// frontend/app/settings/audit-log/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getAuditLogs } from '@/lib/api';
import { AuditLog } from '@/lib/types';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const logData = await getAuditLogs();
        setLogs(logData);
      } catch (err) {
        setError('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-8">ロードローラー！</p>;
  if (error) return <p className="p-8 text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">監査ログ</h1>
      <p className="text-muted-foreground">アプリケーションで実行されたすべての重要なアクションの記録。</p>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイムスタンプ</TableHead>
                <TableHead>ユーザー</TableHead>
                <TableHead>アクション</TableHead>
                <TableHead>詳細</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.user?.name || 'System'}</TableCell>
                  <TableCell>
                    <span className="font-mono bg-muted px-2 py-1 rounded-md text-sm">{log.action}</span>
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}