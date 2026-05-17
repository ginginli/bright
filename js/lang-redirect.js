/**
 * Language Auto-Redirect for Bridger Western Wiki
 * Detects browser language and redirects Russian users to /ru/ pages.
 * Falls back to English if no Russian version exists.
 * Uses sessionStorage to avoid redirect loops.
 */
(function () {
  // Already redirected this session — don't redirect again
  if (sessionStorage.getItem('lang_redirected')) return;

  // Already on a /ru/ page — no need to redirect
  if (window.location.pathname.startsWith('/ru/')) return;

  // Check browser language
  var lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (!lang.startsWith('ru')) return;

  // Map of English paths that have Russian equivalents
  var ruPages = {
    '/':                          '/ru/',
    '/index.html':                '/ru/',
    '/locations/map/':            '/ru/locations/map/',
    '/locations/map/index.html':  '/ru/locations/map/',
    '/stands/stand-abilities/':           '/ru/stands/stand-abilities/',
    '/stands/stand-abilities/index.html': '/ru/stands/stand-abilities/'
  };

  var path = window.location.pathname;
  // Normalize trailing slash
  if (!path.endsWith('/') && !path.endsWith('.html')) path += '/';

  var target = ruPages[path];
  if (target) {
    sessionStorage.setItem('lang_redirected', '1');
    window.location.replace(target);
  }
  // No Russian version for this page — stay on English, mark as handled
  sessionStorage.setItem('lang_redirected', '1');
})();
