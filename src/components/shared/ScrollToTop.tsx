import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Composant qui force le scroll en haut de la page à chaque changement de route
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroller instantanément en haut à chaque changement de route
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

