/* ===========================
   PRIYANKA SHANMUGHAM — PORTFOLIO
   =========================== */

(function () {
  'use strict';

  /* ─── Utility ─────────────────────────────── */
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const map = (v, inMin, inMax, outMin, outMax) =>
    outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);

  /* ─── Cursor ───────────────────────────────── */
  const cursorDot  = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const cursorLabel = document.getElementById('cursorLabel');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX   = mouseX;
  let dotY   = mouseY;
  let ringX  = mouseX;
  let ringY  = mouseY;
  let isHovering = false;
  let isCard     = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.querySelectorAll('.interactive').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      isHovering = true;
      const isProjectCard = el.classList.contains('project-card');
      isCard = isProjectCard;
      cursorRing.classList.toggle('cursor--hover', !isProjectCard);
      cursorRing.classList.toggle('cursor--card', isProjectCard);
      cursorLabel.textContent = isProjectCard ? 'View' : '';
    });
    el.addEventListener('mouseleave', () => {
      isHovering = false;
      isCard = false;
      cursorRing.classList.remove('cursor--hover', 'cursor--card');
      cursorLabel.textContent = '';
    });
  });

  function animateCursor() {
    dotX  = lerp(dotX,  mouseX, 0.35);
    dotY  = lerp(dotY,  mouseY, 0.35);
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);

    cursorDot.style.transform  = `translate(calc(${dotX}px - 50%), calc(${dotY}px - 50%))`;
    cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* ─── Clock ────────────────────────────────── */
  const clockEl = document.getElementById('heroClock');

  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ─── Hero Letter Entrance ─────────────────── */
  const chars     = document.querySelectorAll('.char');
  const lastName  = document.querySelector('.last-name');
  const eyebrow   = document.querySelector('.hero-eyebrow');

  function runHeroEntrance() {
    eyebrow.classList.add('visible');
    chars.forEach((ch, i) => {
      setTimeout(() => ch.classList.add('revealed'), 200 + i * 80);
    });
    setTimeout(() => lastName.classList.add('revealed'), 200 + chars.length * 80);
  }

  window.addEventListener('load', () => {
    setTimeout(runHeroEntrance, 300);
  });

  /* ─── Hero Letter Scatter on Exit ─────────────────── */
  let heroScattered = false;

  function scatterHeroLetters() {
    if (heroScattered) return;
    heroScattered = true;
    chars.forEach((ch) => {
      const tx = (Math.random() - 0.5) * 40;
      const ty = (Math.random() - 0.5) * 40;
      ch.classList.add('scattered');
      ch.style.transform  = `translate(${tx}px, ${ty}px)`;
      ch.style.opacity    = '0';
    });
    lastName.style.transition = 'opacity 0.6s, transform 0.6s';
    lastName.style.opacity    = '0';
    lastName.style.transform  = `translate(${(Math.random()-0.5)*30}px, ${(Math.random()-0.5)*30}px)`;
  }

  function restoreHeroLetters() {
    if (!heroScattered) return;
    heroScattered = false;
    chars.forEach((ch) => {
      ch.style.transform = '';
      ch.style.opacity   = '';
    });
    lastName.style.opacity   = '';
    lastName.style.transform = '';
  }

  /* ─── Bio Quote Word Injection ─────────────── */
  const bioQuote = document.getElementById('bioQuote');
  const quoteText = `"I believe that great design is about crafting high‑quality products that are aesthetically pleasing and easy to use"`;

  quoteText.split(' ').forEach((word) => {
    const wrap = document.createElement('span');
    wrap.className = 'word-wrap';
    const inner = document.createElement('span');
    inner.className = 'word';
    inner.textContent = word;
    wrap.appendChild(inner);
    bioQuote.appendChild(wrap);
  });

  const bioWords = bioQuote.querySelectorAll('.word');

  /* ─── Video Scrub ──────────────────────────── */
  const video       = document.getElementById('scrubVideo');
  const videoSect   = document.getElementById('videoSection');
  const vignette    = document.getElementById('vignettePulse');

  let targetTime    = 0;
  let videoDuration = 5;
  let vignetteFired = false;
  let isSeeking     = false;
  let pendingSeek   = null;

  /* Keep video permanently paused — scrubbing via currentTime only */
  video.pause();
  video.addEventListener('loadedmetadata', () => {
    videoDuration = video.duration;
    video.currentTime = 0;
    video.pause();
  });
  video.addEventListener('play',    () => video.pause());
  video.addEventListener('playing', () => video.pause());

  /* One-at-a-time seek gate — eliminates seek queue stuttering */
  function seekTo(time) {
    time = clamp(time, 0, videoDuration);
    if (isSeeking) {
      pendingSeek = time;
      return;
    }
    if (Math.abs(video.currentTime - time) < 0.001) return;
    isSeeking = true;
    video.currentTime = time;
  }

  video.addEventListener('seeked', () => {
    isSeeking = false;
    if (pendingSeek !== null) {
      const t = pendingSeek;
      pendingSeek = null;
      seekTo(t);
    }
  });

  /* ─── Projects Horizontal Scroll ──────────── */
  const projectsSect  = document.getElementById('projectsSection');
  const projectsTrack = document.getElementById('projectsTrack');

  function getProjectsScrollWidth() {
    return projectsTrack.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pad-x')) * 2;
  }

  /* ─── Bio Section Elements ─────────────────── */
  const bioRule     = document.getElementById('bioRule');
  const metaItems   = document.querySelectorAll('.meta-item');
  let bioTriggered  = false;

  /* ─── Main Scroll Handler ──────────────────── */
  function onScroll() {
    const scrollY = window.scrollY;

    /* — Hero scatter — */
    const videoTop = videoSect.getBoundingClientRect().top + scrollY;
    const heroProgress = clamp(scrollY / (videoTop * 0.4), 0, 1);
    if (heroProgress > 0.5) {
      scatterHeroLetters();
    } else if (heroProgress < 0.1) {
      restoreHeroLetters();
    }

    /* — Video scrub — */
    const vSectTop   = videoSect.offsetTop;
    const vSectH     = videoSect.offsetHeight;
    const vProgress  = clamp((scrollY - vSectTop) / (vSectH - window.innerHeight), 0, 1);
    targetTime = vProgress * videoDuration;
    seekTo(targetTime);

    /* Vignette pulse at end */
    if (vProgress >= 0.98 && !vignetteFired) {
      vignetteFired = true;
      vignette.classList.add('pulse');
      vignette.addEventListener('animationend', () => {
        vignette.classList.remove('pulse');
        vignetteFired = false;
      }, { once: true });
    }

    /* — Bio reveals — */
    const bioSect     = document.getElementById('bioSection');
    const bioSectTop  = bioSect.offsetTop;
    const bioSectH    = bioSect.offsetHeight;
    const bioProgress = clamp((scrollY - bioSectTop) / (bioSectH - window.innerHeight), 0, 1);

    bioWords.forEach((w, i) => {
      const threshold = i / (bioWords.length * 1.5);
      if (bioProgress > threshold) {
        w.style.transition = `clip-path 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms`;
        w.classList.add('revealed');
      }
    });

    if (bioProgress > 0.35 && !bioTriggered) {
      bioTriggered = true;
      bioRule.classList.add('revealed');
      metaItems.forEach((item, i) => {
        const delay = parseInt(item.dataset.delay || 0, 10) + i * 30;
        setTimeout(() => item.classList.add('visible'), delay);
      });
    }

    /* — Horizontal project scroll — */
    const pTop      = projectsSect.offsetTop;
    const pHeight   = projectsSect.offsetHeight;
    const pProgress = clamp((scrollY - pTop) / (pHeight - window.innerHeight), 0, 1);
    const maxShift  = getProjectsScrollWidth();
    projectsTrack.style.transform = `translateX(-${pProgress * maxShift}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── Intersection Observer — Bio label ───── */
  const bioLabel = document.querySelector('.bio-label');
  const ioFade   = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.transition = 'opacity 0.8s ease';
        e.target.style.opacity    = '1';
      }
    });
  }, { threshold: 0.3 });

  if (bioLabel) {
    bioLabel.style.opacity = '0';
    ioFade.observe(bioLabel);
  }

  /* ─── Smooth scroll for nav links ─────────── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ─── Initial trigger ──────────────────────── */
  onScroll();
})();
