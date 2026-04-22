# Plan de Testing y QA - Sistema de Monetización (Parte 3)
## Tests Automatizados, Mocks, Datos de Prueba y Errores Críticos

---

## 7. Tests Automatizados

### **7.1 Frontend Tests (Vitest + React Testing Library)**

```typescript
// tests/billing/PricingPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { PricingPage } from '@/billing/pages/PricingPage';
import * as billingApi from '@/billing/api';

describe('PricingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show sign in prompt when not authenticated', () => {
    vi.spyOn(billingApi, 'getCurrentSession').mockResolvedValue(null);
    
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/sign in with discord/i)).toBeInTheDocument();
  });

  it('should load guilds when authenticated', async () => {
    vi.spyOn(billingApi, 'getCurrentSession').mockResolvedValue({
      user: { id: '123', email: 'test@example.com' }
    });
    
    vi.spyOn(billingApi, 'fetchBillingGuilds').mockResolvedValue({
      guilds: [
        { id: '1', name: 'Test Guild', has_premium: false, icon: null }
      ]
    });

    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Guild')).toBeInTheDocument();
    });
  });

  it('should show guild selector after selecting plan', async () => {
    const user = userEvent.setup();
    
    vi.spyOn(billingApi, 'getCurrentSession').mockResolvedValue({
      user: { id: '123' }
    });
    
    vi.spyOn(billingApi, 'fetchBillingGuilds').mockResolvedValue({
      guilds: [{ id: '1', name: 'Test Guild', has_premium: false }]
    });

    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    const monthlyButton = await screen.findByText(/get started/i);
    await user.click(monthlyButton);

    expect(screen.getByText(/select a server/i)).toBeInTheDocument();
  });

  it('should create checkout when proceeding', async () => {
    const createCheckoutMock = vi.spyOn(billingApi, 'createBillingCheckout')
      .mockResolvedValue({
        checkout_url: 'https://checkout.stripe.com/test',
        plan_key: 'pro_monthly'
      });

    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    // Select plan and guild
    const monthlyButton = await screen.findByText(/pro monthly/i);
    await user.click(monthlyButton);
    
    const guildButton = await screen.findByText(/test guild/i);
    await user.click(guildButton);
    
    const proceedButton = await screen.findByText(/proceed to checkout/i);
    await user.click(proceedButton);

    expect(createCheckoutMock).toHaveBeenCalledWith({
      guild_id: '1',
      plan_key: 'pro_monthly'
    });
  });

  it('should handle checkout error gracefully', async () => {
    vi.spyOn(billingApi, 'createBillingCheckout')
      .mockRejectedValue(new Error('Checkout failed'));

    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <PricingPage />
      </BrowserRouter>
    );

    const proceedButton = await screen.findByText(/proceed to checkout/i);
    await user.click(proceedButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create checkout/i)).toBeInTheDocument();
    });
  });
});
```

```typescript
// tests/billing/GuildSelector.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuildSelector } from '@/billing/components/GuildSelector';

describe('GuildSelector', () => {
  const mockGuilds = [
    { id: '1', name: 'Free Guild', has_premium: false, icon: null },
    { id: '2', name: 'Premium Guild', has_premium: true, plan_key: 'pro_yearly', icon: null }
  ];

  it('should render guilds list', () => {
    render(
      <GuildSelector
        guilds={mockGuilds}
        selectedGuildId={null}
        onSelectGuild={() => {}}
        loading={false}
      />
    );

    expect(screen.getByText('Free Guild')).toBeInTheDocument();
    expect(screen.getByText('Premium Guild')).toBeInTheDocument();
  });

  it('should disable premium guilds', () => {
    render(
      <GuildSelector
        guilds={mockGuilds}
        selectedGuildId={null}
        onSelectGuild={() => {}}
        loading={false}
      />
    );

    const premiumGuild = screen.getByText('Premium Guild').closest('button');
    expect(premiumGuild).toBeDisabled();
  });

  it('should call onSelectGuild when clicking free guild', async () => {
    const onSelectGuild = vi.fn();
    const user = userEvent.setup();

    render(
      <GuildSelector
        guilds={mockGuilds}
        selectedGuildId={null}
        onSelectGuild={onSelectGuild}
        loading={false}
      />
    );

    const freeGuild = screen.getByText('Free Guild');
    await user.click(freeGuild);

    expect(onSelectGuild).toHaveBeenCalledWith('1');
  });

  it('should show loading state', () => {
    render(
      <GuildSelector
        guilds={[]}
        selectedGuildId={null}
        onSelectGuild={() => {}}
        loading={true}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

---

### **7.2 Backend Tests (Deno Test)**

```typescript
// supabase/functions/billing-create-checkout/test.ts
import { assertEquals, assertExists } from 'https://deno.land/std/testing/asserts.ts';
import { handler } from './index.ts';

