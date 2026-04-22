-- Migration: Update billing table comments to reflect Stripe migration
-- This migration supersedes the historical comments added during the Lemon Squeezy
-- integration phase. All billing is now processed through Stripe.

COMMENT ON TABLE public.subscriptions IS 'Recurring subscriptions (monthly/yearly) processed through Stripe';
COMMENT ON TABLE public.purchases IS 'One-time purchases (lifetime) processed through Stripe';
