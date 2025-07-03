// frontend/app/analytics/deal-outcomes/page.tsx

"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Define the type for the data we expect from the API
interface OutcomeData {
  year: number;
  month: number;
  status: string;
  industry: string;
  reason: string | null;
  count: number;
}

export default function DealOutcomesPage() {
  const [data, setData] = useState<OutcomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // We will centralize this in lib/api.ts later
        const response = await axios.get('http://127.0.0.1:8000/api/analytics/deal-outcomes');
        setData(response.data);
      } catch (err) {
        setError('Failed to load analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">取引成果分析 (Deal Outcome Analysis)</h1>
      <Card>
        <CardHeader>
          <CardTitle>Raw Data Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading data...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.year}-{row.month}</TableCell>
                    <TableCell>{row.industry}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.reason || 'N/A'}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

