#!/usr/bin/env node
/**
 * Staging helper. Every database command targets STAGING_DATABASE_URL from .env.staging.local
 * and refuses to run against the production database in .env.
 *
 *   npm run staging:setup     one-time: build the schema, mark migrations applied, create your staging login, seed an event
 *   npm run staging:reset     wipe ticket data and create a fresh on-sale test event
 *       npm run staging:reset door        pick the live window: early-bird | door | gap | upcoming | closed
 *       npm run staging:reset door-only   Early Bird off on every tier (the Fall 2026 setup); combinable
 *     (Plain words on purpose: PowerShell strips the `--` that `--flag` style options would need.)
 *   npm run staging:env       print the Stripe webhook URL + phone link, and write the Vercel settings file
 *   npm run staging:migrate   apply new migrations to staging
 *   npm run staging:status    what's in staging right now
 *   npm run staging:push      deploy your current commit to staging
 */
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const TZ = 'America/Los_Angeles';

function readEnvFile(file) {
  const out = {};
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return out;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !line.trim().startsWith('#')) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return out;
}

const stagingEnv = readEnvFile('.env.staging.local');
const prodEnv = readEnvFile('.env');
const STAGING_URL = stagingEnv.STAGING_DATABASE_URL;
const SITE = (stagingEnv.STAGING_SITE_URL || 'https://staging.spiritathletics.net').replace(/\/$/, '');

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

