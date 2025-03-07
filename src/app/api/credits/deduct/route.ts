import { NextResponse } from 'next/server';
import { deductTokens } from '@/app/actions/token-actions';
import { createClient } from '@/lib/supabase/server';

// Prevent caching in development mode
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const { amount } = await request.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return new NextResponse('Invalid token amount', { status: 400 });
    }

    const result = await deductTokens(amount);

    if (!result.success) {
      return new NextResponse(result.error || 'Failed to deduct tokens', { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      tokensRemaining: result.tokensRemaining 
    });
  } catch (error) {
    console.error('Error deducting tokens:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 