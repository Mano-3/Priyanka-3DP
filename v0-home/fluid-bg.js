(function () {
  const canvas = document.getElementById('fluidCanvas');
  const ctx = canvas.getContext('2d');

  // Framer component palette: purple / pink / lavender
  const BLOBS = [
    { r: 0x52, g: 0x27, b: 0xFF, size: 0.70, x: 0.18, y: 0.60, dx:  0.000035, dy:  0.000020, phase: 0.0 },
    { r: 0xFF, g: 0x9F, b: 0xFC, size: 0.60, x: 0.82, y: 0.22, dx: -0.000025, dy:  0.000030, phase: 1.2 },
    { r: 0xB1, g: 0x9E, b: 0xEF, size: 0.55, x: 0.55, y: 0.88, dx:  0.000028, dy: -0.000022, phase: 2.5 },
    { r: 0x7B, g: 0x2F, b: 0xFF, size: 0.50, x: 0.75, y: 0.65, dx: -0.000020, dy: -0.000028, phase: 0.8 },
    { r: 0xFF, g: 0x6E, b: 0xE8, size: 0.45, x: 0.30, y: 0.20, dx:  0.000022, dy:  0.000035, phase: 3.7 },
  ];

  let W, H, t = 0, last = 0;
  // mouse influence
  let mx = 0.5, my = 0.5, mActive = false;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', e => {
    mx = e.clientX / W;
    my = e.clientY / H;
    mActive = true;
  });

  function easeBlob(blob) {
    // very slow sine drift
    const ox = Math.sin(t * 0.8 + blob.phase)       * 0.04;
    const oy = Math.cos(t * 0.7 + blob.phase + 0.9) * 0.03;

    // mouse attraction (very subtle)
    if (mActive) {
      const dx = mx - (blob.x + ox);
      const dy = my - (blob.y + oy);
      const d  = Math.sqrt(dx * dx + dy * dy);
      const pull = Math.max(0, 1 - d / 0.6) * 0.000015;
      blob.x += dx * pull;
      blob.y += dy * pull;
    }

    // wrap
    blob.x = ((blob.x + blob.dx) % 1 + 1) % 1;
    blob.y = ((blob.y + blob.dy) % 1 + 1) % 1;

    return { cx: (blob.x + ox) * W, cy: (blob.y + oy) * H };
  }

  function draw(now = 0) {
    const dt = Math.min(now - last, 50); // cap at 50ms so tab-blur doesn't jump
    last = now;
    t += dt * 0.00008; // ~1 unit per ~12 seconds — very slow drift
    ctx.clearRect(0, 0, W, H);

    // dark base
    ctx.fillStyle = '#010008';
    ctx.fillRect(0, 0, W, H);

    // draw each blob as a radial gradient — composited with 'screen'
    ctx.globalCompositeOperation = 'screen';

    for (const blob of BLOBS) {
      const { cx, cy } = easeBlob(blob);
      const radius = Math.min(W, H) * blob.size;

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0,   `rgba(${blob.r},${blob.g},${blob.b},0.28)`);
      g.addColorStop(0.4, `rgba(${blob.r},${blob.g},${blob.b},0.08)`);
      g.addColorStop(1,   `rgba(${blob.r},${blob.g},${blob.b},0)`);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.1, radius * 0.85, t * 0.5 + blob.phase, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';

    // dark vignette to keep edges cinematic
    const vignette = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.72);
    vignette.addColorStop(0,   'rgba(1,0,8,0)');
    vignette.addColorStop(0.6, 'rgba(1,0,8,0.25)');
    vignette.addColorStop(1,   'rgba(1,0,8,0.82)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);  // ts passed by rAF
  }

  requestAnimationFrame(draw);
})();
