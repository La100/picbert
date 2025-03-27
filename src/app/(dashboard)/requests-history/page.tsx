import React, { Suspense } from 'react';
import RequestsTable, { type Request } from '@/components/requests-history/RequestsTable';
import { getUserRequests } from '@/app/actions/request-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Requests History - Faces Factory',
  description: 'View history of your image and video generation requests'
};

async function RequestsHistory() {
  const { data: requests } = await getUserRequests(1, 50);
  
  return (
    <div>
      <RequestsTable requests={(requests || []) as Request[]} />
    </div>
  );
}

export default function RequestsHistoryPage() {
  return (
    <section className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Requests History</h1>
        <p className="text-muted-foreground">
          View history of all your image and video generation requests
        </p>
      </div>
      
      <Suspense fallback={<RequestsLoadingSkeleton />}>
        <RequestsHistory />
      </Suspense>
    </section>
  );
}

function RequestsLoadingSkeleton() {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
} 