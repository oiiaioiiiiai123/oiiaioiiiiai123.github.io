// Load before CSS to avoid a light flash; storage can be blocked in private mode.
(() => {
  let saved;
  try { saved = localStorage.getItem('oiia-theme'); } catch (_) {}
  const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved === 'dark' || saved === 'light' ? saved : dark ? 'dark' : 'light';
})();
