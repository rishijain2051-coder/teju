import { brand } from './site';

/**
 * Enquiries are delivered as a pre-composed WhatsApp message rather than posted
 * to a server — there is no backend, and this is the channel the business
 * already runs on.
 *
 * This was previously inlined in the contact form only, which meant the trade
 * access form on /collections resolved to a success screen while sending
 * nothing at all. Both now go through here.
 */
export function sendEnquiry(subject: string, fields: Record<string, string>): void {
  const body = Object.entries(fields)
    .filter(([, value]) => value && value.trim())
    .map(([label, value]) => `${label}: ${value.trim()}`);

  const text = encodeURIComponent([subject, '', ...body].join('\n'));

  window.open(`https://wa.me/${brand.whatsapp}?text=${text}`, '_blank', 'noopener,noreferrer');
}

export const BUSINESS_TYPES = [
  { value: 'retailer', label: 'Furniture retailer' },
  { value: 'importer', label: 'Importer / distributor' },
  { value: 'interior-designer', label: 'Interior designer / studio' },
  { value: 'hospitality', label: 'Hospitality group' },
  { value: 'private-label', label: 'Private label brand' },
  { value: 'other', label: 'Other' },
] as const;

export const labelForBusinessType = (value: string): string =>
  BUSINESS_TYPES.find((t) => t.value === value)?.label ?? value;
