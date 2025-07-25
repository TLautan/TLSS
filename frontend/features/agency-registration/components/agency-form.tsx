// frontend/features/agency-registration/components/agency-form.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAgency } from '@/lib/api';

export default function AgencyForm() {
  const [formData, setFormData] = useState({
    agency_name: '',
    agency_kana: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      const response = await createAgency(formData);

      setMessage(`成功! 代理店 "${response.agency_name}" 登録完了しました`);
      // Reset form
      setFormData({
        agency_name: '', agency_kana: '', contact_person: '',
        contact_email: '', contact_phone: '', notes: '',
      });
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="agency_name">代理店名 (Agency Name)</Label>
          <Input id="agency_name" value={formData.agency_name} onChange={handleChange} placeholder="例：株式会社パートナー" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agency_kana">代理店名（カナ）</Label>
          <Input id="agency_kana" value={formData.agency_kana} onChange={handleChange} placeholder="例：カブシキガイシャパートナー" />
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
        <Textarea id="notes" value={formData.notes} onChange={handleChange} placeholder="代理店の詳細情報..." />
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {message && <p className="text-sm font-medium text-green-600">{message}</p>}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? '保存中...' : '代理店を登録 (Register Agency)'}
      </Button>
    </form>
  );
}
