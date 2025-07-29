// frontend/lib/api.ts
import axios from 'axios';
import { Deal, User, DashboardData, Agency, Company, Activity, DealOutcomesData } from './types';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

// --- Analytics ---

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await apiClient.get('/analytics/dashboard');
  return response.data;
};

export const getUserPerformance = async (userId: number) => {
  const response = await apiClient.get(`/analytics/user-performance/${userId}`);
  return response.data;
};

export const getDealOutcomesData = async (): Promise<DealOutcomesData> => {
  const response = await apiClient.get('/analytics/deal-outcomes');
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

interface UserUpdateData {
    name?: string;
    name_kana?: string;
    email?: string;
    password?: string;
}

export const createUser = async (userData: UserData) => {
  const response = await apiClient.post('/users/', userData);
  return response.data;
};

export const getUsers = async (params?: { skip?: number; limit?: number }): Promise<User[]> => {
    const response = await apiClient.get('/users/', { params });
    return response.data;
};

export const getUser = async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
};

export const updateUser = async (userId: number, userData: UserUpdateData): Promise<User> => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
};

// --- Companies ---
export const getCompanies = async (params?: { skip?: number; limit?: number }): Promise<Company[]> => {
    const response = await apiClient.get('/companies/', { params });
    return response.data;
};

export const getCompany = async (companyId: number): Promise<Company> => {
    const response = await apiClient.get(`/companies/${companyId}`);
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

export const updateCompany = async (companyId: number, companyData: Partial<CompanyData>): Promise<Company> => {
    const response = await apiClient.put(`/companies/${companyId}`, companyData);
    return response.data;
}

export const deleteCompany = async (companyId: number): Promise<void> => {
    await apiClient.delete(`/companies/${companyId}`);
}


// --- Deals ---
interface DealData {
  title: string;
  value: number;
  type: string;
  user_id: number;
  company_id: number;
  lead_source: string;
  product_name: string;
  forecast_accuracy: string;
  status?: string;
  closed_at?: string | null;
}

interface DealUpdateData {
    title?: string;
    value?: number;
    type?: string;
    status?: 'in_progress' | 'won' | 'lost' | 'cancelled';
    user_id?: number;
    company_id?: number;
    lead_source?: string;
    product_name?: string;
    forecast_accuracy?: string;
}

export const createDeal = async (dealData: DealData) => {
  const response = await apiClient.post('/deals/', dealData);
  return response.data;
};

export const getDeals = async (params?: { skip?: number; limit?: number }): Promise<Deal[]> => {
  const response = await apiClient.get('/deals/', { params });
  return response.data;
};

export const getDeal = async (dealId: number): Promise<Deal> => {
  const response = await apiClient.get(`/deals/${dealId}`);
  return response.data;
};

export const updateDeal = async (dealId: number, dealData: DealUpdateData): Promise<Deal> => {
    const response = await apiClient.put(`/deals/${dealId}`, dealData);
    return response.data;
};

export const deleteDeal = async (dealId: number): Promise<void> => {
    await apiClient.delete(`/deals/${dealId}`);
};

// --- Activities ---
interface ActivityData {
  type: string;
  notes?: string;
}

export const createActivityForDeal = async (dealId: number, activityData: ActivityData) => {
    const response = await apiClient.post(`/deals/${dealId}/activities/`, activityData);
    return response.data;
};

export const getActivitiesForDeal = async (dealId: number): Promise<Activity[]> => {
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

export const getAgencies = async (params?: { skip?: number; limit?: number }): Promise<Agency[]> => {
    const response = await apiClient.get('/agencies/', { params });
    return response.data;
};

// --- Importer ---
export interface DealImportData {
  title: string;
  value: number;
  type: "direct" | "agency";
  user_id: number;
  company_id: number;
  status: "in_progress" | "won" | "lost" | "cancelled";
  lead_source?: string;
  product_name?: string;
  forecast_accuracy?: "高" | "中" | "低";
}

export const importDeals = async (deals: DealImportData[]) => {
  const response = await apiClient.post('/importer/deals', deals);
  return response.data;
};

// --- FAST API Error Structures ---
export interface FastAPIValidationError {
  loc: (string | number)[];
  msg: string;              
  type: string;             
}

export interface FastAPIErrorDetailWithErrors {
  message?: string;
  errors: FastAPIValidationError[]; 
}

export interface FastAPIErrorResponse {
  detail: string | FastAPIErrorDetailWithErrors;
}

export interface SimpleErrorResponse {
  message: string;
}

// Add other functions for POST, PUT, DELETE as needed
// For example:
// export const createCompany = (companyData) => {
//   return apiClient.post('/companies/', companyData);
// };

