import { playRoutes, type PlayKey } from '../../lib/play-routes';
// Preserve both bookmarked links and same-document hash navigation.
function redirectLegacyLink() {
  const key = location.hash.slice(1);
  if (Object.hasOwn(playRoutes, key)) location.replace(playRoutes[key as PlayKey]);
}
window.addEventListener('hashchange', redirectLegacyLink);
redirectLegacyLink();
