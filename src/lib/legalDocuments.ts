import type { TFunction } from 'i18next';

export type LegalDocumentType = 'terms' | 'privacy' | 'cookies' | 'refunds' | 'billing-contact';
export const LEGAL_DOCUMENT_TYPES: LegalDocumentType[] = [
  'terms',
  'privacy',
  'cookies',
  'refunds',
  'billing-contact',
];

export interface LegalDocumentSection {
  heading: string;
  body: string[];
  points: string[];
}

export interface LegalDocumentContent {
  type: LegalDocumentType;
  title: string;
  summary: string;
  metaDescription: string;
  lastUpdated: string;
  highlights: string[];
  sections: LegalDocumentSection[];
}

function resolveLocalizedText(t: TFunction, key: string, fallback: string) {
  const value = t(key, { defaultValue: fallback });
  return value === key ? fallback : value;
}

function isEnglishLanguage(t: TFunction) {
  return resolveLocalizedText(t, 'nav.docs', 'Docs') === 'Docs';
}

function getFallbackLegalDocumentContent(
  t: TFunction,
  type: LegalDocumentType,
): LegalDocumentContent | null {
  const isEnglish = isEnglishLanguage(t);

  if (type === 'refunds') {
    return isEnglish
      ? {
          type,
          title: 'Refund Policy',
          summary: 'TON618 Pro is billed as a self-serve subscription. Refund requests are reviewed manually and applied when billing errors, duplicate charges or activation failures are confirmed.',
          metaDescription: 'TON618 refund policy for Pro subscriptions and paid beta billing.',
          lastUpdated: '2026-04-03',
          highlights: [
            'Subscription renewals are managed through the Stripe customer portal.',
            'Duplicate charges and failed activations are prioritized for remediation or refund.',
            'Supporter status is recognition only and does not purchase premium features.',
          ],
          sections: [
            {
              heading: 'How refunds are evaluated',
              body: [
                'TON618 Pro is sold as a subscription attached to a Discord server. We review refund requests manually because activation depends on Stripe, Supabase and the Discord control plane staying aligned.',
                'Refunds are generally approved when we confirm an operational billing error, such as duplicate charges, checkout succeeding without Pro activation, or a technical issue that blocks the paid features during the first days of service.',
              ],
              points: [
                'Please include the Stripe receipt email and the affected guild ID when contacting support.',
                'Cancelling a subscription stops future renewals but does not automatically refund the current billing period.',
              ],
            },
            {
              heading: 'What is not refunded automatically',
              body: [
                'We do not automatically refund a period only because the subscription was no longer needed, the bot was removed from the guild after activation, or the team decided not to continue using the product after the service was delivered.',
              ],
              points: [
                'Enterprise agreements follow their own commercial terms.',
                'Supporter recognition is not a paid feature bundle and is outside this refund policy.',
              ],
            },
          ],
        }
      : {
          type,
          title: 'Politica de reembolsos',
          summary: 'TON618 Pro se cobra como suscripcion self-serve. Las solicitudes de reembolso se revisan manualmente y se aprueban cuando confirmamos errores de cobro, cargos duplicados o fallos reales de activacion.',
          metaDescription: 'Politica de reembolsos de TON618 para suscripciones Pro y billing de beta pagada.',
          lastUpdated: '2026-04-03',
          highlights: [
            'Las renovaciones y cancelaciones se gestionan desde el portal de Stripe.',
            'Los cargos duplicados y las activaciones fallidas se atienden con prioridad.',
            'Supporter es reconocimiento y no compra funciones premium.',
          ],
          sections: [
            {
              heading: 'Como evaluamos los reembolsos',
              body: [
                'TON618 Pro se vende como una suscripcion ligada a un servidor de Discord. Revisamos cada solicitud manualmente porque la activacion depende de Stripe, Supabase y el control plane del bot funcionando de forma consistente.',
                'Normalmente aprobamos reembolsos cuando confirmamos un error operativo de billing, por ejemplo cargos duplicados, checkout exitoso sin activacion de Pro o una falla tecnica que impide usar las funciones pagadas durante los primeros dias del servicio.',
              ],
              points: [
                'Incluye el correo del recibo de Stripe y el ID del servidor afectado al escribirnos.',
                'Cancelar la suscripcion evita renovaciones futuras, pero no reembolsa automaticamente el periodo actual.',
              ],
            },
            {
              heading: 'Lo que no se reembolsa automaticamente',
              body: [
                'No reembolsamos de forma automatica un periodo solo porque el equipo dejo de necesitar la herramienta, desinstalo el bot despues de activarlo o decidio no continuar usando el producto una vez entregado el servicio.',
              ],
              points: [
                'Los acuerdos Enterprise siguen sus propios terminos comerciales.',
                'El estado Supporter no es un paquete de funciones pagadas y queda fuera de esta politica.',
              ],
            },
          ],
        };
  }

  if (type === 'billing-contact') {
    return isEnglish
      ? {
          type,
          title: 'Billing Contact',
          summary: 'Questions about invoices, failed activations, taxes or manual overrides for the paid beta should be sent through the official billing support channels listed here.',
          metaDescription: 'TON618 billing support contact details for paid beta customers.',
          lastUpdated: '2026-04-03',
          highlights: [
            'Billing incidents should include the guild ID and the Stripe receipt email when possible.',
            'Manual entitlement overrides are used only for support remediation, beta grants or enterprise onboarding.',
          ],
          sections: [
            {
              heading: 'Best way to reach us',
              body: [
                'Use the support server for urgent activation issues and use email for invoices, taxes, refund reviews or account corrections. Include enough context for us to identify the guild and the purchase quickly.',
              ],
              points: [
                'Support channel: Discord support server',
                'Billing email: the contact address published in the footer of this site',
              ],
            },
            {
              heading: 'What to include',
              body: [
                'To speed up support, send the guild ID, the Discord account that manages the server, the billing interval purchased, and the Stripe receipt or payment intent ID when available.',
              ],
              points: [
                'We may request extra verification before changing commercial entitlements.',
                'Enterprise rollouts are coordinated directly with the project owner.',
              ],
            },
          ],
        }
      : {
          type,
          title: 'Contacto de billing',
          summary: 'Las dudas sobre facturas, activaciones fallidas, impuestos o overrides manuales de la beta pagada deben enviarse por los canales oficiales de soporte comercial listados aqui.',
          metaDescription: 'Canales de contacto de billing de TON618 para clientes de la beta pagada.',
          lastUpdated: '2026-04-03',
          highlights: [
            'Los incidentes de cobro deben incluir el ID del servidor y, si existe, el correo del recibo de Stripe.',
            'Los overrides manuales solo se usan para soporte, grants de beta o onboarding enterprise.',
          ],
          sections: [
            {
              heading: 'La mejor forma de escribirnos',
              body: [
                'Usa el servidor de soporte para problemas urgentes de activacion y usa email para facturas, impuestos, revisiones de reembolsos o correcciones de cuenta. Entre mas contexto envies, mas rapido podremos ubicar la compra y el servidor.',
              ],
              points: [
                'Canal de soporte: servidor oficial de Discord',
                'Email comercial: la direccion publicada en el footer de este sitio',
              ],
            },
            {
              heading: 'Que informacion incluir',
              body: [
                'Para acelerar la atencion, manda el ID del servidor, la cuenta de Discord que lo administra, el intervalo de billing comprado y el recibo o payment intent ID de Stripe si lo tienes.',
              ],
              points: [
                'Podemos pedir verificacion adicional antes de cambiar entitlements comerciales.',
                'Los despliegues Enterprise se coordinan directamente con el owner del proyecto.',
              ],
            },
          ],
        };
  }

  return null;
}

