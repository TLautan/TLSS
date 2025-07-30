// frontend/app/agencies/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAgencies, deleteAgency } from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Agency } from '@/lib/types';

export default function AgenciesListPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);
  const router = useRouter();

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const agenciesData = await getAgencies();
      setAgencies(agenciesData);
    } catch (err) {
      setError('Failed to load agencies.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const openDeleteDialog = (agency: Agency) => {
    setAgencyToDelete(agency);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!agencyToDelete) return;
    try {
      await deleteAgency(agencyToDelete.id);
      setShowDeleteDialog(false);
      setAgencyToDelete(null);
      fetchAgencies(); // Refresh the list
    } catch (err) {
      setError(`Failed to delete agency: ${agencyToDelete.agency_name}`);
      console.error(err);
      setShowDeleteDialog(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">代理店一覧 (Agency List)</h1>
          <p className="text-muted-foreground">代理店管理</p>
        </div>
        <Link href="/register/agency">
          <Button>+ 代理店追加</Button>
        </Link>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {loading && <p>ロード中</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>代理店名 (Agency Name)</TableHead>
                  <TableHead>担当者 (Contact Person)</TableHead>
                  <TableHead>連絡先メール (Contact Email)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies.length > 0 ? (
                  agencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">{agency.agency_name}</TableCell>
                      <TableCell>{agency.contact_person || 'N/A'}</TableCell>
                      <TableCell>{agency.contact_email || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/agencies/${agency.id}/edit`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(agency)} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      代理店見つかりませんでした。
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the agency
              <span className="font-bold"> {agencyToDelete?.agency_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAgencyToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}