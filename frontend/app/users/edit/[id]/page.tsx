// frontend/app/users/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUser, updateUser } from '@/lib/api';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // State for each form field
  const [name, setName] = useState('');
  const [nameKana, setNameKana] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchUserData = async () => {
      try {
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
          setError("Invalid user ID.");
          return;
        }
        const data = await getUser(userId);
        setName(data.name);
        setNameKana(data.name_kana || '');
        setEmail(data.email);
      } catch (err) {
        setError("Failed to fetch user data.");
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchUserData();
  }, [id]);
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      setIsLoading(false);
      return;
    }

    try {
      const userId = parseInt(id, 10);
      
      const updateData: { name: string, name_kana?: string, email: string, password?: string } = {
        name: name,
        name_kana: nameKana,
        email: email,
      };

      // Only include the password in the update if the user has entered a new one
      if (password.trim()) {
        updateData.password = password;
      }

      await updateUser(userId, updateData);
      setMessage("User updated successfully!");
      setTimeout(() => router.push('/users'), 1500);

    } catch (apiError: unknown) {
      if (axios.isAxiosError(apiError) && apiError.response?.data?.detail) {
        setError(`Error: ${apiError.response.data.detail}`);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div>Loading user details...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit User</h1>
      
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Update User Information</CardTitle>
          <CardDescription>Modify the details for {name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">氏名 (Name)</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameKana">氏名（カナ） (Name Kana)</Label>
              <Input id="nameKana" type="text" value={nameKana} onChange={(e) => setNameKana(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス (Email)</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password (optional)</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            {message && <p className="text-sm font-medium text-green-600">{message}</p>}

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push('/users')}>Cancel</Button>
              <Button type="submit" disabled={isLoading} className="flex-grow">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}