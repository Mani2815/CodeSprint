import { getAuditLogs } from '@/services/audit-service';
import { format } from 'date-fns';
import { H1, Muted } from '@/components/shared/typography';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { requireAdminPageSession } from '@/lib/auth-guards';

export const metadata = {
  title: 'Audit Logs | Admin Dashboard',
};

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string; adminId?: string };
}) {
  await requireAdminPageSession();

  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const { logs, pagination } = await getAuditLogs({
    page,
    action: searchParams.action,
    adminId: searchParams.adminId,
  });

  return (
    <div className="space-y-6">
      <div>
        <H1 className="text-3xl font-bold tracking-tight">Audit Logs</H1>
        <Muted className="mt-2">System-wide record of administrative actions.</Muted>
      </div>

      <div className="rounded-md border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>{log.admin.displayName ?? log.admin.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    {log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)}...)` : ''}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {log.newValue
                      ? JSON.stringify(log.newValue)
                      : log.oldValue
                        ? 'Deleted'
                        : 'No details'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" size="sm" asChild disabled={pagination.page <= 1}>
            <Link
              href={`/admin/audit-logs?page=${Math.max(1, pagination.page - 1)}`}
              className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : ''}
            >
              <ChevronLeft className="mr-1 size-4" /> Previous
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={pagination.page >= pagination.totalPages}
          >
            <Link
              href={`/admin/audit-logs?page=${Math.min(pagination.totalPages, pagination.page + 1)}`}
              className={
                pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''
              }
            >
              Next <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
