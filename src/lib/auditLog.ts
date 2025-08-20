import { prisma } from '@/lib/prisma';

export async function createAuditLog({
  actorUserId,
  action,
  entity,
  entityId,
  meta = {}
}: {
  actorUserId?: string;
  action: string;
  entity: string;
  entityId: string;
  meta?: Record<string, any>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId,
        action,
        entity,
        entityId,
        meta,
      },
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Audit log failed:', error);
  }
}

export async function logSecurityEvent({
  event,
  userId,
  ip,
  userAgent,
  details = {}
}: {
  event: 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
}) {
  try {
    await createAuditLog({
      actorUserId: userId,
      action: 'SECURITY_EVENT',
      entity: 'SECURITY',
      entityId: event,
      meta: {
        event,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        ...details,
      },
    });
  } catch (error) {
    console.error('Security audit log failed:', error);
  }
}
