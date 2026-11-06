# Staging: `staging.spiritathletics.net`

A permanent test copy of the site with its own database, Stripe **test** keys and its own login secret. Nothing you do there touches the live site or real money. A yellow **"Staging site"** banner on every page tells you which one you're on.

---

## Every test round (after setup): about 3 minutes

1. Commit your changes.
2. Deploy them:
   ```bash
   npm run staging:push
   ```
3. Get a fresh test event:
   ```bash
   npm run staging:reset
   ```
4. Test on your phone using the links `staging:reset` prints.

| Want to test… | Run |
|---|---|
| Early Bird pricing (default) | `npm run staging:reset` |
| Door pricing | `npm run staging:reset door` |
| Between Early Bird and door ("opens Sun 8 AM") | `npm run staging:reset gap` |
| Not on sale yet | `npm run staging:reset upcoming` |
| Sales closed | `npm run staging:reset closed` |
| Door-only launch (the Fall 2026 setup) | `npm run staging:reset door-only` |
| What's in staging right now | `npm run staging:status` |

Changed `prisma/schema.prisma` or added a migration? Run `npm run staging:migrate` **before** `staging:push`.

---

## One-time setup

**Time:** about 40 minutes. **You'll need:** logins for Neon, Vercel, Stripe, and wherever your domain's DNS is managed.

As you go, you'll save four values into `.env.staging.local`. The scripts read them from there, so you never retype them or paste them into chat.

### Three mistakes this guide is built to prevent
1. **Never tick "Production" on a staging setting in Vercel.** That would point the live site at the staging database.
2. **Don't run `npm run staging:push` until step 6 is done.** Until then, Vercel would build staging with your production settings. The script asks you to confirm the first time.
3. **Create the Stripe webhook in test mode (sandbox), not live mode.**

---

### Step 0 · Commit your work (in this conversation)
Everything built so far is uncommitted. Commit it first so it's ready to deploy later.
- [ ] Committed

### Step 1 · Neon: create the staging database (about 5 minutes)
1. Go to **console.neon.tech** and open the project used by spiritathletics.net.
2. Left menu: **Branches**, then **New branch** (or **Create branch**).
3. **Name:** `staging`. **Parent:** your main/production branch.
4. **Data:** if there's an option like **Schema only**, choose it. You get the same tables with no customer data.
   - No such option? Create the branch with current data. Then open the `staging` branch → **Databases** → **New database**, name it `staging`, and use that database in step 1.6. It starts empty.
5. Click **Create**.
6. On the `staging` branch, click **Connect**:
   - Branch: `staging`
   - Database: `neondb` (or `staging` if you used the fallback above)
   - **Connection pooling: ON**
   - Copy the connection string.
7. In VS Code, create your local settings file:
   ```bash
   cp .env.staging.example .env.staging.local
   ```
8. Open `.env.staging.local` and paste the string after `STAGING_DATABASE_URL=`, with no quotes and no spaces.

**✅ You'll know it worked:** the address in the string starts with `ep-` followed by a name that is **not** `ep-snowy-wildflower`, which is production. (If you used it by mistake, the scripts refuse to run.)

**Also check:** Vercel → your project → **Integrations**. If **Neon** is installed and set to create a database branch for each preview deployment, turn that off for this project. Otherwise it replaces the staging database on every deploy.

### Step 2 · Your computer: build the staging database (about 3 minutes)
1. In `.env.staging.local`, fill in:
   - `STAGING_ADMIN_EMAIL`: the email you'll sign into staging with.
   - `STAGING_ALERT_EMAIL`: your own email, so staging shop and booking alerts come to you instead of the front desk.
2. Check the connection:
   ```bash
   npm run staging:status
   ```
   **✅** It prints `Staging database: ep-…` with your staging endpoint. Either "Connected, but the tables aren't built yet" or a list of counts is fine.
3. Build it:
   ```bash
   npm run staging:setup
   ```
   What you'll see:
   - **1/4 Building the schema:** Prisma prints that the database is in sync. If it ever asks about **data loss**, answer **N** and stop, then tell me.
   - **2/4 Marking migrations:** about a minute; prints `12 migrations recorded`.
   - **3/4 Staging admin login:** press Enter for **Y**, confirm your email, then type a **new** password (shown as `*****`). Don't reuse your live password.
   - **4/4 Test event:** prints the buy, attendance and scanner links.

**✅ You'll know it worked:** it ends with `✓ Staging reset` and the four links.

### Step 3 · Vercel: add the staging domain (about 5 minutes, plus DNS wait)
1. **vercel.com** → your project → **Settings** → **Domains**.
2. **Add**, then type `staging.spiritathletics.net`.
3. When asked how to connect it, choose **Preview** (not Production) and set the **Git branch** to `staging`.
   - If Vercel won't accept `staging` because the branch doesn't exist yet, run this, then come back:
     ```bash
     git push origin main:staging
     ```
     It only creates the branch from your current live code. That build stays behind Vercel's login, so it's harmless.
4. DNS:
   - If Vercel shows **Valid Configuration**, you're done.
   - Otherwise, copy the record Vercel shows (usually **CNAME**, name `staging`, value like `cname.vercel-dns.com`). Add it exactly at your DNS provider (GoDaddy, Namecheap, Squarespace, etc.).

