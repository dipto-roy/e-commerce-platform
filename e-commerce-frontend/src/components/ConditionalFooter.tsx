'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer/Footer';

// Hide global footer on routes that have their own full-screen layout
const HIDDEN_ROUTES = ['/dashboard/admin'];

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some(r => pathname.startsWith(r));
  if (hidden) return null;
  return <Footer />;
}
