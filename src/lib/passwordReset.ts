import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const PREFIX = 'pwreset:';

/**
 * Creates a single-use password reset token for the given email, reusing the
 * NextAuth VerificationToken table. Any prior reset tokens for the email are
 * cleared first so only the newest link is valid.
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const identifier = `${PREFIX}${email.toLowerCase()}`;
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = randomBytes(32).toString('hex');
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

/**
 * Validates a reset token. Returns the associated email if valid and unexpired,
 * otherwise null. Does NOT consume the token (use consumePasswordResetToken).
 */
export async function getEmailForResetToken(token: string): Promise<string | null> {
  if (!token) return null;
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;
  if (!record.identifier.startsWith(PREFIX)) return null;
  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } });
    return null;
  }
  return record.identifier.slice(PREFIX.length);
}

/**
 * Validates and consumes (deletes) a reset token, returning the email if valid.
 */
export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const email = await getEmailForResetToken(token);
  if (!email) return null;
  await prisma.verificationToken.deleteMany({ where: { token } });
  return email;
}
