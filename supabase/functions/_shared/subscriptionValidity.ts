export interface SubscriptionValidityFields {
  status: string;
  ends_at: string | null;
}

export function selectValidSubscription<T extends SubscriptionValidityFields>(
  subscriptions: T[],
  now = new Date()
): T | null {
  return subscriptions.find((subscription) => {
    if (subscription.status === 'active' || subscription.status === 'past_due') {
      return true;
    }

    return subscription.status === 'cancelled'
      && Boolean(subscription.ends_at)
      && new Date(subscription.ends_at as string) > now;
  }) ?? null;
}
