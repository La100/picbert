import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionLink?: string;
  actionText?: string;
}

const EmptyState = ({
  title,
  description,
  icon,
  actionLink,
  actionText,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-tl from-background to-muted/50 border border-primary/10 rounded-lg shadow-lg">
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-muted/30 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">{description}</p>
      {actionLink && actionText && (
        <Button asChild>
          <Link href={actionLink}>{actionText}</Link>
        </Button>
      )}
    </div>
  );
};

export default EmptyState; 