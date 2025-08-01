// frontend/features/pipeline/components/pipeline-board.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { getDeals, updateDeal } from '@/lib/api';
import { Deal } from '@/lib/types';
import { PipelineColumn } from './pipeline-column';

type DealStatus = "in_progress" | "won" | "lost" | "cancelled";

const statusMap: Record<DealStatus, string> = {
  in_progress: "進行中 (In Progress)",
  won: "受注 (Won)",
  lost: "失注 (Lost)",
  cancelled: "キャンセル (Cancelled)",
};

export function PipelineBoard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    fetchData();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeDealId = active.id;
      const newStatus = over.id as DealStatus;

      // Find the deal being moved
      const dealToUpdate = deals.find(d => d.id === activeDealId);
      if (!dealToUpdate) return;
      
      // Optimistic UI update
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.id === activeDealId ? { ...deal, status: newStatus } : deal
        )
      );

      // API call to update the backend
      try {
        await updateDeal(Number(activeDealId), { status: newStatus });
      } catch (err) {
        setError('Failed to update deal status. Reverting change.');
        console.error(err);
        // Revert UI on error
        setDeals(prevDeals =>
            prevDeals.map(deal =>
              deal.id === activeDealId ? { ...deal, status: dealToUpdate.status } : deal
            )
        );
      }
    }
  };
  
  const columns = Object.keys(statusMap) as DealStatus[];

  if (loading) return <p>パイプラインロード中</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto p-4">
        {columns.map(status => (
          <PipelineColumn
            key={status}
            id={status}
            title={statusMap[status]}
            deals={deals.filter(d => d.status === status)}
          />
        ))}
      </div>
    </DndContext>
  );
}