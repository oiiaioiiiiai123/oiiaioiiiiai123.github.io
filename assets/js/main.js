(() => {
  'use strict';
  const theme = document.querySelector('.theme-toggle');
  const update = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    theme.setAttribute('aria-pressed', String(dark));
    theme.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };
  if (theme) {
    update();
    theme.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('oiia-theme', next); } catch (_) {}
      update();
    });
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    if (scheme.addEventListener) scheme.addEventListener('change', event => {
      let saved;
      try { saved = localStorage.getItem('oiia-theme'); } catch (_) {}
      if (!saved) { document.documentElement.dataset.theme = event.matches ? 'dark' : 'light'; update(); }
    });
  }
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const close = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); } });
    document.addEventListener('click', e => { if (!e.target.closest('.nav-actions')) close(); });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }
})();
