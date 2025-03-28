import { toDateTime } from '@/lib/helpers';
import { stripe } from '@/lib/stripe/config';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database, Tables, TablesInsert } from '@database.types';
import { revalidateTag } from 'next/cache';
import { sendSubscriptionConfirmationEmail, sendSubscriptionCancellationEmail, sendTokenPurchaseConfirmationEmail } from '@/lib/email';
import { format } from 'date-fns';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };

  const { error: upsertError } = await supabaseAdmin
    .from('products')
    .upsert([productData]);
  if (upsertError)
    throw new Error(`Product insert/update failed: ${upsertError.message}`);
  console.log(`Product inserted/updated: ${product.id}`);
};

const upsertPriceRecord = async (
  price: Stripe.Price,
  retryCount = 0,
  maxRetries = 3
) => {
  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? 0,
    description: null,
    metadata: price.metadata ?? null
  };

  const { error: upsertError } = await supabaseAdmin
    .from('prices')
    .upsert([priceData]);

  if (upsertError?.message.includes('foreign key constraint')) {
    if (retryCount < maxRetries) {
      console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await upsertPriceRecord(price, retryCount + 1, maxRetries);
    } else {
      throw new Error(
        `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
      );
    }
  } else if (upsertError) {
    throw new Error(`Price insert/update failed: ${upsertError.message}`);
  } else {
    console.log(`Price inserted/updated: ${price.id}`);
  }
};

const deleteProductRecord = async (product: Stripe.Product) => {
  const { error: deletionError } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', product.id);
  if (deletionError)
    throw new Error(`Product deletion failed: ${deletionError.message}`);
  console.log(`Product deleted: ${product.id}`);
};

const deletePriceRecord = async (price: Stripe.Price) => {
  const { error: deletionError } = await supabaseAdmin
    .from('prices')
    .delete()
    .eq('id', price.id);
  if (deletionError) throw new Error(`Price deletion failed: ${deletionError.message}`);
  console.log(`Price deleted: ${price.id}`);
};

const upsertCustomerToSupabase = async (uuid: string, customerId: string) => {
  const { error: upsertError } = await supabaseAdmin
    .from('customers')
    .upsert([{ id: uuid, stripe_customer_id: customerId }]);

  if (upsertError)
    throw new Error(`Supabase customer record creation failed: ${upsertError.message}`);

  return customerId;
};

const createCustomerInStripe = async (uuid: string, email: string) => {
  const customerData = { metadata: { supabaseUUID: uuid }, email: email };
  const newCustomer = await stripe.customers.create(customerData);
  if (!newCustomer) throw new Error('Stripe customer creation failed.');

  return newCustomer.id;
};

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string;
  uuid: string;
}) => {
  // CASE 1: First, check if customer exists in Supabase
  // Possible outcomes:
  // a) Customer exists with stripe_customer_id
  // b) Customer exists without stripe_customer_id
  // c) Customer doesn't exist
  // d) Query error
  const { data: existingSupabaseCustomer, error: queryError } =
    await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', uuid)
      .maybeSingle();

  if (queryError) {
    throw new Error(`Supabase customer lookup failed: ${queryError.message}`);
  }

  // CASE 2: Try to get Stripe customer ID
  // Possible outcomes:
  // a) Found via existing Supabase record
  // b) Found via email lookup in Stripe
  // c) Not found anywhere
  let stripeCustomerId: string | undefined;
  if (existingSupabaseCustomer?.stripe_customer_id) {
    // CASE 2a: Customer has Stripe ID in Supabase - verify it exists in Stripe
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingSupabaseCustomer.stripe_customer_id
    );
    stripeCustomerId = existingStripeCustomer.id;
  } else {
    // CASE 2b: No Stripe ID in Supabase - search Stripe by email
    // This handles cases where customer might exist in Stripe but not linked in Supabase
    const stripeCustomers = await stripe.customers.list({ email: email });
    stripeCustomerId =
      stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
  }

  // CASE 3: Ensure we have a Stripe customer
  // If no existing Stripe customer found, create new one
  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(uuid, email);
  if (!stripeIdToInsert) throw new Error('Stripe customer creation failed.');

  // CASE 4: Handle database synchronization
  if (existingSupabaseCustomer && stripeCustomerId) {
    // CASE 4a: Customer exists in both systems
    if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
      // CASE 4a-1: IDs don't match - update Supabase to match Stripe
      // This can happen if customer was found by email but had different ID
      const { error: updateError } = await supabaseAdmin
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', uuid);

      if (updateError)
        throw new Error(
          `Supabase customer record update failed: ${updateError.message}`
        );
      console.warn(
        `Supabase customer record mismatched Stripe ID. Supabase record updated.`
      );
    }
    // CASE 4a-2: IDs match - return existing Stripe ID
    return stripeCustomerId;
  } else {
    // CASE 4b: Customer missing from Supabase
    // Create new Supabase record with Stripe ID
    console.warn(
      `Supabase customer record was missing. A new record was created.`
    );

    const upsertedStripeCustomer = await upsertCustomerToSupabase(
      uuid,
      stripeIdToInsert
    );
    if (!upsertedStripeCustomer)
      throw new Error('Supabase customer record creation failed.');

    return upsertedStripeCustomer;
  }
};



/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  // @ts-expect-error TODO: check billing details
  await stripe.customers.update(customer, { name, phone, address });
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] }
    })
    .eq('id', uuid);
  if (updateError) throw new Error(`Customer update failed: ${updateError.message}`);
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (noCustomerError)
    throw new Error(`Customer lookup failed: ${noCustomerError.message}`);

  const { id: uuid } = customerData!;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'items.data.price.product']
  });
  // Upsert the latest status of the subscription object.
  const subscriptionData: TablesInsert<'subscriptions'> = {
    id: subscription.id,
    user_id: uuid,
    metadata: subscription.metadata,
    status: subscription.status as 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | null | undefined,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      subscription.current_period_start
    ).toISOString(),
    current_period_end: toDateTime(
      subscription.current_period_end
    ).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null
  };

  const { error: upsertError } = await supabaseAdmin
    .from('subscriptions')
    .upsert([subscriptionData]);
  if (upsertError)
    throw new Error(`Subscription insert/update failed: ${upsertError.message}`);
  console.log(
    `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
  );

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid)
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
    
  // Send confirmation email for new subscriptions only
  if (createAction && uuid && subscription.status === 'active') {
    try {
      // Get user data from the users table
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('full_name')
        .eq('id', uuid)
        .single();
        
      if (userError) {
        console.error('Error fetching user data for email:', userError);
      } else {
        // Get user email from auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(uuid);
        
        if (authError || !authUser) {
          console.error('Error fetching auth user data:', authError || 'User not found');
          return;
        }
        
        const userEmail = authUser.user.email;
        if (!userEmail) {
          console.error('User email not found');
          return;
        }
        
        // Get product details
        const product = subscription.items.data[0].price.product as Stripe.Product;
        const planName = product.name || 'Premium Plan';
        
        // Get tokens from product metadata
        const priceMetadata = subscription.items.data[0].price.metadata as { tokens?: string };
        const productMetadata = product.metadata as { tokens?: string };
        const tokens = parseInt(priceMetadata?.tokens || productMetadata?.tokens || '0', 10);
        
        // Get price details and format payment amount
        const price = subscription.items.data[0].price;
        const currency = price.currency || 'usd';
        const unitAmount = price.unit_amount || 0;
        const interval = price.recurring?.interval || 'month';
        
        // Format payment amount with currency symbol
        const paymentAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0
        }).format(unitAmount / 100) + (interval === 'month' ? '/month' : interval === 'year' ? '/year' : '');
        
        // Format dates - ensure they are strings
        const startDate = format(
          new Date(subscriptionData.current_period_start as string), 
          'MMMM d, yyyy'
        );
        const endDate = format(
          new Date(subscriptionData.current_period_end as string), 
          'MMMM d, yyyy'
        );
        
        // Send confirmation email
        const emailResult = await sendSubscriptionConfirmationEmail({
          to: userEmail,
          userName: userData?.full_name || userEmail.split('@')[0] || 'Valued Customer',
          planName,
          startDate,
          endDate,
          paymentAmount,
          tokens: tokens > 0 ? tokens : undefined
        });
        
        if (!emailResult.success) {
          console.error('Failed to send subscription confirmation email:', emailResult.error);
        } else {
          console.log(`Subscription confirmation email sent to ${userEmail}`);
        }
      }
    } catch (error) {
      console.error('Error sending subscription confirmation email:', error);
      // Don't throw error here to avoid disrupting the subscription process
    }
  }
  
  // Send cancellation email when subscription is cancelled or set to cancel at period end
  if (subscription.cancel_at_period_end || subscription.status === 'canceled') {
    try {
      // Get user data from the users table
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('full_name')
        .eq('id', uuid)
        .single();
        
      if (userError) {
        console.error('Error fetching user data for cancellation email:', userError);
      } else {
        // Get user email from auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(uuid);
        
        if (authError || !authUser) {
          console.error('Error fetching auth user data:', authError || 'User not found');
          return;
        }
        
        const userEmail = authUser.user.email;
        if (!userEmail) {
          console.error('User email not found');
          return;
        }
        
        // Get product details
        const product = subscription.items.data[0].price.product as Stripe.Product;
        const planName = product.name || 'Premium Plan';
        
        // Format end date - the date when the subscription will actually end
        const endDate = format(
          new Date(subscriptionData.current_period_end as string), 
          'MMMM d, yyyy'
        );
        
        // Send cancellation email
        const emailResult = await sendSubscriptionCancellationEmail({
          to: userEmail,
          userName: userData?.full_name || userEmail.split('@')[0] || 'Valued Customer',
          planName,
          endDate
        });
        
        if (!emailResult.success) {
          console.error('Failed to send subscription cancellation email:', emailResult.error);
        } else {
          console.log(`Subscription cancellation email sent to ${userEmail}`);
        }
      }
    } catch (error) {
      console.error('Error sending subscription cancellation email:', error);
      // Don't throw error here to avoid disrupting the subscription process
    }
  }
};