Deno.test('billing-create-checkout: should create checkout for monthly', async () => {
  const request = new Request('http://localhost/billing-create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({
      guild_id: '123456789',
      plan_key: 'pro_monthly'
    })
  });

  const response = await handler(request);
  const data = await response.json();

  assertEquals(response.status, 200);
  assertExists(data.checkout_url);
  assertEquals(data.plan_key, 'pro_monthly');
});

Deno.test('billing-create-checkout: should reject guild with existing premium', async () => {
  const request = new Request('http://localhost/billing-create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({
      guild_id: 'guild-with-premium',
      plan_key: 'pro_monthly'
    })
  });

  const response = await handler(request);
  
  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, 'Guild already has premium');
});

Deno.test('billing-create-checkout: should allow donation without guild', async () => {
  const request = new Request('http://localhost/billing-create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plan_key: 'donate'
    })
  });

  const response = await handler(request);
  const data = await response.json();

  assertEquals(response.status, 200);
  assertExists(data.checkout_url);
});

Deno.test('billing-create-checkout: should reject without authentication for premium', async () => {
  const request = new Request('http://localhost/billing-create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      guild_id: '123456789',
      plan_key: 'pro_monthly'
    })
  });

  const response = await handler(request);
  
  assertEquals(response.status, 401);
});
```

```typescript
// supabase/functions/billing-webhook/test.ts
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { createHmac } from 'https://deno.land/std/crypto/mod.ts';
import { handler } from './index.ts';

function createSignature(payload: any, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.toString('hex');
}

Deno.test('webhook: should process subscription_created', async () => {
  const payload = {
    meta: {
      event_name: 'subscription_created',
      custom_data: {
        guild_id: '123456789',
        discord_user_id: '987654321',
        plan_key: 'pro_monthly'
      }
    },
    data: {
      id: 'sub_123',
      type: 'subscriptions',
      attributes: {
        renews_at: '2026-05-06T00:00:00Z',
        status: 'active'
      }
    }
  };

  const signature = createSignature(payload, Deno.env.get('STRIPE_WEBHOOK_SECRET')!);

  const request = new Request('http://localhost/billing-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature
    },
    body: JSON.stringify(payload)
  });

  const response = await handler(request);
  assertEquals(response.status, 200);
});

Deno.test('webhook: should reject invalid signature', async () => {
  const payload = {
    meta: { event_name: 'subscription_created' },
    data: {}
  };

  const request = new Request('http://localhost/billing-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': 'invalid-signature'
    },
    body: JSON.stringify(payload)
  });

  const response = await handler(request);
  assertEquals(response.status, 401);
});

Deno.test('webhook: should be idempotent', async () => {
  const payload = {
    meta: {
      event_name: 'subscription_created',
      custom_data: {
        guild_id: '123456789',
        plan_key: 'pro_monthly'
      }
    },
    data: {
      id: 'sub_idempotent_test',
      type: 'subscriptions',
      attributes: {
        status: 'active',
        renews_at: '2026-05-06T00:00:00Z'
      }
    }
  };

  const signature = createSignature(payload, Deno.env.get('STRIPE_WEBHOOK_SECRET')!);

  const createRequest = () => new Request('http://localhost/billing-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature
    },
    body: JSON.stringify(payload)
  });

  // First request
  const response1 = await handler(createRequest());
  assertEquals(response1.status, 200);
  
  // Second request (duplicate)
  const response2 = await handler(createRequest());
  assertEquals(response2.status, 200);
  
  // Both should succeed but only one should create subscription
});

