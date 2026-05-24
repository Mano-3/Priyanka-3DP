(function () {
  'use strict';

  const canvas = document.getElementById('characterCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // ── Renderer ──────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  // ── Camera ────────────────────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(2.2, 2.8, 4.8);
  camera.lookAt(0, 0.6, 0);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function mat(color, opts = {}) {
    return new THREE.MeshLambertMaterial({ color, ...opts });
  }
  function box(w, h, d, color, opts) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function cyl(rt, rb, h, segs, color, opts) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat(color, opts));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function sph(r, ws, hs, color, opts) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat(color, opts));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  // ── Palette ───────────────────────────────────────────────────────────────
  const C = {
    skin:     0xf5c5a0,
    hair:     0x2a1a0a,
    shirt:    0x334460,
    pants:    0x1a1a2e,
    desk:     0xd4a574,
    deskDark: 0xb8895a,
    laptop:   0x2c2c2e,
    screen:   0x8ab4f8,
    plantPot: 0xe07050,
    leaf:     0x4a8c3a,
    lampBase: 0xc8c8c8,
    lampHead: 0xf5e050,
    chair:    0x3a3a3a,
    floor:    0x111111,
    mug:      0xe8e8e8,
    mugLiq:   0x7a4a20,
  };

  // ── Group ─────────────────────────────────────────────────────────────────
  const root = new THREE.Group();
  scene.add(root);

  // ── Floor shadow receiver ─────────────────────────────────────────────────
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.ShadowMaterial({ opacity: 0.18 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  floor.receiveShadow = true;
  root.add(floor);

  // ── Desk ──────────────────────────────────────────────────────────────────
  const deskGroup = new THREE.Group();
  root.add(deskGroup);

  const deskTop = box(2.6, 0.08, 1.2, C.desk);
  deskTop.position.set(0, 0.76, 0);
  deskGroup.add(deskTop);

  // desk legs
  [[-1.2, 0.6], [1.2, 0.6], [-1.2, -0.6], [1.2, -0.6]].forEach(([x, z]) => {
    const leg = box(0.07, 0.76, 0.07, C.deskDark);
    leg.position.set(x, 0.38, z);
    deskGroup.add(leg);
  });

  // desk back edge trim
  const edgeTrim = box(2.6, 0.03, 0.02, C.deskDark);
  edgeTrim.position.set(0, 0.79, -0.59);
  deskGroup.add(edgeTrim);

  // ── Laptop ────────────────────────────────────────────────────────────────
  const laptopGroup = new THREE.Group();
  laptopGroup.position.set(0.1, 0.8, -0.1);
  deskGroup.add(laptopGroup);

  const laptopBase = box(0.72, 0.025, 0.5, C.laptop);
  laptopBase.position.y = 0.0125;
  laptopGroup.add(laptopBase);

  const laptopLidGroup = new THREE.Group();
  laptopLidGroup.position.set(0, 0.025, -0.25);
  laptopGroup.add(laptopLidGroup);

  const laptopLid = box(0.72, 0.48, 0.025, C.laptop);
  laptopLid.position.set(0, 0.24, 0);
  laptopLidGroup.add(laptopLid);

  const screenGlow = box(0.64, 0.40, 0.005, C.screen, { emissive: C.screen, emissiveIntensity: 0.4 });
  screenGlow.position.set(0, 0.24, -0.014);
  laptopLidGroup.add(screenGlow);

  // laptop lid slightly open (~100°)
  laptopLidGroup.rotation.x = -1.75;

  // ── Coffee mug ────────────────────────────────────────────────────────────
  const mugGroup = new THREE.Group();
  mugGroup.position.set(-0.85, 0.8, 0.15);
  deskGroup.add(mugGroup);

  const mug = cyl(0.075, 0.065, 0.14, 10, C.mug);
  mug.position.y = 0.07;
  mugGroup.add(mug);

  const liquid = cyl(0.063, 0.063, 0.01, 10, C.mugLiq);
  liquid.position.y = 0.135;
  mugGroup.add(liquid);

  // mug handle
  const handleGeo = new THREE.TorusGeometry(0.042, 0.012, 6, 10, Math.PI);
  const handle = new THREE.Mesh(handleGeo, mat(C.mug));
  handle.position.set(0.09, 0.07, 0);
  handle.rotation.y = Math.PI / 2;
  mugGroup.add(handle);

  // ── Plant ─────────────────────────────────────────────────────────────────
  const plantGroup = new THREE.Group();
  plantGroup.position.set(-0.85, 0.8, -0.28);
  deskGroup.add(plantGroup);

  const pot = cyl(0.085, 0.065, 0.12, 8, C.plantPot);
  pot.position.y = 0.06;
  plantGroup.add(pot);

  // leaves — 3 overlapping ellipsoid-ish blobs
  [[0, 0.22, 0, 1], [0.06, 0.26, 0.04, 0.85], [-0.05, 0.24, -0.03, 0.9]].forEach(([x, y, z, s]) => {
    const leaf = sph(0.1 * s, 6, 5, C.leaf);
    leaf.scale.set(0.8, 1.4, 0.7);
    leaf.position.set(x, y, z);
    plantGroup.add(leaf);
  });

  // ── Desk lamp ─────────────────────────────────────────────────────────────
  const lampGroup = new THREE.Group();
  lampGroup.position.set(1.0, 0.8, -0.3);
  deskGroup.add(lampGroup);

  const lampBaseCyl = cyl(0.07, 0.07, 0.02, 8, C.lampBase);
  lampBaseCyl.position.y = 0.01;
  lampGroup.add(lampBaseCyl);

  const lampNeck = cyl(0.015, 0.015, 0.6, 6, C.lampBase);
  lampNeck.position.y = 0.31;
  lampGroup.add(lampNeck);

  const lampHead = cyl(0.12, 0.04, 0.15, 8, C.lampBase);
  lampHead.position.set(-0.1, 0.64, 0);
  lampHead.rotation.z = 0.6;
  lampGroup.add(lampHead);

  // emissive cone for glow
  const lampBulb = cyl(0.035, 0.035, 0.04, 8, C.lampHead, { emissive: 0xfff0a0, emissiveIntensity: 1.2 });
  lampBulb.position.set(-0.1, 0.64, 0);
  lampBulb.rotation.z = 0.6;
  lampGroup.add(lampBulb);

  // ── Chair ─────────────────────────────────────────────────────────────────
  const chairGroup = new THREE.Group();
  chairGroup.position.set(0, 0, 0.85);
  root.add(chairGroup);

  const chairSeat = box(0.72, 0.06, 0.62, C.chair);
  chairSeat.position.y = 0.46;
  chairGroup.add(chairSeat);

  const chairBack = box(0.72, 0.56, 0.06, C.chair);
  chairBack.position.set(0, 0.77, -0.31);
  chairGroup.add(chairBack);

  // chair legs (4)
  [[-0.32, 0.26], [0.32, 0.26], [-0.32, -0.26], [0.32, -0.26]].forEach(([x, z]) => {
    const cl = cyl(0.025, 0.025, 0.46, 6, 0x222222);
    cl.position.set(x, 0.23, z);
    chairGroup.add(cl);
  });

  // ── Character ─────────────────────────────────────────────────────────────
  const charGroup = new THREE.Group();
  charGroup.position.set(0, 0.49, 0.62);
  root.add(charGroup);

  // torso
  const torso = box(0.34, 0.44, 0.22, C.shirt);
  torso.position.y = 0.22;
  charGroup.add(torso);

  // neck
  const neck = cyl(0.065, 0.065, 0.1, 8, C.skin);
  neck.position.y = 0.49;
  charGroup.add(neck);

  // head
  const head = sph(0.175, 10, 8, C.skin);
  head.position.y = 0.64;
  charGroup.add(head);

  // hair
  const hair = sph(0.178, 10, 8, C.hair);
  hair.scale.y = 0.55;
  hair.position.set(0, 0.73, -0.02);
  charGroup.add(hair);

  // eyes
  [-0.06, 0.06].forEach(ex => {
    const eye = sph(0.022, 6, 5, 0x1a1a2e);
    eye.position.set(ex, 0.65, 0.168);
    charGroup.add(eye);
  });

  // upper arms (attached to torso shoulders)
  const armLGroup = new THREE.Group();
  armLGroup.position.set(-0.22, 0.38, 0);
  charGroup.add(armLGroup);

  const armL = box(0.1, 0.32, 0.12, C.shirt);
  armL.position.y = -0.16;
  armLGroup.add(armL);

  // lower arm + hand
  const foreL = box(0.09, 0.28, 0.1, C.skin);
  foreL.position.set(0, -0.46, 0.04);
  armLGroup.add(foreL);

  const armRGroup = new THREE.Group();
  armRGroup.position.set(0.22, 0.38, 0);
  charGroup.add(armRGroup);

  const armR = box(0.1, 0.32, 0.12, C.shirt);
  armR.position.y = -0.16;
  armRGroup.add(armR);

  const foreR = box(0.09, 0.28, 0.1, C.skin);
  foreR.position.set(0, -0.46, 0.04);
  armRGroup.add(foreR);

  // legs (visible below desk — partially hidden)
  const legLGroup = new THREE.Group();
  legLGroup.position.set(-0.1, 0, 0);
  charGroup.add(legLGroup);

  const thighL = box(0.15, 0.36, 0.16, C.pants);
  thighL.position.y = -0.18;
  legLGroup.add(thighL);

  const legRGroup = new THREE.Group();
  legRGroup.position.set(0.1, 0, 0);
  charGroup.add(legRGroup);

  const thighR = box(0.15, 0.36, 0.16, C.pants);
  thighR.position.y = -0.18;
  legRGroup.add(thighR);

  // position arms for typing pose
  armLGroup.rotation.x = -1.1;
  armRGroup.rotation.x = -1.1;
  armLGroup.rotation.z =  0.18;
  armRGroup.rotation.z = -0.18;

  // ── Lighting ──────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  // cool fill from upper-left
  const fill = new THREE.DirectionalLight(0xb8c8ff, 0.6);
  fill.position.set(-3, 5, 3);
  scene.add(fill);

  // key light from right
  const key = new THREE.DirectionalLight(0xffffff, 0.5);
  key.position.set(4, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.width = 512;
  key.shadow.mapSize.height = 512;
  scene.add(key);

  // warm lamp point light
  const lampLight = new THREE.PointLight(0xfff0a0, 1.8, 3);
  lampLight.position.set(0.9, 1.55, 0.25);
  scene.add(lampLight);

  // screen glow
  const screenLight = new THREE.PointLight(0x8ab4f8, 0.6, 1.2);
  screenLight.position.set(0.1, 1.1, 0.3);
  scene.add(screenLight);

  // ── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ── Animation state ───────────────────────────────────────────────────────
  let t = 0;
  let waving = false;
  let waveT = 0;
  let nextWave = 7 + Math.random() * 5;

  function frame(now) {
    requestAnimationFrame(frame);
    t = now * 0.001;

    // Breathing — torso & head subtle scale
    const breath = Math.sin(t * 1.2) * 0.012;
    torso.scale.y = 1 + breath;
    head.position.y = 0.64 + breath * 1.5;
    neck.position.y = 0.49 + breath * 0.6;

    // Typing — alternate arms up/down
    const typePeriod = 0.22;
    const typePhase  = (t % (typePeriod * 2)) / (typePeriod * 2);
    const typeLift   = 0.055;
    armLGroup.position.y = 0.38 + (typePhase < 0.5 ?  typeLift : 0);
    armRGroup.position.y = 0.38 + (typePhase >= 0.5 ? typeLift : 0);

    // Wave animation — periodic
    if (!waving && t > nextWave) {
      waving = true;
      waveT = 0;
    }
    if (waving) {
      waveT += 0.06;
      // right arm raises and sways
      armRGroup.rotation.x = -1.1 + Math.sin(waveT) * 1.2 * Math.max(0, 1 - waveT / (Math.PI * 2));
      armRGroup.rotation.z = -0.18 - Math.sin(waveT * 0.9) * 0.5 * Math.max(0, 1 - waveT / (Math.PI * 2));
      if (waveT > Math.PI * 2.5) {
        waving = false;
        armRGroup.rotation.x = -1.1;
        armRGroup.rotation.z = -0.18;
        nextWave = t + 8 + Math.random() * 6;
      }
    }

    // Subtle whole-scene sway
    root.rotation.y = Math.sin(t * 0.18) * 0.04;

    renderer.render(scene, camera);
  }

  requestAnimationFrame(frame);
})();
