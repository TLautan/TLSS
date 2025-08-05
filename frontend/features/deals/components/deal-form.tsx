// frontend/features/deals/components/deal-form.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
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

  const companyOptions: ComboboxOption[] = useMemo(() => 
    companies.map(c => ({ value: String(c.id), label: c.company_name })),
    [companies]
  );
  
  const userOptions: ComboboxOption[] = useMemo(() => 
    users.map(u => ({ value: String(u.id), label: u.name })),
    [users]
  );

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
              <Label>会社</Label>
              <Combobox
                options={companyOptions}
                value={formData.company_id}
                onChange={(value) => handleInputChange('company_id', value)}
                placeholder="会社選択"
                searchPlaceholder="会社検索"
                emptyPlaceholder="会社が見つかりませんでした"
              />
            </div>
            <div className="space-y-2">
              <Label>担当</Label>
              <Combobox
                options={userOptions}
                value={formData.user_id}
                onChange={(value) => handleInputChange('user_id', value)}
                placeholder="ユーザー選択"
                searchPlaceholder="ユーザー検索"
                emptyPlaceholder="ユーザーが見つかりませんでした"
              />
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