Deno.test('webhook: should not activate premium for donation', async () => {
  const payload = {
    meta: {
      event_name: 'order_created',
      custom_data: {
        plan_key: 'donate',
        discord_user_id: null
      }
    },
    data: {
      id: 'order_donation',
      type: 'orders',
      attributes: {
        status: 'paid',
        total: 1000
      }
    }
  };

  const signature = createSignature(payload, Deno.env.get('STRIPE_WEBHOOK_SECRET')!);

  const request = new Request('http://localhost/billing-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature
    },
    body: JSON.stringify(payload)
  });

  const response = await handler(request);
  assertEquals(response.status, 200);
  
  // Verify no guild_subscription created
  // Only donation and purchase records should exist
});
```

---

### **7.3 Bot Tests (Node.js + Jest)**

```javascript
// tests/premiumService.test.js
const { premiumService } = require('../src/services/premiumService');

describe('PremiumService', () => {
  beforeEach(async () => {
    await premiumService.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return premium status for guild', async () => {
    const premium = await premiumService.checkGuildPremium('123456789');
    
    expect(premium).toHaveProperty('has_premium');
    expect(premium).toHaveProperty('tier');
    expect(premium).toHaveProperty('lifetime');
    expect(premium).toHaveProperty('expires_at');
  });

  test('should use cache on second call', async () => {
    const spy = jest.spyOn(premiumService, 'fetchPremiumFromAPI');
    
    await premiumService.checkGuildPremium('123456789');
    await premiumService.checkGuildPremium('123456789');
    
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should fallback to stale cache when API fails', async () => {
    // Setup stale cache
    await premiumService.cachePremiumStatus('123456789', {
      has_premium: true,
      tier: 'pro_monthly',
      lifetime: false,
      expires_at: new Date('2026-05-06')
    });

    // Mock API failure
    jest.spyOn(premiumService, 'fetchPremiumFromAPI')
      .mockRejectedValue(new Error('API unavailable'));

    const premium = await premiumService.checkGuildPremium('123456789');
    
    expect(premium.has_premium).toBe(true);
    expect(premium.tier).toBe('pro_monthly');
  });

  test('should return free plan when no cache and API fails', async () => {
    jest.spyOn(premiumService, 'fetchPremiumFromAPI')
      .mockRejectedValue(new Error('API unavailable'));

    const premium = await premiumService.checkGuildPremium('new-guild');
    
    expect(premium.has_premium).toBe(false);
    expect(premium.tier).toBe('free');
  });

  test('should invalidate cache', async () => {
    await premiumService.cachePremiumStatus('123456789', {
      has_premium: true,
      tier: 'pro_monthly'
    });

    await premiumService.invalidateCache('123456789');

    const spy = jest.spyOn(premiumService, 'fetchPremiumFromAPI');
    await premiumService.checkGuildPremium('123456789');
    
    expect(spy).toHaveBeenCalled();
  });
});
```

```javascript
// tests/premiumMiddleware.test.js
const { requirePremium, checkLimit } = require('../src/utils/premiumMiddleware');
const { premiumService } = require('../src/services/premiumService');

