#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Installs the repository's git hooks, from `npm install`'s `prepare` step.
 *
 * There is no husky here on purpose. Husky's whole job is writing a file into
 * `.git/hooks` and setting `core.hooksPath`, and that is about thirty lines —
 * cheaper to own than to add a dependency, a `.husky/` directory and a second
 * install lifecycle to a tree this small.
 *
 * Everything below fails open, and that is the deliberate trade. This runs inside
 * `npm install` and `npm ci`, on machines that may have no git directory (an
 * install from a tarball, a Docker layer, Vercel's build step), no git binary, or
 * a read-only checkout. None of those are the user's problem, and none of them
 * should be able to fail an install over a convenience hook. The check that
 * actually gates the branch is the one in CI — `.github/workflows/ci.yml` runs
 * `npm run images:check` on every push and pull request, and it cannot be skipped
 * with `--no-verify`. This hook only moves that answer earlier.
 */

/*
 * `--git-path hooks` rather than a hardcoded `.git/hooks`, because `.git` is a
 * *file* in a linked worktree and in a submodule, and this returns the real
 * directory in both. It also honours `core.hooksPath` if something else has
 * already claimed it — in which case that tool owns hooks here and this backs off
 * rather than writing somewhere git will never look.
 */
function hooksDirectory() {
  const git = (...args) =>
    execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

  git('rev-parse', '--git-dir');

  const configured = (() => {
    try {
      return git('config', '--get', 'core.hooksPath');
    } catch {
      return '';
    }
  })();

  return {
    dir: path.resolve(git('rev-parse', '--git-path', 'hooks')),
    borrowed: Boolean(configured),
  };
}

// Written into the hook so a later run can tell its own file apart from one
// somebody wrote by hand, and refuse to overwrite the latter.
const MARKER = '# managed by scripts/install-git-hooks.mjs';

/*
 * No backticks anywhere in this script. It is interpolated into a shell file whose
 * messages are double-quoted, where a backtick opens a command substitution — so
 * prose punctuation would become something the hook executes.
 */
const PRE_COMMIT = [
  '#!/bin/sh',
  MARKER,
  '#',
  '# Reconciles src/lib/imagery.ts against public/assets/images/catalogue/ before',
  '# the commit lands. A photograph added without a manifest entry is invisible to',
  '# the editor, an entry whose dimensions no longer match a re-exported file makes',
  '# every layout that reserves space for it wrong, and a missing alt is an',
  '# accessibility defect that is easy to ship and hard to notice.',
  '#',
  '# Roughly a second over 45 photographs. "git commit --no-verify" skips it; CI',
  '# does not, so skipping only defers the answer.',
  '',
  '# No toolchain, no check. Blocking a commit because node_modules is not',
  '# installed would be a worse failure than the one this prevents.',
  'if [ ! -d node_modules ]; then',
  '  exit 0',
  'fi',
  '',
  'if ! npm run --silent images:check; then',
  '  echo ""',
  '  echo "pre-commit: the imagery manifest and public/assets/images/catalogue/ disagree."',
  '  echo "            Run: npm run images"',
  '  echo "            Then stage src/lib/imagery.ts, or commit with --no-verify if the"',
  '  echo "            manifest is being handled separately."',
  '  exit 1',
  'fi',
  '',
].join('\n');

try {
  const { dir, borrowed } = hooksDirectory();

  if (borrowed) {
    console.log('[hooks] core.hooksPath is set by something else; leaving hooks alone');
    process.exit(0);
  }

  const target = path.join(dir, 'pre-commit');

  if (fs.existsSync(target) && !fs.readFileSync(target, 'utf8').includes(MARKER)) {
    console.log(`[hooks] ${target} already exists and is not ours; leaving it alone`);
    process.exit(0);
  }

  fs.mkdirSync(dir, { recursive: true });
  // LF endings explicitly: this is a shell script, and a CRLF shebang makes
  // "/bin/sh\r" a command not found — on Windows, which is where this repo is
  // edited, that is the default a naive write would produce.
  fs.writeFileSync(target, PRE_COMMIT, { mode: 0o755 });
  // writeFileSync ignores mode when the file already existed, so set it again.
  fs.chmodSync(target, 0o755);

  console.log(`[hooks] installed pre-commit (${path.relative(process.cwd(), target)})`);
} catch {
  // Any of: no git binary, no git directory, a read-only checkout. See the note
  // at the top — CI is the gate, this is the convenience.
  console.log('[hooks] no git checkout to install into; skipping');
}
