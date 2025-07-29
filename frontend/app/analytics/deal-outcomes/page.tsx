// frontend/app/analytics/deal-outcomes/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDealOutcomesData } from '@/lib/api';
import { DealOutcomesData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function DealOutcomesPage() {
  const [data, setData] = useState<DealOutcomesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const outcomesData = await getDealOutcomesData();
        setData(outcomesData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch deal outcome data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading analysis...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Deal Outcome Analysis</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Win Reasons</CardTitle>
            <CardDescription>{`What's driving successful deals?`}</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.win_reasons && data.win_reasons.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.win_reasons} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="reason" width={100} />
                  <Tooltip cursor={{ fill: '#fafafa' }} />
                  <Bar dataKey="count" name="Won Deals" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p>No win reason data available.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Loss Reasons</CardTitle>
            <CardDescription>Why are we losing deals?</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.loss_reasons && data.loss_reasons.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.loss_reasons} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="reason" width={100} />
                  <Tooltip cursor={{ fill: '#fafafa' }} />
                  <Bar dataKey="count" name="Lost Deals" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p>No loss reason data available.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance by Industry</CardTitle>
          <CardDescription>Which industries are our strongest markets?</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Industry</TableHead>
                <TableHead>Total Deals</TableHead>
                <TableHead>Won Deals</TableHead>
                <TableHead>Win Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.industry_performance && data.industry_performance.length > 0 ? (
                data.industry_performance.map((item) => (
                  <TableRow key={item.industry}>
                    <TableCell className="font-medium">{item.industry}</TableCell>
                    <TableCell>{item.total_deals}</TableCell>
                    <TableCell>{item.won_deals}</TableCell>
                    <TableCell>
                        <Badge variant={item.win_rate > 50 ? 'default' : 'secondary'}>
                            {item.win_rate.toFixed(2)}%
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">No industry performance data available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