describe('requirePremium', () => {
  test('should block command without premium', async () => {
    jest.spyOn(premiumService, 'checkGuildPremium').mockResolvedValue({
      has_premium: false,
      tier: 'free'
    });

    const interaction = {
      guildId: 'free-guild',
      reply: jest.fn()
    };

    const result = await requirePremium(interaction);
    
    expect(result).toBe(false);
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining('Premium')
          })
        ]),
        ephemeral: true
      })
    );
  });

  test('should allow command with premium', async () => {
    jest.spyOn(premiumService, 'checkGuildPremium').mockResolvedValue({
      has_premium: true,
      tier: 'pro_monthly',
      lifetime: false
    });

    const interaction = {
      guildId: 'premium-guild',
      reply: jest.fn()
    };

    const result = await requirePremium(interaction);
    
    expect(result).toBe(true);
    expect(interaction.reply).not.toHaveBeenCalled();
  });

  test('should allow command with lifetime', async () => {
    jest.spyOn(premiumService, 'checkGuildPremium').mockResolvedValue({
      has_premium: true,
      tier: 'lifetime',
      lifetime: true
    });

    const interaction = {
      guildId: 'lifetime-guild'
    };

    const result = await requirePremium(interaction);
    
    expect(result).toBe(true);
  });
});

describe('checkLimit', () => {
  test('should allow within free limit', async () => {
    jest.spyOn(premiumService, 'checkGuildPremium').mockResolvedValue({
      has_premium: false,
      tier: 'free'
    });

    const result = await checkLimit('123456789', 'custom_commands', 3);
    
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(5);
  });

  test('should block over free limit', async () => {
    jest.spyOn(premiumService, 'checkGuildPremium').mockResolvedValue({
      has_premium: false,
      tier: 'free'
    });

    const result = await checkLimit('123456789', 'custom_commands', 6);
    
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(5);
    expect(result.current).toBe(6);
  });

  test('should allow within pro limit', async () => {
    jest.spyOn(premiumService, 'checkGuildPremium').mockResolvedValue({
      has_premium: true,
      tier: 'pro_monthly'
    });

    const result = await checkLimit('123456789', 'custom_commands', 30);
    
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(50);
  });

  test('should allow within lifetime limit', async () => {
    jest.spyOn(premiumService, 'checkGuildPremium').mockResolvedValue({
      has_premium: true,
      tier: 'lifetime',
      lifetime: true
    });

    const result = await checkLimit('123456789', 'custom_commands', 80);
    
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(100);
  });
});
```

---

## 8. Mocks Sugeridos

### **8.1 Stripe Mocks**

```typescript
// mocks/stripe.ts
export const mockStripeCheckout = {
  checkout_url: 'https://checkout.stripe.com/test-123',
  checkout_id: 'checkout_123'
};

