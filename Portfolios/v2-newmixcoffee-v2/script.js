(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     PARTICLE TEXT  (Three.js)
     — samples font pixels → particle cloud
     — spring physics, mouse repulsion/scatter
     ═══════════════════════════════════════════ */
  class ParticleText {
    constructor(canvas, text, onReady) {
      this.canvas  = canvas;
      this.text    = text;
      this.onReady = onReady;
      this.mouse   = { x: -9999, y: -9999 };
      this.ready   = false;
      this._onResize = this._onResize.bind(this);
      this._init();
    }

    _init() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(w, h, false);

      this.scene  = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-w/2, w/2, h/2, -h/2, 0.1, 100);
      this.camera.position.z = 10;

      const hero = document.getElementById('hero');
      hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        this.mouse.x =  (e.clientX - r.left) - w/2;
        this.mouse.y = -((e.clientY - r.top)  - h/2);
      }, { passive: true });
      hero.addEventListener('mouseleave', () => {
        this.mouse.x = -9999;
        this.mouse.y = -9999;
      });
      hero.addEventListener('touchmove', e => {
        const r = hero.getBoundingClientRect();
        const t = e.touches[0];
        this.mouse.x =  (t.clientX - r.left) - w/2;
        this.mouse.y = -((t.clientY - r.top)  - h/2);
      }, { passive: true });
      hero.addEventListener('touchend', () => {
        this.mouse.x = -9999;
        this.mouse.y = -9999;
      });

      window.addEventListener('resize', this._onResize);

      this._build(w, h);
      this._tick();
    }

    _build(w, h) {
      /* ── Render text to offscreen canvas ── */
      const off = document.createElement('canvas');
      off.width  = w;
      off.height = h;
      const ctx  = off.getContext('2d');
      const fam  = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, sans-serif";

      /* Auto-fit font size so text fills ~82 % of width */
      let fontSize = 140;
      ctx.font = `700 ${fontSize}px ${fam}`;
      while (ctx.measureText(this.text).width > w * 0.82 && fontSize > 14) {
        fontSize--;
        ctx.font = `700 ${fontSize}px ${fam}`;
      }
      fontSize = Math.min(fontSize, 90);
      ctx.font = `700 ${fontSize}px ${fam}`;

      ctx.fillStyle    = '#fff';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.text, w / 2, h / 2);

      /* ── Sample lit pixels ── */
      const data = ctx.getImageData(0, 0, w, h).data;
      const gap  = Math.max(2, Math.round(w / 380));
      const hxArr = [], hyArr = [];

      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          if (data[(y * w + x) * 4 + 3] > 128) {
            hxArr.push(x - w / 2);
            hyArr.push(-(y - h / 2));
          }
        }
      }

      /* ── Build buffers ── */
      const n   = hxArr.length;
      const pos = new Float32Array(n * 3);
      const vel = new Float32Array(n * 2);
      const hom = new Float32Array(n * 2);

      for (let i = 0; i < n; i++) {
        const angle  = Math.random() * Math.PI * 2;
        const radius = 250 + Math.random() * 450;
        pos[i*3]   = hxArr[i] + Math.cos(angle) * radius;
        pos[i*3+1] = hyArr[i] + Math.sin(angle) * radius;
        pos[i*3+2] = 0;
        hom[i*2]   = hxArr[i];
        hom[i*2+1] = hyArr[i];
        /* initial velocity toward home for faster convergence */
        vel[i*2]   = (hxArr[i] - pos[i*3])   * 0.04;
        vel[i*2+1] = (hyArr[i] - pos[i*3+1]) * 0.04;
      }

      /* ── Three.js Points mesh ── */
      if (this.mesh) {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

      const mat = new THREE.PointsMaterial({
        color:           0xffffff,
        size:            2.0,
        sizeAttenuation: false,
        transparent:     true,
        opacity:         0.92,
        blending:        THREE.AdditiveBlending,
        depthWrite:      false,
      });

      this.mesh  = new THREE.Points(geo, mat);
      this.scene.add(this.mesh);
      this._pos  = pos;
      this._vel  = vel;
      this._hom  = hom;
      this._n    = n;
      this._t0   = Date.now();
      this.ready = false;
    }

    _onResize() {
      clearTimeout(this._rt);
      this._rt = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.renderer.setSize(w, h, false);
        this.camera.left   = -w/2; this.camera.right  =  w/2;
        this.camera.top    =  h/2; this.camera.bottom = -h/2;
        this.camera.updateProjectionMatrix();
        this._build(w, h);
      }, 200);
    }

    _tick() {
      requestAnimationFrame(() => this._tick());

      const pos = this._pos, vel = this._vel, hom = this._hom, n = this._n;
      const mx = this.mouse.x, my = this.mouse.y;
      const R = 130, F = 14, K = 0.08, D = 0.88;

      for (let i = 0; i < n; i++) {
        let x  = pos[i*3],   y  = pos[i*3+1];
        let vx = vel[i*2],   vy = vel[i*2+1];

        /* mouse repulsion */
        const dx = x - mx, dy = y - my;
        const d2 = dx*dx + dy*dy;
        if (d2 < R*R && d2 > 0.01) {
          const d   = Math.sqrt(d2);
          const mag = (R - d) / R * F;
          vx += dx/d * mag;
          vy += dy/d * mag;
        }

        /* spring toward home */
        vx += (hom[i*2]   - x) * K;
        vy += (hom[i*2+1] - y) * K;

        /* friction */
        vx *= D; vy *= D;

        pos[i*3]   = x + vx;
        pos[i*3+1] = y + vy;
        vel[i*2]   = vx;
        vel[i*2+1] = vy;
      }

      this.mesh.geometry.attributes.position.needsUpdate = true;
      this.renderer.render(this.scene, this.camera);

      if (!this.ready && Date.now() - this._t0 > 1900) {
        this.ready = true;
        if (this.onReady) this.onReady();
      }
    }
  }

  /* ═══════════════════════════════════════════
     INIT — particle text
     ═══════════════════════════════════════════ */
  const particleCanvas = document.getElementById('particleCanvas');
  const heroSub        = document.getElementById('heroSub');

  window.addEventListener('load', () => {
    setTimeout(() => {
      new ParticleText(particleCanvas, "I'm Priyanka Shanmugham", () => {
        heroSub.classList.add('visible');
      });
    }, 300);
  });

  /* ═══════════════════════════════════════════
     HEADER — transparent → black on scroll
     ═══════════════════════════════════════════ */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ═══════════════════════════════════════════
     MOBILE MENU
     ═══════════════════════════════════════════ */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(l => {
    l.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ═══════════════════════════════════════════
     GALLERY — clip-path reveals on scroll
     ═══════════════════════════════════════════ */
  const galleryItems = document.querySelectorAll('.gallery-item');

  document.querySelectorAll('.gallery-row').forEach(row => {
    row.querySelectorAll('.gallery-item').forEach((item, i) => {
      item.style.transitionDelay = `${i * 0.13}s`;
    });
  });

  const galleryObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        galleryObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  galleryItems.forEach(el => galleryObs.observe(el));

  /* ═══════════════════════════════════════════
     BRAND STORY LINE — draw on enter
     ═══════════════════════════════════════════ */
  const brandPath = document.getElementById('brandLinePath');
  if (brandPath) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) brandPath.classList.add('revealed'); });
    }, { threshold: 0.5 }).observe(brandPath);
  }

  /* ═══════════════════════════════════════════
     FEATURES LOGO — fade in on enter
     ═══════════════════════════════════════════ */
  const featLogo = document.querySelector('.features-logo');
  if (featLogo) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => { featLogo.classList.toggle('visible', e.isIntersecting); });
    }, { threshold: 0.3 }).observe(featLogo);
  }

  /* ═══════════════════════════════════════════
     WORK LIST — staggered fade-slide
     ═══════════════════════════════════════════ */
  const workItems = document.querySelectorAll('.work-item');
  workItems.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(16px)'; });

  const workObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const i = Array.from(workItems).indexOf(e.target);
        setTimeout(() => {
          e.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }, i * 70);
        workObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  workItems.forEach(el => workObs.observe(el));

  /* ═══════════════════════════════════════════
     STATEMENT — fade up
     ═══════════════════════════════════════════ */
  const stmtEl = document.querySelector('.stmt-h');
  if (stmtEl) {
    stmtEl.style.cssText = 'opacity:0;transform:translateY(28px);transition:opacity 0.9s ease,transform 0.9s ease';
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { stmtEl.style.opacity = '1'; stmtEl.style.transform = 'translateY(0)'; }
      });
    }, { threshold: 0.25 }).observe(stmtEl);
  }

  /* ═══════════════════════════════════════════
     ABOUT / CONTACT — fade up columns
     ═══════════════════════════════════════════ */
  ['.about-left', '.about-right', '.contact-h'].forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.cssText = `opacity:0;transform:translateY(22px);transition:opacity 0.8s ease ${i * 0.1}s,transform 0.8s ease ${i * 0.1}s`;
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }
      });
    }, { threshold: 0.15 }).observe(el);
  });

  /* ═══════════════════════════════════════════
     SMOOTH SCROLL for anchor links
     ═══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const t = document.querySelector(link.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

})();
