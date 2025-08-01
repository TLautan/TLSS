// frontend/features/pipeline/components/deal-card.tsx
"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Deal } from '@/lib/types';

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-4">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">{deal.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-xs text-muted-foreground">
          <p>{deal.company.company_name}</p>
          <p>¥{Number(deal.value).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}