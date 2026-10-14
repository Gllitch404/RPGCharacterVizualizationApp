import { useState, useEffect, useCallback } from 'react';

export type RouteType = 'stage' | 'controls';

function getRouteFromLocation(): RouteType {
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);

  if (
    pathname === '/controls' ||
    pathname.startsWith('/controls/') ||
    hash === '#/controls' ||
    hash === '#controls' ||
    searchParams.get('view') === 'controls'
  ) {
    return 'controls';
  }
  return 'stage';
}

export function useRoute() {
  const [currentRoute, setCurrentRoute] = useState<RouteType>(getRouteFromLocation);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getRouteFromLocation());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = useCallback((route: RouteType, newWindow = false) => {
    const targetUrl = route === 'controls' ? '/controls' : '/';
    if (newWindow) {
      window.open(targetUrl, '_blank');
      return;
    }
    window.history.pushState({}, '', targetUrl);
    setCurrentRoute(route);
  }, []);

  return { currentRoute, navigateTo };
}
