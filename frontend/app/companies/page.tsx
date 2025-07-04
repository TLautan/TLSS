// frontend/app/companies/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCompanies } from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';

// Define the type for the company data
interface Company {
  id: number;
  company_name: string;
  industry: string;
  created_at: string;
}

export default function CompaniesListPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companiesData = await getCompanies();
        setCompanies(companiesData);
      } catch (err) {
        setError('Failed to load companies.');
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
          <h1 className="text-3xl font-bold">会社一覧 (Company List)</h1>
          <p className="text-muted-foreground">登録された会社管理表</p>
        </div>
        <Link href="/register/company">
          <Button>+ 会社追加</Button>
        </Link>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {loading && <p>Loading companies...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>会社名 (Company Name)</TableHead>
                  <TableHead>業種 (Industry)</TableHead>
                  <TableHead>登録日 (Date Registered)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.company_name}</TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>{new Date(company.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      会社が見つかりませんでした。
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
