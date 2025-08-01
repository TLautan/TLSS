// frontend/app/analytics/leaderboard/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getLeaderboardData } from '@/lib/api';
import { LeaderboardEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

type SortKey = "total_revenue" | "deals_won" | "average_deal_size";

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("total_revenue");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const leaderboardData = await getLeaderboardData();
        setData(leaderboardData);
      } catch (err) {
        setError('Failed to load leaderboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b[sortKey] - a[sortKey]);
  }, [data, sortKey]);

  if (loading) return <p className="p-8">読み込んでいます...</p>;
  if (error) return <p className="p-8 text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">売上リーダーボード</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>トップセールス担当者</CardTitle>
          <CardDescription>パフォーマンス指標に基づいて営業担当者をランク付けします。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Button variant={sortKey === 'total_revenue' ? 'default' : 'outline'} onClick={() => setSortKey('total_revenue')}>
              収益で並べ替え
            </Button>
            <Button variant={sortKey === 'deals_won' ? 'default' : 'outline'} onClick={() => setSortKey('deals_won')}>
              獲得した取引で並べ替え
            </Button>
            <Button variant={sortKey === 'average_deal_size' ? 'default' : 'outline'} onClick={() => setSortKey('average_deal_size')}>
              平均取引規模で並べ替え
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ランク</TableHead>
                <TableHead>営業担当</TableHead>
                <TableHead className="text-right">総合売り上げ</TableHead>
                <TableHead className="text-right">獲得した取引</TableHead>
                <TableHead className="text-right">平均取引規模</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((entry, index) => (
                <TableRow key={entry.user_id}>
                  <TableCell className="font-bold">
                    <div className="flex items-center">
                        {index < 3 && <Trophy className={`h-4 w-4 mr-2 ${
                            index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-yellow-700'
                        }`} />}
                        {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>{entry.user_name}</TableCell>
                  <TableCell className="text-right">¥{entry.total_revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{entry.deals_won}</TableCell>
                  <TableCell className="text-right">¥{Math.round(entry.average_deal_size).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}