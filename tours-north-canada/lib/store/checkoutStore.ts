import { create } from 'zustand'
import { createClient } from '../supabase/client'
import { Json } from '../../types/database.types'

interface CheckoutStateData {
  guestDetails?: Record<string, any>;
  pricing?: Record<string, any>;
  [key: string]: any;
}

interface CheckoutStore {
  step: number;
  checkoutState: CheckoutStateData | Json;
  lockId: string | null;
  lockExpiresAt: number | null; // Unix timestamp in ms
  experienceId: string | null;
  slotId: string | null;
  selectedDate: string | null;
  
  // Actions
  setStep: (step: number) => void;
  setExperienceId: (id: string) => void;
  setSelectedDate: (date: string) => void;
  acquireSlotLock: (experienceId: string, slotId: string) => Promise<void>;
  releaseSlotLock: () => Promise<void>;
  hydrateFromAbandonedCheckout: (lockId: string, state: Json, step: number) => void;
  updateCheckoutState: (newState: Partial<CheckoutStateData>) => void;
  clearStore: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  step: 1,
  checkoutState: {},
  lockId: null,
  lockExpiresAt: null,
  experienceId: null,
  slotId: null,
  selectedDate: null,

  setStep: (step) => set({ step }),
  setExperienceId: (experienceId) => set({ experienceId }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  
  clearStore: () => set({ 
    lockId: null, 
    lockExpiresAt: null, 
    experienceId: null, 
    slotId: null, 
    selectedDate: null, 
    step: 1, 
    checkoutState: {} 
  }),

  acquireSlotLock: async (experienceId: string, slotId: string) => {
    // Instead of querying Supabase directly, we hit the secure API route
    const response = await fetch('/api/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experienceId, slotId })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to acquire slot lock:', data.error);
      throw new Error(data.error || 'Failed to lock slot');
    }

    if (data && data.lock_id) {
      set({
        lockId: data.lock_id,
        lockExpiresAt: new Date(data.expires_at).getTime(),
        experienceId,
        slotId,
        step: 3 // Move to Guest Details (Step 3) since Slot was Step 2
      });
    }
  },

  releaseSlotLock: async () => {
    const { lockId } = get();
    if (!lockId) return;

    const supabase = createClient();
    
    // Example: Delete the pending booking or call a release RPC if available
    const { error } = await supabase
      .from('pending_bookings')
      .delete()
      .eq('lock_id', lockId);

    if (error) {
      console.error('Failed to release slot lock:', error);
    } else {
      get().clearStore();
    }
  },

  hydrateFromAbandonedCheckout: (lockId: string, state: Json, step: number) => {
    set({
      lockId,
      checkoutState: state,
      step
    });
  },

  updateCheckoutState: (newState) => {
    set((state) => ({
      checkoutState: {
        ...(state.checkoutState as object),
        ...newState
      }
    }));
  }
}));
