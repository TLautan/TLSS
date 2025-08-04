// frontend/app/analytics/user/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDetailedUserPerformance } from '@/lib/api';
import { UserPerformanceMetrics } from '@/lib/types';
import { Trophy, DollarSign, Target, Percent, Phone, Mail, Users } from 'lucide-react';

export default function UserPerformancePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [data, setData] = useState<UserPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const numericUserId = parseInt(userId, 10);
        const performanceData = await getDetailedUserPerformance(numericUserId);
        setData(performanceData);
      } catch (err) {
        setError('Failed to load user performance data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <div className="p-8">読み込んでいます...</div>;
  if (error) return <div className="p-8 text-destructive">{error}</div>;
  if (!data) return <div className="p-8">このユーザーのパフォーマンス データは見つかりません。</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">パフォーマンスダッシュボード</h1>
        <p className="text-muted-foreground">{data.user_name} の詳細な分析</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Trophy} title="Total Revenue" value={`¥${data.total_revenue.toLocaleString()}`} />
        <KpiCard icon={Target} title="Deals Won" value={data.deals_won.toString()} />
        <KpiCard icon={Percent} title="Win Rate" value={`${data.win_rate.toFixed(1)}%`} />
        <KpiCard icon={DollarSign} title="Avg. Days to Win" value={data.average_days_to_win.toString()} />
      </div>

      {/* Monthly Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>月次パフォーマンス</CardTitle>
          <CardDescription>時間の経過とともに成立した取引と成立しなかった取引の内訳。</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.monthly_performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="deals_won" name="Deals Won" fill="#16a34a" />
              <Bar dataKey="deals_lost" name="Deals Lost" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Win/Loss Reason Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <ReasonTable title="Top Win Reasons" reasons={data.win_reasons} />
        <ReasonTable title="Top Loss Reasons" reasons={data.loss_reasons} />
      </div>
      
       {/* Activity Summary */}
      <Card>
          <CardHeader>
              <CardTitle>活動概要</CardTitle>
              <CardDescription>ユーザーの販売活動の概要。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">総アクティビティ数</p>
                      <p className="text-2xl font-bold">{data.activity_summary.total_activities}</p>
                  </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">取引あたりの平均アクティビティ数</p>
                      <p className="text-2xl font-bold">{data.activity_summary.activities_per_deal.toFixed(1)}</p>
                  </div>
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">分析</p>
                      <div className="text-sm text-muted-foreground flex items-center">
                          <Phone className="h-4 w-4 mr-2" /> 電話番号: {data.activity_summary.by_type['電話'] || 0} |
                          <Mail className="h-4 w-4 mx-2" /> メールアドレス: {data.activity_summary.by_type['メール'] || 0} |
                          <Users className="h-4 w-4 ml-2 mr-2" /> 会議: {data.activity_summary.by_type['会議'] || 0}
                      </div>
                  </div>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}

// Helper component for KPI cards
function KpiCard({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// Helper component for reason tables
function ReasonTable({ title, reasons }: { title: string, reasons: { reason: string, count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow><TableHead>理由</TableHead><TableHead className="text-right">数</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {reasons.length > 0 ? reasons.map(r => (
              <TableRow key={r.reason}>
                <TableCell>{r.reason}</TableCell>
                <TableCell className="text-right">{r.count}</TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={2} className="text-center">データはありません。</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}