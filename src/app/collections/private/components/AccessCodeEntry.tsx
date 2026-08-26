'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Arrow from '@/components/ui/Arrow';
import AppImage from '@/components/ui/AppImage';
import Wordmark from '@/components/ui/Wordmark';
import { useReveal } from '@/components/ui/useReveal';
import { brand, facts, img } from '@/lib/site';

type EntryState = 'idle' | 'loading' | 'granted' | 'error';

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
        /*
         * Acknowledge before navigating, but do not delay the navigation. The push
         * still fires on this tick; fetching the catalogue's payload already takes
         * a beat, and the confirmation occupies that beat instead of leaving the
         * button reading "Checking…" until the page cuts away. A buyer crosses this
         * threshold once, so it is worth the twelve lines — and worth nothing more
         * than this: the range behind the gate is the reward, not an animation.
         */
        setState('granted');
        router.push('/collections/private/catalogue');
        return;
      }

      /*
       * 401 is the ONLY status that means the code was wrong.
       *
       * Every non-ok response used to read "That code was not recognised", so a
       * missing ACCESS_SECRET or an unset ACCESS_CODES on the host reported a
       * deployment fault as a wrong code: buyers re-typed a code that had been
       * correct all along, and we went looking for a bug in the code list. A
       * server fault has to say it is a server fault.
       *
       * The route's own `error` string is shown verbatim when it sends one — it
       * is written for display, and deliberately reveals nothing about whether a
       * code exists or what one looks like.
       */
      const payload = (await res.json().catch(() => null)) as {
        error?: unknown;
        reason?: unknown;
      } | null;

      setState('error');
      setErrorMsg(
        res.status === 401
          ? 'That code was not recognised. Check it and try again.'
          : typeof payload?.error === 'string' && payload.error
            ? payload.error
            : 'Access could not be checked just now. Please try again in a moment.'
      );

      /* One line in the console so a non-401 is diagnosable without opening the
         Network tab. `reason` names the misconfigured variable, never a value. */
      if (res.status !== 401) {
        console.warn(
          `[access] /api/verify-access returned ${res.status}` +
            (typeof payload?.reason === 'string' ? ` (${payload.reason})` : '')
        );
      }
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
        <Link href="/" className="inline-flex items-center self-start">
          <Wordmark />
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
            The full range of {facts.designs}+ designs is held for verified trade buyers. Enter the
            code we issued you.
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
              className={`w-full bg-transparent border-b py-3.5 mt-1 text-title font-serif font-light text-ink placeholder:text-muted placeholder:font-sans placeholder:text-base focus:outline-none transition-colors duration-fast ease-out ${
                state === 'error'
                  ? 'border-clay'
                  : state === 'granted'
                    ? 'border-ink'
                    : 'border-line-strong focus:border-clay'
              }`}
            />

            {state === 'error' && (
              <p id="code-error" role="alert" className="text-manifest-sm text-clay mt-3">
                {errorMsg}
              </p>
            )}

            {state === 'granted' && (
              <p className="text-manifest-sm text-ink mt-3 filter-swap">
                Code accepted. Opening the full range…
              </p>
            )}

            <button
              type="submit"
              disabled={state === 'loading' || state === 'granted' || !code.trim()}
              className="btn btn-solid mt-8 disabled:opacity-45"
            >
              {state === 'loading' ? 'Checking…' : state === 'granted' ? 'Access granted' : 'Enter'}
              {state !== 'loading' && state !== 'granted' && <Arrow />}
            </button>
          </form>

          <p className="text-body text-muted mt-10 rise" style={{ transitionDelay: '420ms' }}>
            No code yet?{' '}
            <Link href="/collections#access" className="text-clay link-draw press">
              Request trade access
            </Link>
            , or write to{' '}
            <a href={`mailto:${brand.email}`} className="text-clay link-draw press">
              {brand.email}
            </a>
            .
          </p>
        </div>

        <Link
          href="/collections"
          /* `py-2` rather than `.tap`: this is the only way back off the gate, so
             the hit area belongs in the box itself rather than in a pseudo-element
             that a neighbour could win. */
          className="link-arrow inline-flex items-center gap-2.5 py-2 text-manifest text-muted hover:text-ink transition-colors duration-fast ease-out self-start"
        >
          <Arrow back />
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
