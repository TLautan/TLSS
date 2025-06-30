// frontend/app/analytics/overall_analytics/monthly_churn/page.tsx
import CancellationRateChart from '@/features/analytics/components/cancellation-rate-chart';

export default function ChurnAnalysisPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Sales Analytics</h1>
      <p className="mb-8 text-gray-600">This page shows detailed analysis of customer churn.</p>
      
      {/* This is the chart component we created in the previous step.
        It handles its own data fetching and rendering.
      */}
      <div className="max-w-4xl">
        <CancellationRateChart />
      </div>

    </div>
  );
}