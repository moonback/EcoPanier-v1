import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  initialize: () => Promise<void>;
}

// Variable pour stocker l'unsubscribe du listener
let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      initialized: false,

      initialize: async () => {
        const state = get();
        
        // Éviter de réinitialiser si déjà initialisé
        if (state.initialized) {
          set({ loading: false });
          return;
        }

        try {
          // Nettoyer l'ancien listener s'il existe
          if (authListener) {
            authListener.data.subscription.unsubscribe();
            authListener = null;
          }

          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            set({ user: session.user, profile, loading: false, initialized: true });
          } else {
            set({ user: null, profile: null, loading: false, initialized: true });
          }

          // Configurer le listener d'auth une seule fois
          authListener = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              set({ user: session.user, profile, loading: false });
            } else {
              set({ user: null, profile: null, loading: false });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ loading: false, initialized: true });
        }
      },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch the profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        set({ user: data.user, profile, loading: false });
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, profileData) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        let beneficiaryId = null;

        if (profileData.role === 'beneficiary') {
          const year = new Date().getFullYear();
          const count = Math.floor(Math.random() * 100000);
          beneficiaryId = `${year}-BEN-${String(count).padStart(5, '0')}`;
        }

        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          ...profileData,
          beneficiary_id: beneficiaryId,
          verified: false,
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }

        // Don't auto-login after signup, user needs to verify email first
        set({ loading: false });
      }
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      set({ profile: data, loading: false });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      set({ profile: data });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
}),
    {
      name: 'auth-storage', // Nom unique pour le localStorage
      partialize: (state) => ({
        // Ne persister que les données nécessaires, pas les états de chargement
        user: state.user,
        profile: state.profile,
        initialized: state.initialized,
      }),
    }
  )
);