// Neon's pooled and direct hosts differ only by "-pooler"; compare endpoint + database name.
function dbIdentity(url) {
  try {
    const u = new URL(url);
    return { host: u.hostname.replace('-pooler', ''), rawHost: u.hostname, db: u.pathname.replace(/^\//, '') || 'postgres' };
  } catch {
    return null;
  }
}

function guard() {
  if (!STAGING_URL) fail('Add STAGING_DATABASE_URL to .env.staging.local first (copy .env.staging.example).');
  const s = dbIdentity(STAGING_URL);
  const p = dbIdentity(prodEnv.DATABASE_URL || '');
  if (!s) fail('STAGING_DATABASE_URL is not a valid Postgres connection string.');
  if (p && s.host === p.host && s.db === p.db) {
    fail(`STAGING_DATABASE_URL is the production database (${s.host}/${s.db}). Use the Neon staging branch's connection string.`);
  }
  return s;
}

function prisma(args, { capture = false } = {}) {
  const r = spawnSync('npx', ['prisma', ...args], {
    cwd: ROOT,
    shell: process.platform === 'win32',
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    env: { ...process.env, DATABASE_URL: STAGING_URL },
  });
  return r;
}

/** Belt and braces: confirm the Prisma CLI itself resolved the staging host before any write. */
function assertCliTargetsStaging(target) {
  const r = prisma(['migrate', 'status'], { capture: true });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  if (!out.includes(target.rawHost)) {
    console.error(out);
    fail('Prisma did not connect to the staging host. Nothing was changed.');
  }
}

function db() {
  const { PrismaClient } = require('@prisma/client');
  return new PrismaClient({ datasources: { db: { url: STAGING_URL } } });
}

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => rl.output.write(s.includes(question) ? s : s.replace(/[^\r\n]/g, '*'));
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

// ── commands ────────────────────────────────────────────────

async function setup() {
  const target = guard();
  console.log(`Staging database: ${target.host}/${target.db}\n`);
  assertCliTargetsStaging(target);

  console.log('1/4  Building the schema (no-op if it already exists)…');
  if (prisma(['db', 'push', '--skip-generate']).status !== 0) fail('prisma db push failed.');

  console.log('\n2/4  Marking existing migrations as applied…');
  const client = db();
  let applied = new Set();
  try {
    const rows = await client.$queryRawUnsafe(
      'SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL',
    );
    applied = new Set(rows.map((r) => r.migration_name));
  } catch {
    // Table doesn't exist yet; `migrate resolve` creates it.
  }
  const migrations = fs
    .readdirSync(path.join(ROOT, 'prisma', 'migrations'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const name of migrations) {
    if (applied.has(name)) continue;
    if (prisma(['migrate', 'resolve', '--applied', name]).status !== 0) fail(`Couldn't mark ${name} as applied.`);
  }
  console.log(`     ${migrations.length} migrations recorded.`);

  console.log('\n3/4  Staging admin login');
  const admins = await client.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { email: true } });
  if (admins.length) console.log(`     Existing admins: ${admins.map((a) => a.email).join(', ')}`);
  const want = (await ask('     Create or update a staging admin login? (Y/n) ')).toLowerCase();
  if (want !== 'n') {
    const fallback = stagingEnv.STAGING_ADMIN_EMAIL;
    const email = ((await ask(`     Email${fallback ? ` [${fallback}]` : ''}: `)) || fallback || '').toLowerCase();
    if (!/.+@.+\..+/.test(email)) fail('That email does not look right.');
    const password = await ask('     Password (10+ characters, not your live password): ', { hidden: true });
    if (password.length < 10) fail('Use at least 10 characters.');
    const { hash } = require('bcryptjs');
    const passwordHash = await hash(password, 10);
    await client.user.upsert({
      where: { email },
      update: { role: 'ADMIN', isActive: true, passwordHash },
      create: { email, name: 'Staging Admin', role: 'ADMIN', isActive: true, passwordHash },
    });
    console.log(`     ✓ ${email} can sign in at ${SITE}/dashboard-login`);
  }
  await client.$disconnect();

  console.log('\n4/4  Creating a test event…');
  await reset([]);
}

async function reset(args) {
  const target = guard();
  const windows = ['early-bird', 'door', 'gap', 'upcoming', 'closed'];
  const tokens = args.map((a) => a.replace(/^--(window=)?/, ''));
  const unknown = tokens.filter((t) => !windows.includes(t) && t !== 'door-only');
  if (unknown.length) fail(`Unknown option "${unknown[0]}". Use one of: ${windows.join(', ')}, door-only`);
  const windowArg = tokens.find((t) => windows.includes(t)) || 'early-bird';
  const doorOnly = tokens.includes('door-only');

  const { fromZonedTime, formatInTimeZone } = require('date-fns-tz');
  const today = formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd');
  const day = (offset) => {
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const at = (d, hm) => fromZonedTime(`${d} ${hm}:00`, TZ);
  const hoursFromNow = (h) => new Date(Date.now() + h * 36e5);
  const show = day(2);

  const sales = {
    'early-bird': [hoursFromNow(-1), at(day(1), '23:59'), at(show, '08:00'), at(show, '16:00')],
    door: [hoursFromNow(-3), hoursFromNow(-2), hoursFromNow(-1), at(show, '16:00')],
    gap: [hoursFromNow(-3), hoursFromNow(-1), at(show, '08:00'), at(show, '16:00')],
    upcoming: [hoursFromNow(2), at(day(1), '23:59'), at(show, '08:00'), at(show, '16:00')],
    closed: [hoursFromNow(-4), hoursFromNow(-3), hoursFromNow(-2), hoursFromNow(-1)],
  }[windowArg];

  const client = db();
  const [tickets, orders] = await client.$transaction([
    client.ticket.deleteMany({}),
    client.ticketOrder.deleteMany({}),
    client.ticketTier.deleteMany({}),
    client.event.deleteMany({}),
    client.auditLog.deleteMany({ where: { action: 'TICKET_ORDER_FULFILLMENT_FAILED' } }),
  ]);

  const tier = (tierCode, name, description, eb, door, capacity, sortOrder) => ({
    tierCode,
    name,
    description,
    earlyBirdPriceCents: eb,
    doorPriceCents: door,
    capacity,
    showOnline: true,
    earlyBirdEnabled: !doorOnly,
    sortOrder,
  });

  const event = await client.event.create({
    data: {
      slug: 'staging-showcase',
      title: 'Spirit Spectacular (Staging)',
      description: 'Staging test event. Safe to buy, scan, and reset.',
      venue: 'Granite Hills High School',
      venueAddress: '22900 Esaws Rd, Apple Valley, CA',
      startDateTimeUTC: at(show, '13:00'),
      doorsOpenUTC: at(show, '12:30'),
      endDateTimeUTC: at(show, '17:00'),
      salesOpenAtUTC: sales[0],
      earlyBirdEndsAtUTC: sales[1],
      doorSalesOpenAtUTC: sales[2],
      salesCloseAtUTC: sales[3],
      convenienceFeeCents: 300,
      status: 'ACTIVE',
      tiers: {
        create: [
          tier('STANDARD', 'Standard', 'General admission wristband.', 2000, 2500, null, 10),
          tier('SENIOR_CHILD', 'Senior / Child', 'Reduced price for seniors and children.', 1500, 2000, null, 20),
          tier('VIP', 'VIP', 'Early access and front-row seating. Only 5, so sold-out tests are quick.', 4000, 4500, 5, 30),
        ],
      },
    },
  });
  await client.$disconnect();

  const fmt = (d) => formatInTimeZone(d, TZ, "EEE MMM d, h:mm a 'PT'");
  console.log(`\n✓ Staging reset on ${target.host}`);
  console.log(`  Cleared ${orders.count} orders / ${tickets.count} tickets.`);
  console.log(`  "${event.title}" · window: ${windowArg}${doorOnly ? ' · door-only (no Early Bird)' : ''}`);
  console.log(`  Sales open ${fmt(sales[0])} · Early Bird ends ${fmt(sales[1])}`);
  console.log(`  Door pricing ${fmt(sales[2])} · Sales close ${fmt(sales[3])}`);
  console.log(`\n  Buy:        ${SITE}/showcase/${event.slug}/tickets`);
  console.log(`  Showcase:   ${SITE}/showcase`);
  console.log(`  Attendance: ${SITE}/dashboard/events/${event.slug}`);
  console.log(`  Scanner:    ${SITE}/dashboard/events/${event.slug}/scan\n`);
}

async function migrate() {
  const target = guard();
  console.log(`Applying migrations to ${target.host}/${target.db}…`);
  assertCliTargetsStaging(target);
  if (prisma(['migrate', 'deploy']).status !== 0) fail('prisma migrate deploy failed.');
}

async function status() {
  const target = guard();
  console.log(`Staging database: ${target.rawHost}/${target.db}`);
  const client = db();
  let result;
  try {
    result = await Promise.all([
      client.event.findMany({ select: { slug: true, status: true } }),
      client.ticketOrder.count(),
      client.ticket.count(),
      client.ticket.count({ where: { status: 'REDEEMED' } }),
      client.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { email: true } }),
    ]);
  } catch (e) {
    await client.$disconnect();
    const msg = String(e?.message || e);
    if (/does not exist|P2021/.test(msg)) {
      console.log('Connected, but the tables aren’t built yet. Run: npm run staging:setup');
      return;
    }
    fail(`Couldn't read the staging database: ${msg.split('\n').filter(Boolean).pop()}`);
  }
  await client.$disconnect();
  const [events, orders, tickets, redeemed, admins] = result;
  console.log(`Events: ${events.map((e) => `${e.slug} (${e.status})`).join(', ') || 'none'}`);
  console.log(`Orders: ${orders} · Tickets: ${tickets} (${redeemed} checked in)`);
  console.log(`Admins: ${admins.map((a) => a.email).join(', ') || 'none — run npm run staging:setup'}`);
  console.log(`Site:   ${SITE}`);
}

