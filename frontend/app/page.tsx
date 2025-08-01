// frontend/app/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, CreditCard, Activity as ActivityIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDashboardData } from '@/lib/api';
import { DashboardData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#16a34a', '#dc2626'];

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const analyticsData = await getDashboardData();
        setDashboardData(analyticsData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold animate-pulse">ロード中</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">営業ダッシュボード</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総収益</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{dashboardData?.kpis.total_value.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">獲得したすべての取引からの総収益</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成約率</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.kpis.win_rate || '0'}%</div>
            <p className="text-xs text-muted-foreground">成約した取引の割合</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総取引数</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.kpis.total_deals || '0'}</div>
            <p className="text-xs text-muted-foreground">パイプライン内の取引合計</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均取引規模</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{dashboardData?.kpis.average_deal_size.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">獲得した取引の平均価値</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>月次売上概要</CardTitle>
            <CardDescription>過去 12 か月間に成立した取引からの収益。</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dashboardData?.monthly_sales_chart_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `¥${(value / 10000).toLocaleString()}万`} />
                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" name="Total Sales" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>取引結果</CardTitle>
            <CardDescription>完了したすべての取引の内訳。</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={dashboardData?.deal_outcomes_chart_data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {dashboardData?.deal_outcomes_chart_data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()} deals`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>最近の取引</CardTitle>
            <CardDescription>最近作成された 5 件の取引。</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>会社</TableHead>
                  <TableHead>営業担当者</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">価値</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData?.recent_deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                        <div className="font-medium">{deal.company?.company_name || 'N/A'}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">{deal.title}</div>
                    </TableCell>
                    <TableCell>{deal.user?.name || 'N/A'}</TableCell>
                    <TableCell><Badge variant="outline">{deal.status}</Badge></TableCell>
                    <TableCell className="text-right">¥{deal.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
