(function () {
  'use strict';

  /* ── Header: transparent → black on scroll ── */
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── Mobile menu ── */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── Gallery clip-path reveals ── */
  const galleryItems = document.querySelectorAll('.gallery-item');

  /* Stagger items inside rows */
  document.querySelectorAll('.gallery-row').forEach(row => {
    row.querySelectorAll('.gallery-item').forEach((item, i) => {
      item.style.transitionDelay = `${i * 0.14}s`;
    });
  });

  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        galleryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  galleryItems.forEach(item => galleryObserver.observe(item));

  /* ── Brand story rule reveal ── */
  const brandLine = document.getElementById('brandLine');
  if (brandLine) {
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) brandLine.classList.add('revealed');
      });
    }, { threshold: 0.5 }).observe(brandLine);
  }

  /* ── Work list: fade + slide in ── */
  const workItems = document.querySelectorAll('.work-item');

  workItems.forEach(item => {
    item.style.opacity   = '0';
    item.style.transform = 'translateY(18px)';
  });

  const workObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const i = Array.from(workItems).indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 70);
        workObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  workItems.forEach(item => workObserver.observe(item));

  /* ── Statement: fade + slide in ── */
  const statEl = document.querySelector('.statement-text');
  if (statEl) {
    statEl.style.opacity   = '0';
    statEl.style.transform = 'translateY(28px)';
    statEl.style.transition = 'opacity 0.9s ease, transform 0.9s ease';

    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statEl.style.opacity   = '1';
          statEl.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.25 }).observe(statEl);
  }

  /* ── About: fade in columns ── */
  ['.about-left', '.about-right'].forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = `opacity 0.8s ease ${i * 0.12}s, transform 0.8s ease ${i * 0.12}s`;

    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.15 }).observe(el);
  });

  /* ── Contact heading: fade in ── */
  const contactH2 = document.querySelector('.contact-inner h2');
  if (contactH2) {
    contactH2.style.opacity   = '0';
    contactH2.style.transform = 'translateY(30px)';
    contactH2.style.transition = 'opacity 0.9s ease, transform 0.9s ease';

    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          contactH2.style.opacity   = '1';
          contactH2.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.2 }).observe(contactH2);
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
