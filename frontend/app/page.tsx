"use client";

import { useState, useEffect } from 'react';
//import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { DollarSign, Zap, Target, Users } from "lucide-react";
import { getOverallKpis } from '@/lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the types for our API data structure
interface SalesData {
  label: string;
  sales: number;
}

interface KpiData {
  direct_sales: { conclusion_rate: number; won_count: number };
  agency_sales: { conclusion_rate: number; won_count: number };
  average_customer_unit_price: number;
  monthly_sales_data: SalesData[];
  total_annual_sales: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOverallKpis()
        setKpis(data);
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p>Loading Dashboard...</p></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full"><p className="text-red-500">{error}</p></div>;
  }
  if (!kpis) {
    return <div className="flex items-center justify-center h-full"><p>No data available.</p></div>;
  }

  // Define the data for the sales chart
  const salesChartData = {
    labels: kpis.monthly_sales_data.map(d => d.label),
    datasets: [{
      label: 'Monthly Sales',
      data: kpis.monthly_sales_data.map(d => d.sales),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* KPI Cards Grid - This is the single, correct grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">年間総売上 (Total Annual Sales)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{kpis.total_annual_sales.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">顧客平均単価 (Avg. Unit Price)</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{kpis.average_customer_unit_price.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">直販売上 (Direct Sales)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{kpis.direct_sales.won_count}</div>
            <p className="text-xs text-muted-foreground">成約率: {kpis.direct_sales.conclusion_rate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">代理店売上 (Agency Sales)</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{kpis.agency_sales.won_count}</div>
            <p className="text-xs text-muted-foreground">成約率: {kpis.agency_sales.conclusion_rate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Chart */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>月間売上推移 (Monthly Sales Trend)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <Bar options={{ responsive: true, maintainAspectRatio: false }} data={salesChartData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
