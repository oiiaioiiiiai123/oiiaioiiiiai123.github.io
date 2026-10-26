(() => {
  'use strict';
  const article = document.querySelector('.article-body');
  const toc = document.querySelector('.post-toc');
  if (!article) return;
  const headings = [...article.querySelectorAll('h2, h3')];
  if (toc && headings.length > 1) {
    const list = toc.querySelector('ol');
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const li = document.createElement('li');
      if (heading.tagName === 'H3') li.className = 'toc-sub';
      const link = document.createElement('a');
      link.href = `#${encodeURIComponent(heading.id)}`;
      link.textContent = heading.textContent;
      li.append(link); list.append(li);
    });
    toc.hidden = false;
  }
  const progress = document.querySelector('.reading-progress');
  if (!progress) return;
  let pending = false;
  const render = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const value = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 1;
    progress.firstElementChild.style.transform = `scaleX(${value})`;
    progress.setAttribute('aria-valuenow', String(Math.round(value * 100)));
    pending = false;
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(render); } };
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule, {passive: true});
  addEventListener('load', schedule, {once: true});
  article.querySelectorAll('img').forEach(img => img.addEventListener('load', schedule, {once: true}));
  render();
})();
