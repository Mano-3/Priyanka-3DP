(function () {
  'use strict';

  const wrap  = document.getElementById('layerScrollerWrap');
  const scene = document.getElementById('layerScene');
  const numEl = document.getElementById('layerActiveNum');
  const fill  = document.getElementById('layerFill');
  if (!wrap || !scene) return;

  const cards = Array.from(scene.querySelectorAll('.layer-card'));
  const N = cards.length;

  // ── SexyScroll SmoothDamp — Unity critically-damped spring ─────────────
  const vel = { v: 0 };
  function smoothDamp(cur, target, vs, smoothTime, maxSpeed, dt) {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const x   = omega * dt;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = cur - target;
    const cap = maxSpeed * smoothTime;
    change = Math.max(-cap, Math.min(change, cap));
    const temp = (vs.v + omega * change) * dt;
    vs.v = (vs.v - omega * temp) * exp;
    let out = target + (change + temp) * exp;
    if ((target - cur > 0) === (out > target)) { out = target; vs.v = 0; }
    return out;
  }

  // ── Scroll progress within the sticky wrap (0 → N-1) ───────────────────
  function getTarget() {
    const rect = wrap.getBoundingClientRect();
    const scrollable = wrap.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    const scrolled = Math.max(0, -rect.top);
    return Math.min(N - 1, (scrolled / scrollable) * (N - 1));
  }

  // ── stackPos → visual properties ───────────────────────────────────────
  // 0 = front, negative = behind in stack, positive = exited toward viewer
  function getVisual(pos) {
    let z, opacity, blur;
    if (pos >= 0) {
      // card exiting forward (toward viewer) — fades out fast
      z       =  pos * 360;
      opacity = pos < 0.06 ? 1 : Math.max(0, 1 - (pos - 0.06) * 7);
      blur    = 0;
    } else {
      // card in the stack behind
      const d = Math.abs(pos);
      z       = -(Math.pow(d, 0.78) * 320);
      opacity = Math.max(0.10, 1 - d * 0.26);
      blur    = Math.min(8, d * 2.4);
    }
    return { z, opacity, blur };
  }

  // ── State ───────────────────────────────────────────────────────────────
  let smooth  = 0;
  let lastT   = 0;
  let hovered = -1;

  cards.forEach((c, i) => {
    c.addEventListener('mouseenter', () => { hovered = i; });
    c.addEventListener('mouseleave', () => { hovered = -1; });
  });

  // ── Apply per-card transform ────────────────────────────────────────────
  function applyCard(card, pos, isHovered) {
    const { z, opacity, blur } = getVisual(pos);
    const atFront = Math.abs(pos) < 0.07;

    const yLift    = (isHovered && atFront) ? -20 : 0;
    const hScale   = (isHovered && atFront) ? ' scale(1.022)' : '';

    card.style.transform     = `translateZ(${z.toFixed(1)}px) translateY(${yLift}px)${hScale}`;
    card.style.opacity       = opacity.toFixed(3);
    card.style.filter        = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
    card.style.zIndex        = Math.round(1000 + z);
    card.style.pointerEvents = atFront ? 'auto' : 'none';
  }

  // ── Render loop ─────────────────────────────────────────────────────────
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;

    smooth = smoothDamp(smooth, getTarget(), vel, 0.44, 14, dt);

    cards.forEach((card, i) => applyCard(card, smooth - i, hovered === i));

    const active = Math.round(smooth);
    if (numEl) numEl.textContent = String(active + 1).padStart(2, '0');
    if (fill)  fill.style.width  = `${((active + 1) / N) * 100}%`;
  }

  requestAnimationFrame(frame);
})();
