'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import AppLogo from '@/components/ui/AppLogo';
import { useReveal } from '@/components/ui/useReveal';
import { brand, facts, img } from '@/lib/site';

type EntryState = 'idle' | 'loading' | 'error';

export default function AccessCodeEntry() {
  const router = useRouter();
  const ref = useReveal<HTMLDivElement>({ immediate: true });
  const [code, setCode] = useState('');
  const [state, setState] = useState<EntryState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        router.push('/collections/private/catalogue');
        return;
      }

      setState('error');
      setErrorMsg('That code was not recognised. Check it and try again.');
    } catch {
      setState('error');
      setErrorMsg('Could not reach the server. Check your connection and try again.');
    }
  };

  const plate = img('hero-starburst');

  return (
    <div ref={ref} className="min-h-screen grid lg:grid-cols-12">
      {/* Gate */}
      <div className="lg:col-span-7 flex flex-col justify-between px-gutter py-10 lg:py-14">
        <Link href="/" className="inline-flex items-center gap-3 self-start">
          <AppLogo size={30} />
          <span className="font-serif text-[1.35rem] leading-none tracking-tight">
            Vardhman Impex
          </span>
        </Link>

        <div className="max-w-[34rem] py-16">
          <p className="text-manifest text-clay veil">Private catalogue</p>

          <h1 className="font-serif text-display font-light mt-6">
            <span className="wipe">
              <span className="wipe-inner" style={{ transitionDelay: '90ms' }}>
                By invitation.
              </span>
            </span>
          </h1>

          <p className="text-lead text-ink-soft mt-6 rise" style={{ transitionDelay: '260ms' }}>
            The full range of {facts.designs}+ designs is held for verified trade
            buyers. Enter the code we issued you.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 rise" style={{ transitionDelay: '340ms' }}>
            <label htmlFor="code" className="text-manifest-sm text-muted">
              Access code
            </label>
            <input
              id="code"
              name="code"
              value={code}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={state === 'error'}
              aria-describedby={state === 'error' ? 'code-error' : undefined}
              onChange={(e) => {
                setCode(e.target.value);
                if (state === 'error') setState('idle');
              }}
              placeholder="Enter your code"
              className={`w-full bg-transparent border-b py-3.5 mt-1 text-title font-serif font-light text-ink placeholder:text-muted/60 placeholder:font-sans placeholder:text-base focus:outline-none transition-colors duration-base ${
                state === 'error' ? 'border-clay' : 'border-line-strong focus:border-clay'
              }`}
            />

            {state === 'error' && (
              <p id="code-error" role="alert" className="text-manifest-sm text-clay mt-3">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={state === 'loading' || !code.trim()}
              className="btn btn-solid mt-8 disabled:opacity-45"
            >
              {state === 'loading' ? 'Checking…' : 'Enter'}
              {state !== 'loading' && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </form>

          <p className="text-body text-muted mt-10 rise" style={{ transitionDelay: '420ms' }}>
            No code yet?{' '}
            <Link href="/collections#access" className="text-clay link-draw">
              Request trade access
            </Link>
            , or write to{' '}
            <a href={`mailto:${brand.email}`} className="text-clay link-draw">
              {brand.email}
            </a>
            .
          </p>
        </div>

        <Link
          href="/collections"
          className="link-arrow inline-flex items-center gap-2.5 text-manifest text-muted hover:text-ink transition-colors duration-base self-start"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" style={{ transform: 'rotate(180deg)' }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Back to the public collections
        </Link>
      </div>

      {/* Plate */}
      <div className="lg:col-span-5 relative min-h-[42vh] lg:min-h-0 bg-paper-deep order-first lg:order-last overflow-hidden">
        <AppImage
          src={plate.src}
          alt={plate.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 42vw"
          placeholder="blur"
          blurDataURL={plate.blurDataURL}
          data-parallax
          className="object-cover scale-[1.14]"
        />
      </div>
    </div>
  );
}
