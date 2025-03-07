import { allocateTokensForSubscription } from '@/lib/supabase/admin';

/**
 * This script manually allocates tokens for a yearly subscription
 * Use this when the webhook processing failed
 */
async function manualTokenAllocation() {
  try {
    // Subscription and customer IDs for kontakt@corkamor.com
    const subscriptionId = 'sub_1QzgRpIZ05ulVpnwmbk7ki9S';
    const customerId = 'cus_PpXXXXXXXXXX'; // Replace with the actual customer ID from Stripe
    
    console.log(`Manually allocating tokens for subscription: ${subscriptionId}`);
    
    // Call the function to allocate tokens
    await allocateTokensForSubscription(subscriptionId, customerId);
    
    console.log('Token allocation completed successfully');
  } catch (error) {
    console.error('Error allocating tokens:', error);
  }
}

// Execute the function
manualTokenAllocation(); 