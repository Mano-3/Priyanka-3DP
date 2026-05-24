(function () {
  'use strict';

  const canvas = document.getElementById('rippleCanvas');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false }) ||
             canvas.getContext('experimental-webgl', { alpha: false, antialias: false });

  // ── Fallback: static gradient if WebGL unavailable ───────────────────────
  if (!gl) {
    canvas.style.background =
      'radial-gradient(ellipse at 15% 75%, #3812c8 0%, transparent 50%),' +
      'radial-gradient(ellipse at 85% 18%, #8830dc 0%, transparent 45%),' +
      '#010008';
    return;
  }

  const floatExt = gl.getExtension('OES_texture_float');
  const TEXTYPE   = floatExt ? gl.FLOAT : gl.UNSIGNED_BYTE;
  const SIM_W = 256, SIM_H = 144;

  // ── Fullscreen quad ───────────────────────────────────────────────────────
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  // ── Shader helpers ────────────────────────────────────────────────────────
  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src.trim());
    gl.compileShader(s);
    return s;
  }
  function mkProg(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, mkShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, mkShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    return p;
  }

  const VS = `
    attribute vec2 aPos;
    varying   vec2 vUv;
    void main() { vUv = aPos * .5 + .5; gl_Position = vec4(aPos, 0., 1.); }
  `;

  // Wave propagation — ping-pong simulation
  const FS_WAVE = `
    precision highp float;
    uniform sampler2D uPrev, uCurr;
    uniform vec2  uPx;
    uniform vec4  uDrop;   // xy = norm pos, z = strength, w = radius
    varying vec2  vUv;
    void main() {
      float l = texture2D(uCurr, vUv - vec2(uPx.x, 0.)).r;
      float r = texture2D(uCurr, vUv + vec2(uPx.x, 0.)).r;
      float t = texture2D(uCurr, vUv + vec2(0., uPx.y)).r;
      float b = texture2D(uCurr, vUv - vec2(0., uPx.y)).r;
      float h = (l + r + t + b) * .5 - texture2D(uPrev, vUv).r;
      h *= .984;
      if (uDrop.z > 0.) {
        float d = distance(vUv, uDrop.xy);
        h += uDrop.z * smoothstep(uDrop.w, 0., d);
      }
      gl_FragColor = vec4(h, 0., 0., 1.);
    }
  `;

  // Render: refract background through wave surface + specular
  const FS_RENDER = `
    precision highp float;
    uniform sampler2D uWave, uBg;
    uniform vec2 uPx;
    varying vec2 vUv;
    void main() {
      float hr = texture2D(uWave, vUv + vec2(uPx.x, 0.)).r;
      float hl = texture2D(uWave, vUv - vec2(uPx.x, 0.)).r;
      float ht = texture2D(uWave, vUv + vec2(0., uPx.y)).r;
      float hb = texture2D(uWave, vUv - vec2(0., uPx.y)).r;
      vec2  slope = vec2(hr - hl, ht - hb);
      vec2  uv    = clamp(vUv + slope * .032, 0., 1.);
      vec4  col   = texture2D(uBg, uv);
      vec3  n     = normalize(vec3(-slope * 5., 1.));
      float spec  = pow(max(0., dot(n, normalize(vec3(.25, .5, 1.)))), 10.) * .16;
      col.rgb    += spec * vec3(.68, .55, 1.);
      gl_FragColor = col;
    }
  `;

  const waveProg   = mkProg(VS, FS_WAVE);
  const renderProg = mkProg(VS, FS_RENDER);

  // Cache uniform locations
  const wU = {
    prev: gl.getUniformLocation(waveProg,   'uPrev'),
    curr: gl.getUniformLocation(waveProg,   'uCurr'),
    px:   gl.getUniformLocation(waveProg,   'uPx'),
    drop: gl.getUniformLocation(waveProg,   'uDrop'),
  };
  const rU = {
    wave: gl.getUniformLocation(renderProg, 'uWave'),
    bg:   gl.getUniformLocation(renderProg, 'uBg'),
    px:   gl.getUniformLocation(renderProg, 'uPx'),
  };

  // ── Background gradient texture ───────────────────────────────────────────
  function buildBgTex() {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#010008';
    ctx.fillRect(0, 0, 512, 512);
    ctx.globalCompositeOperation = 'screen';
    [
      { x:.14, y:.74, r:.58, a:.62, col:'72,22,210' },
      { x:.86, y:.16, r:.46, a:.52, col:'120,45,220' },
      { x:.50, y:.52, r:.40, a:.20, col:'160,65,200' },
      { x:.28, y:.92, r:.34, a:.38, col:'80,18,190' },
    ].forEach(({ x, y, r, a, col }) => {
      const g = ctx.createRadialGradient(x*512, y*512, 0, x*512, y*512, r*512);
      g.addColorStop(0, `rgba(${col},${a})`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 512);
    });
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  const bgTex = buildBgTex();

  // ── Wave FBOs ─────────────────────────────────────────────────────────────
  function makeFBO() {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SIM_W, SIM_H, 0, gl.RGBA, TEXTYPE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { t, fb };
  }
  const fbos   = [makeFBO(), makeFBO(), makeFBO()];
  let curr = 0, prev = 1, write = 2;

  // ── Drop queue ────────────────────────────────────────────────────────────
  let drop = null;
  function addDrop(nx, ny, str) { drop = [nx, 1 - ny, str || .07, .055]; }

  // ── Input ─────────────────────────────────────────────────────────────────
  window.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    addDrop((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, .035);
  });

  // ── Auto drops ────────────────────────────────────────────────────────────
  function auto() {
    addDrop(Math.random(), Math.random(), .055 + Math.random() * .04);
    setTimeout(auto, 3200 + Math.random() * 2200);
  }
  setTimeout(auto, 900);

  // ── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Draw quad ─────────────────────────────────────────────────────────────
  function drawQuad(prog) {
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ── Render loop ───────────────────────────────────────────────────────────
  const PX = [1 / SIM_W, 1 / SIM_H];

  function frame() {
    // 1. Simulate wave into write FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[write].fb);
    gl.viewport(0, 0, SIM_W, SIM_H);
    gl.useProgram(waveProg);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fbos[prev].t); gl.uniform1i(wU.prev, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fbos[curr].t); gl.uniform1i(wU.curr, 1);
    gl.uniform2fv(wU.px, PX);
    gl.uniform4fv(wU.drop, drop || [0, 0, 0, 0]);
    drop = null;
    drawQuad(waveProg);

    // rotate buffers
    const tmp = prev; prev = curr; curr = write; write = tmp;

    // 2. Render to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(renderProg);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fbos[curr].t); gl.uniform1i(rU.wave, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bgTex);         gl.uniform1i(rU.bg,   1);
    gl.uniform2fv(rU.px, PX);
    drawQuad(renderProg);

    requestAnimationFrame(frame);
  }

  frame();

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestAnimationFrame(frame);
  });

})();
