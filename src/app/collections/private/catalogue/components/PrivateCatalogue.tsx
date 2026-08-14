'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { useReveal } from '@/components/ui/useReveal';
import PrivatePiece, { pieceFields, type PieceState } from './PrivatePiece';
import ContainerPlan from './ContainerPlan';
import PrivateProgramme from './PrivateProgramme';
import {
  allPieces,
  cartonFor,
  collections,
  currentSeason,
  pieces as publicPieces,
  type CollectionName,
  type Piece,
} from '@/lib/site';
import { submitEnquiry } from '@/lib/enquiry';

const FILTERS = ['All', ...collections.map((collection) => collection.name)] as const;
type Filter = (typeof FILTERS)[number];

const SORTS = [
  { value: 'ref', label: 'Reference' },
  { value: 'name', label: 'Name' },
  { value: 'volume', label: 'Volume' },
  { value: 'newest', label: 'Newest' },
] as const;
type Sort = (typeof SORTS)[number]['value'];

const newArrivals = allPieces.filter((piece) => piece.season === currentSeason);

const MANIFEST_COLUMNS = [
  'Ref',
  'Design',
  'Collection',
  'Material',
  'Finish',
  'Finished size',
  'CBM',
  '20ft / 40ft',
  'Qty',
  '',
] as const;

/**
 * The gated catalogue.
 *
 * The public grid and this page used to render the same component with a longer
 * array, which made the access gate feel like a formality. What is actually
 * behind it now: roughly twice the range, the trade figures a buyer needs to
 * plan a container, a dense manifest view of the whole range, and a planner that
 * totals a selection and sends it as one enquiry.
 */
