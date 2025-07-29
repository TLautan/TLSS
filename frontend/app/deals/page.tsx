// frontend/app/deals/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getDeals, deleteDeal } from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ActivityFormModal } from '@/features/activities/components/activity-form-modal';


export default function DealsListPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDealForActivity, setSelectedDealForActivity] = useState<Deal | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const dealsData = await getDeals();
      setDeals(dealsData);
    } catch (err) {
      setError('Failed to load deals.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleActivitySuccess = () => {
      setSelectedDealForActivity(null);
      fetchData();
  }

  const openDeleteDialog = (deal: Deal) => {
    setDealToDelete(deal);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!dealToDelete) return;

    try {
      await deleteDeal(dealToDelete.id);
      setShowDeleteDialog(false);
      setDealToDelete(null);
      fetchData(); 
    } catch (err) {
      setError(`Failed to delete deal: ${dealToDelete.title}`);
      console.error(err);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">取引一覧 (Deals List)</h1>
          <p className="text-muted-foreground">Manage and track your sales deals.</p>
        </div>
        <Link href="/register/deal">
          <Button>+ Register New Deal</Button>
        </Link>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {loading && <p>Loading deals...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Sales Rep</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.length > 0 ? (
                  deals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">
                        <Link href={`/deals/${deal.id}`} className="hover:underline">
                          {deal.title}
                        </Link>
                      </TableCell>
                      <TableCell>{deal.company?.company_name || 'N/A'}</TableCell>
                      <TableCell>{deal.user?.name || 'N/A'}</TableCell>
                      <TableCell><Badge variant="outline">{deal.status}</Badge></TableCell>
                      <TableCell className="text-right">¥{Number(deal.value).toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/deals/${deal.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedDealForActivity(deal)}>
                              Add Activity
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/deals/${deal.id}/edit`)}>
                              Edit Deal
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDeleteDialog(deal)} className="text-destructive">
                              Delete Deal
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No deals found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Activity Dialog */}
      <Dialog open={!!selectedDealForActivity} onOpenChange={(isOpen) => !isOpen && setSelectedDealForActivity(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add Activity for: {selectedDealForActivity?.title}</DialogTitle>
                  <DialogDescription>
                  Log a new phone call, email, or meeting for this deal.
                  </DialogDescription>
              </DialogHeader>
              {selectedDealForActivity && <ActivityFormModal dealId={selectedDealForActivity.id} onSuccess={handleActivitySuccess} />}
          </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deal
              <span className="font-bold">  {`"{dealToDelete?.title}"`}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDealToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
