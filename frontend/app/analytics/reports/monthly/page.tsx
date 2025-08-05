// frontend/app/analytics/reports/monthly/page.tsx
"use client";

import { useState } from 'react';
import { getMonthlyReport } from '@/lib/api';
import { MonthlyReportData } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Trophy, Star } from 'lucide-react';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
const months = [
    { value: "1", label: "January" }, { value: "2", label: "February" },
    { value: "3", label: "March" }, { value: "4", label: "April" },
    { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
];

export default function MonthlyReportPage() {
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);
    try {
      const data = await getMonthlyReport(Number(selectedYear), Number(selectedMonth));
      setReportData(data);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monthly Sales Report</h1>
          <p className="text-muted-foreground">Generate a summary of sales performance for a selected month.</p>
        </div>
        {reportData && (
            <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print Report
            </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6 flex items-center space-x-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Year" /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Month" /></SelectTrigger>
            <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>
      
      {error && <p className="text-destructive text-center">{error}</p>}
      
      {reportData && (
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sales Report for {reportData.month_label}</CardTitle>
            <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                <StatCard title="Total Revenue" value={`¥${reportData.total_revenue.toLocaleString()}`} />
                <StatCard title="Deals Won" value={reportData.deals_won} />
                <StatCard title="Deals Lost" value={reportData.deals_lost} />
                <StatCard title="Win Rate" value={`${reportData.win_rate}%`} />
                <StatCard title="New Deals Created" value={reportData.new_deals} />
                <StatCard title="Average Deal Size" value={`¥${Math.round(reportData.average_deal_size).toLocaleString()}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <HighlightCard icon={Star} title="Top Deal of the Month" data={reportData.top_deal ? `${reportData.top_deal.title} (¥${Number(reportData.top_deal.value).toLocaleString()})` : "N/A"} />
                <HighlightCard icon={Trophy} title="Top Performer of the Month" data={reportData.top_performer ? `${reportData.top_performer.user_name} (¥${reportData.top_performer.total_revenue.toLocaleString()})` : "N/A"} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper components for the report display
function StatCard({ title, value }: { title: string, value: string | number }) {
    return (
        <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}

function HighlightCard({ icon: Icon, title, data }: { icon: React.ElementType, title: string, data: string}) {
    return (
        <div className="flex items-center space-x-4">
            <Icon className="h-8 w-8 text-primary" />
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="font-semibold">{data}</p>
            </div>
        </div>
    );
}