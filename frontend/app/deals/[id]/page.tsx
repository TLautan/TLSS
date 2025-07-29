// frontend/app/deals/[id]/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getDeal, getActivitiesForDeal } from '@/lib/api';
import { Deal, Activity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Users, Calendar } from 'lucide-react';

const activityIcons = {
  email: <Mail className="h-5 w-5 text-muted-foreground" />,
  phone: <Phone className="h-5 w-5 text-muted-foreground" />,
  meeting: <Users className="h-5 w-5 text-muted-foreground" />,
};

export default function DealDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const dealId = parseInt(id, 10);
        if (isNaN(dealId)) {
          setError("Invalid deal ID.");
          return;
        }
        
        // Fetch both deal details and activities in parallel
        const [dealData, activitiesData] = await Promise.all([
          getDeal(dealId),
          getActivitiesForDeal(dealId)
        ]);

        setDeal(dealData);
        setActivities(activitiesData);
      } catch (err) {
        setError("Failed to fetch deal details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading deal details...</div>;
  }

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>;
  }

  if (!deal) {
    return <div className="p-8">Deal not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Deal Header */}
      <div>
        <h1 className="text-3xl font-bold">{deal.title}</h1>
        <p className="text-muted-foreground">
          For {deal.company?.company_name} - Managed by {deal.user?.name}
        </p>
      </div>

      {/* Deal Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold">Value</p>
              <p>¥{Number(deal.value).toLocaleString()}</p>
            </div>
            <div>
              <p className="font-semibold">Status</p>
              <Badge variant="secondary">{deal.status}</Badge>
            </div>
            <div>
              <p className="font-semibold">Type</p>
              <p>{deal.type}</p>
            </div>
            <div>
              <p className="font-semibold">Lead Source</p>
              <p>{deal.lead_source || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold">Product</p>
              <p>{deal.product_name || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold">Forecast</p>
              <p>{deal.forecast_accuracy || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Activity Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>A log of all interactions for this deal.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activities.length > 0 ? (
              activities
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {activityIcons[activity.type] || <Calendar className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 w-px bg-border my-2"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-center">
                          <p className="font-semibold capitalize">{activity.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleString()}
                          </p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{activity.notes || "No notes provided."}</p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No activities have been logged for this deal yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}