const STAGING_FILE = path.join(ROOT, '.env.staging.local');
const VERCEL_FILE = path.join(ROOT, '.env.staging.vercel.local');

function envCmd() {
  guard();
  const local = readEnvFile('.env.local');
  const problems = [];
  const bypass = stagingEnv.STAGING_BYPASS_SECRET;
  const whsec = stagingEnv.STAGING_WEBHOOK_SECRET;
  const sk = local.STRIPE_SECRET_KEY || '';
  const pk = local.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  if (!sk.startsWith('sk_test_')) problems.push('STRIPE_SECRET_KEY in .env.local must be your sk_test_ key.');
  if (!pk.startsWith('pk_test_')) problems.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local must be your pk_test_ key.');

  let authSecret = stagingEnv.STAGING_NEXTAUTH_SECRET;
  if (!authSecret) {
    authSecret = crypto.randomBytes(32).toString('base64');
    fs.appendFileSync(STAGING_FILE, `\nSTAGING_NEXTAUTH_SECRET=${authSecret}\n`);
    console.log('Generated a staging login secret and saved it to .env.staging.local.\n');
  }
  if (authSecret === prodEnv.NEXTAUTH_SECRET) problems.push('STAGING_NEXTAUTH_SECRET must not match production.');

  console.log('Stripe webhook URL (paste into Stripe, test mode):');
  console.log(bypass ? `  ${SITE}/api/stripe/webhook?x-vercel-protection-bypass=${bypass}\n` : '  (add STAGING_BYPASS_SECRET to .env.staging.local first, then run this again)\n');
  console.log('Phone link (open once on each phone):');
  console.log(bypass ? `  ${SITE}/?x-vercel-protection-bypass=${bypass}&x-vercel-set-bypass-cookie=true\n` : '  (needs STAGING_BYPASS_SECRET)\n');

  if (!whsec) {
    console.log('Next: create the Stripe webhook, put its signing secret in STAGING_WEBHOOK_SECRET, then run this again.');
    if (problems.length) fail(problems.join('\n  '));
    return;
  }
  if (!whsec.startsWith('whsec_')) problems.push('STAGING_WEBHOOK_SECRET should start with whsec_.');
  if (problems.length) fail(problems.join('\n  '));

  const alert = stagingEnv.STAGING_ALERT_EMAIL || stagingEnv.STAGING_ADMIN_EMAIL;
  const lines = [
    'NEXT_PUBLIC_APP_ENV=staging',
    `DATABASE_URL=${STAGING_URL}`,
    `NEXTAUTH_URL=${SITE}`,
    `NEXTAUTH_SECRET=${authSecret}`,
    `NEXT_PUBLIC_SITE_URL=${SITE}`,
    `BASE_PROD_URL=${SITE}`,
    `STRIPE_SECRET_KEY=${sk}`,
    `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${pk}`,
    `STRIPE_WEBHOOK_SECRET_KEY=${whsec}`,
    ...(alert ? [`RECEIVABLE_EMAIL=${alert}`, `SHOP_SUPPORT_EMAIL=${alert}`] : []),
  ];
  fs.writeFileSync(VERCEL_FILE, `${lines.join('\n')}\n`);
  console.log(`✓ Wrote .env.staging.vercel.local (${lines.length} settings).`);
  console.log('  Open it, copy everything, paste into Vercel (runbook step 6), then delete the file.');
  if (!alert) console.log('  Tip: set STAGING_ALERT_EMAIL so staging shop/booking alerts come to you, then run this again.');
}

