// frontend/features/analytics/components/deal-outcomes-view.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { getDealOutcomeBreakdowns } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Define the type for the raw data from the API
interface OutcomeData {
  status: string;
  industry: string;
  reason: string | null;
  count: number;
}

export default function DealOutcomesView() {
  const [data, setData] = useState<OutcomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDealOutcomeBreakdowns();
        setData(result);
      } catch (err) {
        setError('Failed to load analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Data Processing with useMemo for performance ---

  // Calculate Success & Loss Rates by Industry
  const ratesByIndustry = useMemo(() => {
    if (data.length === 0) return { labels: [], successRates: [], lossRates: [] };

    const industryMap = new Map<string, { won: number; lost: number; total: number }>();

    data.forEach(row => {
      if (!industryMap.has(row.industry)) {
        industryMap.set(row.industry, { won: 0, lost: 0, total: 0 });
      }
      const industryData = industryMap.get(row.industry)!;
      if (row.status === '受注') { // 'won'
        industryData.won += row.count;
      } else if (row.status === '失注') { // 'lost'
        industryData.lost += row.count;
      }
      // We only care about won/lost for success/loss rate calculation
      if (row.status === '受注' || row.status === '失注') {
        industryData.total += row.count;
      }
    });

    const labels: string[] = [];
    const successRates: number[] = [];
    const lossRates: number[] = [];

    industryMap.forEach((counts, industry) => {
      labels.push(industry);
      successRates.push(counts.total > 0 ? parseFloat(((counts.won / counts.total) * 100).toFixed(2)) : 0);
      lossRates.push(counts.total > 0 ? parseFloat(((counts.lost / counts.total) * 100).toFixed(2)) : 0);
    });

    return { labels, successRates, lossRates };
  }, [data]);

  // Calculate Top 5 Loss Reasons
  const topLossReasons = useMemo(() => {
    if (data.length === 0) return { labels: [], counts: [] };

    const reasonMap = new Map<string, number>();
    data.filter(row => row.status === '失注' && row.reason).forEach(row => {
        const reason = row.reason!;
        reasonMap.set(reason, (reasonMap.get(reason) || 0) + row.count);
    });

    const sortedReasons = Array.from(reasonMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    return {
        labels: sortedReasons.map(entry => entry[0]),
        counts: sortedReasons.map(entry => entry[1]),
    };
  }, [data]);

  // --- Chart Configurations ---

  const successRateChartData = {
    labels: ratesByIndustry.labels,
    datasets: [{
      label: 'Success Rate (%)',
      data: ratesByIndustry.successRates,
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
    }],
  };
  
  const lossRateChartData = {
    labels: ratesByIndustry.labels,
    datasets: [{
      label: 'Loss Rate (%)',
      data: ratesByIndustry.lossRates,
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
    }],
  };

  const lossReasonChartData = {
    labels: topLossReasons.labels,
    datasets: [{
      label: 'Number of Lost Deals',
      data: topLossReasons.counts,
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
      ],
      borderColor: 'rgba(255, 255, 255, 0.7)',
      borderWidth: 1,
    }],
  };

  if (loading) return <p>Loading analytics data...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Success Rate by Industry</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <Bar options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false }} data={successRateChartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loss Rate by Industry</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <Bar options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false }} data={lossRateChartData} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top 5 Loss Reasons</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex justify-center items-center">
          <div className="w-full h-full max-w-sm">
             <Pie options={{ responsive: true, maintainAspectRatio: true }} data={lossReasonChartData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
