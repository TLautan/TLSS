// frontend/app/register/company/page.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterCompanyPage() {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!companyName.trim() || !industry.trim()) {
      setError('会社名と業種は必須です。(Company Name and Industry are required.)');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/companies/', {
        company_name: companyName,
        industry: industry,
      });

      setMessage(`Success! Company "${response.data.company_name}" has been registered.`);
      setCompanyName('');
      setIndustry('');

    } catch (apiError: unknown) { // FIX #1: Use 'unknown' instead of 'any'
      console.error("Error submitting company data:", apiError);
      
      // FIX #2: Add a type guard to safely check the error structure
      if (axios.isAxiosError(apiError) && apiError.response?.data?.detail) {
        setError(`Error: ${apiError.response.data.detail}`);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">会社登録 (Register Company)</h1>
      
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>新規会社情報 (New Company Information)</CardTitle>
          <CardDescription>
            新しい顧客の会社名と業種を登録します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">会社名 (Company Name)</Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="例：株式会社ミライAI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">業種 (Industry)</Label>
              <Input
                id="industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="例：IT、製造、金融"
              />
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {message && <p className="text-sm font-medium text-green-600">{message}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '保存中...' : '登録する (Register)'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
