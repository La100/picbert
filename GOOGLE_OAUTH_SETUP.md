# Setting Up Google OAuth with Supabase

This guide will walk you through the process of setting up Google OAuth authentication with Supabase for your application.

## Prerequisites

- A Supabase project
- A Google Cloud Platform account

## Step 1: Create OAuth Credentials in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client
7. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: `https://facesfactory.com` (your domain)
8. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://facesfactory.com/auth/callback`
9. Click "Create"
10. Note down the Client ID and Client Secret

## Step 2: Configure Supabase Auth

1. Go to your Supabase dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" in the list of providers and click "Enable"
4. Enter the Client ID and Client Secret from Google Cloud Console
5. Save the changes

## Step 3: Update Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_SITE_URL=https://facesfactory.com
```

For local development, set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000`.

## Step 4: Test the Integration

1. Start your application
2. Navigate to the login page
3. Click the "Sign in with Google" button
4. You should be redirected to Google's authentication page
5. After successful authentication, you should be redirected back to your application

## Troubleshooting

- If you're getting redirect errors, make sure the redirect URIs are correctly set up in both Google Cloud Console and your application
- Check that the Client ID and Client Secret are correctly set in Supabase
- Ensure that the `NEXT_PUBLIC_SITE_URL` environment variable is correctly set for your environment

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2) 