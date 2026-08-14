import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../../keystatic.config';

/**
 * The editor's read and write endpoints. Local storage means these touch the
 * working tree, which only makes sense while developing.
 *
 * They are safe to deploy: in local mode Keystatic's own handler answers 404 to
 * everything unless NODE_ENV is development, so a production build serves no
 * read or write path here even though the route exists. Verified against
 * `next start` — /api/keystatic/tree/main and /api/keystatic/config both 404.
 * If you switch to GitHub mode, that guard goes away and the handler starts
 * doing OAuth instead; see the README.
 */
export const { POST, GET } = makeRouteHandler({ config });
