// frontend/components/common/page-header.tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actionElement?: React.ReactNode;
}

export function PageHeader({ title, description, actionElement }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {actionElement}
    </div>
  );
}