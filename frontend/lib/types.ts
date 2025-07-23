// frontend/lib/types.ts

// Defines the structure for the User object received from the API
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Defines the structure for the Company object
export interface Company {
  id: number;
  company_name: string;
  industry: string;
  created_at: string;
  updated_at: string;
}

// Defines the structure for the Deal object
// Includes nested User and Company objects for when they are loaded together, just in case
export interface Deal {
  id: number;
  title: string;
  value: number;
  status: 'in_progress' | 'won' | 'lost' | 'cancelled';
  type: 'direct' | 'agency';
  user_id: number;
  company_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  company?: Company;
}

// Defines the structure for the KPI data from the analytics endpoint
export interface KpiData {
  total_deals: number;
  total_value: number;
  win_rate: number;
  average_deal_size: number;
}


// Defines the structure for the Agency object
export interface Agency {
    id: number;
    agency_name: string;
    agency_kana?: string;
    contact_person?: string;
    contact_email?: string;
    contact_phone?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Defines the structure for the Activity object
export interface Activity {
    id: number;
    deal_id: number;
    type: 'phone' | 'email' | 'meeting';
    date: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface MonthlySale {
    name: string;
    total: number;
}

export interface DashboardData {
    total_revenue: number;
    total_deals: number;
    win_rate: number;
    average_deal_size: number;
    monthly_sales_chart_data: MonthlySale[];
}