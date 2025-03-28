import { Resend } from 'resend';
import EmailTemplate from '@/components/email-templates/EmailTemplate';
import SubscriptionConfirmation from '@/components/email-templates/SubscriptionConfirmation';
import SubscriptionCancellation from '@/components/email-templates/SubscriptionCancellation';
import { ReactElement } from 'react';
import * as React from 'react';

// Initialize Resend with API key
// Make sure we're explicitly using the API key from environment variables
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('RESEND_API_KEY is not defined in environment variables');
}
const resend = new Resend(resendApiKey);

// Default sender email
const DEFAULT_FROM_EMAIL = 'support@facesfactory.com';

/**
 * Send a generic email
 */
export async function sendEmail({
  to,
  subject,
  react,
  from = DEFAULT_FROM_EMAIL,
}: {
  to: string;
  subject: string;
  react: ReactElement;
  from?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending email' 
    };
  }
}

/**
 * Send a subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail({
  to,
  userName,
  planName,
  startDate,
  endDate,
  paymentAmount,
  tokens,
}: {
  to: string;
  userName: string;
  planName: string;
  startDate: string;
  endDate: string;
  paymentAmount: string;
  tokens?: number;
}) {
  console.log(`Attempting to send subscription confirmation email to ${to} for plan ${planName}`);
  const result = await sendEmail({
    to,
    subject: 'Your Subscription is Confirmed!',
    react: React.createElement(SubscriptionConfirmation, {
      userName,
      planName,
      startDate,
      endDate,
      paymentAmount,
      tokens,
    }),
  });
  console.log(`Subscription confirmation email result:`, result);
  return result;
}

/**
 * Send a generic message email
 */
export async function sendMessageEmail({
  to,
  userName,
  message,
  subject = 'New Message from Faces Factory',
}: {
  to: string;
  userName: string;
  message: string;
  subject?: string;
}) {
  return sendEmail({
    to,
    subject,
    react: React.createElement(EmailTemplate, {
      userName,
      message,
    }),
  });
}

/**
 * Send a subscription cancellation email
 */
export async function sendSubscriptionCancellationEmail({
  to,
  userName,
  planName,
  endDate,
}: {
  to: string;
  userName: string;
  planName: string;
  endDate: string;
}) {
  return sendEmail({
    to,
    subject: 'Thank You for Your Time with Faces Factory',
    react: React.createElement(SubscriptionCancellation, {
      userName,
      planName,
      endDate,
    }),
  });
}

/**
 * Send a token purchase confirmation email
 */
export async function sendTokenPurchaseConfirmationEmail({
  to,
  userName,
  tokenAmount,
  paymentAmount,
}: {
  to: string;
  userName: string;
  tokenAmount: number;
  paymentAmount: string;
}) {
  const message = `Thank you for your token purchase! You have successfully added ${tokenAmount} tokens to your account for ${paymentAmount}.`;
  
  return sendEmail({
    to,
    subject: 'Token Purchase Confirmation',
    react: React.createElement(EmailTemplate, {
      userName,
      message,
    }),
  });
} 