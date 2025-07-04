// frontend/app/register/user/page.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser } from '@/lib/api';

export default function RegisterUserPage() {
  // State for each form field
  const [name, setName] = useState('');
  const [nameKana, setNameKana] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for loading and feedback messages
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    // Client-side validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('名前、メール、とパスワードを入力してください。');
      setIsLoading(false);
      return;
    }

    try {
      const response = await createUser({
        name: name,
        name_kana: nameKana,
        email: email,
        password: password,
      });

      // Handle success
      setMessage(`成功! ユーザー "${response.name}" 登録完了しました`);
      // Clear the form fields
      setName('');
      setNameKana('');
      setEmail('');
      setPassword('');

    } catch (apiError: unknown) {
      console.error("Error submitting user data:", apiError);
      if (axios.isAxiosError(apiError) && apiError.response?.data?.detail) {
        // Display specific error from the backend (e.g., "Email already registered")
        setError(`Error: ${apiError.response.data.detail}`);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">ユーザー登録 (Register User)</h1>
      
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>新規ユーザー情報 (New User Information)</CardTitle>
          <CardDescription>
            新しい営業担当者の情報を登録します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">氏名 (Name)</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：山田 太郎" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameKana">氏名（カナ） (Name Kana)</Label>
              <Input id="nameKana" type="text" value={nameKana} onChange={(e) => setNameKana(e.target.value)} placeholder="例：ヤマダ タロウ" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス (Email)</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード (Password)</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {/* Error and Success Message Display */}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {message && <p className="text-sm font-medium text-green-600">{message}</p>}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? '保存中...' : '登録する (Register)'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}