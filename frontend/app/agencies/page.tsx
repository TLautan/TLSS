// frontend/app/agencies/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAgencies } from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';

// Define the type for the agency data
interface Agency {
  id: number;
  agency_name: string;
  contact_person: string | null;
  contact_email: string | null;
}

export default function AgenciesListPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const agenciesData = await getAgencies();
        setAgencies(agenciesData);
      } catch (err) {
        setError('Failed to load agencies.');
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
          <h1 className="text-3xl font-bold">代理店一覧 (Agency List)</h1>
          <p className="text-muted-foreground">代理店管理</p>
        </div>
        <Link href="/register/agency">
          <Button>+ 代理店追加</Button>
        </Link>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {loading && <p>ロード中</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>代理店名 (Agency Name)</TableHead>
                  <TableHead>担当者 (Contact Person)</TableHead>
                  <TableHead>連絡先メール (Contact Email)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies.length > 0 ? (
                  agencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">{agency.agency_name}</TableCell>
                      <TableCell>{agency.contact_person || 'N/A'}</TableCell>
                      <TableCell>{agency.contact_email || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      代理店見つかりませんでした。
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
