import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { ShieldAlert, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, actionFilter, entityFilter],
    queryFn: async () => {
      const res = await api.get('/audit-logs', {
        params: { page, limit: 20, action: actionFilter, entityType: entityFilter }
      });
      return res.data;
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-indigo-500" />
            Audit Logs
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            System-wide security and action audit trail.
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white dark:bg-[#111] p-4 rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Filter by action (e.g. CREATE, DELETE)..."
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="pl-9 bg-zinc-50 dark:bg-black"
          />
        </div>
        <div className="w-[200px]">
          <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v === 'ALL' ? '' : v); setPage(1); }}>
            <SelectTrigger className="bg-zinc-50 dark:bg-black">
              <SelectValue placeholder="Entity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Entities</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="PRODUCT">Product</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
              <SelectItem value="CHALLAN">Challan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Loading logs...</TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">No audit logs found.</TableCell>
              </TableRow>
            ) : (
              data?.data?.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono bg-zinc-50 dark:bg-black">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold">{log.entityType}</div>
                    <div className="text-xs text-zinc-500 font-mono truncate max-w-[150px]">{log.entityId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{log.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-zinc-500">{log.user?.email || log.userId}</div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {log.details || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Details */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="text-sm text-zinc-500">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
