// frontend/lib/types.ts

// Defines the structure for the User object received from the API
export interface User {
  id: number;
  name: string;
  name_kana: string
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
  deals?: Deal[];
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
  company: Company;
  lead_source?: string;
  product_name?: string;
  forecast_accuracy?: "高" | "中" | "低";
}

// Defines the structure for the KPI data from the analytics endpoint
export interface KpiData {
  total_deals: number;
  total_value: number;
  win_rate: number;
  average_deal_size: number;
}

export interface ChartDataPoint {
  name: string;
  total: number;
}

export interface DonutChartDataPoint {
  name: string;
  value: number;
}
export interface DashboardData {
  kpis: {
    total_deals: number;
    total_value: number;
    win_rate: number;
    average_deal_size: number;
  };
  monthly_sales_chart_data: ChartDataPoint[];
  deal_outcomes_chart_data: DonutChartDataPoint[];
  recent_deals: Deal[];
}

export interface DashboardComponentProps {
    data: DashboardData;
    visibleKpis?: string[];
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

// Deal Outcomes

export interface ReasonAnalysis {
    reason: string;
    count: number;
}

export interface IndustryPerformance {
    industry: string;
    total_deals: number;
    won_deals: number;
    win_rate: number;
}

export interface DealOutcomesData {
    win_reasons: ReasonAnalysis[];
    loss_reasons: ReasonAnalysis[];
    industry_performance: IndustryPerformance[];
}

export interface ChannelPerformance {
  deals_won: number;
  total_deals: number;
  win_rate: number;
  total_revenue: number;
}

export interface ChannelAnalyticsData {
  direct: ChannelPerformance;
  agency: ChannelPerformance;
}

export interface AgencyPerformance {
  agency_id: number;
  agency_name: string;
  deals_won: number;
  total_revenue: number;
}

export interface ChurnReasonAnalysis {
  reason: string;
  count: number;
}

export interface ChurnAnalysisData {
  annual_survival_rate: number;
  annual_churn_rate: number;
  monthly_cancellation_rates: {
    label: string;
    cancellation_rate: number;
  }[];
  cancellation_reasons: ChurnReasonAnalysis[];
}

export interface LeaderboardEntry {
  user_id: number;
  user_name: string;
  total_revenue: number;
  deals_won: number;
  average_deal_size: number;
}

export interface ForecastEntry {
  month: string;
  projected_revenue: number;
}

export interface UserSearchResult {
  type: "user";
  id: number;
  name: string;
  email: string;
}

export interface CompanySearchResult {
  type: "company";
  id: number;
  name: string;
  industry: string;
}

export interface DealSearchResult {
  type: "deal";
  id: number;
  name: string;
  value: number;
}

export type SearchResult = UserSearchResult | CompanySearchResult | DealSearchResult;

export interface Note {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Attachment {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  uploader?: {
    name: string;
  };
}

export interface DashboardPreferences {
  layout: string[];
  visible_kpis: string[];
}

export interface UserPerformanceMetrics {
  user_id: number;
  user_name: string;
  average_days_to_win: number;
  total_revenue: number;
  deals_won: number;
  win_rate: number;
  monthly_performance: {
    month: string;
    deals_won: number;
    deals_lost: number;
    win_rate: number;
  }[];
  win_reasons: { reason: string; count: number }[];
  loss_reasons: { reason: string; count: number }[];
  activity_summary: {
    total_activities: number;
    activities_per_deal: number;
    by_type: { [key: string]: number };
  };
}