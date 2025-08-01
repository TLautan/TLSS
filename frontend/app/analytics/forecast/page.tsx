// frontend/app/analytics/forecast/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSalesForecast } from '@/lib/api';
import { ForecastEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ForecastPage() {
  const [data, setData] = useState<ForecastEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const forecastData = await getSalesForecast();
        setData(forecastData);
      } catch (err) {
        setError('Failed to load forecast data.');
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
      <h1 className="text-3xl font-bold">売上高予測</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>予想収益</CardTitle>
          <CardDescription>
            最近数か月間の「進行中」の取引の価値と予測精度に基づいた簡単な予測。
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#888888" fontSize={12} />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                tickFormatter={(value: number) => `¥${(value / 10000).toLocaleString()}万`}
              />
              <Tooltip 
                formatter={(value: number) => `¥${value.toLocaleString()}`} 
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Legend />
              <Bar dataKey="projected_revenue" fill="hsl(var(--primary))" name="Projected Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}