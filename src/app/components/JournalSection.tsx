'use client';

import React from 'react';
import Link from 'next/link';
import PlateLink from '@/components/ui/PlateLink';
import AppImage from '@/components/ui/AppImage';
import { useReveal } from '@/components/ui/useReveal';
import { journal, img } from '@/lib/site';

export default function JournalSection() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} id="journal" className="py-20 lg:py-32">
      <div className="shell">
        <header className="rule-label rise">
          <div className="flex-1">
            <h2 className="font-serif text-display font-light -mt-2">
              From the <span className="italic">workshop</span>
            </h2>
          </div>
          <Link
            href="/journal"
            className="link-arrow tap hidden sm:inline-flex items-center gap-2.5 text-manifest text-ink-soft hover:text-clay transition-colors duration-fast ease-out"
          >
            All notes
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </header>

        <div data-reveal-group className="grid md:grid-cols-3 gap-x-6 gap-y-12 mt-12 lg:mt-16">
          {journal.slice(0, 3).map((article) => {
            const plate = img(article.image);
            return (
              <article key={article.slug} className="group rise">
                <PlateLink href={`/journal/${article.slug}`} className="block">
                  <div data-plate="idle" className="plate aspect-[3/2]">
                    <AppImage
                      src={plate.src}
                      alt={plate.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      placeholder="blur"
                      blurDataURL={plate.blurDataURL}
                      className="object-cover"
                    />
                  </div>

                  <div className="pt-4 mt-4 border-t border-line group-hover:border-ink transition-colors duration-fast ease-out">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-manifest-sm text-clay">{article.category}</span>
                      <span className="text-manifest-sm text-muted">{article.date}</span>
                    </div>
                    <h3 className="text-title mt-3 group-hover:text-clay transition-colors duration-fast ease-out">
                      {article.title}
                    </h3>
                    <p className="text-body text-muted mt-2">{article.excerpt}</p>
                  </div>
                </PlateLink>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
