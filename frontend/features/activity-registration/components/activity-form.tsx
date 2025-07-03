// frontend/ features/activity-registration/components/activity-form.tsx

"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDeals } from '@/lib/api';

// Define the types for the data we'll fetch
interface Deal {
  id: number;
  title: string;
}

const ACTIVITY_TYPES = ["電話", "メール", "会議"]; // Corresponds to your ActivityType Enum

export default function ActivityForm() {
  // State for the dropdown list
  const [deals, setDeals] = useState<Deal[]>([]);
  
  // State for form inputs
  const [selectedDealId, setSelectedDealId] = useState('');
  const [activityType, setActivityType] = useState('');
  const [notes, setNotes] = useState('');
  
  // State for loading and feedback
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch deals when the component mounts to populate the dropdown
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const dealsData = await getDeals();
        setDeals(dealsData);
      } catch (err) {
        setError('Failed to load deals for dropdown.');
        console.error(err);
      }
    };
    fetchDeals();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDealId || !activityType) {
      setError('Deal and Activity Type are required.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/deals/${selectedDealId}/activities/`, {
        deal_id: parseInt(selectedDealId),
        type: activityType,
        notes: notes,
      });

      setMessage(`Success! Activity logged for deal ID ${response.data.deal_id}.`);
      // Reset form
      setSelectedDealId('');
      setActivityType('');
      setNotes('');
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
      {/* Deal Select */}
      <div className="space-y-2">
        <Label htmlFor="deal">取引 (Deal)</Label>
        <Select onValueChange={setSelectedDealId} value={selectedDealId}>
          <SelectTrigger id="deal"><SelectValue placeholder="取引を選択..." /></SelectTrigger>
          <SelectContent>
            {deals.map(deal => (
              <SelectItem key={deal.id} value={String(deal.id)}>{deal.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Activity Type Select */}
      <div className="space-y-2">
        <Label htmlFor="type">活動タイプ (Activity Type)</Label>
        <Select onValueChange={setActivityType} value={activityType}>
          <SelectTrigger id="type"><SelectValue placeholder="活動タイプを選択..." /></SelectTrigger>
          <SelectContent>
            {ACTIVITY_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">備考 (Notes)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="活動の詳細..." />
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {message && <p className="text-sm font-medium text-green-600">{message}</p>}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? '保存中...' : '活動を登録 (Register Activity)'}
      </Button>
    </form>
  );
}
