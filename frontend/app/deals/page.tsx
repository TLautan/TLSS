// frontend/app/deals/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDeals } from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActivityFormModal } from '@/features/activities/components/activity-form-modal';

export default function DealsListPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

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
      setSelectedDeal(null);
      fetchData();
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals</h1>
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
                      <TableCell className="font-medium">{deal.title}</TableCell>
                      <TableCell>{deal.company?.company_name || 'N/A'}</TableCell>
                      <TableCell>{deal.user?.name || 'N/A'}</TableCell>
                      <TableCell><Badge variant="outline">{deal.status}</Badge></TableCell>
                      <TableCell className="text-right">¥{deal.value.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Dialog open={selectedDeal?.id === deal.id} onOpenChange={(isOpen: boolean) => !isOpen && setSelectedDeal(null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedDeal(deal)}>
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Activity for: {selectedDeal?.title}</DialogTitle>
                              <DialogDescription>
                                Log a new phone call, email, or meeting for this deal.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedDeal && <ActivityFormModal dealId={selectedDeal.id} onSuccess={handleActivitySuccess} />}
                          </DialogContent>
                        </Dialog>
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
    </div>
  );
}
