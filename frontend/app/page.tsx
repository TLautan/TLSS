// frontend/app/page.tsx
"use client";

import { useEffect, useState } from 'react';

// Imports for react-chartjs-2 (for Chart.js graph)
import { Bar as ChartjsBar } from 'react-chartjs-2';

// Imports for Recharts (for Recharts graph)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'; // Bar is used for Recharts
import { Tooltip as RechartsTooltip, Legend as RechartsLegend } from 'recharts'; // Recharts specific Tooltip and Legend

// Lucide Icons (combined)
import { DollarSign, Users, CreditCard, Activity as ActivityIcon, Zap, Target } from 'lucide-react';

// Shadcn UI Components (combined)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// API Calls (combined)
import { getOverallKpis, getDashboardData, getDeals } from '@/lib/api';

// --- Consolidated Type Definitions ---

interface OverallKpiData {
  direct_sales: { conclusion_rate: number; won_count: number };
  agency_sales: { conclusion_rate: number; won_count: number };
  average_customer_unit_price: number;
  monthly_sales_data: {
    length: number; data: { label: string; sales: number }[] 
};
  total_annual_sales: number;
}

// Type for dashboard analytics data (renamed from DashboardData)
interface DashboardAnalyticsData {
  total_revenue: number;
  win_rate: number;
  total_deals: number;
  average_deal_size: number;
  monthly_sales_chart_data: { name: string; total: number }[]; // Data format for Recharts
}

// Type for Deal (from page.tsx)
interface Deal {
  id: number;
  title: string;
  value: number;
  status: string;
  user?: { name: string };
  company?: { company_name: string };
}


export default function DashboardPage() {
  // --- State Variables (combined) ---
  const [overallKpis, setOverallKpis] = useState<OverallKpiData | null>(null);
  const [dashboardAnalytics, setDashboardAnalytics] = useState<DashboardAnalyticsData | null>(null);
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Consolidated Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [overallKpisData, analyticsData, dealsData] = await Promise.all([
          getOverallKpis(),
          getDashboardData(),
          getDeals({ limit: 5 })
        ]);
        
        setOverallKpis(overallKpisData);
        setDashboardAnalytics(analyticsData);
        setRecentDeals(dealsData);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold">Loading Dashboard...</div>
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

  if (!overallKpis && !dashboardAnalytics) {
    return <div className="flex items-center justify-center h-screen"><p>No data available for the dashboard.</p></div>;
  }

  // --- Chart.js Data Preparation (uses overallKpis) ---
  const salesChartData = overallKpis ? {
    labels: overallKpis.monthly_sales_data.data.map(d => d.label),
    datasets: [{
      label: '月間売上 (Monthly Sales)',
      data: overallKpis.monthly_sales_data.data.map(d => d.sales),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  } : { labels: [], datasets: [] };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sales Dashboard</h2>
      </div>
      
      {/* KPI Cards Grid - Combined and organized */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Annual Sales (from draft.tsx) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">年間総売上 (Total Annual Sales)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{overallKpis?.total_annual_sales.toLocaleString() || '0'}</div>
          </CardContent>
        </Card>

        {/* Avg. Unit Price (from draft.tsx) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">顧客平均単価 (Avg. Unit Price)</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{overallKpis?.average_customer_unit_price.toLocaleString() || '0'}</div>
          </CardContent>
        </Card>

        {/* Direct Sales (from draft.tsx) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">直販売上 (Direct Sales)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{overallKpis?.direct_sales.won_count || '0'}</div>
            <p className="text-xs text-muted-foreground">成約率: {overallKpis?.direct_sales.conclusion_rate || '0'}%</p>
          </CardContent>
        </Card>

        {/* Agency Sales (from draft.tsx) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">代理店売上 (Agency Sales)</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{overallKpis?.agency_sales.won_count || '0'}</div>
            <p className="text-xs text-muted-foreground">成約率: {overallKpis?.agency_sales.conclusion_rate || '0'}%</p>
          </CardContent>
        </Card>

        {/* Total Revenue (from page.tsx) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総収益 (Total Revenue)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{dashboardAnalytics?.total_revenue.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">すべての受注取引からの総収益</p>
          </CardContent>
        </Card>

        {/* Win Rate (from page.tsx) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">勝率 (Win Rate)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardAnalytics?.win_rate || '0'}%</div>
            <p className="text-xs text-muted-foreground">成約した取引の割合</p>
          </CardContent>
        </Card>

        {/* Total Deals (from page.tsx) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総取引数 (Total Deals)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardAnalytics?.total_deals || '0'}</div>
            <p className="text-xs text-muted-foreground">パイプライン内の総取引数</p>
          </CardContent>
        </Card>

        {/* Average Deal Size (from page.tsx) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均取引規模 (Average Deal Size)</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{dashboardAnalytics?.average_deal_size.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">成約済み取引の平均価格</p>
          </CardContent>
        </Card>

      </div>

      {/* Charts and Recent Deals Table (combined) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        
        {/* Monthly Sales Trend Chart (Chart.js Bar) - uses overallKpis */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>月間売上推移 (Monthly Sales Trend - Chart.js)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {overallKpis?.monthly_sales_data && overallKpis.monthly_sales_data.length > 0 ? (
                <ChartjsBar options={{ responsive: true, maintainAspectRatio: false }} data={salesChartData} />
              ) : (
                <p className="text-muted-foreground text-center py-10">No monthly sales data available from KPI source.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Sales Overview Chart (Recharts BarChart) - uses dashboardAnalytics */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>月間売上概要 (Monthly Sales Overview - Recharts)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {dashboardAnalytics && dashboardAnalytics.monthly_sales_chart_data && dashboardAnalytics.monthly_sales_chart_data.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dashboardAnalytics.monthly_sales_chart_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `¥${(value / 10000).toLocaleString()}万`} />
                  <RechartsTooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                  <RechartsLegend />
                  <Bar dataKey="total" fill="#8884d8" name="Total Sales" /> {/* This is Recharts Bar */}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-10">No monthly sales overview data available from Dashboard source.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Deals Table (from compil/page.tsx) */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>最近の取引 (Recent Deals)</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>会社 (Company)</TableHead>
                    <TableHead>担当者 (Sales Rep)</TableHead>
                    <TableHead className="text-right">金額 (Value)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>
                          <div className="font-medium">{deal.company?.company_name || 'N/A'}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">{deal.title}</div>
                      </TableCell>
                      <TableCell>{deal.user?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right">¥{deal.value.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-10">No recent deals available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}