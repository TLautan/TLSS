// frontend/app/companies/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCompany } from '@/lib/api';
import { Company } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { NotesSection } from '@/features/notes/components/notes-section';
import { AttachmentsSection } from '@/features/attachments/components/attachments-section';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const companyId = parseInt(id, 10);
        if (isNaN(companyId)) {
          setError("Invalid company ID.");
          return;
        }
        
        const companyData = await getCompany(companyId);
        setCompany(companyData);
      } catch (err) {
        setError("Failed to fetch company details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-8">ロード中</div>;
  }

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>;
  }

  if (!company) {
    return <div className="p-8">会社が見つかりませんでした。</div>;
  }

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{company.company_name}</h1>
          <p className="text-muted-foreground">
            業務内容：{company.industry}
          </p>
        </div>
        <Button onClick={() => router.push(`/companies/${company.id}/edit`)}>編集</Button>
      </div>

      {/* Associated Deals Card */}
      <Card>
        <CardHeader>
          <CardTitle>関連取引</CardTitle>
          <CardDescription>関連するすべての取引 {company.company_name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>取引名</TableHead>
                <TableHead>代表</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">バリュー</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {company.deals && company.deals.length > 0 ? (
                company.deals.map(deal => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">
                       <Link href={`/deals/${deal.id}`} className="hover:underline">
                          {deal.title}
                        </Link>
                    </TableCell>
                    <TableCell>{deal.user?.name || 'N/A'}</TableCell>
                    <TableCell><Badge variant="outline">{deal.status}</Badge></TableCell>
                    <TableCell className="text-right">¥{Number(deal.value).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    この会社の取引がありません。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <NotesSection relatedTo="company" relatedId={company.id} />
      <AttachmentsSection relatedTo="company" relatedId={company.id} />
    </div>
  );
}