async function push() {
  if (stagingEnv.STAGING_VERCEL_READY !== '1') {
    console.log('Before the first deploy, the staging settings must already be in Vercel (runbook step 6).');
    console.log('Without them, Vercel builds staging with your PRODUCTION database and live Stripe keys.');
    const ok = (await ask('Are the staging settings saved in Vercel for Preview → staging? (y/N) ')).toLowerCase();
    if (ok !== 'y') fail('Not pushed. Finish runbook step 6, then run npm run staging:push again.');
    fs.appendFileSync(STAGING_FILE, '\nSTAGING_VERCEL_READY=1\n');
  }
  const git = (...a) => spawnSync('git', a, { cwd: ROOT, encoding: 'utf8' });
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD').stdout.trim();
  const commit = git('log', '-1', '--format=%h %s').stdout.trim();
  if (git('status', '--porcelain').stdout.trim()) {
    console.warn('Heads up: you have uncommitted changes. Only committed work gets deployed.\n');
  }
  console.log(`Deploying ${branch} @ ${commit} → staging`);
  // Staging is a deploy target, not a shared branch: it always mirrors whatever you push.
  const r = spawnSync('git', ['push', 'origin', 'HEAD:staging', '--force-with-lease'], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) fail('git push failed.');
  console.log(`\n✓ Pushed. Vercel builds it in about 2 minutes → ${SITE}`);
}

const [cmd, ...rest] = process.argv.slice(2);
const commands = { setup, reset: () => reset(rest), env: envCmd, migrate, status, push };
if (!commands[cmd]) {
  console.log('Usage: npm run staging:<setup|reset|env|migrate|status|push>');
  process.exit(cmd ? 1 : 0);
}
try {
  await commands[cmd]();
} catch (e) {
  fail(String(e?.message || e).split('\n').filter(Boolean).slice(-3).join('\n  '));
}
