import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import EmailTemplate from '@/components/email-templates/EmailTemplate';
import * as React from 'react';

// Initialize Resend with API key on the server side
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('RESEND_API_KEY is not defined in environment variables');
}
const resend = new Resend(resendApiKey);

// Default sender email
const DEFAULT_FROM_EMAIL = 'support@facesfactory.com';

export async function POST(request: Request) {
  try {
    const { to, subject, userName, message, from = DEFAULT_FROM_EMAIL } = await request.json();

    if (!to || !subject || !userName || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react: React.createElement(EmailTemplate, {
        userName,
        message,
      }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Exception sending email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error sending email' 
      },
      { status: 500 }
    );
  }
} 