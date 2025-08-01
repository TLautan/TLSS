// frontend/app/deals/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDeal, updateDeal, getUsers, getCompanies } from '@/lib/api';
import { User, Company } from '@/lib/types';
import { DealForm, DealFormData } from '@/features/deals/components/deal-form';
import { Button } from '@/components/ui/button';

export default function EditDealPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialData, setInitialData] = useState<Partial<DealFormData> | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async () => {
      try {
        const dealId = parseInt(id, 10);
        const [dealData, usersData, companiesData] = await Promise.all([
          getDeal(dealId),
          getUsers(),
          getCompanies()
        ]);

        setInitialData({
          ...dealData,
          value: String(dealData.value),
          user_id: String(dealData.user_id),
          company_id: String(dealData.company_id),
        });
        setUsers(usersData);
        setCompanies(companiesData);
      } catch (err) {
        setError("Failed to fetch initial data for the form.");
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleEditSubmit = async (data: DealFormData) => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const dealId = parseInt(id, 10);
      await updateDeal(dealId, {
        ...data,
        status: data.status as 'in_progress' | 'won' | 'lost' | 'cancelled',
        value: parseFloat(data.value),
        user_id: parseInt(data.user_id),
        company_id: parseInt(data.company_id),
      });

      setMessage("Deal updated successfully!");
      setTimeout(() => router.push('/deals'), 1500);
    } catch (apiError) {
      if (axios.isAxiosError(apiError) && apiError.response?.data?.detail) {
        setError(`Error: ${apiError.response.data.detail}`);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div>読み込み中</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">編集</h1>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>取引情報の更新</CardTitle>
          <CardDescription>{`"{initialData?.title}"`}の詳細を変更します。</CardDescription>
        </CardHeader>
        <CardContent>
          <DealForm
            onSubmit={handleEditSubmit}
            isLoading={isLoading}
            users={users}
            companies={companies}
            initialData={initialData}
          />
          {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
          {message && <p className="mt-4 text-sm font-medium text-green-600">{message}</p>}
           <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/deals')}>
              取り消し
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}