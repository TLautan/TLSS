// frontend/app/deals/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDeals } from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Define the types for the nested data
interface User {
  id: number;
  name: string;
}
interface Company {
  id: number;
  company_name: string;
}
interface Deal {
  id: number;
  title: string;
  value: number;
  status: string;
  user: User; // Nested user object
  company: Company; // Nested company object
}

export default function DealsListPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dealsData = await getDeals();
        setDeals(dealsData);
      } catch (err) {
        setError('Failed to load deals.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">取引一覧 (Deal List)</h1>
          <p className="text-muted-foreground">取引管理</p>
        </div>
        <Link href="/register/deal">
          <Button>+ 取引登録</Button>
        </Link>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {loading && <p>Loading deals...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>取引</TableHead>
                  <TableHead>会社</TableHead>
                  <TableHead>担当者</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">バリュー</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.length > 0 ? (
                  deals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">{deal.title}</TableCell>
                      <TableCell>{deal.company.company_name}</TableCell>
                      <TableCell>{deal.user.name}</TableCell>
                      <TableCell><Badge variant="outline">{deal.status}</Badge></TableCell>
                      <TableCell className="text-right">¥{deal.value.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      取引見つかりませんでした。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