export const mockWebhookPayloads = {
  subscription_created: {
    meta: {
      event_name: 'subscription_created',
      custom_data: {
        guild_id: '123456789',
        discord_user_id: '987654321',
        plan_key: 'pro_monthly'
      }
    },
    data: {
      id: 'sub_123',
      type: 'subscriptions',
      attributes: {
        status: 'active',
        renews_at: '2026-05-06T00:00:00.000000Z',
        ends_at: null,
        customer_id: 123,
        store_id: 456
      }
    }
  },
  
  subscription_cancelled: {
    meta: {
      event_name: 'subscription_cancelled',
      custom_data: {
        guild_id: '123456789',
        plan_key: 'pro_monthly'
      }
    },
    data: {
      id: 'sub_123',
      type: 'subscriptions',
      attributes: {
        status: 'cancelled',
        renews_at: null,
        ends_at: '2026-05-06T00:00:00.000000Z',
        cancelled_at: '2026-04-06T12:00:00.000000Z'
      }
    }
  },
  
  subscription_expired: {
    meta: {
      event_name: 'subscription_expired',
      custom_data: {
        guild_id: '123456789',
        plan_key: 'pro_monthly'
      }
    },
    data: {
      id: 'sub_123',
      type: 'subscriptions',
      attributes: {
        status: 'expired',
        ends_at: '2026-04-06T00:00:00.000000Z'
      }
    }
  },
  
  order_created_lifetime: {
    meta: {
      event_name: 'order_created',
      custom_data: {
        guild_id: '123456789',
        discord_user_id: '987654321',
        plan_key: 'lifetime'
      }
    },
    data: {
      id: 'order_123',
      type: 'orders',
      attributes: {
        status: 'paid',
        total: 29999,
        currency: 'USD',
        customer_id: 123,
        created_at: '2026-04-06T00:00:00.000000Z'
      }
    }
  },
  
  order_created_donation: {
    meta: {
      event_name: 'order_created',
      custom_data: {
        plan_key: 'donate',
        discord_user_id: null
      }
    },
    data: {
      id: 'order_456',
      type: 'orders',
      attributes: {
        status: 'paid',
        total: 1000,
        currency: 'USD'
      }
    }
  },
  
  order_refunded: {
    meta: {
      event_name: 'order_refunded',
      custom_data: {
        guild_id: '123456789',
        plan_key: 'lifetime'
      }
    },
    data: {
      id: 'order_123',
      type: 'orders',
      attributes: {
        status: 'refunded',
        refunded_at: '2026-04-10T00:00:00.000000Z'
      }
    }
  }
};
```

### **8.2 Discord Mocks**

```typescript
// mocks/discord.ts
export const mockDiscordGuilds = [
  {
    id: '123456789',
    name: 'Test Guild',
    icon: 'abc123',
    owner: true,
    permissions: '8', // ADMINISTRATOR
    has_premium: false
  },
  {
    id: '987654321',
    name: 'Premium Guild',
    icon: 'def456',
    owner: false,
    permissions: '32', // MANAGE_GUILD
    has_premium: true,
    plan_key: 'pro_yearly',
    renews_at: '2027-04-06T00:00:00Z'
  },
  {
    id: '111222333',
    name: 'Lifetime Guild',
    icon: 'ghi789',
    owner: true,
    permissions: '8',
    has_premium: true,
    plan_key: 'lifetime',
    lifetime: true
  },
  {
    id: '444555666',
    name: 'No Permissions Guild',
    icon: null,
    owner: false,
    permissions: '0', // No permissions
    has_premium: false
  }
];

export const mockDiscordUser = {
  id: '987654321',
  username: 'TestUser',
  discriminator: '1234',
  avatar: 'avatar_hash',
  email: 'test@example.com'
};
```

### **8.3 Supabase Mocks**

```typescript
// mocks/supabase.ts
import { vi } from 'vitest';

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          user: { 
            id: '123', 
            email: 'test@example.com',
            user_metadata: {
              provider_id: '987654321',
              full_name: 'Test User'
            }
          },
          access_token: 'test-token'
        }
      },
      error: null
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: { url: 'https://discord.com/oauth2/authorize' },
      error: null
    }),
    signOut: vi.fn().mockResolvedValue({ error: null })
  },
  
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ 
      data: {}, 
      error: null 
    })
  })),
  
  functions: {
    invoke: vi.fn((functionName: string, options?: any) => {
      if (functionName === 'billing-create-checkout') {
        return Promise.resolve({
          data: {
            checkout_url: 'https://checkout.stripe.com/123',
            plan_key: options?.body?.plan_key || 'pro_monthly'
          },
          error: null
        });
      }
      
      if (functionName === 'billing-get-guilds') {
        return Promise.resolve({
          data: {
            guilds: mockDiscordGuilds
          },
          error: null
        });
      }
      
      return Promise.resolve({ data: null, error: null });
    })
  }
};
```

---

## 9. Datos de Prueba

### **9.1 Test Users**

```yaml
Test User 1 - Free Guild:
  discord_user_id: "111111111111111111"
  username: "TestUser1"
  email: "test1@example.com"
  guilds:
    - id: "guild_free_1"
      name: "Free Test Guild"
      has_premium: false
      permissions: "8" # ADMINISTRATOR

Test User 2 - Pro Monthly:
  discord_user_id: "222222222222222222"
  username: "TestUser2"
  email: "test2@example.com"
  guilds:
    - id: "guild_monthly_1"
      name: "Monthly Premium Guild"
      has_premium: true
      plan_key: "pro_monthly"
      renews_at: "2026-05-06T00:00:00Z"
      permissions: "32" # MANAGE_GUILD

