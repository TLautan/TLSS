// frontend/app/components/datadisplay.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Import the shadcn/ui Card components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Register the components Chart.js needs
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SalesData {
  months: string;
  sales: number;
}

export default function DataDisplay() {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/data`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("Failed to load data from the API.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const chartData = {
    labels: data.map(d => d.months),
    datasets: [
      {
        label: 'Monthly Sales',
        data: data.map(d => d.sales),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Replace the generic <div> with the <Card> component
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Sales Data from Python Backend</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar data={chartData} />
      </CardContent>
    </Card>
  );
}