// frontend/app/analytics/user/[id]/page.tsx
import React from 'react';
import UserPerformanceClient from "@/features/analytics/components/user-performance-client";

interface PageProps {
  params: Promise<{ id: string }>; 
}

export default async function UserPerformancePage({ params }: PageProps) {
  const resolvedParams = await params; 
  
  const userId = resolvedParams.id; 

  return <UserPerformanceClient userId={userId} />;
}