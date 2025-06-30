// frontend/lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

// Function to fetch monthly cancellation rate data
export const getMonthlyCancellationRate = async () => {
  const response = await apiClient.get('/analytics/monthly-cancellation-rate');
  return response.data;
};