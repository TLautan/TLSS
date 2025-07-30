// frontend/app/agencies/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAgency, updateAgency } from '@/lib/api';

export default function EditAgencyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    agency_name: '',
    agency_kana: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchAgencyData = async () => {
        try {
            const agencyId = parseInt(id, 10);
            if(isNaN(agencyId)) {
                setError("Invalid Agency ID.");
                return;
            }
            const data = await getAgency(agencyId);
            setFormData({
                agency_name: data.agency_name,
                agency_kana: data.agency_kana || '',
                contact_person: data.contact_person || '',
                contact_email: data.contact_email || '',
                contact_phone: data.contact_phone || '',
                notes: data.notes || '',
            });
        } catch (err) {
            setError("Failed to fetch agency data.");
            console.error(err);
        } finally {
            setIsFetching(false);
        }
    };
    fetchAgencyData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prevState => ({ ...prevState, [id]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!formData.agency_name.trim()) {
      setError('Agency Name is a required field.');
      setIsLoading(false);
      return;
    }

    try {
      const agencyId = parseInt(id, 10);
      await updateAgency(agencyId, formData);

      setMessage("Agency updated successfully!");
      setTimeout(() => router.push('/agencies'), 1500);
      
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
  
  if (isFetching) return <div>Loading agency details...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Agency</h1>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Update Agency Information</CardTitle>
          <CardDescription>
            Modify the details for {formData.agency_name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
             <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="agency_name">代理店名 (Agency Name)</Label>
                        <Input id="agency_name" value={formData.agency_name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="agency_kana">代理店名（カナ）</Label>
                        <Input id="agency_kana" value={formData.agency_kana} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact_person">担当者名</Label>
                        <Input id="contact_person" value={formData.contact_person} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact_email">連絡先メール</Label>
                        <Input id="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact_phone">連絡先電話番号</Label>
                        <Input id="contact_phone" type="tel" value={formData.contact_phone} onChange={handleChange} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">備考 (Notes)</Label>
                    <Textarea id="notes" value={formData.notes} onChange={handleChange} />
                </div>

                {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                {message && <p className="text-sm font-medium text-green-600">{message}</p>}

                <div className="flex space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.push('/agencies')}>Cancel</Button>
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