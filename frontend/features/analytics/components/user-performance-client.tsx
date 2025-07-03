// frontend/features/analytics/components/user-performance-client.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Clock, Mail, Phone, Users } from 'lucide-react';
import { getUserPerformance } from '@/lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Type definitions for the API data
interface MonthlyMetric {
  label: string;
  success_rate: number;
  loss_rate: number;
}
interface PerformanceData {
  user_name: string;
  monthly_metrics: MonthlyMetric[];
  average_days_to_win: number;
  activity_summary: { [key: string]: number };
}

// This component receives a simple userId string as a prop
export default function UserPerformanceClient({ userId }: { userId: string }) {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const data = await getUserPerformance(userId);
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

  if (loading) return <p>Loading performance data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!performanceData) return <p>No data available for this user.</p>;

  // Prepare data for the grouped bar chart
  const monthlyRatesChartData = {
    labels: performanceData.monthly_metrics.map(d => d.label),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: performanceData.monthly_metrics.map(d => d.success_rate),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Loss Rate (%)',
        data: performanceData.monthly_metrics.map(d => d.loss_rate),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      }
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{performanceData.user_name} - Performance Dashboard</h1>
        <p className="text-muted-foreground">Individual performance metrics for this sales representative.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均成約期間 (Avg. Time to Win)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{performanceData.average_days_to_win} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活動回数 (Activity Count)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span><Phone className="inline h-4 w-4 mr-2 text-muted-foreground" />電話 (Calls):</span>
                <span className="font-medium">{performanceData.activity_summary['電話'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span><Mail className="inline h-4 w-4 mr-2 text-muted-foreground" />メール (Emails):</span>
                <span className="font-medium">{performanceData.activity_summary['メール'] || 0}</span>
              </div>
              <div className="flex justify-between">
                <span><Users className="inline h-4 w-4 mr-2 text-muted-foreground" />会議 (Meetings):</span>
                <span className="font-medium">{performanceData.activity_summary['会議'] || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>月次成約・失注率 (Monthly Success & Loss Rate)</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <Bar options={{ responsive: true, maintainAspectRatio: false }} data={monthlyRatesChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}