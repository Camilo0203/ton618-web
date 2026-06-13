import { describe, expect, it } from 'vitest';
import { selectValidSubscription } from './subscriptionValidity';

describe('selectValidSubscription', () => {
  it('keeps a Tebex subscription active while it is temporarily past due', () => {
    const subscription = { id: 'tebex-subscription', status: 'past_due', ends_at: null };

    expect(selectValidSubscription([subscription])).toEqual(subscription);
  });

  it('keeps a cancelled subscription only during its paid grace period', () => {
    const expired = { id: 'expired', status: 'cancelled', ends_at: '2000-01-01T00:00:00.000Z' };
    const valid = { id: 'valid', status: 'cancelled', ends_at: '2999-01-01T00:00:00.000Z' };

    expect(selectValidSubscription([expired, valid])).toEqual(valid);
  });

  it('rejects expired or disabled subscriptions', () => {
    expect(selectValidSubscription([
      { id: 'expired', status: 'expired', ends_at: null },
      { id: 'cancelled', status: 'cancelled', ends_at: '2000-01-01T00:00:00.000Z' },
    ])).toBeNull();
  });
});
