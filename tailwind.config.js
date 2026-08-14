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
        paper: {
          DEFAULT: 'var(--paper)',
          deep: 'var(--paper-deep)',
          warm: 'var(--paper-warm)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
        },
        clay: {
          DEFAULT: 'var(--clay)',
          soft: 'var(--clay-soft)',
        },
        teal: {
          DEFAULT: 'var(--teal)',
          soft: 'var(--teal-soft)',
        },
        timber: 'var(--timber)',
        sand: 'var(--sand)',
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
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
          DEFAULT: 'var(--muted)',
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
