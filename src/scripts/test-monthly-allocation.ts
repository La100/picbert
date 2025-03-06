import { allocateTokensForSubscription } from '@/lib/supabase/admin';

/**
 * This script tests the token allocation for yearly subscriptions
 * It simulates an invoice.payment_succeeded event for a yearly subscription
 */
async function testTokenAllocation() {
  try {
    // Replace these with actual values from your database
    const subscriptionId = 'sub_XXXXXXXXXXXX'; // Replace with a real subscription ID
    const customerId = 'cus_XXXXXXXXXXXX'; // Replace with a real customer ID
    
    console.log(`Testing token allocation for subscription: ${subscriptionId}`);
    
    // Call the function to allocate tokens
    await allocateTokensForSubscription(subscriptionId, customerId);
    
    console.log('Token allocation test completed successfully');
  } catch (error) {
    console.error('Error testing token allocation:', error);
  }
}

// Call the test function
testTokenAllocation(); 