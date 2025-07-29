// frontend/app/deals/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDeal, updateDeal, getUsers, getCompanies } from '@/lib/api';
import { User, Company } from '@/lib/types';

export default function EditDealPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    type: '',
    status: '',
    user_id: '',
    company_id: '',
    lead_source: '',
    product_name: '',
    forecast_accuracy: '',
  });

  // Data for dropdowns
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Loading and feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Constants for dropdown options
  const DEAL_TYPES = ["direct", "agency"];
  const DEAL_STATUSES = ["in_progress", "won", "lost", "cancelled"];
  const LEAD_SOURCES = ["Web Inquiry", "Referral", "Exhibition", "Cold Call"];
  const PRODUCTS = ["Standard Plan", "Pro Plan", "Enterprise Solution"];
  const FORECAST_ACCURACY = ["高", "中", "低"];

  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async () => {
      try {
        const dealId = parseInt(id, 10);
        if (isNaN(dealId)) {
          setError("Invalid deal ID.");
          return;
        }
        
        // Fetch deal, users, and companies in parallel for efficiency
        const [dealData, usersData, companiesData] = await Promise.all([
          getDeal(dealId),
          getUsers(),
          getCompanies()
        ]);

        setFormData({
          title: dealData.title,
          value: String(dealData.value),
          type: dealData.type,
          status: dealData.status,
          user_id: String(dealData.user_id),
          company_id: String(dealData.company_id),
          lead_source: dealData.lead_source || '',
          product_name: dealData.product_name || '',
          forecast_accuracy: dealData.forecast_accuracy || '',
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

  const handleInputChange = (id: string, value: string) => {
    setFormData(prevState => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const dealId = parseInt(id, 10);
      await updateDeal(dealId, {
        ...formData,
        title: (formData.title),
        value: parseFloat(formData.value),
        type: formData.type,
        status: formData.status,
        user_id: parseInt(formData.user_id),
        company_id: parseInt(formData.company_id),
        lead_source: formData.lead_source,
        product_name: formData.product_name,
        forecast_accuracy: formData.forecast_accuracy,
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

  if (isFetching) return <div>Loading form...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Deal</h1>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Update Deal Information</CardTitle>
          <CardDescription>Modify the details for {`"{formData.title}"`}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input id="value" type="number" value={formData.value} onChange={(e) => handleInputChange('value', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(v) => handleInputChange('status', v)} value={formData.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Company</Label>
                <Select onValueChange={(v) => handleInputChange('company_id', v)} value={formData.company_id}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {companies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.company_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sales Rep</Label>
                <Select onValueChange={(v) => handleInputChange('user_id', v)} value={formData.user_id}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {users.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Deal Type</Label>
                    <Select onValueChange={(v) => handleInputChange('type', v)} value={formData.type}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {DEAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Lead Source</Label>
                    <Select onValueChange={(v) => handleInputChange('lead_source', v)} value={formData.lead_source}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {LEAD_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Select onValueChange={(v) => handleInputChange('product_name', v)} value={formData.product_name}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {PRODUCTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Forecast Accuracy</Label>
                    <Select onValueChange={(v) => handleInputChange('forecast_accuracy', v)} value={formData.forecast_accuracy}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {FORECAST_ACCURACY.map(fa => <SelectItem key={fa} value={fa}>{fa}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {message && <p className="text-sm font-medium text-green-600">{message}</p>}

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push('/deals')}>Cancel</Button>
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