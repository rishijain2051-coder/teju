import type { Metadata } from 'next';
import PrivateCatalogue from './components/PrivateCatalogue';

export const metadata: Metadata = {
  title: 'Private Catalogue — Vardhman Impex',
  description: 'Full private catalogue for verified trade buyers.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function PrivateCataloguePage() {
  return <PrivateCatalogue />;
}
