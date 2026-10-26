/* Native horizontal scrolling and <dialog> keep the gallery usable without JS. */
(() => {
  'use strict';
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const track = gallery.querySelector('.screenshot-track');
    if (!track) return;
    const items = [...gallery.querySelectorAll('[data-gallery-item]')];
    const controls = gallery.querySelector('.gallery-controls');
    const scrollButtons = [...gallery.querySelectorAll('[data-scroll]')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const updateScroll = () => scrollButtons.forEach(button => {
      button.disabled = Number(button.dataset.scroll) < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    });
    if (controls) controls.hidden = false;
    scrollButtons.forEach(button => button.addEventListener('click', () => {
      const distance = Math.min(track.clientWidth * .8, items[0].getBoundingClientRect().width + 24);
      track.scrollBy({left: Number(button.dataset.scroll) * distance, behavior: reduced.matches ? 'auto' : 'smooth'});
    }));
    track.addEventListener('scroll', updateScroll, {passive: true});
    addEventListener('resize', updateScroll); updateScroll();
    const dialog = gallery.querySelector('dialog');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    const large = dialog.querySelector('.viewer-image img');
    const caption = dialog.querySelector('.viewer-caption');
    const previous = dialog.querySelector('[data-viewer-step="-1"]');
    const next = dialog.querySelector('[data-viewer-step="1"]');
    let selected = 0;
    const show = index => {
      selected = Math.max(0, Math.min(items.length - 1, index));
      const item = items[selected];
      large.src = item.href; large.alt = item.querySelector('img').alt;
      caption.textContent = `${selected + 1} / ${items.length} — ${item.dataset.caption}`;
      previous.disabled = selected === 0; next.disabled = selected === items.length - 1;
      if (dialog.open && document.activeElement === next && next.disabled) previous.focus();
      if (dialog.open && document.activeElement === previous && previous.disabled) dialog.querySelector('.viewer-close').focus();
    };
    items.forEach((item, index) => item.addEventListener('click', event => {
      event.preventDefault(); show(index); dialog.showModal(); document.body.classList.add('is-viewing-screenshot');
    }));
    dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => document.body.classList.remove('is-viewing-screenshot'));
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.querySelectorAll('[data-viewer-step]').forEach(button => button.addEventListener('click', () => show(selected + Number(button.dataset.viewerStep))));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        const buttons = [...dialog.querySelectorAll('button:not(:disabled)')];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); show(selected + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
  });
})();