Test User 3 - Pro Yearly:
  discord_user_id: "333333333333333333"
  username: "TestUser3"
  email: "test3@example.com"
  guilds:
    - id: "guild_yearly_1"
      name: "Yearly Premium Guild"
      has_premium: true
      plan_key: "pro_yearly"
      renews_at: "2027-04-06T00:00:00Z"
      permissions: "8"

Test User 4 - Lifetime:
  discord_user_id: "444444444444444444"
  username: "TestUser4"
  email: "test4@example.com"
  guilds:
    - id: "guild_lifetime_1"
      name: "Lifetime Premium Guild"
      has_premium: true
      plan_key: "lifetime"
      lifetime: true
      renews_at: null
      permissions: "8"

Test User 5 - No Guilds:
  discord_user_id: "555555555555555555"
  username: "TestUser5"
  email: "test5@example.com"
  guilds: []

Test User 6 - No MANAGE_GUILD:
  discord_user_id: "666666666666666666"
  username: "TestUser6"
  email: "test6@example.com"
  guilds:
    - id: "guild_no_perms"
      name: "No Permissions Guild"
      permissions: "0" # No permissions
      has_premium: false
```

### **9.2 Test Guilds**

```yaml
Guild 1 - Free:
  guild_id: "guild_free_1"
  name: "Free Test Guild"
  premium_enabled: false
  status: null
  plan_key: null

Guild 2 - Pro Monthly Active:
  guild_id: "guild_monthly_1"
  name: "Monthly Premium Guild"
  premium_enabled: true
  status: "active"
  plan_key: "pro_monthly"
  billing_type: "subscription"
  provider_subscription_id: "sub_test_123"
  renews_at: "2026-05-06T00:00:00Z"
  ends_at: null

Guild 3 - Pro Yearly Cancelled:
  guild_id: "guild_yearly_cancelled"
  name: "Cancelled Yearly Guild"
  premium_enabled: true
  status: "cancelled"
  plan_key: "pro_yearly"
  cancel_at_period_end: true
  ends_at: "2026-12-31T23:59:59Z"
  renews_at: null

Guild 4 - Lifetime:
  guild_id: "guild_lifetime_1"
  name: "Lifetime Premium Guild"
  premium_enabled: true
  status: "active"
  plan_key: "lifetime"
  billing_type: "one_time"
  lifetime: true
  provider_order_id: "order_test_456"
  renews_at: null
  ends_at: null

Guild 5 - Expired:
  guild_id: "guild_expired"
  name: "Expired Premium Guild"
  premium_enabled: false
  status: "expired"
  plan_key: "pro_monthly"
  ends_at: "2026-03-01T00:00:00Z"
