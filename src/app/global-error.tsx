'use client';

import React, { useEffect } from 'react';

/**
 * The last resort.
 *
 * `error.tsx` sits inside the root layout, so it cannot catch a fault in the
 * layout itself — and the layout is where the fonts, the design tokens and the
 * motion provider are wired. This boundary replaces the whole document, which
 * means it gets no `<Header>`, no Tailwind classes and no CSS custom properties:
 * if the layout failed, the stylesheet may never have loaded.
 *
 * So the styling here is inline and self-contained, with the palette values
 * written out literally rather than read from `:root`. It is deliberately plain.
 * A page that only appears when everything else has failed should have no
 * dependencies of its own.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root layout error', error.digest ? `(digest ${error.digest})` : '', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#EFE9DF',
          color: '#17130F',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <div style={{ maxWidth: '38rem', padding: '3rem 1.5rem' }}>
          <p
            style={{
              margin: 0,
              color: '#973F24',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            Vardhman Impex
          </p>

          <h1
            style={{
              margin: '1.5rem 0 0',
              fontFamily: 'ui-serif, Georgia, serif',
              fontSize: 'clamp(2rem, 1rem + 4vw, 3.5rem)',
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            The site could not start.
          </h1>

          <p
            style={{
              margin: '1.5rem 0 0',
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              color: '#3A332B',
            }}
          >
            Something failed before the page could be built. Reloading usually clears it. If it does
            not, write to{' '}
            <a href="mailto:rishi@vardhman-impex.com" style={{ color: '#973F24' }}>
              rishi@vardhman-impex.com
            </a>{' '}
            or call{' '}
            <a href="tel:+919352187266" style={{ color: '#973F24' }}>
              +91 93521 87266
            </a>
            .
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '2.5rem',
              padding: '1rem 1.75rem',
              background: '#17130F',
              color: '#EFE9DF',
              border: '1px solid #17130F',
              borderRadius: 0,
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>

          {error.digest && (
            <p style={{ margin: '2rem 0 0', fontSize: '0.8125rem', color: '#655B4E' }}>
              Reference for us: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
