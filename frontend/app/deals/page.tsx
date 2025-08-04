// frontend/app/deals/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getDeals, deleteDeal, getUsers, getCompanies, DealFilters } from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Deal, User, Company } from '@/lib/types';
import { MoreHorizontal, X } from 'lucide-react';
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

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};


export default function DealsListPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [filters, setFilters] = useState<Omit<DealFilters, 'skip' | 'limit'>>({
      search: '',
      status: '',
      user_id: undefined,
      company_id: undefined,
  });
  const debouncedSearch = useDebounce(filters.search || '', 500);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDealForActivity, setSelectedDealForActivity] = useState<Deal | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const router = useRouter();

  useEffect(() => {
      const fetchFilterData = async () => {
          try {
              const [usersData, companiesData] = await Promise.all([getUsers(), getCompanies()]);
              setUsers(usersData);
              setCompanies(companiesData);
          } catch (err) {
              setError('Failed to load filter data (users and companies).');
              console.error(err);
          }
      };
      fetchFilterData();
  }, []);

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const activeFilters: DealFilters = { ...filters };
      if (!activeFilters.search) delete activeFilters.search;
      if (!activeFilters.status) delete activeFilters.status;
      if (!activeFilters.user_id) delete activeFilters.user_id;
      if (!activeFilters.company_id) delete activeFilters.company_id;

      const dealsData = await getDeals(activeFilters);
      setDeals(dealsData);
    } catch (err) {
      setError('Failed to load deals.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
      const newFilters = { ...filters, search: debouncedSearch };
      setFilters(newFilters);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);
  
  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
      setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
  };

  const clearFilters = () => {
      setFilters({
          search: '',
          status: '',
          user_id: undefined,
          company_id: undefined,
      });
  };

  const handleActivitySuccess = () => {
      setSelectedDealForActivity(null);
      fetchDeals();
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
      fetchDeals(); 
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
          <h1 className="text-3xl font-bold">取引一覧</h1>
          <p className="text-muted-foreground">販売取引を検索、フィルタリング、管理します。</p>
        </div>
        <Link href="/register/deal">
          <Button>+ 取引登録</Button>
        </Link>
      </div>

      {/* Filter Controls */}
      <Card>
          <CardContent className="pt-6 flex flex-wrap items-center gap-4">
              <Input
                  placeholder="Search by deal title..."
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  className="max-w-sm"
              />
              <Select value={filters.status} onValueChange={value => handleFilterChange('status', value)}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">全ステータス</SelectItem>
                      <SelectItem value="in_progress">進行中</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="cancelled">キャンセル</SelectItem>
                  </SelectContent>
              </Select>
               <Select value={String(filters.user_id || 'all')} onValueChange={value => handleFilterChange('user_id', value)}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by User" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">ユーザー一覧</SelectItem>
                      {users.map(user => <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>)}
                  </SelectContent>
              </Select>
               <Select value={String(filters.company_id || 'all')} onValueChange={value => handleFilterChange('company_id', value)}>
                  <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Company" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">会社一覧</SelectItem>
                      {companies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.company_name}</SelectItem>)}
                  </SelectContent>
              </Select>
              <Button variant="ghost" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  フィルタリセット
              </Button>
          </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          {loading && <p>ロード中</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>取引名</TableHead>
                  <TableHead>会社</TableHead>
                  <TableHead>代表の方</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">バリュー</TableHead>
                  <TableHead className="text-center">活動</TableHead>
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
                              <span className="sr-only">メニュー</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/deals/${deal.id}`)}>
                              詳細
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedDealForActivity(deal)}>
                              追加
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/deals/${deal.id}/edit`)}>
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDeleteDialog(deal)} className="text-destructive">
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      現在のフィルターに一致する取引は見つかりませんでした。
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
                  <DialogTitle>活動追加: {selectedDealForActivity?.title}</DialogTitle>
                  <DialogDescription>
                  この取引に関する新しい電話、電子メール、または会議を記録します。
                  </DialogDescription>
              </DialogHeader>
              {selectedDealForActivity && <ActivityFormModal dealId={selectedDealForActivity.id} onSuccess={handleActivitySuccess} />}
          </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              取引情報が削除されます。
              <span className="font-bold"> {`"`}{dealToDelete?.title}{`"`}</span>.
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
