// frontend/app/components/ChurnInputForm.tsx
"use client";

import { useState } from 'react';
import { postMonthlyChurnData } from '@/lib/api'; // Import the new API function
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MonthEntry {
  month: number;
  start_customers: string;
  churned_customers: string;
}

export default function ChurnInputForm() {
  const initialMonths = Array.from({ length: 12 }, (_, i) => {
    const monthNum = (i + 6) % 12 + 1;
    return { month: monthNum, start_customers: '', churned_customers: '' };
  });

  const [monthlyData, setMonthlyData] = useState<MonthEntry[]>(initialMonths);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (index: number, field: 'start_customers' | 'churned_customers', value: string) => {
    const updatedData = [...monthlyData];
    updatedData[index][field] = value.replace(/[^0-9]/g, '');
    setMonthlyData(updatedData);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const dataToSend = monthlyData
      .filter(row => row.start_customers !== '' && row.churned_customers !== '')
      .map(row => ({
        month: row.month,
        start_customers: Number(row.start_customers),
        churned_customers: Number(row.churned_customers),
      }));
    
    if (dataToSend.length === 0) {
      setError("Error: Please input data for at least one month.");
      setIsLoading(false);
      return;
    }

    try {
      // Use the new, centralized API function
      const response = await postMonthlyChurnData({
        monthly_data: dataToSend
      });

      setMessage(`Success! Server response: ${response.message}`);
      
    } catch (err: unknown) {
      console.error("Error submitting data:", err);
      // Basic error handling, can be improved
      setError("Error: Failed to submit data to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg p-6 bg-card text-card-foreground rounded-lg border shadow-md">
      <h2 className="text-2xl font-bold mb-4">月次データ入力 (Monthly Data Input)</h2>
      <p className="text-sm text-muted-foreground mb-4">
        実績のある月のデータを入力してください。(データがない月は空欄のままにしてください)
      </p>
      
      <div className="grid grid-cols-3 gap-4 font-bold mb-2 pb-2 border-b">
        <div className="text-center">月 (Month)</div>
        <div>月初顧客数 (Start Customers)</div>
        <div>月間解約者数 (Churned)</div>
      </div>

      <div className="space-y-2">
        {monthlyData.map((data, index) => (
          <div key={data.month} className="grid grid-cols-3 gap-4 items-center">
            <Label className="text-center font-medium">{data.month}月</Label>
            <Input
              type="text"
              value={data.start_customers}
              onChange={(e) => handleInputChange(index, 'start_customers', e.target.value)}
              placeholder="e.g., 1000"
            />
            <Input
              type="text"
              value={data.churned_customers}
              onChange={(e) => handleInputChange(index, 'churned_customers', e.target.value)}
              placeholder="e.g., 10"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Submitting...' : '計算する (Calculate)'}
        </Button>
      </div>

      {message && <div className="mt-4 p-3 rounded-md bg-secondary text-secondary-foreground text-center">{message}</div>}
      {error && <div className="mt-4 p-3 rounded-md bg-destructive text-destructive-foreground text-center">{error}</div>}
    </form>
  );
}
