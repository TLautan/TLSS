// frontend/app/users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUsers } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define the type for the user data
interface User {
  id: number;
  name: string;
  email: string;
}

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (err) {
        setError('Failed to load users.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">営業担当者一覧 (Sales Rep List)</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            選択したら詳細が表示されます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名 (Name)</TableHead>
                <TableHead>メールアドレス (Email)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">
                    <Link 
                      href={`/analytics/user/${user.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      パフォーマンス
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
