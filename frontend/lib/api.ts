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

/*export const getOverallKpis = async (): Promise<KpiData> => {
  const response = await apiClient.get('/analytics/detailed-kpis');
  return response.data;
};*/

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

export const createUser = async (userData: UserData) => {
  const response = await apiClient.post('/users/', userData);
  return response.data;
};

export const getUsers = async (params?: { skip?: number; limit?: number }): Promise<User[]> => {
    const response = await apiClient.get('/users/', { params });
    return response.data;
};

// --- Companies ---
export const getCompanies = async (params?: { skip?: number; limit?: number }): Promise<Company[]> => {
    const response = await apiClient.get('/companies/', { params });
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
  lead_source: string;
  product_name: string;
  forecast_accuracy: string;
  status?: string;
  closed_at?: string | null;
}


export const createDeal = async (dealData: DealData) => {
  const response = await apiClient.post('/deals/', dealData);
  return response.data;
};

export const getDeals = async (params?: { skip?: number; limit?: number }): Promise<Deal[]> => {
  const response = await apiClient.get('/deals/', { params });
  return response.data;
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
  loc: (string | number)[]; // Location of the error, e.g., ["body", "email"]
  msg: string;              // Error message
  type: string;             // Error type, e.g., "value_error.email"
}

export interface FastAPIErrorDetailWithErrors {
  message?: string; // Overall message for multiple errors, often "Validation Error"
  errors: FastAPIValidationError[]; // Array of detailed validation errors
}

export interface FastAPIErrorResponse {
  detail: string | FastAPIErrorDetailWithErrors; // Detail can be a string or structured errors
  // Add other common properties like 'code', 'status_code' if your API sends them
}

// You might also have simpler error messages from your backend
export interface SimpleErrorResponse {
  message: string;
}

// Add other functions for POST, PUT, DELETE as needed
// For example:
// export const createCompany = (companyData) => {
//   return apiClient.post('/companies/', companyData);
// };

