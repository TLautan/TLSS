// frontend/app/register/deal/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsers, getCompanies, createDeal } from '@/lib/api';
import { DealForm, DealFormData } from '@/features/deals/components/deal-form';
import { User, Company } from '@/lib/types';

export default function RegisterDealPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch data for the form's dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getUsers();
        const companiesData = await getCompanies();
        setUsers(usersData);
        setCompanies(companiesData);
      } catch (err) {
        setError('Failed to load initial data for dropdowns.');
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleRegisterSubmit = async (data: DealFormData) => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await createDeal({
        ...data,
        value: parseFloat(data.value),
        user_id: parseInt(data.user_id),
        company_id: parseInt(data.company_id),
      });
      setMessage(`Success! Deal "${response.title}" has been registered.`);
    } catch (apiError: unknown) {
      if (axios.isAxiosError(apiError) && apiError.response?.data?.detail) {
        setError(`Error: ${apiError.response.data.detail}`);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">取引登録 (Register Deal)</h1>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>新規取引情報 (New Deal Information)</CardTitle>
        </CardHeader>
        <CardContent>
          <DealForm
            onSubmit={handleRegisterSubmit}
            isLoading={isLoading}
            users={users}
            companies={companies}
          />
          {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
          {message && <p className="mt-4 text-sm font-medium text-green-600">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}