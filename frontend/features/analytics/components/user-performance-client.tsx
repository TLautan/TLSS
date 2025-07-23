// frontend/features/analytics/components/user-performance-client.tsx
"use client";

import { useEffect, useState } from 'react';
import { getUserPerformance } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PerformanceData {
  user_name: string;
  average_days_to_win: number;
  activity_summary: { [key: string]: number };
}

export default function UserPerformanceClient({ userId }: { userId: string }) {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const numericUserId = parseInt(userId, 10);
        if (isNaN(numericUserId)) {
          setError("Invalid User ID provided.");
          return;
        }
        const data = await getUserPerformance(numericUserId);
        setPerformanceData(data);
      } catch (err) {
        setError('Failed to load user performance data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return <div>Loading user performance...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  if (!performanceData) {
    return <div>No performance data found for this user.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics for {performanceData.user_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Average Days to Win a Deal: {performanceData.average_days_to_win}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity Type</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(performanceData.activity_summary).map(([type, count]) => (
                <TableRow key={type}>
                  <TableCell>{type}</TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
