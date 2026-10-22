import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { SvgDefs } from '../ui/Art';

export default function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60); return; }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <SvgDefs />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
