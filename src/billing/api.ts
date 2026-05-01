// Billing API service for Whop integration
import { supabase } from '../lib/supabaseClient';
import type {
  GuildsResponse,
} from './types';

/**
 * Get user's manageable guilds with premium status
 */
export async function fetchBillingGuilds(): Promise<GuildsResponse> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('No active session. Please login with Discord.');
  }

  const { data, error } = await supabase.functions.invoke('billing-get-guilds', {
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to fetch guilds');
  }

  return data as GuildsResponse;
}

/**
 * Sign in with Discord OAuth
 */
export async function signInWithDiscord(redirectTo?: string) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const state = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  sessionStorage.setItem('discord_oauth_state', state);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      scopes: 'identify email guilds',
      redirectTo: redirectTo || `${window.location.origin}/pricing`,
      queryParams: { state },
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to sign in with Discord');
  }

  return data;
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Sign out
 */
export async function signOut() {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message || 'Failed to sign out');
  }
}
