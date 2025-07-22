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

  // NEW: State variables for the new fields
  const [leadSource, setLeadSource] = useState('');
  const [productName, setProductName] = useState('');
  const [forecastAccuracy, setForecastAccuracy] = useState('');

  // State for loading and feedback
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const LEAD_SOURCES = ["Web Inquiry", "Referral", "Exhibition", "Cold Call"];
  const PRODUCTS = ["Standard Plan", "Pro Plan", "Enterprise Solution"];
  const FORECAST_ACCURACY = ["高", "中", "低"]; // "High", "Medium", "Low"

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
  }, []); // Empty dependency array means this runs once on mount

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // Validation - Now 'leadSource', 'productName', 'forecastAccuracy' are actual state variables
    if (!title || !value || !type || !selectedUserId || !selectedCompanyId || !leadSource || !productName || !forecastAccuracy) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      // Pass all form data to the createDeal API function
      const response = await createDeal({
        title: title,
        value: parseFloat(value),
        type: type,
        user_id: parseInt(selectedUserId),
        company_id: parseInt(selectedCompanyId),
        lead_source: leadSource, // Now correctly bound
        product_name: productName, // Now correctly bound
        forecast_accuracy: forecastAccuracy, // Now correctly bound
      });

      // Show success message
      setMessage(`成功! 取引 "${response.title}" は登録できました。`);

      // Reset form fields after successful submission
      setTitle('');
      setValue('');
      setType('');
      setSelectedUserId('');
      setSelectedCompanyId('');
      setLeadSource(''); // NEW: Resetting leadSource
      setProductName(''); // NEW: Resetting productName
      setForecastAccuracy(''); // NEW: Resetting forecastAccuracy

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

            {/* Lead Source Select - Now correctly bound */}
            <div className="space-y-2">
              <Label htmlFor="leadSource">リードソース (Lead Source)</Label>
              <Select onValueChange={setLeadSource} value={leadSource}>
                <SelectTrigger id="leadSource"><SelectValue placeholder="ソースを選択..." /></SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Name Select - Now correctly bound */}
            <div className="space-y-2">
              <Label htmlFor="productName">商材名 (Product Name)</Label>
              <Select onValueChange={setProductName} value={productName}>
                <SelectTrigger id="productName"><SelectValue placeholder="商材を選択..." /></SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map(product => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Forecast Accuracy Select - Now correctly bound */}
            <div className="space-y-2">
              <Label htmlFor="forecastAccuracy">ヨミ精度 (Forecast Accuracy)</Label>
              <Select onValueChange={setForecastAccuracy} value={forecastAccuracy}>
                <SelectTrigger id="forecastAccuracy"><SelectValue placeholder="精度を選択..." /></SelectTrigger>
                <SelectContent>
                  {FORECAST_ACCURACY.map(accuracy => (
                    <SelectItem key={accuracy} value={accuracy}>{accuracy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Feedback messages */}
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