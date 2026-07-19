'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';

// Valid access codes — in production, validate server-side
const VALID_CODES = ['radheshyam', 'teju', 'ramkishore'];
const SESSION_KEY = 'vi_private_access';

type EntryState = 'idle' | 'loading' | 'error';

export default function AccessCodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [state, setState] = useState<EntryState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [checked, setChecked] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'granted') {
      router.replace('/collections/private/catalogue');
    } else {
      setChecked(true);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setState('loading');
    setErrorMsg('');

    // Simulate async validation (replace with API call in production)
    setTimeout(() => {
      const normalised = code.trim().toUpperCase();
      if (VALID_CODES.includes(normalised)) {
        sessionStorage.setItem(SESSION_KEY, 'granted');
        router.push('/collections/private/catalogue');
      } else {
        setState('error');
        setErrorMsg('This code is not recognised. Please check your email or contact us.');
      }
    }, 800);
  };

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-6 lg:px-12 h-16 lg:h-20 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <AppLogo size={28} />
          <span className="font-sans font-semibold text-xs tracking-[0.15em] uppercase text-foreground">
            Vardhman Impex
          </span>
        </Link>
        <Link
          href="/collections"
          className="text-xs font-mono text-muted-foreground tracking-widest uppercase hover:text-foreground transition-colors"
        >
          ← Public Collection
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Lock icon */}
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 border border-border flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-accent"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <p className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase mb-3">
              Private Catalogue
            </p>
            <h1 className="font-serif text-display font-light text-foreground mb-4">
              Enter your access code
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This catalogue is reserved for verified trade buyers. If you have received an access code, enter it below to unlock 1,000+ designs.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="access-code"
                className="block text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2"
              >
                Access Code
              </label>
              <input
                id="access-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (state === 'error') setState('idle');
                }}
                placeholder="e.g. Hack Karke Bata"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                required
                className={`w-full px-4 py-4 bg-background border text-foreground text-sm font-mono tracking-widest placeholder:text-muted-foreground/40 placeholder:tracking-normal focus:outline-none transition-colors ${
                  state === 'error' ?'border-red-400 focus:border-red-400' :'border-border focus:border-foreground'
                }`}
              />
              {state === 'error' && (
                <p className="mt-2 text-xs text-red-500">{errorMsg}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={state === 'loading' || !code.trim()}
              className="w-full py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.12em] uppercase btn-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {state === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Verifying…
                </span>
              ) : (
                'Unlock Catalogue'
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-10 pt-8 border-t border-border text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an access code?
            </p>
            <Link
              href="/collections#access"
              className="inline-block text-xs font-mono text-accent tracking-widest uppercase hover:underline underline-offset-4 transition-colors"
            >
              Request access →
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom strip */}
      <footer className="px-6 lg:px-12 py-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © Vardhman Impex. Private access only. Not indexed by search engines.
        </p>
      </footer>
    </div>
  );
}
