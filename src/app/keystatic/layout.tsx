import React from 'react';
import KeystaticApp from './keystatic';

/**
 * The editor renders its own shell, so it opts out of the site layout's fonts,
 * grain and motion provider entirely. Keeping it separate also means a change to
 * the site's chrome can never break the tool used to edit the site.
 */
export const metadata = {
  title: 'Content — Vardhman Impex',
  robots: { index: false, follow: false, nocache: true },
};

export default function KeystaticLayout() {
  return <KeystaticApp />;
}
