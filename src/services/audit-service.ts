import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_TEAM'
  | 'UPDATE_TEAM'
  | 'DELETE_TEAM'
  | 'CREATE_EVENT'
  | 'UPDATE_EVENT'
  | 'DELETE_EVENT'
  | 'ACTIVATE_EVENT'
  | 'CREATE_CHECKPOINT'
  | 'UPDATE_CHECKPOINT'
  | 'DELETE_CHECKPOINT'
  | 'UPDATE_SCORE'
  | 'MANUAL_GITHUB_SYNC';

export async function logAdminAction(
  adminId: string,
  action: AuditAction,
  entityType?: string,
  entityId?: string,
  oldValue?: unknown,
  newValue?: unknown
) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        oldValue: oldValue !== undefined ? (oldValue as Prisma.InputJsonValue) : undefined,
        newValue: newValue !== undefined ? (newValue as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch (err) {
    // Audit logs should never crash the main application flow
    console.error('Failed to write audit log:', err);
  }
}

export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  action?: string;
  adminId?: string;
}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {};
  if (params.action) where.action = params.action;
  if (params.adminId) where.adminId = params.adminId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        admin: {
          select: { username: true, displayName: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
