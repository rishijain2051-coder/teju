import type { Metadata } from 'next';
import AccessCodeEntry from './components/AccessCodeEntry';

export const metadata: Metadata = {
  title: 'Private Catalogue Access — Vardhman Impex',
  description: 'Enter your access code to view the full Vardhman Impex private catalogue.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function PrivateAccessPage() {
  return <AccessCodeEntry />;
}
