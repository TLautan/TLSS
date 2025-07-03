import axios from 'axios';

// It dynamically uses the URL from the environment variable.
const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

// --- Analytics ---
export const getOverallKpis = async () => {
  const response = await apiClient.get('/analytics/overall-kpis');
  return response.data;
};

export const getUserPerformance = async (userId: string) => {
  const response = await apiClient.get(`/analytics/user/${userId}/performance`);
  return response.data;
};

export const getMonthlyCancellationRate = async () => {
  const response = await apiClient.get('/analytics/monthly-cancellation-rate');
  return response.data;
};

export const getDealOutcomeBreakdowns = async () => {
  const response = await apiClient.get('/analytics/outcome-breakdowns');
  return response.data;
};

// --- Users ---
export const getUsers = async () => {
  const response = await apiClient.get('/users/');
  return response.data;
};

// --- Companies ---
export const getCompanies = async () => {
  const response = await apiClient.get('/companies/');
  return response.data;
};

// --- Deals ---
export const getDeals = async () => {
  const response = await apiClient.get('/deals/');
  return response.data;
};

// --- Activities ---
export const getActivitiesForDeal = async (dealId: string) => {
  const response = await apiClient.get(`/deals/${dealId}/activities/`);
  return response.data;
};

// Add other functions for POST, PUT, DELETE as needed
// For example:
// export const createCompany = (companyData) => {
//   return apiClient.post('/companies/', companyData);
// };
