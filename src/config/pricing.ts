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
    period: {
      monthly: { en: '/mo', es: '/mes' },
      yearly: { en: '/mo', es: '/mes' },
    },
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
      monthly: { amount: 9.99, display: '$9.99' },
      yearly: { amount: 89.99, display: '$89.99' },
    },
    period: {
      monthly: { en: '/mo', es: '/mes' },
      yearly: { en: '/year', es: '/año' },
    },
    billingCycle: {
      monthly: { en: 'billed monthly', es: 'facturado mensual' },
      yearly: { en: 'billed annually', es: 'facturado anual' },
    },
    effectiveMonthly: {
      yearly: { amount: 7.5, display: '$7.50' },
    },
    yearlyDiscount: { en: 'Save 25% · BEST VALUE', es: 'Ahorra 25% · MEJOR VALOR' },
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
    cta: { en: 'Contact for Pro', es: 'Contactar para Pro' },
    ctaType: 'pricing' as const,
    popular: true,
    popularLabel: { en: 'Core plan', es: 'Plan core' },
  },
  enterprise: {
    key: 'enterprise',
    name: { en: 'Enterprise', es: 'Enterprise' },
    description: {
      en: 'Custom limits, dedicated support, and bespoke integrations.',
      es: 'Límites personalizados, soporte dedicado e integraciones a medida.',
    },
    price: {
      monthly: { amount: null, display: 'Custom' },
      yearly: { amount: null, display: 'Custom' },
    },
    period: {
      monthly: { en: '', es: '' },
      yearly: { en: '', es: '' },
    },
    features: {
      en: [
        'Everything in Pro',
        'Custom operational limits',
        'Dedicated success manager',
        'White-label options',
        'SLA guarantees',
      ],
      es: [
        'Todo en Pro',
        'Límites operativos personalizados',
        'Manager de éxito dedicado',
        'Opciones marca blanca',
        'Garantías de SLA',
      ],
    },
    cta: { en: 'Contact Sales', es: 'Contactar Ventas' },
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

type PlanConfig = typeof PRICING_CONFIG[PricingPlanKey];
type PeriodConfig = { monthly: Record<string, string>; yearly: Record<string, string> };

function hasPeriod(config: PlanConfig): config is PlanConfig & { period: PeriodConfig } {
  return 'period' in config && 
    typeof config.period === 'object' && 
    config.period !== null &&
    'monthly' in config.period &&
    'yearly' in config.period;
}

export function getPlanPeriod(planKey: PricingPlanKey, cycle: BillingCycle, lang: 'en' | 'es'): string {
  const planConfig = PRICING_CONFIG[planKey];
  if (hasPeriod(planConfig) && cycle in planConfig.period) {
    const cyclePeriod = planConfig.period[cycle];
    if (typeof cyclePeriod === 'object' && lang in cyclePeriod) {
      return cyclePeriod[lang];
    }
  }
  return '';
}
