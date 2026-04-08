export const PRICING_CONFIG = {
  free: {
    key: 'free',
    name: { en: 'Free', es: 'Free' },
    description: {
      en: 'Install the base layer and prove the workflow.',
      es: 'Instala la base y valida el flujo.',
    },
    price: {
      monthly: { amount: 0, display: '$0' },
      yearly: { amount: 0, display: '$0' },
    },
    period: { en: '/mo', es: '/mes' },
    features: {
      en: [
        'Basic setup essentials',
        'Simple tickets',
        'Verification',
        'Basic operational metrics',
      ],
      es: [
        'Setup base esencial',
        'Tickets simples',
        'Verificacion',
        'Metricas operativas basicas',
      ],
    },
    cta: { en: 'Start free', es: 'Empezar gratis' },
    ctaType: 'invite' as const,
    popular: false,
  },
  pro: {
    key: 'pro',
    name: { en: 'Pro operativo', es: 'Pro operativo' },
    description: {
      en: 'For staff teams that need inbox, SLA and guided decisions.',
      es: 'Para staffs que necesitan inbox, SLA y decisiones guiadas.',
    },
    price: {
      monthly: { amount: 9, display: '$9' },
      yearly: { amount: 84, display: '$84' },
    },
    period: { en: '/mo', es: '/mes' },
    yearlyDiscount: { en: 'Save 20%', es: 'Ahorra 20%' },
    features: {
      en: [
        'Everything in Free',
        'Advanced web inbox',
        'Macros, SLA and escalation',
        'Live playbooks and incident mode',
        'Operational analytics and backups',
      ],
      es: [
        'Todo en Free',
        'Inbox web avanzado',
        'Macros, SLA y escalado',
        'Playbooks vivos e incident mode',
        'Analitica operativa y backups',
      ],
    },
    cta: { en: 'Upgrade to Pro', es: 'Subir a Pro' },
    ctaType: 'pricing' as const,
    popular: true,
    popularLabel: { en: 'Core plan', es: 'Plan core' },
  },
  enterprise: {
    key: 'enterprise',
    name: { en: 'Enterprise rollout', es: 'Enterprise rollout' },
    description: {
      en: 'For staged launches, multiple servers and white-glove onboarding.',
      es: 'Para betas cuidadas, multi-servidor y onboarding white-glove.',
    },
    price: {
      monthly: { amount: null, display: 'Custom' },
      yearly: { amount: null, display: 'Custom' },
    },
    period: { en: '', es: '' },
    features: {
      en: [
        'Everything in Pro',
        'Guided onboarding',
        'Multi-server rollout',
        'Priority support',
        'Custom operating defaults',
      ],
      es: [
        'Todo en Pro',
        'Onboarding guiado',
        'Rollout multi-servidor',
        'Soporte prioritario',
        'Defaults operativos a medida',
      ],
    },
    cta: { en: 'Contact sales', es: 'Contactar ventas' },
    ctaType: 'contact' as const,
    popular: false,
  },
} as const;

export type PricingPlanKey = keyof typeof PRICING_CONFIG;
export type BillingCycle = 'monthly' | 'yearly';
export type CTAType = 'invite' | 'pricing' | 'contact';

export function getPlanPrice(planKey: PricingPlanKey, cycle: BillingCycle): number | null {
  return PRICING_CONFIG[planKey].price[cycle].amount;
}

export function getPlanPriceDisplay(planKey: PricingPlanKey, cycle: BillingCycle): string {
  return PRICING_CONFIG[planKey].price[cycle].display;
}

export function getLowestPrice(): number {
  const yearlyTotal = PRICING_CONFIG.pro.price.yearly.amount;
  const yearlyMonthly = yearlyTotal / 12;
  return Math.floor(yearlyMonthly);
}

export function getHighestPrice(): number {
  return PRICING_CONFIG.pro.price.monthly.amount;
}