/**
 * Update user credits based on checkout session metadata
 */
const updateUserCredits = async (
  userId: string,
  metadata: Stripe.Metadata | null
) => {
  if (!metadata || !metadata.tokens) {
    console.log('No token metadata found in checkout session');
    return;
  }

  const tokenAmount = parseInt(metadata.tokens as string, 10);
  if (isNaN(tokenAmount) || tokenAmount <= 0) {
    console.log(`Invalid token amount: ${metadata.tokens}`);
    return;
  }

  console.log(`Adding ${tokenAmount} tokens to user ${userId}`);

  try {
    // First check if the user already has a credits record
    const { data: existingCredits, error: fetchError } = await supabaseAdmin
      .from('credits')
      .select('tokens')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw new Error(`Error fetching user credits: ${fetchError.message}`);
    }

    let currentTokens = 0;
    if (existingCredits) {
      // User has an existing credits record
      currentTokens = existingCredits.tokens || 0;
    }

    const newTokenAmount = currentTokens + tokenAmount;

    if (existingCredits) {
      // Update existing record
      const { error: updateError } = await supabaseAdmin
        .from('credits')
        .update({ tokens: newTokenAmount })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Error updating user credits: ${updateError.message}`);
      }
    } else {
      // Create new record
      const { error: insertError } = await supabaseAdmin
        .from('credits')
        .insert([{ user_id: userId, tokens: newTokenAmount }]);

      if (insertError) {
        throw new Error(`Error inserting user credits: ${insertError.message}`);
      }
    }

    // Get user information for sending email
    const { data: userData, error: userError } = await supabaseAdmin
      .auth.admin.getUserById(userId);

    if (userError) {
      console.error('Error getting user for email:', userError);
    } else if (userData && userData.user) {
      const userEmail = userData.user.email;
      const userName = userData.user.user_metadata?.full_name || 'User';
      
      // Only send email if this is a direct token purchase (not from subscription)
      if (userEmail && metadata.source === 'top_up') {
        // Get payment amount if available
        let paymentAmount = "your payment";
        if (metadata.payment_amount) {
          paymentAmount = metadata.payment_amount;
        }

        // Send token purchase confirmation email
        try {
          const emailResult = await sendTokenPurchaseConfirmationEmail({
            to: userEmail,
            userName,
            tokenAmount,
            paymentAmount
          });

          if (!emailResult.success) {
            console.error('Failed to send token purchase confirmation email:', emailResult.error);
          } else {
            console.log(`Token purchase confirmation email sent to ${userEmail}`);
          }
        } catch (error) {
          console.error('Error sending token purchase confirmation email:', error);
        }
      } else {
        console.log(`Skipping token purchase email for subscription-based tokens`);
      }
    }

    console.log(`Successfully updated tokens for user ${userId}: ${newTokenAmount}`);
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
};

/**
 * Allocate tokens for a yearly subscription
 * This function is called when an invoice.payment_succeeded event is received for a yearly subscription
 */
const allocateTokensForSubscription = async (
  subscriptionId: string,
  customerId: string
) => {
  try {
    // Get customer's UUID from mapping table
    const { data: customerData, error: noCustomerError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (noCustomerError) {
      throw new Error(`Customer lookup failed: ${noCustomerError.message}`);
    }

    const { id: userId } = customerData!;

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product']
    });

    // Get the product details
    const product = subscription.items.data[0].price.product as Stripe.Product;
    
    // Get tokens from product metadata
    // First check price metadata, then product metadata
    const priceMetadata = subscription.items.data[0].price.metadata as { tokens?: string };
    const productMetadata = product.metadata as { tokens?: string };
    
    // Try to get tokens from price metadata first, then from product metadata
    const tokens = parseInt(priceMetadata?.tokens || productMetadata?.tokens || '0', 10);
    
    if (tokens <= 0) {
      console.log(`No tokens defined for product: ${product.id}`);
      return;
    }
    
    // No longer dividing by 12 - using the full token amount as specified in metadata
    const monthlyTokens = tokens;
    
    console.log(`Allocating ${monthlyTokens} tokens for subscription: ${subscriptionId}`);
    
    // Add the tokens to the user's account
    // Get current tokens
    const { data: currentCredits, error: fetchError } = await supabaseAdmin
      .from('credits')
      .select('tokens')
      .eq('user_id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(`Error fetching current credits: ${fetchError.message}`);
      throw new Error(`Credits fetch failed: ${fetchError.message}`);
    }
    
    const currentTokens = currentCredits?.tokens || 0;
    const newTokens = currentTokens + monthlyTokens;
    
    console.log(`Adding ${monthlyTokens} tokens to user ${userId}. Current: ${currentTokens}, New: ${newTokens}`);
    
    // Update the user's tokens
    const { error: updateError, data: updateData } = await supabaseAdmin
      .from('credits')
      .update({ tokens: newTokens })
      .eq('user_id', userId)
      .select();
    
    // If no rows were updated (user doesn't have a credits record yet), insert one
    if (updateData && updateData.length === 0) {
      const { error: insertError } = await supabaseAdmin
        .from('credits')
        .insert([{ user_id: userId, tokens: monthlyTokens }]);
      
      if (insertError) {
        throw new Error(`Credits insert failed: ${insertError.message}`);
      }
      
      console.log(`Created new credits record for user: ${userId} with ${monthlyTokens} tokens`);
    } else if (updateError) {
      throw new Error(`Credits update failed: ${updateError.message}`);
    } else {
      console.log(`Updated credits for user: ${userId} from ${currentTokens} to ${newTokens} tokens`);
    }
    
    // Get user information for sending email
    const { data: userData, error: userError } = await supabaseAdmin
      .auth.admin.getUserById(userId);

    if (userError) {
      console.error('Error getting user for email:', userError);
    } else if (userData && userData.user) {
      const userEmail = userData.user.email;
      
      if (userEmail) {
        // Log token allocation without sending email
        console.log(`Tokens allocated for subscription: ${monthlyTokens} (no separate email sent)`);
      }
    }
    
    revalidateTag('credits');
    
  } catch (error) {
    console.error('Error allocating monthly tokens for subscription:', error);
    throw error;
  }
};

export {
  upsertProductRecord,
  upsertPriceRecord,
  deleteProductRecord,
  deletePriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange,
  updateUserCredits,
  allocateTokensForSubscription
};