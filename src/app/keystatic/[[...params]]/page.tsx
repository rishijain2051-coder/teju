import { notFound } from 'next/navigation';

/**
 * The catch-all the editor mounts on. The UI itself is rendered by the layout,
 * which owns the client boundary; this page only decides whether the editor
 * should exist at all.
 *
 * Not in production. Storage is local, so the editor cannot write to a deployed
 * filesystem anyway — but shipping a route that renders an authoring UI and
 * silently fails to save is worse than not shipping it. Content is edited
 * locally and committed.
 */
export default function KeystaticPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return null;
}
