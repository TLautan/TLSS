// frontend/app/register/activity/page.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityForm from "@/features/activity-registration/components/activity-form";

export default function RegisterActivityPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">活動登録 (Register Activity)</h1>
      
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>新規活動情報 (New Activity Information)</CardTitle>
          <CardDescription>
            取引に関する新しい活動（電話、メール、会議）を記録します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityForm />
        </CardContent>
      </Card>
    </div>
  );
}
