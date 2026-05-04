export const PRICING_CONFIG = {
  donation_2: {
    key: 'donation_2',
    category: 'donation',
    name: { en: 'Signal Boost', es: 'Impulso de Senal' },
    badge: { en: 'Donation', es: 'Donacion' },
    description: {
      en: 'A small boost to keep TON618 growing.',
      es: 'Un apoyo pequeno para seguir haciendo crecer TON618.',
    },
    price: { amount: 2, display: '$2.00' },
    period: { en: '', es: '' },
    features: {
      en: ['Supports development', 'Helps hosting costs', 'No premium access included'],
      es: ['Apoya el desarrollo', 'Ayuda con costos de hosting', 'No incluye acceso premium'],
    },
    cta: { en: 'Donate $2', es: 'Donar $2' },
    whopKey: 'donation_2' as const,
    popular: false,
  },
  donation_5: {
    key: 'donation_5',
    category: 'donation',
    name: { en: 'Orbit Fuel', es: 'Combustible Orbital' },
    badge: { en: 'Donation', es: 'Donacion' },
    description: {
      en: 'Support new features and faster improvements.',
      es: 'Apoya nuevas funciones y mejoras mas rapidas.',
    },
    price: { amount: 5, display: '$5.00' },
    period: { en: '', es: '' },
    features: {
      en: ['Supports development', 'Helps hosting costs', 'No premium access included'],
      es: ['Apoya el desarrollo', 'Ayuda con costos de hosting', 'No incluye acceso premium'],
    },
    cta: { en: 'Donate $5', es: 'Donar $5' },
    whopKey: 'donation_5' as const,
    popular: false,
  },
  donation_10: {
    key: 'donation_10',
    category: 'donation',
    name: { en: 'Event Horizon', es: 'Horizonte de Evento' },
    badge: { en: 'Donation', es: 'Donacion' },
    description: {
      en: 'A stronger contribution for the bot roadmap.',
      es: 'Un aporte mas fuerte para el roadmap del bot.',
    },
    price: { amount: 10, display: '$10.00' },
    period: { en: '', es: '' },
    features: {
      en: ['Supports development', 'Helps hosting costs', 'No premium access included'],
      es: ['Apoya el desarrollo', 'Ayuda con costos de hosting', 'No incluye acceso premium'],
    },
    cta: { en: 'Donate $10', es: 'Donar $10' },
    whopKey: 'donation_10' as const,
    popular: false,
  },
  donation_25: {
    key: 'donation_25',
    category: 'donation',
    name: { en: 'Quasar Patron', es: 'Mecenas Quasar' },
    badge: { en: 'Donation', es: 'Donacion' },
    description: {
      en: 'Top-tier support for TON618 development.',
      es: 'Apoyo top para el desarrollo de TON618.',
    },
    price: { amount: 25, display: '$25.00' },
    period: { en: '', es: '' },
    features: {
      en: ['Supports development', 'Helps hosting costs', 'No premium access included'],
      es: ['Apoya el desarrollo', 'Ayuda con costos de hosting', 'No incluye acceso premium'],
    },
    cta: { en: 'Donate $25', es: 'Donar $25' },
    whopKey: 'donation_25' as const,
    popular: false,
  },
  lifetime: {
    key: 'lifetime',
    category: 'premium',
    name: { en: 'Singularity Pass', es: 'Pase Singularidad' },
    badge: { en: 'Lifetime', es: 'De por vida' },
    description: {
      en: 'Premium access forever with one payment.',
      es: 'Acceso premium para siempre con un solo pago.',
    },
    price: { amount: 79.99, display: '$79.99' },
    period: { en: 'lifetime', es: 'de por vida' },
    features: {
      en: ['All premium features', 'One-time payment', 'Lifetime access', 'Priority improvements'],
      es: ['Todas las funciones premium', 'Pago unico', 'Acceso de por vida', 'Mejoras prioritarias'],
    },
    cta: { en: 'Get lifetime', es: 'Comprar de por vida' },
    whopKey: 'lifetime' as const,
    popular: true,
  },
  yearly: {
    key: 'yearly',
    category: 'premium',
    name: { en: 'Command Core', es: 'Nucleo de Comando' },
    badge: { en: 'Yearly', es: 'Anual' },
    description: {
      en: 'Premium access billed once per year.',
      es: 'Acceso premium facturado una vez al ano.',
    },
    price: { amount: 39.99, display: '$39.99' },
    period: { en: '/ year', es: '/ ano' },
    features: {
      en: ['All premium features', 'Annual billing', 'Cancel future renewals', 'Priority support'],
      es: ['Todas las funciones premium', 'Facturacion anual', 'Cancela futuras renovaciones', 'Soporte prioritario'],
    },
    cta: { en: 'Choose yearly', es: 'Elegir anual' },
    whopKey: 'pro_yearly' as const,
    popular: false,
  },
  monthly: {
    key: 'monthly',
    category: 'premium',
    name: { en: 'Staff Engine', es: 'Motor de Staff' },
    badge: { en: 'Monthly', es: 'Mensual' },
    description: {
      en: 'Premium access with a monthly subscription.',
      es: 'Acceso premium con suscripcion mensual.',
    },
    price: { amount: 4.99, display: '$4.99' },
    period: { en: '/ month', es: '/ mes' },
    features: {
      en: ['All premium features', 'Monthly billing', 'Flexible subscription', 'Priority support'],
      es: ['Todas las funciones premium', 'Facturacion mensual', 'Suscripcion flexible', 'Soporte prioritario'],
    },
    cta: { en: 'Choose monthly', es: 'Elegir mensual' },
    whopKey: 'pro_monthly' as const,
    popular: false,
  },
} as const;

export const donationPlanKeys = ['donation_2', 'donation_5', 'donation_10', 'donation_25'] as const;
export const premiumPlanKeys = ['lifetime', 'yearly', 'monthly'] as const;

export type PricingPlanKey = keyof typeof PRICING_CONFIG;
export type BillingPlanKey = 'pro_monthly' | 'pro_yearly' | 'lifetime';
export type DonationCheckoutKey = 'donation_2' | 'donation_5' | 'donation_10' | 'donation_25';
export type DonationPlanKey = typeof donationPlanKeys[number];
export type PremiumPlanKey = typeof premiumPlanKeys[number];