export default function PrivateCatalogue() {
  const router = useRouter();
  const ref = useReveal<HTMLDivElement>({ immediate: true });

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [onlyNew, setOnlyNew] = useState(false);
  const [sort, setSort] = useState<Sort>('ref');
  const [view, setView] = useState<'gallery' | 'manifest'>('gallery');

  const [signingOut, setSigningOut] = useState(false);
  const [pieceState, setPieceState] = useState<Record<string, PieceState>>({});
  const [openDossiers, setOpenDossiers] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const matches = (piece: Piece) => {
      if (filter !== 'All' && piece.collection !== (filter as CollectionName)) return false;
      if (onlyNew && piece.season !== currentSeason) return false;
      if (!needle) return true;
      return [piece.ref, piece.name, piece.collection, piece.material, piece.finish]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    };

    const sorted = allPieces.filter(matches);

    switch (sort) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'volume':
        return sorted.sort((a, b) => (cartonFor(a)?.cbm ?? 0) - (cartonFor(b)?.cbm ?? 0));
      case 'newest':
        return sorted.sort((a, b) => b.ref.localeCompare(a.ref));
      default:
        return sorted.sort((a, b) => a.ref.localeCompare(b.ref));
    }
  }, [query, filter, onlyNew, sort]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await fetch('/api/logout', { method: 'POST' });
    router.push('/collections');
    router.refresh();
  };

  const handleEnquire = useCallback(async (piece: Piece) => {
    setPieceState((prev) => ({ ...prev, [piece.ref]: 'sending' }));

    const result = await submitEnquiry(
      `Private catalogue enquiry: ${piece.name}`,
      pieceFields(piece)
    );

    setPieceState((prev) => ({ ...prev, [piece.ref]: result.ok ? 'sent' : 'error' }));
  }, []);

  /*
   * A ref set to 0 is kept, not deleted. Deleting it made `planning` false on the
   * intermediate keystroke of any edit that passes through empty — backspacing
   * "12" to type "20" — which unmounted the planner and snapped 176px of page
   * padding away under a buyer who was scrolled to the bottom of the page looking
   * at it. `ContainerPlan` already filters on `> 0`, so a zero entry contributes
   * nothing to the totals. `onClear` resets the whole object, which is the one
   * deliberate way back to no selection.
   */
  const setQuantity = useCallback((pieceRef: string, next: number) => {
    setQuantities((prev) => ({ ...prev, [pieceRef]: Math.max(0, next) }));
  }, []);

  const toggleDossier = useCallback((pieceRef: string) => {
    setOpenDossiers((prev) => ({ ...prev, [pieceRef]: !prev[pieceRef] }));
  }, []);

  const control =
    'text-manifest py-2 transition-colors duration-fast ease-out tap disabled:opacity-40';

  /* Keyed on the coarse filters only. Including the search query would remount
     every plate on each keystroke — the animation is for a deliberate change of
     view, not for typing. `sort` is out for the same reason and one more: a
     re-order is the same items in a new sequence, so there is nothing for an
     entrance to explain, and a closed native <select> fires `change` on every
     arrow keypress — three restarted keyframes over 39 rows to get from Reference
     to Newest. `filter` and `view` stay: those genuinely change what is on screen. */
  const gridKey = `${filter}-${onlyNew}-${view}`;

  /* The planner is a sticky bar, so while scrolling it covers whatever is
     underneath it. Reserving the space only once a selection exists keeps the
     page from carrying dead room before the bar is ever shown.

     Any entry at all, including zeros, so the reserved space does not thrash
     while a quantity is being edited. */
  const planning = Object.values(quantities).length > 0;

  return (
    <div ref={ref} className="min-h-screen flex flex-col">
      {/* Private masthead — deliberately distinct from the public one */}
      <header className="sticky top-0 z-40 bg-ink text-paper">
        <div className="shell-wide flex items-center justify-between h-16 lg:h-18 py-3">
          <Link href="/" className="flex items-center gap-3">
            <AppLogo size={26} className="brightness-0 invert" />
            <span className="font-serif text-[1.15rem] leading-none tracking-tight">
              Vardhman Impex
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <span className="hidden sm:inline text-manifest-sm text-timber">Private catalogue</span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-manifest-sm text-paper/60 hover:text-paper transition-colors duration-fast ease-out disabled:opacity-50 tap"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      <main
        id="main"
        /* No transition on the padding: animating it would reflow the whole
           page every frame, and the change happens below the fold anyway. */
        className={`flex-1 pt-12 lg:pt-16 ${planning ? 'pb-56 lg:pb-48' : 'pb-12 lg:pb-16'}`}
      >
        <div className="shell">
          <p className="text-manifest text-clay veil">Verified trade access</p>
          <h1 className="font-serif text-display font-light mt-5">
            The full <span className="italic">range</span>
          </h1>
          <p className="text-lead text-ink-soft max-w-measure mt-6 rise">
            Everything currently live, with the packed volumes and container counts that are not
            published publicly. Select quantities as you go and the planner at the foot of the page
            totals them into a container.
          </p>

          {/* What the gate is actually for, stated as a manifest. */}
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 mt-10 pt-6 border-t border-line-strong rise">
            <div>
              <dt className="text-manifest-sm text-muted">In this catalogue</dt>
              <dd className="font-serif text-display-sm font-light numeral mt-1.5">
                {allPieces.length}
                <span className="text-manifest-sm text-muted ml-2">designs</span>
              </dd>
            </div>
            <div>
              <dt className="text-manifest-sm text-muted">Shown publicly</dt>
              <dd className="font-serif text-display-sm font-light numeral mt-1.5 text-muted">
                {publicPieces.length}
              </dd>
            </div>
            <div>
              <dt className="text-manifest-sm text-muted">New in {currentSeason}</dt>
              <dd className="font-serif text-display-sm font-light numeral mt-1.5 text-clay">
                {newArrivals.length}
              </dd>
            </div>
            <div>
              <dt className="text-manifest-sm text-muted">Collections</dt>
              <dd className="font-serif text-display-sm font-light numeral mt-1.5">
                {collections.length}
              </dd>
            </div>
          </dl>

          {/* ── Controls ────────────────────────────────────────────────────── */}
          <div className="mt-12 border-y border-line-strong rise">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 py-4">
              {FILTERS.map((entry) => {
                const count =
                  entry === 'All'
                    ? allPieces.length
                    : allPieces.filter((piece) => piece.collection === entry).length;
                return (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setFilter(entry)}
                    aria-pressed={entry === filter}
                    className={`${control} ${
                      entry === filter ? 'text-clay' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {entry}
                    {/* Quantity, not an index — see CollectionsGrid. */}
                    <span className="ml-2 text-manifest-sm text-muted numeral">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 py-4 border-t border-line">
              <label className="flex items-center gap-3 flex-1 min-w-[14rem]">
                <span className="text-manifest-sm text-muted shrink-0">Search</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Reference, name, material, finish"
                  className="w-full bg-transparent border-b border-line py-2 text-body text-ink placeholder:text-muted/70 focus:border-clay focus:outline-none transition-colors duration-fast ease-out"
                />
              </label>

              <label className="flex items-center gap-2.5 py-2">
                <input
                  type="checkbox"
                  checked={onlyNew}
                  onChange={(e) => setOnlyNew(e.target.checked)}
                  className="w-4 h-4 accent-clay"
                />
                <span className="text-manifest-sm text-ink-soft">
                  New only <span className="text-muted numeral">{newArrivals.length}</span>
                </span>
              </label>

              <label className="flex items-center gap-2.5 py-2">
                <span className="text-manifest-sm text-muted">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="bg-transparent border-b border-line py-2 text-manifest-sm text-ink focus:border-clay focus:outline-none transition-colors duration-fast ease-out"
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* View toggle. The manifest view is the reason this page exists —
                  it is how a buyer reads thirty-nine designs at once. */}
              <div className="flex items-center gap-4" role="group" aria-label="View">
                {(['gallery', 'manifest'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setView(option)}
                    aria-pressed={view === option}
                    className={`${control} ${
                      view === option ? 'text-clay' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {option === 'gallery' ? 'Gallery' : 'Manifest'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-manifest-sm text-muted mt-5 numeral" aria-live="polite">
            {visible.length} of {allPieces.length} designs
            {query.trim() && ` matching “${query.trim()}”`}
          </p>

          {/* ── The range ───────────────────────────────────────────────────── */}
          {visible.length === 0 ? (
            <p className="text-lead text-muted mt-12">
              Nothing matches that. Clear the search, or ask us: the drawing floor produces to
              specification.
            </p>
          ) : view === 'gallery' ? (
            <div
              key={gridKey}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-8 filter-swap"
            >
              {visible.map((piece) => (
                <PrivatePiece
                  key={piece.ref}
                  piece={piece}
                  view="gallery"
                  open={Boolean(openDossiers[piece.ref])}
                  onToggle={() => toggleDossier(piece.ref)}
                  state={pieceState[piece.ref]}
                  onEnquire={() => handleEnquire(piece)}
                  quantity={quantities[piece.ref] ?? 0}
                  onQuantity={(next) => setQuantity(piece.ref, next)}
                />
              ))}
            </div>
          ) : (
            <div key={gridKey} className="overflow-x-auto mt-8 filter-swap">
              <table className="w-full min-w-[64rem] border-collapse">
                <caption className="sr-only">
                  The full Vardhman Impex range with indicative packed volumes
                </caption>
                <thead>
                  <tr className="border-b border-line-strong">
                    {MANIFEST_COLUMNS.map((column, i) => (
                      <th
                        key={column || `actions-${i}`}
                        scope="col"
                        className="text-left text-manifest-sm text-muted font-normal pb-3 pr-4"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((piece) => (
                    <PrivatePiece
                      key={piece.ref}
                      piece={piece}
                      view="manifest"
                      open={Boolean(openDossiers[piece.ref])}
                      onToggle={() => toggleDossier(piece.ref)}
                      state={pieceState[piece.ref]}
                      onEnquire={() => handleEnquire(piece)}
                      quantity={quantities[piece.ref] ?? 0}
                      onQuantity={(next) => setQuantity(piece.ref, next)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <PrivateProgramme />
      </main>

      <ContainerPlan pieces={allPieces} quantities={quantities} onClear={() => setQuantities({})} />
    </div>
  );
}
