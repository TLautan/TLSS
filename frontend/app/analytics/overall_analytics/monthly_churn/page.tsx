// frontend/app/analytics/overall_analytics/monthly_churn/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getChurnAnalysis } from '@/lib/api';
import { ChurnAnalysisData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingDown, ShieldCheck } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6'];

export default function ChurnAnalysisPage() {
  const [data, setData] = useState<ChurnAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const churnData = await getChurnAnalysis();
        setData(churnData);
      } catch (err) {
        setError('Failed to load churn analysis data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-8">読み込み中</p>;
  if (error) return <p className="p-8 text-destructive">{error}</p>;
  if (!data) return <p className="p-8">Noデータ</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">解約と維持の分析</h1>
      <p className="text-muted-foreground">顧客がいつ、なぜ離脱するのかを理解する。</p>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">年間生存率</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.annual_survival_rate.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">過去 12 か月間に維持された取引の割合。</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">年間解約率</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">{data.annual_churn_rate.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">過去 12 か月間にキャンセルされた取引の割合。</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Monthly Cancellation Rate Chart */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>月次解約率</CardTitle>
            <CardDescription>月次解約割合。</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthly_cancellation_rates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis unit="%" />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                <Bar dataKey="cancellation_rate" name="Cancellation Rate" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Cancellation Reasons Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>主な解約理由</CardTitle>
            <CardDescription>解約の最も一般的な理由。</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={data.cancellation_reasons} dataKey="count" nameKey="reason" cx="50%" cy="50%" outerRadius={100} label>
                         {data.cancellation_reasons.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value} deals`, name]} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}