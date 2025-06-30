// frontend/app/components/ChurnInputForm.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';

// Define the type for a single row of data in our form
interface MonthEntry {
  month: number;
  start_customers: string; // We use string for form inputs to handle empty state
  churned_customers: string;
}

export default function ChurnInputForm() {
  // Create state to hold the data for all 12 months, following your fiscal year (July-June)
  const initialMonths = Array.from({ length: 12 }, (_, i) => {
    const monthNum = (i + 6) % 12 + 1; // Generates 7, 8, ..., 12, 1, 2, ..., 6
    return { month: monthNum, start_customers: '', churned_customers: '' };
  });

  const [monthlyData, setMonthlyData] = useState<MonthEntry[]>(initialMonths);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // This function updates the state when a user types in an input field
  const handleInputChange = (index: number, field: 'start_customers' | 'churned_customers', value: string) => {
    const updatedData = [...monthlyData];
    // Allow only numbers to be typed
    updatedData[index][field] = value.replace(/[^0-9]/g, '');
    setMonthlyData(updatedData);
  };

  // This function runs when the "Calculate" button is clicked
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    // 1. Filter out any rows where the user didn't enter both values
    const dataToSend = monthlyData
      .filter(row => row.start_customers !== '' && row.churned_customers !== '')
      .map(row => ({
        month: row.month,
        start_customers: Number(row.start_customers),
        churned_customers: Number(row.churned_customers),
      }));
    
    if (dataToSend.length === 0) {
      setMessage("Error: Please input data for at least one month.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Send the cleaned-up data to your FastAPI backend
      const response = await axios.post('http://127.0.0.1:8000/api/analytics/monthly-churn', {
        monthly_data: dataToSend
      });

      // 3. Display the success response from the server
      setMessage(`Success! Server response: ${response.data.message}`);
      
    } catch (error) {
      console.error("Error submitting data:", error);
      setMessage("Error: Failed to submit data to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">月次データ入力 (Monthly Data Input)</h2>
      <p className="text-sm text-gray-600 mb-4">
        実績のある月のデータを入力してください。(データがない月は空欄のままにしてください)
      </p>
      
      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 font-bold mb-2 pb-2 border-b">
        <div className="text-center">月 (Month)</div>
        <div>月初顧客数 (Start Customers)</div>
        <div>月間解約者数 (Churned)</div>
      </div>

      {/* Table Rows for Data Input */}
      <div className="space-y-2">
        {monthlyData.map((data, index) => (
          <div key={data.month} className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center font-medium">{data.month}月</div>
            <input
              type="text"
              value={data.start_customers}
              onChange={(e) => handleInputChange(index, 'start_customers', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., 1000"
            />
            <input
              type="text"
              value={data.churned_customers}
              onChange={(e) => handleInputChange(index, 'churned_customers', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., 10"
            />
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Submitting...' : '計算する (Calculate)'}
        </button>
      </div>

      {/* Display a message after submission */}
      {message && <div className="mt-4 p-3 rounded bg-gray-100 text-gray-700 text-center">{message}</div>}
    </form>
  );
}