import { create } from 'zustand'
import { getCredits } from '@/app/actions/credit-actions';

interface TokenState {
  tokenCount: number | null;
  isLoading: boolean;
  error: string | null;
  setTokenCount: (count: number) => void;
  decrementTokens: (amount: number) => void;
  refreshTokens: () => Promise<void>;
}

const useTokenStore = create<TokenState>((set) => ({
  tokenCount: null,
  isLoading: false,
  error: null,
  
  setTokenCount: (count: number) => set({ tokenCount: count }),
  
  decrementTokens: (amount: number) => 
    set((state) => ({ 
      tokenCount: state.tokenCount !== null ? state.tokenCount - amount : null 
    })),
  
  refreshTokens: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get fresh data by calling getCredits
      // getCredits is already configured to use no-store caching strategy
      const credits = await getCredits();
      
      if (credits.success && credits.data) {
        set({ tokenCount: credits.data.tokens || 0, isLoading: false });
      } else {
        set({ error: credits.error || 'Failed to fetch tokens', isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  }
}));

export default useTokenStore; 