export function getLegalDocumentTitle(t: TFunction, type: LegalDocumentType) {
  const fallback = getFallbackLegalDocumentContent(t, type);
  if (fallback) {
    return fallback.title;
  }

  return resolveLocalizedText(t, `legal.${type}.title`, type);
}

function toStringArray(value: unknown): string[] {
  if (typeof value === 'string') {
    return value.trim() ? [value] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function normalizeLegalDocumentSection(value: unknown): LegalDocumentSection | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const section = value as Record<string, unknown>;
  if (typeof section.heading !== 'string') {
    return null;
  }

  const body = toStringArray(section.body);
  if (!body.length) {
    return null;
  }

  return {
    heading: section.heading,
    body,
    points: toStringArray(section.points),
  };
}

export function getLegalDocumentContent(
  t: TFunction,
  type: LegalDocumentType,
): LegalDocumentContent {
  const fallback = getFallbackLegalDocumentContent(t, type);
  if (fallback) {
    return fallback;
  }

  const rawSections = t(`legal.${type}.sections`, {
    returnObjects: true,
    defaultValue: [],
  }) as unknown;
  const rawHighlights = t(`legal.${type}.highlights`, {
    returnObjects: true,
    defaultValue: [],
  }) as unknown;

  const sections = Array.isArray(rawSections)
    ? rawSections
      .map((section) => normalizeLegalDocumentSection(section))
      .filter((section): section is LegalDocumentSection => Boolean(section))
    : [];

  return {
    type,
    title: resolveLocalizedText(t, `legal.${type}.title`, type),
    summary: resolveLocalizedText(t, `legal.${type}.content`, ''),
    metaDescription: resolveLocalizedText(t, `legal.${type}.metaDescription`, ''),
    lastUpdated: resolveLocalizedText(t, 'legal.lastUpdatedDate', '2026-04-03'),
    highlights: toStringArray(rawHighlights),
    sections,
  };
}
