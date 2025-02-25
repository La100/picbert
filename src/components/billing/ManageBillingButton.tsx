'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { createStripePortal } from '@/lib/stripe/server';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface ManageBillingButtonProps {
  className?: string;
}

export default function ManageBillingButton({ className }: ManageBillingButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleManageBilling = async () => {
    try {
      setLoading(true);
      const url = await createStripePortal('/billing');
      if (typeof url === 'string') {
        router.push(url);
      } else {
        console.error('Failed to create billing portal session');
      }
    } catch (error) {
      console.error('Error creating billing portal session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleManageBilling} 
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        'Manage Billing'
      )}
    </Button>
  );
} 