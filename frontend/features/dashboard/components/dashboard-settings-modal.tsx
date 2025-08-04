// frontend/features/dashboard/components/dashboard-settings-modal.tsx
"use client";

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DashboardPreferences } from '@/lib/types';

const componentNames: { [key: string]: string } = {
  kpi_cards: "KPI Cards",
  monthly_sales: "Monthly Sales Chart",
  deal_outcomes: "Deal Outcomes Chart",
  recent_deals: "Recent Deals Table",
};

const kpiNames: { [key: string]: string } = {
  total_revenue: "Total Revenue",
  win_rate: "Win Rate",
  total_deals: "Total Deals",
  average_deal_size: "Average Deal Size",
};


// Sortable Item Component
function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center p-2 bg-muted rounded-md mb-2">
      <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
      <span>{componentNames[id]}</span>
    </div>
  );
}

interface DashboardSettingsModalProps {
  currentPreferences: DashboardPreferences;
  onSave: (newPreferences: DashboardPreferences) => Promise<void>;
  onClose: () => void;
}

export function DashboardSettingsModal({ currentPreferences, onSave, onClose }: DashboardSettingsModalProps) {
  const [layout, setLayout] = useState(currentPreferences.layout);
  const [visibleKpis, setVisibleKpis] = useState(currentPreferences.visible_kpis);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLayout((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  
  const handleKpiToggle = (kpiId: string, checked: boolean) => {
    setVisibleKpis(prev => checked ? [...prev, kpiId] : prev.filter(id => id !== kpiId));
  }

  const handleSaveChanges = async () => {
      setIsSaving(true);
      await onSave({ layout, visible_kpis: visibleKpis });
      setIsSaving(false);
      onClose();
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Customize Dashboard</DialogTitle>
        <DialogDescription>
          Drag and drop to reorder sections. Toggle visibility of KPI cards.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4 space-y-6">
        <div>
          <Label className="font-semibold">Section Layout</Label>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={layout} strategy={verticalListSortingStrategy}>
              {layout.map(id => <SortableItem key={id} id={id} />)}
            </SortableContext>
          </DndContext>
        </div>
        <div>
          <Label className="font-semibold">Visible KPI Cards</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {Object.keys(kpiNames).map(kpiId => (
              <div key={kpiId} className="flex items-center space-x-2">
                <Checkbox
                  id={kpiId}
                  checked={visibleKpis.includes(kpiId)}
                  onCheckedChange={(checked: boolean) => handleKpiToggle(kpiId, !!checked)}
                />
                <Label htmlFor={kpiId} className="text-sm font-normal">
                  {kpiNames[kpiId]}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}