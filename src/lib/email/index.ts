import { Resend } from 'resend';
import EmailTemplate from '@/components/email-templates/EmailTemplate';
import SubscriptionConfirmation from '@/components/email-templates/SubscriptionConfirmation';
import { ReactElement } from 'react';
import * as React from 'react';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email
const DEFAULT_FROM_EMAIL = 'notifications@facesfactory.com';

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
}: {
  to: string;
  userName: string;
  planName: string;
  startDate: string;
  endDate: string;
}) {
  return sendEmail({
    to,
    subject: 'Your Subscription is Confirmed!',
    react: React.createElement(SubscriptionConfirmation, {
      userName,
      planName,
      startDate,
      endDate,
    }),
  });
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