// frontend/features/deals/components/deal-form.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEAL_STATUSES, DEAL_TYPES, LEAD_SOURCES, PRODUCTS, FORECAST_ACCURACY } from '@/lib/constants';
import { User, Company } from '@/lib/types';

export type DealFormData = {
  title: string;
  value: string;
  type: string;
  status: string;
  user_id: string;
  company_id: string;
  lead_source: string;
  product_name: string;
  forecast_accuracy: string;
  win_reason: string;
  loss_reason: string;
  cancellation_reason: string;
};

interface DealFormProps {
  users: User[];
  companies: Company[];
  initialData?: Partial<DealFormData>;
  onSubmit: (data: DealFormData) => Promise<void>;
  isLoading: boolean;
}

export const DealForm = ({ users, companies, initialData, onSubmit, isLoading }: DealFormProps) => {
  const [formData, setFormData] = useState<DealFormData>({
    title: '', value: '', type: '', status: 'in_progress', user_id: '',
    company_id: '', lead_source: '', product_name: '', forecast_accuracy: '',
    win_reason: '', loss_reason: '', cancellation_reason: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        value: initialData.value || '',
        type: initialData.type || '',
        status: initialData.status || 'in_progress',
        user_id: initialData.user_id || '',
        company_id: initialData.company_id || '',
        lead_source: initialData.lead_source || '',
        product_name: initialData.product_name || '',
        forecast_accuracy: initialData.forecast_accuracy || '',
        win_reason: initialData.win_reason || '',
        loss_reason: initialData.loss_reason || '',
        cancellation_reason: initialData.cancellation_reason || '',
      });
    }
  }, [initialData]);

  const handleInputChange = (id: keyof DealFormData, value: string) => {
    setFormData(prevState => ({ ...prevState, [id]: value }));
  };
  
  const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="title">取引名</Label>
            <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="value">価値</Label>
            <Input id="value" type="number" value={formData.value} onChange={(e) => handleInputChange('value', e.target.value)} />
            </div>
            <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
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
                <SelectTrigger><SelectValue placeholder="会社名" /></SelectTrigger>
                <SelectContent>
                {companies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.company_name}</SelectItem>)}
                </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
            <Label>営業担当</Label>
            <Select onValueChange={(v) => handleInputChange('user_id', v)} value={formData.user_id}>
                <SelectTrigger><SelectValue placeholder="担当名" /></SelectTrigger>
                <SelectContent>
                {users.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                </SelectContent>
            </Select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>取引種類</Label>
                <Select onValueChange={(v) => handleInputChange('type', v)} value={formData.type}>
                    <SelectTrigger><SelectValue placeholder="種類" /></SelectTrigger>
                    <SelectContent>
                        {DEAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>リード</Label>
                <Select onValueChange={(v) => handleInputChange('lead_source', v)} value={formData.lead_source}>
                    <SelectTrigger><SelectValue placeholder="リード" /></SelectTrigger>
                    <SelectContent>
                        {LEAD_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>プロダクト名</Label>
                <Select onValueChange={(v) => handleInputChange('product_name', v)} value={formData.product_name}>
                    <SelectTrigger><SelectValue placeholder="商品" /></SelectTrigger>
                    <SelectContent>
                        {PRODUCTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>予測精度</Label>
                <Select onValueChange={(v) => handleInputChange('forecast_accuracy', v)} value={formData.forecast_accuracy}>
                    <SelectTrigger><SelectValue placeholder="精度" /></SelectTrigger>
                    <SelectContent>
                        {FORECAST_ACCURACY.map(fa => <SelectItem key={fa} value={fa}>{fa}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
        {formData.status === 'won' && (
            <div className="space-y-2">
                <Label htmlFor="win_reason">受注理由</Label>
                <Textarea id="win_reason" value={formData.win_reason} onChange={(e) => handleInputChange('win_reason', e.target.value)} placeholder="e.g., Better pricing, superior features..." />
            </div>
        )}
        {formData.status === 'lost' && (
            <div className="space-y-2">
                <Label htmlFor="loss_reason">失注理由</Label>
                <Textarea id="loss_reason" value={formData.loss_reason} onChange={(e) => handleInputChange('loss_reason', e.target.value)} placeholder="e.g., Competitor offered a discount..." />
            </div>
        )}
        {formData.status === 'cancelled' && (
            <div className="space-y-2">
                <Label htmlFor="cancellation_reason">キャンセル理由</Label>
                <Textarea id="cancellation_reason" value={formData.cancellation_reason} onChange={(e) => handleInputChange('cancellation_reason', e.target.value)} placeholder="e.g., Project budget cut, change in priorities..." />
            </div>
        )}      
        <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Saving...' : '保存'}
        </Button>
    </form>
  );
};