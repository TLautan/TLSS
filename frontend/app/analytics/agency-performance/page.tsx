// frontend/app/analytics/agency-performance/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getAgencyPerformance } from '@/lib/api';
import { AgencyPerformance } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from 'lucide-react';

export default function AgencyPerformancePage() {
  const [data, setData] = useState<AgencyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const performanceData = await getAgencyPerformance();
        setData(performanceData);
      } catch (err) {
        setError('Failed to load agency performance data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-8">読み込み中</p>;
  if (error) return <p className="p-8 text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">代理店パフォーマンス</h1>
      <p className="text-muted-foreground">販売実績に基づいたパートナー代理店のランキング。</p>
      
      <Card>
        <CardHeader>
          <CardTitle>代理店ランキング</CardTitle>
          <CardDescription>代理店は、獲得した取引から得られた総収益によってランク付けされます。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ランク</TableHead>
                <TableHead>Agency Name</TableHead>
                <TableHead className="text-right">総収益</TableHead>
                <TableHead className="text-right">獲得した取引</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((agency, index) => (
                  <TableRow key={agency.agency_id}>
                    <TableCell className="font-bold">
                      <div className="flex items-center">
                          {index < 3 && <Trophy className={`h-4 w-4 mr-2 ${
                              index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-yellow-700'
                          }`} />}
                          {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>{agency.agency_name}</TableCell>
                    <TableCell className="text-right">¥{agency.total_revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{agency.deals_won}</TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      利用可能な代理店パフォーマンスデータはまだありません。
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}