(function () {
  'use strict';

  const canvas = document.getElementById('nameCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const TW = 1000, TH = 200;

  document.fonts.ready.then(function () {
    // ── Draw "Priyanka" as a mask texture ──────────────────────────────────
    const oc  = document.createElement('canvas');
    oc.width  = TW; oc.height = TH;
    const ctx = oc.getContext('2d');

    // Soft glow pass
    ctx.shadowColor = 'rgba(160, 80, 255, 0.9)';
    ctx.shadowBlur  = 22;
    ctx.fillStyle   = 'rgba(200, 140, 255, 0.5)';
    ctx.font           = `500 ${Math.round(TH * 0.80)}px "Cormorant Garamond", Georgia, serif`;
    ctx.textAlign      = 'center';
    ctx.textBaseline   = 'middle';
    ctx.fillText('Priyanka', TW / 2, TH / 2);

    // Sharp white pass
    ctx.shadowBlur = 0;
    ctx.fillStyle  = '#ffffff';
    ctx.fillText('Priyanka', TW / 2, TH / 2);

    const maskTex        = new THREE.CanvasTexture(oc);
    maskTex.minFilter    = THREE.LinearFilter;
    maskTex.generateMipmaps = false;

    init(maskTex, TW / TH);
  });

  // ────────────────────────────────────────────────────────────────────────
  function init(maskTex, texAspect) {

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    // Orthographic camera: covers [-a..a] × [-1..1]
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 5;

    // Plane sized to match texture aspect
    const planeH = 1.7;
    const planeW = planeH * texAspect;        // ~8.5
    const geo    = new THREE.PlaneGeometry(planeW, planeH);

    // ── Shaders ─────────────────────────────────────────────────────────────
    const VS = /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const FS = /* glsl */`
      precision mediump float;
      uniform sampler2D uMask;
      uniform float     uTime;
      uniform vec2      uMouse;
      varying vec2      vUv;

      float hash(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 17.5);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1,0)), f.x),
          mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
          f.y
        );
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p  = p * 2.1 + vec2(1.7, 9.2);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        float alpha = texture2D(uMask, vUv).r;
        if (alpha < 0.04) discard;

        // Shift UV with mouse
        vec2 uv = vUv + uMouse * 0.07;

        // Three layered noise streams
        float n1 = fbm(uv * 2.6 + vec2( uTime * 0.20,  uTime * 0.13));
        float n2 = fbm(uv * 4.2 + vec2(-uTime * 0.15,  uTime * 0.10) + 1.8);
        float n3 = fbm(uv * 1.6 + vec2( uTime * 0.09, -uTime * 0.18) + 3.5);

        // Palette: violet → white → sky-blue → rose
        vec3 c1 = vec3(0.52, 0.18, 1.00);   // violet
        vec3 c2 = vec3(1.00, 1.00, 1.00);   // white
        vec3 c3 = vec3(0.28, 0.72, 1.00);   // sky blue
        vec3 c4 = vec3(0.90, 0.45, 1.00);   // rose-purple

        vec3 col  = mix(c1, c2, n1);
             col  = mix(col, c3, n2 * 0.55);
             col  = mix(col, c4, n3 * 0.30);
             col  = clamp(col * 1.12 + 0.04, 0.0, 1.0);

        // Subtle horizontal shimmer streak
        float shimmer = smoothstep(0.46, 0.54,
          fract(vUv.y * 6.0 - uTime * 0.6 + n1 * 0.5)) * 0.18;
        col += shimmer;

        gl_FragColor = vec4(col, alpha * (0.90 + n1 * 0.10));
      }
    `;

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMask:  { value: maskTex },
        uTime:  { value: 0.0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader:   VS,
      fragmentShader: FS,
      transparent:    true,
      depthWrite:     false,
    });

    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // ── Resize: scale mesh to fill canvas comfortably ─────────────────────
    function resize() {
      const w = canvas.clientWidth  || window.innerWidth;
      const h = canvas.clientHeight || 130;
      const a = w / h;

      camera.left   = -a; camera.right  = a;
      camera.top    =  1; camera.bottom = -1;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);

      // Scale so text fills ~88% of the shorter dimension
      const sx = (2 * a * 0.88) / planeW;
      const sy = (2     * 0.88) / planeH;
      const s  = Math.min(sx, sy);
      mesh.scale.set(s, s, 1);
    }
    new ResizeObserver(resize).observe(canvas.parentElement || canvas);
    resize();

    // ── Mouse: tilt + noise shift ─────────────────────────────────────────
    const rotTarget  = new THREE.Vector2();
    const rotCurrent = new THREE.Vector2();

    window.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      const nx =  (e.clientX - r.left) / r.width  * 2 - 1;
      const ny = -((e.clientY - r.top) / r.height * 2 - 1);
      rotTarget.set(ny * 0.10, nx * 0.14);
      mat.uniforms.uMouse.value.set(nx * 0.4, ny * 0.4);
    }, { passive: true });

    // ── Render loop ───────────────────────────────────────────────────────
    let last = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) * 0.001, 0.05);
      last = now;

      mat.uniforms.uTime.value += dt;

      // Smooth 3D tilt
      rotCurrent.x += (rotTarget.x - rotCurrent.x) * 0.05;
      rotCurrent.y += (rotTarget.y - rotCurrent.y) * 0.05;
      mesh.rotation.x = rotCurrent.x;
      mesh.rotation.y = rotCurrent.y;

      renderer.render(scene, camera);
    }

    requestAnimationFrame(frame);
  }

})();
