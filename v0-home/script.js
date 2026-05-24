(function () {
  'use strict';

  const PERSP = 'perspective(900px)';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Page transition curtain ── */
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  document.documentElement.appendChild(curtain);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    curtain.classList.add('is-hidden');
    setTimeout(() => {
      const blur = document.querySelector('.wrap-progressive-blur');
      // Forced repaint fixes backdrop-filter rendering artifact after page-entry fade in Safari/Chrome
      if (blur) { blur.style.display = 'none'; blur.offsetHeight; blur.style.display = ''; }
    }, 100);
  }));

  /* fade out on internal link click */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') ||
        link.hasAttribute('target')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      curtain.classList.remove('is-hidden');
      setTimeout(() => { window.location.href = href; }, 650);
    });
  });

  /* ── Hero fade-up ── */
  document.querySelectorAll('.fade-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), 200 + i * 120);
  });

  /* ── Tiles: scroll reveal + tilt on hover ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });

  document.querySelectorAll('.site-tile').forEach((tile, i) => {
    tile.style.transitionDelay = `${i * 0.07}s`;
    obs.observe(tile);

    if (prefersReducedMotion) return;

    const thumb = tile.querySelector('.tile-thumb');
    if (!thumb) return;

    let rect = null;
    tile.addEventListener('mouseenter', () => { rect = tile.getBoundingClientRect(); });
    tile.addEventListener('mousemove', e => {
      if (!rect) rect = tile.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
      thumb.style.transition = 'transform 0.25s ease-out';
      thumb.style.transform = `${PERSP} rotateX(${-y * 2}deg) rotateY(${x * 2}deg)`;
    });
    tile.addEventListener('mouseleave', () => {
      rect = null;
      thumb.style.transition = '';
      thumb.style.transform = `${PERSP} rotateX(0deg) rotateY(0deg)`;
    });
  });

  /* ── Mobile menu ── */
  const menuBtn    = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('is-open');
      menuBtn.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('.mobile-link').forEach(l => {
      l.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        menuBtn.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

})();
