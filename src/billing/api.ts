// Billing API service for Stripe integration
import { supabase } from '../lib/supabaseClient';
import type { 
  GuildsResponse, 
  CheckoutRequest, 
  CheckoutResponse
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
 * Create checkout session for a plan
 */
export async function createBillingCheckout(
  request: CheckoutRequest
): Promise<CheckoutResponse> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('No active session. Please login with Discord.');
  }

  const { data, error } = await supabase.functions.invoke('billing-create-checkout', {
    headers: {
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
    body: request,
  });

  if (error) {
    throw new Error(error.message || 'Failed to create checkout session');
  }

  if (!data?.checkout_url) {
    throw new Error('Invalid checkout response from server');
  }

  return data as CheckoutResponse;
}

/**
 * Sign in with Discord OAuth
 */
export async function signInWithDiscord(redirectTo?: string) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      scopes: 'identify email guilds',
      redirectTo: redirectTo || `${window.location.origin}/pricing`,
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