**✅ You'll know it worked:** the domain shows **Valid Configuration** and **Preview · staging**. DNS can take anywhere from a few minutes to an hour.

### Step 4 · Vercel: create the bypass secret (about 2 minutes)
Preview sites sit behind Vercel's login. This secret lets Stripe's webhooks and your phone through.
1. **Settings** → **Deployment Protection**.
2. Leave **Vercel Authentication** on.
3. Under **Protection Bypass for Automation**, click **Add** (or **Create**), then copy the secret.
4. Paste it into `.env.staging.local` after `STAGING_BYPASS_SECRET=`.
5. Run:
   ```bash
   npm run staging:env
   ```

**✅ You'll know it worked:** it prints the **Stripe webhook URL** and the **phone link**. Keep this terminal open for step 5.

### Step 5 · Stripe: the staging webhook (about 5 minutes)
1. **dashboard.stripe.com.** Make sure you're in the **sandbox / test mode**: the account switcher should show **Spirit Athletics sandbox**, or the **Test mode** toggle should be on.
   - Check: **Developers** → **API keys**. The publishable key should start with `pk_test_51RwUIZ`, the same account as your test keys.
2. **Developers** → **Webhooks** → **Add endpoint** (newer screens say **Add destination** → **Webhook endpoint**).
3. **Endpoint URL:** paste the **Stripe webhook URL** that `staging:env` printed. It includes `?x-vercel-protection-bypass=…`, and that part is required.
4. **Events:** add exactly these two:
   - `checkout.session.completed`
   - `charge.refunded`
5. Save, open the new endpoint, click **Reveal** on **Signing secret**, and copy it (`whsec_…`).
6. Paste it into `.env.staging.local` after `STAGING_WEBHOOK_SECRET=`, then run:
   ```bash
   npm run staging:env
   ```

**✅ You'll know it worked:** it prints `✓ Wrote .env.staging.vercel.local (11 settings)`.

### Step 6 · Vercel: add the staging settings (about 5 minutes)
1. Open `.env.staging.vercel.local` in VS Code. Select all, then copy.
2. Vercel → **Settings** → **Environment Variables** → **Add New** / **Add Environment Variable**.
3. Click into the **Key** box and **paste**. Vercel splits the 11 lines into 11 rows automatically.
4. **Environments:**
   - **Untick Production.**
   - **Untick Development.**
   - Leave only **Preview** ticked, then pick the branch **`staging`** under "Select a custom Preview branch".
5. **Save**.
6. Check the variables staging shares with production. In the list, look at `RESEND_API_KEY`, `SENDER_EMAIL`, `ORG_ADDRESS` and `APP_TZ`. If any shows **Production** only, edit it and tick **Preview** too.
7. Delete `.env.staging.vercel.local`. It only existed for copying, and the values stay in `.env.staging.local`.

**✅ You'll know it worked:** filtering the list by **Preview** shows the 11 staging settings, each labeled **Preview (staging)**, and **none of them labeled Production**.

### Step 7 · First deploy and phone access (about 5 minutes)
1. Deploy:
   ```bash
   npm run staging:push
   ```
   The first time, it asks whether step 6 is done. Answer **y** only if it is.
2. Vercel → **Deployments**: wait for the `staging` build to show **Ready** (about 2 minutes).
3. On each phone (and your computer's browser), open the **phone link** from `staging:env` once. It saves a cookie so Vercel stops asking you to log in. Then bookmark `https://staging.spiritathletics.net`.

**✅ You'll know it worked:** the site opens with the **yellow staging banner** at the top. If the banner is missing, the step 6 settings weren't applied. Fix them, then use **Redeploy** on the deployment in Vercel.

### Step 8 · Smoke test (about 5 minutes)
- [ ] **Banner** is on every page.
- [ ] Sign in at `/dashboard-login` with your **staging admin** login from step 2.
- [ ] `/admin/events` lists **only** "Spirit Spectacular (Staging)". If you see Fall 2026 or the TEST event, staging is using the production database: **stop** and recheck step 6.
- [ ] Buy a ticket. Stripe's checkout page shows **Test mode / Sandbox**. Pay with `4242 4242 4242 4242`, any future date, any CVC.
- [ ] You land on your ticket page and the email arrives.
- [ ] Stripe → your staging webhook → **Event deliveries** shows `200`s.
- [ ] Scan the ticket at `/dashboard/events/staging-showcase/scan`.

Done. From now on it's just the 3-minute loop at the top.

---

## Good to know
- **Production is untouched.** Separate database, test-only Stripe keys and a separate login secret. If a live Stripe key ever reaches staging, payments switch off rather than charging real cards.
- **Emails are real.** Buy with your own email or `delivered@resend.dev` (Resend's test inbox). The staging database has no customers, so it can't email parents.
- **Scheduled jobs** (the daily reminders) only run on production.
- **Search engines** are told not to index staging.
- **Local development** can use the staging database too, so `npm run dev` never writes to production. Ask, and the connection string gets copied from `.env.staging.local` into `.env.local` for you.
- **Commands:** `staging:setup` (once), `staging:env` (setup steps 4–6), `staging:push`, `staging:reset`, `staging:migrate`, `staging:status`.
