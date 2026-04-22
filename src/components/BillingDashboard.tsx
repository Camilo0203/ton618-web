import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Crown, Calendar, AlertCircle, ExternalLink } from 'lucide-react';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  icon_url: string | null;
  owner: boolean;
  has_premium: boolean;
  plan_key: string | null;
  ends_at: string | null;
  lifetime: boolean;
}

interface BillingDashboardProps {
  selectedGuildId?: string;
  onSelectGuild?: (guildId: string) => void;
}

export function BillingDashboard({ selectedGuildId, onSelectGuild }: BillingDashboardProps) {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { data, error } = await supabase.functions.invoke('billing-get-guilds');

      if (error) throw error;

      setGuilds(data.guilds || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load guilds');
      setGuilds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (guildId: string, planKey: string) => {
    setCheckoutLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { data, error } = await supabase.functions.invoke('billing-create-checkout', {
        body: {
          guild_id: guildId,
          plan_key: planKey,
        },
      });

      if (error) throw error;

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTierBadge = (planKey: string | null) => {
    const badges = {
      pro_monthly: { label: 'Pro Monthly', color: 'bg-blue-500' },
      pro_yearly: { label: 'Pro Yearly', color: 'bg-purple-500' },
      lifetime: { label: 'Lifetime', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    };

    const badge = badges[planKey as keyof typeof badges];
    if (!badge) return null;

    return (
      <span className={`${badge.color} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-red-400">Error loading billing data</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedGuild = guilds.find(g => g.id === selectedGuildId);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscriptions</h1>
        <p className="text-gray-400">Manage premium subscriptions for your servers</p>
      </div>

      {selectedGuild ? (
        <div className="space-y-6">
          <button
            onClick={() => onSelectGuild?.('')}
            className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
          >
            ← Back to all servers
          </button>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              {selectedGuild.icon && (
                <img
                  src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
                  alt={selectedGuild.name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedGuild.name}</h2>
                {selectedGuild.has_premium && getTierBadge(selectedGuild.plan_key)}
              </div>
            </div>

            {selectedGuild.has_premium ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <Crown className="w-5 h-5" />
                    <span className="font-semibold">Premium Active</span>
                  </div>
                  <div className="text-gray-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {selectedGuild.lifetime 
                          ? 'Lifetime Access' 
                          : `Expires: ${formatExpiryDate(selectedGuild.ends_at)}`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Active Features</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>✅ Up to {selectedGuild.lifetime ? '100' : '50'} custom commands</li>
                    <li>✅ Advanced moderation tools</li>
                    <li>✅ Custom embed builder</li>
                    <li>✅ Priority support</li>
                    <li>✅ Server analytics</li>
                    {selectedGuild.lifetime && (
                      <li>✅ Exclusive lifetime features</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Free Plan</span>
                  </div>
                  <p className="text-gray-300">
                    This server is on the free plan. Upgrade to unlock premium features!
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleUpgrade(selectedGuild.id, 'pro_monthly')}
                    disabled={checkoutLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-all disabled:opacity-50"
                  >
                    <div className="text-lg font-bold mb-1">Pro Monthly</div>
                    <div className="text-2xl font-bold mb-2">$9.99/mo</div>
                    <div className="text-sm opacity-90">Cancel anytime</div>
                  </button>

                  <button
                    onClick={() => handleUpgrade(selectedGuild.id, 'pro_yearly')}
                    disabled={checkoutLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-all disabled:opacity-50 relative"
                  >
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                      SAVE 25%
                    </div>
                    <div className="text-lg font-bold mb-1">Pro Yearly</div>
                    <div className="text-2xl font-bold mb-2">$89.99/yr</div>
                    <div className="text-sm opacity-90">Best value</div>
                  </button>

                  <button
                    onClick={() => handleUpgrade(selectedGuild.id, 'lifetime')}
                    disabled={checkoutLoading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white p-4 rounded-lg transition-all disabled:opacity-50"
                  >
                    <div className="text-lg font-bold mb-1">Lifetime</div>
                    <div className="text-2xl font-bold mb-2">$299.99</div>
                    <div className="text-sm opacity-90">One-time payment</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guilds.map((guild) => (
            <div
              key={guild.id}
              onClick={() => onSelectGuild?.(guild.id)}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                {guild.icon && (
                  <img
                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                    alt={guild.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{guild.name}</h3>
                  {guild.has_premium && getTierBadge(guild.plan_key)}
                </div>
              </div>

              <div className="text-sm text-gray-400">
                {guild.has_premium ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <Crown className="w-4 h-4" />
                    <span>Premium Active</span>
                  </div>
                ) : (
                  <span>Free Plan</span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm">
                <span>Manage Billing</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          ))}

          {guilds.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <p>No servers found. Make sure you have admin permissions in at least one server.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
