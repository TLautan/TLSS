// frontend/app/analytics/channel-performance/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getChannelPerformance } from '@/lib/api';
import { ChannelAnalyticsData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Target, Percent, Package } from 'lucide-react';

export default function ChannelPerformancePage() {
  const [data, setData] = useState<ChannelAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const performanceData = await getChannelPerformance();
        setData(performanceData);
      } catch (err) {
        setError('Failed to load channel performance data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-8">読み込み中</p>;
  if (error) return <p className="p-8 text-destructive">{error}</p>;
  if (!data) return <p className="p-8">データがありません</p>;

  const chartData = [
    { name: 'Direct Sales', Revenue: data.direct.total_revenue, 'Deals Won': data.direct.deals_won },
    { name: 'Agency Sales', Revenue: data.agency.total_revenue, 'Deals Won': data.agency.deals_won },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">チャネルパフォーマンス</h1>
      <p className="text-muted-foreground">直接販売チャネルと代理店販売チャネルの比較。</p>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChannelCard title="Direct Sales" performance={data.direct} />
        <ChannelCard title="Agency Sales" performance={data.agency} />
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>パフォーマンス比較</CardTitle>
          <CardDescription>チャネル間の主要な指標の視覚的な比較。</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Revenue (¥)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Deals Won', angle: -90, position: 'insideRight' }}/>
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Legend />
              <Bar yAxisId="left" dataKey="Revenue" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="Deals Won" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for displaying channel KPIs
function ChannelCard({ title, performance }: { title: string, performance: ChannelAnalyticsData['direct'] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center">
                    <DollarSign className="h-6 w-6 text-muted-foreground mr-4" />
                    <div>
                        <p className="font-bold text-2xl">¥{performance.total_revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">総収益</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <Percent className="h-6 w-6 text-muted-foreground mr-4" />
                    <div>
                        <p className="font-bold text-2xl">{performance.win_rate.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">成約率</p>
                    </div>
                </div>
                 <div className="flex items-center">
                    <Target className="h-6 w-6 text-muted-foreground mr-4" />
                    <div>
                        <p className="font-bold text-2xl">{performance.deals_won}</p>
                        <p className="text-sm text-muted-foreground">獲得した取引</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}