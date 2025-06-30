// frontend/features/analytics/components/cancellation_rate_chart.tsx
"use client";

import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getMonthlyCancellationRate } from '@/lib/api'; // Import our API function

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the shape of the data we expect from the API
interface ChurnData {
  label: string;
  cancellation_rate: number;
}

export default function CancellationRateChart() {
  const [chartData, setChartData] = useState<ChurnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMonthlyCancellationRate();
        setChartData(data);
      } catch (err) {
        setError('Failed to load chart data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dataForBarChart = {
    labels: chartData.map(d => d.label),
    datasets: [
      {
        label: 'Cancellation Rate (%)',
        data: chartData.map(d => d.cancellation_rate),
        backgroundColor: 'rgba(239, 68, 68, 0.6)', // Red color for cancellations
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>月次解約率</CardTitle>
        <CardDescription>Overall Monthly Cancellation Rate</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading chart...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && <Bar data={dataForBarChart} />}
      </CardContent>
    </Card>
  );
}