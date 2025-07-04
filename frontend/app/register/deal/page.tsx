// frontend/app/register/deal/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsers, getCompanies, createDeal } from '@/lib/api';

// Define the types for the data we'll fetch
interface User {
  id: number;
  name: string;
}
interface Company {
  id: number;
  company_name: string;
}

export default function RegisterDealPage() {
  // State for the lists in our dropdowns
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  // State for the form inputs
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  
  // State for loading and feedback
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch users and companies when the component mounts
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // Validation
    if (!title || !value || !type || !selectedUserId || !selectedCompanyId) {
      setError('全フィールドを入力してください');
      setIsLoading(false);
      return;
    }

    try {
      const response = await createDeal({
        title: title,
        value: parseFloat(value),
        type: type,
        user_id: parseInt(selectedUserId),
        company_id: parseInt(selectedCompanyId),
      });

      setMessage(`成功! 取引 "${response.title}" は登録できました。`);
      setTitle('');
      setValue('');
      setType('');
      setSelectedUserId('');
      setSelectedCompanyId('');

    } catch (apiError: unknown) {
      console.error("Error submitting deal:", apiError);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">取引名 (Deal Title)</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例：新規ウェブサイト構築案件" />
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label htmlFor="value">金額 (Value)</Label>
              <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="例：500000" />
            </div>

            {/* Deal Type */}
            <div className="space-y-2">
              <Label htmlFor="type">タイプ (Type)</Label>
              <Select onValueChange={setType} value={type}>
                <SelectTrigger id="type"><SelectValue placeholder="タイプを選択..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company Select */}
            <div className="space-y-2">
              <Label htmlFor="company">会社 (Company)</Label>
              <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
                <SelectTrigger id="company"><SelectValue placeholder="会社を選択..." /></SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={String(company.id)}>{company.company_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User (Sales Rep) Select */}
            <div className="space-y-2">
              <Label htmlFor="user">担当者 (Sales Rep)</Label>
              <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                <SelectTrigger id="user"><SelectValue placeholder="担当者を選択..." /></SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {message && <p className="text-sm font-medium text-green-600">{message}</p>}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? '保存中...' : '登録する (Register)'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
