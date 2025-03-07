'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";
import { getCredits } from "./credit-actions";
import { Database } from "@database.types";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Response interface for token operations
 */
interface TokenResponse {
  success: boolean;
  tokensRemaining: number | null;
  error: string | null;
}

/**
 * Perform a token operation (check, deduct, or add)
 * @param operation 'check', 'deduct', or 'add'
 * @param tokenAmount Number of tokens to check, deduct, or add
 * @returns TokenResponse with operation status
 */
export async function manageTokens(
  operation: 'check' | 'deduct' | 'add',
  tokenAmount: number
): Promise<TokenResponse> {
  // Get current credits
  const credits = await getCredits();
  
  if (!credits || credits.error || !credits.data) {
    return { 
      success: false, 
      tokensRemaining: null, 
      error: credits?.error || "Failed to fetch tokens" 
    };
  }

  const currentTokens = credits.data.tokens ?? 0;
  const userId = credits.data.user_id;
  
  if (!userId) {
    return {
      success: false,
      tokensRemaining: currentTokens,
      error: "No user ID found"
    };
  }
  
  // For check and deduct operations, verify sufficient tokens
  if ((operation === 'check' || operation === 'deduct') && currentTokens < tokenAmount) {
    return { 
      success: false, 
      tokensRemaining: currentTokens, 
      error: "Not enough tokens. Please purchase more tokens or subscribe for a plan." 
    };
  }
  
  // For check operation, just return success
  if (operation === 'check') {
    return { 
      success: true, 
      tokensRemaining: currentTokens, 
      error: null 
    };
  }
  
  // For add or deduct operations, update the database
  const newTokenAmount = operation === 'add' 
    ? currentTokens + tokenAmount 
    : currentTokens - tokenAmount;
  
  try {
    // Use admin client to bypass RLS policies
    const { error } = await supabaseAdmin
      .from("credits")
      .update({ tokens: newTokenAmount })
      .eq("user_id", userId);
    
    if (error) {
      return { 
        success: false, 
        tokensRemaining: currentTokens, 
        error: `Failed to ${operation} tokens: ${error.message}` 
      };
    }
    
    // Force revalidation of the credits tag
    revalidateTag("credits");
    
    return { 
      success: true, 
      tokensRemaining: newTokenAmount, 
      error: null 
    };
  } catch (dbError) {
    return { 
      success: false, 
      tokensRemaining: currentTokens, 
      error: `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}` 
    };
  }
}

/**
 * Check if a user has enough tokens for an operation
 * @param tokenCost Number of tokens needed
 * @returns TokenResponse with status
 */
export async function checkTokens(tokenCost: number): Promise<TokenResponse> {
  return manageTokens('check', tokenCost);
}

/**
 * Deduct tokens for an operation
 * @param tokenCost Number of tokens to deduct
 * @returns TokenResponse with status
 */
export async function deductTokens(tokenCost: number): Promise<TokenResponse> {
  return manageTokens('deduct', tokenCost);
}

/**
 * Add tokens to a user's account
 * @param tokensToAdd Number of tokens to add
 * @returns TokenResponse with status
 */
export async function addTokens(tokensToAdd: number): Promise<TokenResponse> {
  return manageTokens('add', tokensToAdd);
}

/**
 * Perform a token operation and return updated credits
 * @param operation 'check' or 'deduct'
 * @param tokenCost Number of tokens to check or deduct
 * @param operationName Name of operation for error messages
 * @returns Operation result with updated credits
 */
export async function processTokenOperation(
  operation: 'check' | 'deduct',
  tokenCost: number,
  operationName: string
): Promise<{ 
  hasCredits: boolean; 
  credits: Database["public"]["Tables"]["credits"]["Row"] | null;
  error: string | null;
}> {
  // Check or deduct tokens
  const tokenResult = await manageTokens(operation, tokenCost);
  
  if (!tokenResult.success) {
    return { 
      hasCredits: false, 
      credits: null, 
      error: tokenResult.error || `Not enough tokens for ${operationName}` 
    };
  }

  // Get updated credits for return
  const credits = await getCredits();

  return { 
    hasCredits: true, 
    credits: credits.data || null, 
    error: null 
  };
} 