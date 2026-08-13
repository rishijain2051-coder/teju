import { brand } from './site';

/**
 * Enquiries are emailed through /api/enquiry, which sends over SMTP server-side.
 * WhatsApp remains available as a second, explicitly-labelled route for buyers
 * who prefer to chat — it is no longer what happens when you press "send".
 */

export interface EnquiryField {
  label: string;
  value: string;
}

export interface EnquiryResult {
  ok: boolean;
  error?: string;
}

export async function submitEnquiry(
  subject: string,
  fields: EnquiryField[],
  options: { email?: string; honeypot?: string } = {}
): Promise<EnquiryResult> {
  try {
    const res = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        fields,
        email: options.email,
        honeypot: options.honeypot ?? '',
      }),
    });

    const data = (await res.json().catch(() => null)) as EnquiryResult | null;

    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        error:
          data?.error ??
          'We could not send that just now. Please try WhatsApp or email us directly.',
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'No connection. Please try WhatsApp or email us directly.',
    };
  }
}

/** A pre-composed WhatsApp message for the same enquiry. */
export function whatsappUrl(subject: string, fields: EnquiryField[]): string {
  const body = fields
    .filter((f) => f.value && f.value.trim())
    .map((f) => `${f.label}: ${f.value.trim()}`);

  const text = encodeURIComponent([subject, '', ...body].join('\n'));
  return `https://wa.me/${brand.whatsapp}?text=${text}`;
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
