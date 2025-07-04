// frontend/lib/api.ts
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

export const getDealOutcomeBreakdowns = async () => {
  const response = await apiClient.get('/analytics/outcome-breakdowns');
  return response.data;
};

// --- Churn ---

export const postMonthlyChurnData = async (data: {
  monthly_data: {
    month: number;
    start_customers: number;
    churned_customers: number;
  }[];
}) => {
  const response = await apiClient.post('/analytics/monthly-churn', data);
  return response.data;
};

export const getMonthlyCancellationRate = async () => {
  const response = await apiClient.get('/analytics/monthly-cancellation-rate');
  return response.data;
};

// --- Users ---
interface UserData {
  name: string;
  name_kana?: string;
  email: string;
  password?: string;
}

export const createUser = async (userData: UserData) => {
  const response = await apiClient.post('/users/', userData);
  return response.data;
};

export const getUsers = async () => {
  const response = await apiClient.get('/users/');
  return response.data;
};

// --- Companies ---
export const getCompanies = async () => {
  const response = await apiClient.get('/companies/');
  return response.data;
};

interface CompanyData {
  company_name: string;
  industry: string;
}

export const createCompany = async (companyData: CompanyData) => {
  const response = await apiClient.post('/companies/', companyData);
  return response.data;
};


// --- Deals ---
interface DealData {
  title: string;
  value: number;
  type: string;
  user_id: number;
  company_id: number;
}

export const createDeal = async (dealData: DealData) => {
  const response = await apiClient.post('/deals/', dealData);
  return response.data;
};

export const getDeals = async () => {
  const response = await apiClient.get('/deals/');
  return response.data;
};

// --- Activities ---
interface ActivityData {
  deal_id: number;
  type: string;
  notes?: string;
}

export const createActivityForDeal = async (dealId: string, activityData: ActivityData) => {
  const response = await apiClient.post(`/deals/${dealId}/activities/`, activityData);
  return response.data;
};

export const getActivitiesForDeal = async (dealId: string) => {
  const response = await apiClient.get(`/deals/${dealId}/activities/`);
  return response.data;
};

// --- Agency ---
interface AgencyData {
  agency_name: string;
  agency_kana?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export const createAgency = async (agencyData: AgencyData) => {
  const response = await apiClient.post('/agencies/', agencyData);
  return response.data;
};

// Add other functions for POST, PUT, DELETE as needed
// For example:
// export const createCompany = (companyData) => {
//   return apiClient.post('/companies/', companyData);
// };