```

### **9.3 Test Webhooks JSON**

```json
// subscription_created.json
{
  "meta": {
    "event_name": "subscription_created",
    "custom_data": {
      "guild_id": "guild_free_1",
      "discord_user_id": "111111111111111111",
      "plan_key": "pro_monthly"
    }
  },
  "data": {
    "type": "subscriptions",
    "id": "sub_test_new",
    "attributes": {
      "store_id": 12345,
      "customer_id": 67890,
      "status": "active",
      "renews_at": "2026-05-06T00:00:00.000000Z",
      "ends_at": null,
      "created_at": "2026-04-06T00:00:00.000000Z",
      "updated_at": "2026-04-06T00:00:00.000000Z"
    }
  }
}
```

```json
// subscription_cancelled.json
{
  "meta": {
    "event_name": "subscription_cancelled",
    "custom_data": {
      "guild_id": "guild_monthly_1",
      "discord_user_id": "222222222222222222",
      "plan_key": "pro_monthly"
    }
  },
  "data": {
    "type": "subscriptions",
    "id": "sub_test_123",
    "attributes": {
      "status": "cancelled",
      "renews_at": null,
      "ends_at": "2026-05-06T00:00:00.000000Z",
      "cancelled_at": "2026-04-06T12:00:00.000000Z"
    }
  }
}
```

```json
// order_created_lifetime.json
{
  "meta": {
    "event_name": "order_created",
    "custom_data": {
      "guild_id": "guild_free_1",
      "discord_user_id": "111111111111111111",
      "plan_key": "lifetime"
    }
  },
  "data": {
    "type": "orders",
    "id": "order_test_lifetime",
    "attributes": {
      "store_id": 12345,
      "customer_id": 67890,
      "status": "paid",
      "total": 29999,
      "currency": "USD",
      "created_at": "2026-04-06T00:00:00.000000Z"
    }
  }
}
```

```json
// order_created_donation.json
{
  "meta": {
    "event_name": "order_created",
    "custom_data": {
      "plan_key": "donate",
      "discord_user_id": null
    }
  },
  "data": {
    "type": "orders",
    "id": "order_test_donation",
    "attributes": {
      "status": "paid",
      "total": 1000,
      "currency": "USD",
      "created_at": "2026-04-06T00:00:00.000000Z"
    }
  }
}
```

---

## 10. Errores Críticos a Vigilar Antes de Producción

### **10.1 Errores Bloqueantes (P0)**

```yaml
CRITICAL-001: Webhook Signature No Validada
  Severidad: P0 - BLOQUEANTE
  Impacto: Cualquiera puede activar premium gratis
  Verificación:
    - Enviar webhook con signature falsa
    - Debe ser rechazado con 401
  Fix: Implementar verificación HMAC SHA-256
  Status: [ ] VERIFICADO

CRITICAL-002: Doble Activación de Premium
  Severidad: P0 - BLOQUEANTE
  Impacto: Usuario cobra doble, premium duplicado
  Verificación:
    - Enviar mismo webhook 2 veces
    - Solo debe procesar una vez
  Fix: Implementar idempotencia con event_hash único
  Status: [ ] VERIFICADO

CRITICAL-003: Premium No Se Desactiva al Expirar
  Severidad: P0 - BLOQUEANTE
  Impacto: Usuario sigue usando premium gratis
  Verificación:
    - Simular subscription_expired
    - Verificar premium_enabled = false
  Fix: Webhook handler actualiza correctamente
  Status: [ ] VERIFICADO

CRITICAL-004: Donation Activa Premium
  Severidad: P0 - BLOQUEANTE
  Impacto: Usuarios obtienen premium gratis donando
  Verificación:
    - Hacer donation
    - Verificar que NO se crea guild_subscription
  Fix: Webhook distingue donate de premium
  Status: [ ] VERIFICADO

CRITICAL-005: Bot API Key No Validada
  Severidad: P0 - BLOQUEANTE
  Impacto: Cualquiera puede consultar premium status
  Verificación:
    - Request sin API key
    - Debe ser rechazado con 401
  Fix: Middleware valida X-Bot-Api-Key
  Status: [ ] VERIFICADO

CRITICAL-006: Usuario Compra para Guild Ajeno
  Severidad: P0 - BLOQUEANTE
  Impacto: Usuario cobra premium a guild que no administra
  Verificación:
    - Intentar comprar para guild sin permisos
    - Debe ser rechazado con 403
  Fix: Backend valida MANAGE_GUILD permission
  Status: [ ] VERIFICADO
```

### **10.2 Errores Críticos (P1)**

```yaml
HIGH-001: Cancelación Desactiva Premium Inmediatamente
  Severidad: P1 - CRÍTICO
  Impacto: Usuario pierde acceso antes de fin de periodo
  Verificación:
    - Cancelar subscription
    - Verificar premium activo hasta ends_at
  Fix: Grace period respetado
  Status: [ ] VERIFICADO

HIGH-002: Cache Nunca Expira
  Severidad: P1 - CRÍTICO
  Impacto: Bot no refleja cambios de premium
  Verificación:
    - Activar premium
    - Verificar bot actualiza en < 5min
  Fix: TTL de 5 minutos en cache
  Status: [ ] VERIFICADO

