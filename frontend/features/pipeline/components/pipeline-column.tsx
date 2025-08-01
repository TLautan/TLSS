// frontend/features/pipeline/components/pipeline-column.tsx
"use client";

import React from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { Deal } from '@/lib/types';
import { DealCard } from './deal-card';

interface PipelineColumnProps {
  id: string;
  title: string;
  deals: Deal[];
}

export function PipelineColumn({ id, title, deals }: PipelineColumnProps) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className="w-72 flex-shrink-0 bg-muted/60 rounded-lg p-4"
    >
      <h3 className="text-lg font-semibold mb-4 px-2">{title}</h3>
      <SortableContext items={deals.map(d => d.id)}>
        <div className="space-y-4">
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}