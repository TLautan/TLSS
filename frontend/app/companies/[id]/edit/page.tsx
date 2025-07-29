// frontend/app/companies/[id]/edit/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCompany, updateCompany } from '@/lib/api';
import axios from 'axios';

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchCompanyData = async () => {
      try {
        const companyId = parseInt(id, 10);
        if (isNaN(companyId)) {
            setError("Invalid company ID.");
            return;
        }
        const data = await getCompany(companyId);
        setCompanyName(data.company_name);
        setIndustry(data.industry);
      } catch (err) {
        setError("Failed to fetch company data.");
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!companyName.trim() || !industry.trim()) {
      setError('Company Name and Industry are required.');
      setIsLoading(false);
      return;
    }

    try {
        const companyId = parseInt(id, 10);
        await updateCompany(companyId, {
            company_name: companyName,
            industry: industry,
        });

        setMessage("Company updated successfully!");
        // Redirect back to the company list after a short delay
        setTimeout(() => router.push('/companies'), 1500);

    } catch (apiError: unknown) {
      console.error("Error updating company data:", apiError);
      if (axios.isAxiosError(apiError) && apiError.response?.data?.detail) {
        setError(`Error: ${apiError.response.data.detail}`);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
      return <div>Loading company details...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Company</h1>
      
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Update Company Information</CardTitle>
          <CardDescription>
            Modify the details for {companyName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Mirai AI Inc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., IT, Manufacturing, Finance"
              />
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {message && <p className="text-sm font-medium text-green-600">{message}</p>}

            <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push('/companies')}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-grow">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}