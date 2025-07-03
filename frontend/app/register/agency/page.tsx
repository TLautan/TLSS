// frontend/app/register/agency/page.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AgencyForm from "@/features/agency-registration/components/agency-form";

export default function RegisterAgencyPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">代理店登録 (Register Agency)</h1>
      
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>新規代理店情報 (New Agency Information)</CardTitle>
          <CardDescription>
            新しい代理店の情報を登録します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgencyForm />
        </CardContent>
      </Card>
    </div>
  );
}
