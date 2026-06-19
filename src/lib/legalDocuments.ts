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
          summary: 'TON618 PRO plans are sold through Tebex. Refund requests are reviewed manually when billing errors, duplicate charges or activation failures are confirmed.',
          metaDescription: 'TON618 refund policy for PRO subscriptions and lifetime purchases made through Tebex.',
          lastUpdated: '2026-06-12',
          highlights: [
            'Subscription renewals and cancellations are managed through Tebex.',
            'Duplicate charges and failed activations are prioritized for remediation or refund.',
            'Supporter status is recognition only and does not purchase premium features.',
          ],
          sections: [
            {
              heading: 'How refunds are evaluated',
              body: [
                'TON618 PRO is sold through Tebex and activated on a Discord server with a one-time activation code. We review refund requests manually because Tebex, the entitlement service and Discord must remain aligned.',
                'Refunds are generally approved when we confirm an operational billing error, such as duplicate charges, checkout succeeding without Pro activation, or a technical issue that blocks the paid features during the first days of service.',
              ],
              points: [
                'Please include the Tebex transaction ID, the Discord account used at checkout and the affected guild ID.',
                'Cancelling a subscription stops future renewals but does not automatically refund the current billing period.',
              ],
            },
            {
              heading: 'What is not refunded automatically',
              body: [
                'We do not automatically refund a period only because the subscription was no longer needed, the bot was removed from the guild after activation, or the team decided not to continue using the product after the service was delivered.',
              ],
              points: [
                'Lifetime purchases are reviewed under the same billing-error and activation-failure criteria.',
                'Supporter recognition is not a paid feature bundle and is outside this refund policy.',
              ],
            },
          ],
        }
      : {
          type,
          title: 'Política de reembolsos',
          summary: 'Los planes PRO de TON618 se venden mediante Tebex. Las solicitudes de reembolso se revisan manualmente cuando confirmamos errores de cobro, cargos duplicados o fallos de activación.',
          metaDescription: 'Política de reembolsos de TON618 para suscripciones PRO y compras de por vida realizadas mediante Tebex.',
          lastUpdated: '2026-06-12',
          highlights: [
            'Las renovaciones y cancelaciones se gestionan desde Tebex.',
            'Los cargos duplicados y las activaciones fallidas se atienden con prioridad.',
            'El estado de colaborador es un reconocimiento y no compra funciones premium.',
          ],
          sections: [
            {
              heading: 'Cómo evaluamos los reembolsos',
              body: [
                'TON618 PRO se vende mediante Tebex y se activa en un servidor de Discord con un código de activación de un solo uso. Revisamos cada solicitud manualmente porque Tebex, el servicio de membresías y Discord deben mantenerse sincronizados.',
                'Normalmente aprobamos reembolsos cuando confirmamos un error de cobro, por ejemplo cargos duplicados, un pago completado sin activación de PRO o una falla técnica que impide usar las funciones pagadas durante los primeros días del servicio.',
              ],
              points: [
                'Incluye el ID de transacción de Tebex, la cuenta de Discord usada en la compra y el ID del servidor afectado.',
                'Cancelar la suscripción evita renovaciones futuras, pero no reembolsa automáticamente el periodo actual.',
              ],
            },
            {
              heading: 'Lo que no se reembolsa automáticamente',
              body: [
                'No reembolsamos automáticamente un periodo solo porque el equipo dejó de necesitar la herramienta, desinstaló el bot después de activarlo o decidió no continuar usando el producto una vez entregado el servicio.',
              ],
              points: [
                'Las compras de por vida se revisan con los mismos criterios de error de cobro y fallo de activación.',
                'El estado de colaborador no es un paquete de funciones pagadas y queda fuera de esta política.',
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
          summary: 'Questions about invoices, failed activations, taxes or entitlement corrections should be sent through the official billing support channels listed here.',
          metaDescription: 'TON618 billing support contact details for customers who purchased through Tebex.',
          lastUpdated: '2026-06-12',
          highlights: [
            'Billing incidents should include the guild ID and Tebex transaction ID when possible.',
            'Manual entitlement corrections are used only for verified support remediation.',
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
                'To speed up support, send the guild ID, the Discord account used at checkout, the plan purchased and the Tebex transaction ID.',
              ],
              points: [
                'We may request extra verification before changing commercial entitlements.',
                'Never send full card details or passwords through support.',
              ],
            },
          ],
        }
      : {
          type,
          title: 'Contacto de facturación',
          summary: 'Las dudas sobre facturas, activaciones fallidas, impuestos o correcciones de acceso deben enviarse por los canales oficiales de soporte comercial indicados aquí.',
          metaDescription: 'Canales de contacto de facturación de TON618 para clientes que compraron mediante Tebex.',
          lastUpdated: '2026-06-12',
          highlights: [
            'Los incidentes de cobro deben incluir el ID del servidor y, si existe, el ID de transacción de Tebex.',
            'Las correcciones manuales de acceso solo se usan para resolver casos de soporte verificados.',
          ],
          sections: [
            {
              heading: 'La mejor forma de escribirnos',
              body: [
                'Usa el servidor de soporte para problemas urgentes de activación y el correo electrónico para facturas, impuestos, revisiones de reembolsos o correcciones de cuenta. Cuanto más contexto envíes, más rápido podremos ubicar la compra y el servidor.',
              ],
              points: [
                'Canal de soporte: servidor oficial de Discord',
                'Correo comercial: la dirección publicada en el pie de página de este sitio',
              ],
            },
            {
              heading: 'Qué información incluir',
              body: [
                'Para acelerar la atención, envía el ID del servidor, la cuenta de Discord usada en la compra, el plan adquirido y el ID de transacción de Tebex.',
              ],
              points: [
                'Podemos pedir verificación adicional antes de corregir el acceso comercial.',
                'Nunca envíes datos completos de tarjetas ni contraseñas por soporte.',
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