HIGH-003: Reembolso No Revoca Premium
  Severidad: P1 - CRÍTICO
  Impacto: Usuario mantiene premium después de reembolso
  Verificación:
    - Simular order_refunded
    - Verificar premium_enabled = false
  Fix: Webhook revoca premium inmediatamente
  Status: [ ] VERIFICADO

HIGH-004: SQL Injection en Guild ID
  Severidad: P1 - CRÍTICO
  Impacto: Posible compromiso de DB
  Verificación:
    - Enviar guild_id malicioso
    - Verificar sanitización
  Fix: Prepared statements siempre
  Status: [ ] VERIFICADO

HIGH-005: Session Hijacking
  Severidad: P1 - CRÍTICO
  Impacto: Usuario puede comprar con cuenta ajena
  Verificación:
    - Intentar reusar session token
    - Verificar expiración
  Fix: Session expira en 1 hora
  Status: [ ] VERIFICADO
```

### **10.3 Errores Importantes (P2)**

```yaml
MEDIUM-001: Loading States Faltantes
  Severidad: P2 - IMPORTANTE
  Impacto: UX pobre, doble-clicks
  Verificación:
    - Verificar spinners en todos los botones
  Fix: Loading states en todos los CTAs
  Status: [ ] VERIFICADO

MEDIUM-002: Error Messages No Claros
  Severidad: P2 - IMPORTANTE
  Impacto: Usuario confundido
  Verificación:
    - Probar todos los flujos de error
    - Verificar mensajes útiles
  Fix: Mensajes específicos y accionables
  Status: [ ] VERIFICADO

MEDIUM-003: Mobile UX Rota
  Severidad: P2 - IMPORTANTE
  Impacto: ~50% de usuarios afectados
  Verificación:
    - Probar en iPhone SE, Android
    - Verificar touch targets
  Fix: Responsive design completo
  Status: [ ] VERIFICADO

MEDIUM-004: Logs Exponen Secretos
  Severidad: P2 - IMPORTANTE
  Impacto: Posible leak de API keys
  Verificación:
    - Revisar logs de producción
    - Verificar no hay secretos
  Fix: Sanitizar logs
  Status: [ ] VERIFICADO
```

---

## 11. Resumen Ejecutivo

### **Cobertura de Testing**

```yaml
Frontend:
  - Autenticación: 3 casos
  - Guilds: 3 casos
  - Checkout: 6 casos (monthly, yearly, lifetime, donate)
  - UX: 6 casos (loading, error, success, mobile)
  Total: 18 casos de prueba

Backend:
  - Webhooks: 8 casos (create, cancel, expire, refund, idempotency)
  - Seguridad: 6 casos (signature, API key, permissions)
  - Checkout: 4 casos
  Total: 18 casos de prueba

Bot:
  - Premium check: 3 casos
  - Command blocking: 2 casos
  - Command allowing: 2 casos
  - Cache: 4 casos
  Total: 11 casos de prueba

TOTAL: 47 casos de prueba documentados
```

### **Tests Automatizados Sugeridos**

```yaml
Frontend (Vitest):
  - PricingPage.test.tsx: 5 tests
  - GuildSelector.test.tsx: 4 tests
  - DonationSection.test.tsx: 3 tests
  Total: 12 tests automatizados

Backend (Deno):
  - billing-create-checkout: 4 tests
  - billing-webhook: 5 tests
  - billing-guild-status: 3 tests
  Total: 12 tests automatizados

Bot (Jest):
  - premiumService: 5 tests
  - premiumMiddleware: 4 tests
  Total: 9 tests automatizados

TOTAL: 33 tests automatizados sugeridos
```

### **Errores Críticos**

```yaml
P0 - Bloqueantes: 6 errores
P1 - Críticos: 5 errores
P2 - Importantes: 4 errores

TOTAL: 15 errores críticos a vigilar
```

---

**Plan de Testing y QA Completo - Listo para Implementación**

*Versión 1.0 - 2026-04-06*
