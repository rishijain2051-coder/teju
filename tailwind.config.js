/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    extend: {
      colors: {
        // Material palette, drawn from the catalogue photography.
        //
        // Every entry is `rgb(var(--x-rgb) / <alpha-value>)`, not `var(--x)`.
        // Tailwind substitutes `<alpha-value>` with an opacity modifier — so
        // `text-paper/55` becomes `rgb(239 233 223 / 0.55)` — and with `1` when
        // there is no modifier, which is byte-identical to the plain colour.
        // Handed a bare `var(--paper)` it cannot substitute anything, so it
        // builds no rule and emits nothing: `text-paper/55` compiled to silence
        // and the element inherited whatever colour sat above it. That cost the
        // home page's manifest strip its labels (ink on ink, contrast 1.00) and
        // every form on the site its placeholder colour. See the contrast note
        // at the top of src/styles/tailwind.css.
        paper: {
          DEFAULT: 'rgb(var(--paper-rgb) / <alpha-value>)',
          deep: 'rgb(var(--paper-deep-rgb) / <alpha-value>)',
          warm: 'rgb(var(--paper-warm-rgb) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink-rgb) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft-rgb) / <alpha-value>)',
        },
        clay: {
          DEFAULT: 'rgb(var(--clay-rgb) / <alpha-value>)',
          soft: 'rgb(var(--clay-soft-rgb) / <alpha-value>)',
        },
        teal: {
          DEFAULT: 'rgb(var(--teal-rgb) / <alpha-value>)',
          soft: 'rgb(var(--teal-soft-rgb) / <alpha-value>)',
        },
        timber: 'rgb(var(--timber-rgb) / <alpha-value>)',
        sand: 'rgb(var(--sand-rgb) / <alpha-value>)',
        line: {
          DEFAULT: 'rgb(var(--line-rgb) / <alpha-value>)',
          strong: 'rgb(var(--line-strong-rgb) / <alpha-value>)',
          // Already carries its own 0.18, so an opacity modifier on top of it
          // would compound two alphas. Left as a plain var deliberately.
          invert: 'var(--line-invert)',
        },

        // Semantic aliases.
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted-rgb) / <alpha-value>)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },

      // Editorial work is square. Radius exists only where a control needs it.
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        full: '9999px',
      },

      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },

      maxWidth: {
        shell: 'var(--shell)',
        measure: '68ch',
        '8xl': '1600px',
      },

      spacing: {
        gutter: 'var(--gutter)',
      },

      transitionTimingFunction: {
        out: 'var(--ease-out)',
        'out-soft': 'var(--ease-out-soft)',
        inout: 'var(--ease-inout)',
      },

      transitionDuration: {
        fast: '180ms',
        base: '320ms',
        slow: '640ms',
        reveal: '1000ms',
        crossfade: '1400ms',
      },

      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
      },

      animation: {
        marquee: 'marquee 48s linear infinite',
      },
    },
  },
  // No plugins. Typography was registered but no `prose` class exists anywhere
  // in the source, and forms was never registered at all.
  plugins: [],
};
