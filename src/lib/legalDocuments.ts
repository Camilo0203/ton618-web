import type { TFunction } from 'i18next';

export type LegalDocumentType = 'terms' | 'privacy' | 'cookies';
export const LEGAL_DOCUMENT_TYPES: LegalDocumentType[] = ['terms', 'privacy', 'cookies'];

export interface LegalDocumentSection {
  heading: string;
  body: string;
}

export interface LegalDocumentContent {
  type: LegalDocumentType;
  title: string;
  summary: string;
  metaDescription: string;
  lastUpdated: string;
  sections: LegalDocumentSection[];
}

function isLegalDocumentSection(value: unknown): value is LegalDocumentSection {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const section = value as Record<string, unknown>;
  return typeof section.heading === 'string' && typeof section.body === 'string';
}

export function getLegalDocumentContent(
  t: TFunction,
  type: LegalDocumentType,
): LegalDocumentContent {
  const rawSections = t(`legal.${type}.sections`, {
    returnObjects: true,
    defaultValue: [],
  }) as unknown;

  const sections = Array.isArray(rawSections)
    ? rawSections.filter(isLegalDocumentSection)
    : [];

  return {
    type,
    title: t(`legal.${type}.title`),
    summary: t(`legal.${type}.content`),
    metaDescription: t(`legal.${type}.metaDescription`),
    lastUpdated: t('legal.lastUpdatedDate'),
    sections,
  };
}
