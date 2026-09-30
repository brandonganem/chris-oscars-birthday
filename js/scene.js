import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const rand = (a, b) => a + Math.random() * (b - a);
const STAGE_TOP = 0.3;
const PEDESTAL_H = 1.0;
const MAIN_SCALE = 1.25;

function glowTexture(inner = 'rgba(255,240,200,1)', outer = 'rgba(255,200,80,0)') {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.25, inner.replace(/[\d.]+\)$/, '0.6)'));
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function limb(a, b, r, mat) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 12), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}

// The Oscar: a knight holding a crusader's sword, standing on a five-spoke film reel.
function makeOscar(gold) {
  const g = new THREE.Group();
  const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.62, 0.22, 48), gold);
  reel.position.y = 0.11;
  g.add(reel);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.03, 8, 48), gold);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.22;
  g.add(rim);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.42), gold);
    s.position.set(Math.sin(a) * 0.3, 0.235, Math.cos(a) * 0.3);
    s.rotation.y = a;
    g.add(s);
  }
  const fig = new THREE.Group();
  fig.position.y = 0.22;
  g.add(fig);
  const profile = [
    [0, 0], [0.2, 0], [0.19, 0.06], [0.14, 0.3], [0.155, 0.6], [0.185, 0.95], [0.215, 1.2], [0.2, 1.33],
    [0.185, 1.45], [0.22, 1.65], [0.265, 1.84], [0.29, 1.95], [0.25, 2.03], [0.13, 2.08], [0.075, 2.12], [0.075, 2.16], [0, 2.17],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), gold);
  body.scale.z = 0.72;
  fig.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 18), gold);
  head.position.y = 2.3;
  head.scale.set(0.92, 1.2, 1);
  fig.add(head);
  for (const s of [-1, 1]) {
    const shoulder = V(s * 0.27, 1.9, 0.02);
    const elbow = V(s * 0.3, 1.55, 0.12);
    const hand = V(s * 0.04, 1.5, 0.23);
    fig.add(limb(shoulder, elbow, 0.062, gold));
    fig.add(limb(elbow, hand, 0.055, gold));
  }
  const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.028, 1.28, 12), gold);
  blade.position.set(0, 0.7, 0.25);
  fig.add(blade);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.035, 0.05), gold);
  guard.position.set(0, 1.35, 0.25);
  fig.add(guard);
  const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 10), gold);
  hilt.position.set(0, 1.46, 0.25);
  fig.add(hilt);
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), gold);
  pommel.position.set(0, 1.58, 0.25);
  fig.add(pommel);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}

function goldGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#8a6a1f');
  g.addColorStop(0.3, '#f7e08a');
  g.addColorStop(0.5, '#d4af37');
  g.addColorStop(0.75, '#fff1b0');
  g.addColorStop(1, '#9c7a24');
  return g;
}

function billboardTexture(dec, idx) {
  const W = 1024, H = 1400;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1a0f14');
  bg.addColorStop(1, '#070508');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // Art deco sunburst
  g.save();
  g.translate(W / 2, 420);
  for (let i = 0; i < 36; i++) {
    g.rotate(Math.PI / 18);
    g.fillStyle = i % 2 ? 'rgba(212,175,55,0.05)' : 'rgba(212,175,55,0.1)';
    g.beginPath(); g.moveTo(0, 0); g.lineTo(-60, -900); g.lineTo(60, -900); g.closePath(); g.fill();
  }
  g.restore();
  const gold = goldGradient(g, 0, 0, W, H);
  g.strokeStyle = gold;
  g.lineWidth = 14; g.strokeRect(24, 24, W - 48, H - 48);
  g.lineWidth = 4; g.strokeRect(52, 52, W - 104, H - 104);
  // corner steps
  for (const [cx, cy, sx, sy] of [[52, 52, 1, 1], [W - 52, 52, -1, 1], [52, H - 52, 1, -1], [W - 52, H - 52, -1, -1]]) {
    g.fillStyle = gold;
    for (let k = 0; k < 3; k++) g.fillRect(cx + sx * (k * 22) - (sx < 0 ? 16 : 0), cy + sy * (k * 22) - (sy < 0 ? 16 : 0), 16, 16);
  }
  g.textAlign = 'center';
  g.fillStyle = '#e9d8a6';
  g.font = '600 38px "Josefin Sans", sans-serif';
  g.fillText(`THE ${idx === 0 ? 'FIRST' : 'GOLDEN'} ERA · CHAPTER ${idx + 1}`.toUpperCase(), W / 2, 140);
  g.fillStyle = gold;
  g.font = '200px Limelight, "Poiret One", serif';
  g.shadowColor = 'rgba(255,200,80,0.45)';
  g.shadowBlur = 30;
  g.fillText(dec.d, W / 2, 380);
  g.shadowBlur = 0;
  g.fillRect(W / 2 - 300, 430, 600, 4);
  g.fillStyle = '#e9d8a6';
  g.font = '600 36px "Josefin Sans", sans-serif';
  g.fillText('★  BEST PICTURE WINNERS INCLUDE  ★', W / 2, 500);
  g.font = '52px "Cormorant Garamond", Georgia, serif';
  g.fillStyle = '#fff7e0';
  let y = 580;
  for (const w of dec.winners) { g.fillText(w, W / 2, y); y += 68; }
  y += 30;
  g.fillStyle = gold;
  g.fillRect(W / 2 - 300, y, 600, 4);
  y += 80;
  g.font = '44px Limelight, serif';
  g.fillText('DID YOU KNOW?', W / 2, y);
  y += 70;
  g.fillStyle = '#f3e6c4';
  g.font = 'italic 44px "Cormorant Garamond", Georgia, serif';
  wrapText(g, dec.fact, W / 2, y, W - 200, 58);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function createScene(canvas, { decades, onStatueClick, onBillboardClick, onCandleClick }) {
  const isSmall = Math.min(innerWidth, innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isSmall ? 1.5 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060409);
  scene.fog = new THREE.FogExp2(0x060409, 0.03);

  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 250);
  camera.position.set(0, 3.4, 16);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const gold = new THREE.MeshStandardMaterial({ color: 0xe8b64a, metalness: 1, roughness: 0.22, envMap: env, envMapIntensity: 1.35 });
  const blackGloss = new THREE.MeshStandardMaterial({ color: 0x0c0a0e, metalness: 0.4, roughness: 0.18, envMap: env, envMapIntensity: 0.5 });

  // ── Lights ──
  scene.add(new THREE.HemisphereLight(0x6a5a8a, 0x120808, 0.35));
  const warm = new THREE.PointLight(0xffb85c, 18, 12, 2);
  warm.position.set(0, 3.2, 3.2);
  scene.add(warm);

  const coneMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(0xffe8b0) }, uStrength: { value: 0.16 } },
    vertexShader: `varying float vZ; varying vec3 vN; varying vec3 vV;
      void main(){ vZ = position.z; vec4 mv = modelViewMatrix * vec4(position,1.0);
      vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uStrength; varying float vZ; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(abs(dot(vN, vV)), 2.0); float a = (1.0 - vZ) * f * uStrength; gl_FragColor = vec4(uColor * a, a); }`,
  });
  const coneGeo = new THREE.CylinderGeometry(0.08, 1.8, 1, 40, 1, true);
  coneGeo.translate(0, -0.5, 0);
  coneGeo.rotateX(-Math.PI / 2);

  const spots = [];
  const spotDefs = [[-6.5, 11, 6], [6.5, 11, 6], [0, 12, -5]];
  spotDefs.forEach(([x, y, z], i) => {
    const s = new THREE.SpotLight(0xfff0d6, 520, 40, 0.26, 0.55, 2);
    s.position.set(x, y, z);
    s.target.position.set(0, 2.5, 0);
    if (i === 0) {
      s.castShadow = true;
      s.shadow.mapSize.set(isSmall ? 512 : 1024, isSmall ? 512 : 1024);
      s.shadow.bias = -0.0005;
    }
    scene.add(s, s.target);
    const cone = new THREE.Mesh(coneGeo, coneMat.clone());
    cone.position.copy(s.position);
    scene.add(cone);
    spots.push({ light: s, cone, phase: i * 2.1, focus: V(0, 2.5, 0) });
  });

  // ── Floor, stage, backdrop ──
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.MeshStandardMaterial({ color: 0x0d0b10, roughness: 0.42, metalness: 0.25 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const stage = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.08, STAGE_TOP, 72), new THREE.MeshStandardMaterial({ color: 0x17111a, roughness: 0.28, metalness: 0.35 }));
  stage.position.y = STAGE_TOP / 2;
  stage.receiveShadow = true;
  scene.add(stage);
  const step = new THREE.Mesh(new THREE.CylinderGeometry(3.55, 3.62, 0.12, 72), new THREE.MeshStandardMaterial({ color: 0x120d14, roughness: 0.35, metalness: 0.3 }));
  step.position.y = 0.06;
  step.receiveShadow = true;
  scene.add(step);
  for (const [r, y] of [[3.02, STAGE_TOP], [3.57, 0.12]]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 10, 120), gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    scene.add(ring);
  }

  const barMat = new THREE.MeshStandardMaterial({ color: 0x2a1a05, emissive: 0xffb347, emissiveIntensity: 1.6, roughness: 0.4 });
  const bars = [];
  const N_BARS = 23;
  for (let i = 0; i < N_BARS; i++) {
    const t = i / (N_BARS - 1);
    const a = (t - 0.5) * Math.PI * 0.95;
    const h = 3 + 6.5 * Math.pow(Math.cos((t - 0.5) * Math.PI), 1.6);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, h, 0.14), barMat.clone());
    bar.position.set(Math.sin(a) * 8, h / 2, -Math.cos(a) * 8 - 1);
    scene.add(bar);
    bars.push({ mesh: bar, t });
  }
  // Giant silhouettes of statues flanking the stage, a nod to the classic Oscars set.
  const giantMat = new THREE.MeshStandardMaterial({ color: 0xc99a3c, metalness: 1, roughness: 0.35, envMap: env, envMapIntensity: 0.6 });
  for (const s of [-1, 1]) {
    const giant = makeOscar(giantMat);
    giant.scale.setScalar(2.6);
    giant.position.set(s * 6.8, 0, -6.2);
    giant.rotation.y = -s * 0.35;
    scene.add(giant);
  }

  // ── Main statue + pedestal ──
  const hero = new THREE.Group();
  scene.add(hero);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, PEDESTAL_H, 64), blackGloss);
  pedestal.position.y = STAGE_TOP + PEDESTAL_H / 2;
  pedestal.castShadow = pedestal.receiveShadow = true;
  hero.add(pedestal);
  for (const y of [STAGE_TOP + 0.04, STAGE_TOP + PEDESTAL_H - 0.02]) {
    const tr = new THREE.Mesh(new THREE.TorusGeometry(y > 1 ? 0.755 : 0.8, 0.025, 8, 64), gold);
    tr.rotation.x = Math.PI / 2;
    tr.position.y = y;
    hero.add(tr);
  }
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 1024; plaqueCanvas.height = 380;
  const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
  plaqueTex.colorSpace = THREE.SRGBColorSpace;
  const plaque = new THREE.Mesh(
    new THREE.CylinderGeometry(0.785, 0.785, 0.4, 32, 1, true, -0.62, 1.24),
    new THREE.MeshStandardMaterial({ map: plaqueTex, metalness: 0.6, roughness: 0.3, envMap: env, envMapIntensity: 0.8 }),
  );
  plaque.position.y = STAGE_TOP + PEDESTAL_H / 2;
  hero.add(plaque);
  function setPlaque(l1, l2, l3 = '') {
    const g = plaqueCanvas.getContext('2d');
    const { width: W, height: H } = plaqueCanvas;
    g.fillStyle = goldGradient(g, 0, 0, W, H);
    g.fillRect(0, 0, W, H);
    g.strokeStyle = '#6b4e12';
    g.lineWidth = 10; g.strokeRect(18, 18, W - 36, H - 36);
    g.textAlign = 'center';
    g.fillStyle = '#3b2a07';
    g.font = '600 46px "Josefin Sans", sans-serif';
    g.fillText(l1.toUpperCase(), W / 2, 100);
    g.font = '128px Limelight, serif';
    g.fillText(l2, W / 2, 238);
    g.font = 'italic 44px "Cormorant Garamond", serif';
    g.fillText(l3, W / 2, 316);
    plaqueTex.needsUpdate = true;
  }
  setPlaque('And the Oscar goes to', '…', '');

  const statue = makeOscar(gold);
  statue.scale.setScalar(MAIN_SCALE);
  statue.position.y = STAGE_TOP + PEDESTAL_H;
  hero.add(statue);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,210,120,1)', 'rgba(255,150,40,0)'), blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.35 }));
  halo.scale.set(5, 6, 1);
  halo.position.set(0, 3.1, -0.6);
  hero.add(halo);
  const statueHit = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 4.4, 12), new THREE.MeshBasicMaterial({ visible: false }));
  statueHit.position.y = 2.5;
  hero.add(statueHit);

  // ── Red carpet leading to the stage ──
  const CARPET_START = 3.3, CARPET_END = 95;
  const carpetLen = CARPET_END - CARPET_START;
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.2, carpetLen), new THREE.MeshStandardMaterial({ color: 0x8e0b18, roughness: 0.92 }));
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0, 0.012, CARPET_START + carpetLen / 2);
  carpet.receiveShadow = true;
  scene.add(carpet);
  for (const s of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.08, carpetLen), gold);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(s * 1.62, 0.014, CARPET_START + carpetLen / 2);
    scene.add(edge);
  }
  const velvet = new THREE.MeshStandardMaterial({ color: 0x6d0712, roughness: 0.7 });
  const postGeo = new THREE.CylinderGeometry(0.045, 0.06, 0.95, 12);
  const knobGeo = new THREE.SphereGeometry(0.075, 12, 10);
  const baseGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.05, 20);
  for (const s of [-1, 1]) {
    let prev = null;
    for (let z = 5; z <= 90; z += 4) {
      const x = s * 2.0;
      const p = new THREE.Mesh(postGeo, gold); p.position.set(x, 0.5, z); scene.add(p);
      const k = new THREE.Mesh(knobGeo, gold); k.position.set(x, 1.0, z); scene.add(k);
      const b = new THREE.Mesh(baseGeo, gold); b.position.set(x, 0.03, z); scene.add(b);
      if (prev) {
        const a = V(x, 0.9, prev), c = V(x, 0.9, z), m = V(x, 0.55, (prev + z) / 2);
        const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, c), 12, 0.03, 6), velvet);
        scene.add(rope);
      }
      prev = z;
    }
  }

  // ── Decade billboards ──
  const carpetLight = new THREE.PointLight(0xffc98a, 0, 16, 1.6);
  scene.add(carpetLight);
  const boards = [];
  const boardGroup = new THREE.Group();
  scene.add(boardGroup);
  const BW = 2.6, BH = 3.55;
  decades.forEach((dec, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 82 - i * 7;
    const grp = new THREE.Group();
    grp.position.set(side * 3.7, 0, z);
    grp.rotation.y = -side * 0.42;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ color: 0x222222, toneMapped: false }));
    panel.position.y = 0.55 + BH / 2;
    panel.userData.board = i;
    grp.add(panel);
    const fw = 0.07;
    for (const [w, h, x, y] of [[BW + fw * 2, fw, 0, BH + 0.55 + fw / 2], [BW + fw * 2, fw, 0, 0.55 - fw / 2], [fw, BH, -BW / 2 - fw / 2, 0.55 + BH / 2], [fw, BH, BW / 2 + fw / 2, 0.55 + BH / 2]]) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), gold);
      f.position.set(x, y, 0);
      grp.add(f);
    }
    for (const x of [-BW / 2 + 0.2, BW / 2 - 0.2]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.06), gold);
      leg.position.set(x, 0.275, -0.03);
      grp.add(leg);
    }
    const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6 }));
    lamp.scale.set(1.2, 1.2, 1);
    lamp.position.set(0, BH + 0.85, 0.15);
    grp.add(lamp);
    boardGroup.add(grp);
    grp.updateMatrixWorld(true);
    const center = V(0, 0.55 + BH / 2, 0).applyMatrix4(grp.matrixWorld);
    const normal = V(0, 0, 1).applyQuaternion(grp.quaternion);
    boards.push({ grp, panel, center, normal });
  });
  function buildBoardTextures() {
    boards.forEach((b, i) => {
      b.panel.material.map = billboardTexture(decades[i], i);
      b.panel.material.color.set(0xffffff);
      b.panel.material.needsUpdate = true;
    });
  }

  // ── Floating gold dust ──
  const DUST = isSmall ? 350 : 700;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = rand(-14, 14);
    dustPos[i * 3 + 1] = rand(0, 12);
    dustPos[i * 3 + 2] = rand(-10, 90);
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dotTex = glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.09, map: dotTex, color: 0xffd27a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  // ── Paparazzi flashes along the carpet ──
  const flashes = [];
  const flashTex = glowTexture('rgba(255,255,255,1)', 'rgba(200,220,255,0)');
  for (let i = 0; i < 14; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
    sp.scale.set(1.6, 1.6, 1);
    scene.add(sp);
    flashes.push({ sp, life: 0 });
  }

  // ── Confetti ──
  const CONF = isSmall ? 700 : 1300;
  const confMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.07, 0.12), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), CONF);
  confMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  confMesh.frustumCulled = false;
  const palette = [0xffd24a, 0xf5c542, 0xfff3c4, 0xc8102e, 0xffffff, 0xe0a526, 0xff5c8a];
  const cp = [];
  const tmpColor = new THREE.Color();
  for (let i = 0; i < CONF; i++) {
    confMesh.setColorAt(i, tmpColor.set(palette[i % palette.length]));
    cp.push({ p: V(0, -99, 0), v: V(), r: new THREE.Euler(), rv: V(), life: 0, sway: rand(0, 6) });
  }
  scene.add(confMesh);
  let confCursor = 0;
  const dummy = new THREE.Object3D();
  function burst(origin = V(0, 3, 0), n = 200, power = 5, rain = false) {
    for (let k = 0; k < n; k++) {
      const c = cp[confCursor];
      confCursor = (confCursor + 1) % CONF;
      if (rain) {
        c.p.set(origin.x + rand(-7, 7), origin.y + rand(0, 4), origin.z + rand(-4, 4));
        c.v.set(rand(-0.3, 0.3), rand(-1, 0), rand(-0.3, 0.3));
      } else {
        c.p.copy(origin);
        const a = rand(0, Math.PI * 2), up = rand(0.55, 1);
        const sp = power * rand(0.5, 1.1);
        c.v.set(Math.cos(a) * (1 - up) * sp * 1.6, up * sp, Math.sin(a) * (1 - up) * sp * 1.6);
      }
      c.rv.set(rand(-8, 8), rand(-8, 8), rand(-8, 8));
      c.life = rand(4, 7);
    }
  }

  // ── Fireworks ──
  const FW = isSmall ? 1800 : 3600;
  const fwGeo = new THREE.BufferGeometry();
  const fwPos = new Float32Array(FW * 3).fill(-999);
  const fwCol = new Float32Array(FW * 3);
  fwGeo.setAttribute('position', new THREE.BufferAttribute(fwPos, 3));
  fwGeo.setAttribute('color', new THREE.BufferAttribute(fwCol, 3));
  const fwPts = new THREE.Points(fwGeo, new THREE.PointsMaterial({ size: 0.28, map: dotTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  fwPts.frustumCulled = false;
  scene.add(fwPts);
  const fwP = Array.from({ length: FW }, () => ({ v: V(), life: 0, max: 1, c: new THREE.Color() }));
  let fwCursor = 0;
  const fwColors = [0xffd24a, 0xff4d6d, 0xffffff, 0x7ad7ff, 0xff9f1c, 0xc77dff];
  function firework(center) {
    const col = new THREE.Color(fwColors[Math.floor(Math.random() * fwColors.length)]).multiplyScalar(2.2);
    const n = isSmall ? 110 : 170;
    const speed = rand(3, 4.6);
    for (let k = 0; k < n; k++) {
      const i = fwCursor; fwCursor = (fwCursor + 1) % FW;
      const p = fwP[i];
      const dir = V(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
      p.v.copy(dir).multiplyScalar(speed * rand(0.85, 1));
      p.max = p.life = rand(1.4, 2.2);
      p.c.copy(col);
      fwPos[i * 3] = center.x; fwPos[i * 3 + 1] = center.y; fwPos[i * 3 + 2] = center.z;
    }
  }
  let fireworksOn = false, fwTimer = 0;
  let onFirework = null;

  // ── Mini Oscars earned during trivia ──
  const minis = [];
  const miniGroup = new THREE.Group();
  scene.add(miniGroup);
  const miniBaseGeo = new THREE.CylinderGeometry(0.17, 0.19, 0.14, 24);
  function miniSlot(i) {
    const side = i < 8 ? -1 : 1;
    const k = i < 8 ? i : i - 8;
    const a = THREE.MathUtils.degToRad(34 + k * 14);
    return V(side * 2.35 * Math.sin(a), STAGE_TOP, 2.35 * Math.cos(a));
  }
  function awardMini() {
    const i = minis.length;
    if (i >= 16) return;
    const g = new THREE.Group();
    const base = new THREE.Mesh(miniBaseGeo, blackGloss);
    base.position.y = 0.07;
    base.castShadow = true;
    g.add(base);
    const o = makeOscar(gold);
    o.scale.setScalar(0.24);
    o.position.y = 0.14;
    g.add(o);
    const slot = miniSlot(i);
    g.position.copy(slot).add(V(0, 6, 0));
    g.rotation.y = Math.atan2(slot.x, slot.z) * 0.3;
    miniGroup.add(g);
    minis.push({ g, slot, t: 0 });
  }
  function clearMinis() {
    minis.forEach((m) => miniGroup.remove(m.g));
    minis.length = 0;
  }

  // ── Birthday cake ──
  const cake = new THREE.Group();
  cake.position.set(0, STAGE_TOP, 2.0);
  cake.scale.setScalar(0.001);
  cake.visible = false;
  scene.add(cake);
  const cream = new THREE.MeshStandardMaterial({ color: 0xd9c29a, roughness: 0.75 });
  const berry = new THREE.MeshStandardMaterial({ color: 0x8a0f1f, roughness: 0.5 });
  let cy = 0;
  [[0.62, 0.36, cream], [0.47, 0.3, berry], [0.33, 0.26, cream]].forEach(([r, h, m]) => {
    const tier = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), m);
    tier.position.y = cy + h / 2;
    tier.castShadow = true;
    cake.add(tier);
    const band = new THREE.Mesh(new THREE.TorusGeometry(r + 0.005, 0.022, 8, 48), gold);
    band.rotation.x = Math.PI / 2;
    band.position.y = cy + 0.03;
    cake.add(band);
    const pearls = 28;
    for (let i = 0; i < pearls; i++) {
      const a = (i / pearls) * Math.PI * 2;
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), gold);
      pearl.position.set(Math.sin(a) * r, cy + h, Math.cos(a) * r);
      cake.add(pearl);
    }
    cy += h;
  });
  const stripe = document.createElement('canvas');
  stripe.width = 32; stripe.height = 128;
  const sg = stripe.getContext('2d');
  for (let i = 0; i < 8; i++) { sg.fillStyle = i % 2 ? '#ffffff' : '#c8102e'; sg.fillRect(0, i * 16, 32, 16); }
  const stripeTex = new THREE.CanvasTexture(stripe);
  stripeTex.colorSpace = THREE.SRGBColorSpace;
  const candleMat = new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.5 });
  const flameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb13b).multiplyScalar(2.5), toneMapped: false });
  const flameCore = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4d0).multiplyScalar(2), toneMapped: false });
  const candles = [];
  const candleSpots = [[0, 0]];
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; candleSpots.push([Math.sin(a) * 0.22, Math.cos(a) * 0.22]); }
  candleSpots.forEach(([x, z], i) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 12), candleMat);
    c.position.set(x, cy + 0.14, z);
    cake.add(c);
    const flame = new THREE.Group();
    flame.position.set(x, cy + 0.34, z);
    const outer = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), flameMat);
    outer.scale.set(1, 1.9, 1);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), flameCore);
    inner.scale.set(1, 1.6, 1);
    inner.position.y = -0.01;
    flame.add(outer, inner);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture('rgba(255,200,110,1)', 'rgba(255,120,20,0)'), blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.8 }));
    glow.scale.set(0.35, 0.45, 1);
    flame.add(glow);
    cake.add(flame);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(x, cy + 0.3, z);
    hit.userData.candle = i;
    cake.add(hit);
    candles.push({ flame, hit, lit: true, phase: rand(0, 10) });
  });
  const cakeLight = new THREE.PointLight(0xffa54a, 0, 5, 2);
  cakeLight.position.set(0, cy + 0.6, 0);
  cake.add(cakeLight);
  const smokeTex = glowTexture('rgba(200,200,210,0.9)', 'rgba(120,120,130,0)');
  const smoke = [];
  function puff(pos) {
    for (let k = 0; k < 5; k++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0.5 }));
      sp.position.copy(pos).add(V(rand(-0.03, 0.03), k * 0.04, rand(-0.03, 0.03)));
      sp.scale.setScalar(0.1);
      scene.add(sp);
      smoke.push({ sp, life: 1.6 + k * 0.2, vy: rand(0.3, 0.5) });
    }
  }
  let cakeTarget = 0;
  function showCake(on) {
    cakeTarget = on ? 1 : 0;
    if (on) {
      cake.visible = true;
      candles.forEach((c) => { c.lit = true; c.flame.visible = true; });
    }
  }
  function blowCandle(i) {
    const c = candles[i];
    if (!c || !c.lit) return false;
    c.lit = false;
    c.flame.visible = false;
    const wp = new THREE.Vector3();
    c.flame.getWorldPosition(wp);
    puff(wp);
    return true;
  }
  const candlesLit = () => candles.filter((c) => c.lit).length;

  // ── Camera choreography ──
  let mode = 'intro';
  let focusIdx = 0;
  const camPos = camera.position.clone();
  const camLook = V(0, 2.8, 0);
  const wantPos = camPos.clone();
  const wantLook = camLook.clone();
  const mouse = new THREE.Vector2();
  let spin = 0, spinVel = 0;
  let spotMode = 'sweep';
  let celebrate = 0;

  function fitDistance(w, h, pad = 1.18) {
    const vf = THREE.MathUtils.degToRad(camera.fov) / 2;
    const dh = (h * pad) / 2 / Math.tan(vf);
    const dw = (w * pad) / 2 / (Math.tan(vf) * camera.aspect);
    return Math.max(dh, dw);
  }

  function computeTargets(time) {
    const portrait = camera.aspect < 0.9;
    switch (mode) {
      case 'intro':
        wantPos.set(0, 4.5, 17); wantLook.set(0, 3, 0); break;
      case 'menu': {
        const a = Math.sin(time * 0.12) * 0.38;
        const r = portrait ? 11 / Math.max(camera.aspect, 0.45) * 0.62 : 10.5;
        wantPos.set(Math.sin(a) * r, 3.3, Math.cos(a) * r);
        wantLook.set(0, portrait ? 2.9 : 3.0, 0);
        break;
      }
      case 'quiz':
        if (portrait) { wantPos.set(0, 4.2, 12.5); wantLook.set(0, 1.0, 0); }
        else { wantPos.set(-1.6, 3.4, 9); wantLook.set(1.9, 2.5, 0); }
        break;
      case 'walk': {
        const b = boards[focusIdx];
        const d = fitDistance(BW, BH, portrait ? 1.08 : 1.35);
        wantPos.copy(b.center).addScaledVector(b.normal, d);
        wantPos.y = b.center.y + 0.25;
        wantLook.copy(b.center);
        if (portrait) wantLook.y -= 0.35;
        break;
      }
      case 'finale':
        if (portrait) { wantPos.set(0, 4.4, 13.5); wantLook.set(0, 1.3, 0); }
        else { wantPos.set(-1.8, 3.3, 8.8); wantLook.set(2.0, 3.0, 0); }
        break;
      case 'cake':
        if (portrait) { wantPos.set(0, 3.3, 9.2); wantLook.set(0, 1.7, 1.4); }
        else { wantPos.set(0, 2.6, 6.4); wantLook.set(0, 1.75, 1.4); }
        break;
      case 'credits': {
        const a = Math.sin(time * 0.1) * 0.95;
        wantPos.set(Math.sin(a) * 11, 4.2, Math.cos(a) * 11);
        wantLook.set(0, 2.6, 0);
        break;
      }
    }
  }

  function setMode(m) {
    mode = m;
    spotMode = m === 'finale' || m === 'cake' ? 'focus' : 'sweep';
  }

  // ── Input: drag to spin, tap to interact ──
  const ray = new THREE.Raycaster();
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, lx: e.clientX }; });
  addEventListener('pointermove', (e) => {
    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    if (down && (mode === 'menu' || mode === 'quiz' || mode === 'credits')) {
      spinVel += (e.clientX - down.lx) * 0.004;
      down.lx = e.clientX;
    }
  });
  addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 8 || e.target !== canvas) return;
    const p = new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(p, camera);
    if (mode === 'cake') {
      const hits = ray.intersectObjects(candles.map((c) => c.hit));
      if (hits.length) onCandleClick?.(hits[0].object.userData.candle);
      return;
    }
    if (mode === 'walk') {
      const hits = ray.intersectObjects(boards.map((b) => b.panel));
      if (hits.length) onBillboardClick?.(hits[0].object.userData.board);
      return;
    }
    if (ray.intersectObject(statueHit).length) {
      spinVel += 0.35;
      burst(V(0, 4.5, 0.4), 60, 3.5);
      onStatueClick?.();
    }
  });

  // ── Post-processing ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new THREE.Vector2(innerWidth, innerHeight);
  const bloomPass = new UnrealBloomPass(bloom, 0.45, 0.5, 0.86);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', resize);

  // ── Main loop ──
  const clock = new THREE.Clock();
  const tmpV = new THREE.Vector3();
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;

    computeTargets(time);
    const k = 1 - Math.exp(-dt * (mode === 'walk' ? 2.4 : 1.8));
    camPos.lerp(wantPos, k);
    camLook.lerp(wantLook, k);
    const par = mode === 'walk' ? 0.15 : 0.45;
    camera.position.set(camPos.x + mouse.x * par, camPos.y + mouse.y * par * 0.5, camPos.z);
    camera.lookAt(camLook);

    // statue spin with inertia, always settling back toward facing front
    spin += spinVel * dt * 10;
    spinVel *= Math.pow(0.08, dt);
    if (Math.abs(spinVel) < 0.02) {
      const target = Math.round(spin / (Math.PI * 2)) * Math.PI * 2;
      spin += (target - spin) * (1 - Math.exp(-dt * 1.5));
    }
    statue.rotation.y = spin + Math.sin(time * 0.6) * 0.12;
    const cakeDim = mode === 'cake' ? 0.4 : 1;
    halo.material.opacity = (0.28 + Math.sin(time * 1.3) * 0.06 + celebrate * 0.35) * cakeDim;
    bloomPass.strength += ((mode === 'cake' ? 0.3 : 0.45) - bloomPass.strength) * k;

    // spotlights
    spots.forEach((s, i) => {
      if (spotMode === 'sweep') {
        s.focus.set(Math.sin(time * 0.45 + s.phase) * 3.2, 1.5, Math.cos(time * 0.33 + s.phase) * 2.5 + 1);
      } else {
        s.focus.lerp(V(0, 3.0, 0), 1 - Math.exp(-dt * 3));
      }
      s.light.target.position.copy(s.focus);
      s.cone.lookAt(s.focus);
      s.cone.scale.set(1, 1, s.light.position.distanceTo(s.focus) + 1.5);
      s.cone.material.uniforms.uStrength.value = (0.13 + celebrate * 0.08) * cakeDim;
      s.light.intensity += (520 * (mode === 'cake' ? 0.45 : 1) - s.light.intensity) * k;
    });

    // backdrop bars ripple
    bars.forEach((b) => {
      b.mesh.material.emissiveIntensity = 0.75 + Math.sin(time * 2 - b.t * 8) * 0.4 + celebrate * 0.5;
    });

    // dust drift
    const dp = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) {
      dp[i * 3 + 1] += dt * 0.15;
      dp[i * 3] += Math.sin(time * 0.5 + i) * dt * 0.05;
      if (dp[i * 3 + 1] > 12) dp[i * 3 + 1] = 0;
    }
    dustGeo.attributes.position.needsUpdate = true;

    // paparazzi flashes (busier on the carpet)
    const rate = mode === 'walk' ? 5 : mode === 'intro' || mode === 'menu' ? 0.8 : 0.3;
    if (Math.random() < rate * dt) {
      const f = flashes.find((x) => x.life <= 0);
      if (f) {
        const nearZ = mode === 'walk' ? boards[focusIdx].center.z : rand(4, 20);
        f.sp.position.set((Math.random() < 0.5 ? -1 : 1) * rand(4.6, 7), rand(1.3, 2.6), nearZ + rand(-8, 6));
        f.life = 0.18;
      }
    }
    flashes.forEach((f) => {
      f.life -= dt;
      f.sp.material.opacity = Math.max(0, f.life / 0.18);
    });

    // confetti
    for (let i = 0; i < CONF; i++) {
      const c = cp[i];
      if (c.life > 0) {
        c.life -= dt;
        c.v.y -= 4.2 * dt;
        c.v.multiplyScalar(Math.pow(0.35, dt));
        if (c.v.y < -1.4) c.v.y = -1.4;
        c.p.addScaledVector(c.v, dt);
        c.p.x += Math.sin(time * 3 + c.sway) * dt * 0.35;
        if (c.p.y < 0.02) { c.p.y = 0.02; c.v.set(0, 0, 0); c.rv.set(0, 0, 0); }
        c.r.x += c.rv.x * dt; c.r.y += c.rv.y * dt; c.r.z += c.rv.z * dt;
        dummy.position.copy(c.p);
        dummy.rotation.copy(c.r);
        dummy.scale.setScalar(c.life < 0.6 ? c.life / 0.6 : 1);
      } else {
        dummy.position.set(0, -99, 0);
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      confMesh.setMatrixAt(i, dummy.matrix);
    }
    confMesh.instanceMatrix.needsUpdate = true;

    // fireworks
    if (fireworksOn) {
      fwTimer -= dt;
      if (fwTimer <= 0) {
        fwTimer = rand(0.35, 0.9);
        firework(V(rand(-9, 9), rand(7, 12), rand(-12, -4)));
        onFirework?.();
      }
    }
    for (let i = 0; i < FW; i++) {
      const p = fwP[i];
      if (p.life <= 0) continue;
      p.life -= dt;
      p.v.y -= 2.2 * dt;
      p.v.multiplyScalar(Math.pow(0.4, dt));
      fwPos[i * 3] += p.v.x * dt; fwPos[i * 3 + 1] += p.v.y * dt; fwPos[i * 3 + 2] += p.v.z * dt;
      const f = Math.max(0, p.life / p.max);
      const fl = f * f * (0.7 + Math.random() * 0.3);
      fwCol[i * 3] = p.c.r * fl; fwCol[i * 3 + 1] = p.c.g * fl; fwCol[i * 3 + 2] = p.c.b * fl;
      if (p.life <= 0) fwPos[i * 3 + 1] = -999;
    }
    fwGeo.attributes.position.needsUpdate = true;
    fwGeo.attributes.color.needsUpdate = true;

    // minis dropping in
    minis.forEach((m) => {
      if (m.t >= 1) return;
      m.t = Math.min(1, m.t + dt * 1.1);
      const t = m.t;
      // bounce ease-out
      const n1 = 7.5625, d1 = 2.75;
      let e;
      if (t < 1 / d1) e = n1 * t * t;
      else if (t < 2 / d1) { const u = t - 1.5 / d1; e = n1 * u * u + 0.75; }
      else if (t < 2.5 / d1) { const u = t - 2.25 / d1; e = n1 * u * u + 0.9375; }
      else { const u = t - 2.625 / d1; e = n1 * u * u + 0.984375; }
      m.g.position.y = m.slot.y + 6 * (1 - e);
      m.g.rotation.y += dt * 6 * (1 - t);
    });

    // cake
    const cs = cake.scale.x + (cakeTarget * 1.35 - cake.scale.x) * (1 - Math.exp(-dt * 4));
    cake.scale.setScalar(Math.max(0.001, cs));
    if (cakeTarget === 0 && cs < 0.01) cake.visible = false;
    let lit = 0;
    candles.forEach((c) => {
      if (!c.lit) return;
      lit++;
      const f = 1 + Math.sin(time * 18 + c.phase) * 0.08 + Math.sin(time * 31 + c.phase * 2) * 0.06;
      c.flame.scale.set(1, f, 1);
      c.flame.rotation.z = Math.sin(time * 5 + c.phase) * 0.08;
    });
    cakeLight.intensity = cake.visible ? lit * 0.5 * (0.9 + Math.random() * 0.1) : 0;
    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i];
      s.life -= dt;
      s.sp.position.y += s.vy * dt;
      s.sp.position.x += Math.sin(time * 2 + i) * dt * 0.05;
      s.sp.scale.setScalar(0.1 + (2 - s.life) * 0.18);
      s.sp.material.opacity = Math.max(0, s.life / 2) * 0.5;
      if (s.life <= 0) { scene.remove(s.sp); smoke.splice(i, 1); }
    }

    celebrate = Math.max(0, celebrate - dt * 0.15);
    warm.intensity = 18 + celebrate * 12;
    const walkZ = boards[focusIdx].center.z + 3;
    carpetLight.position.set(camPos.x * 0.5, 3.2, Math.min(camPos.z, walkZ));
    carpetLight.intensity += ((mode === 'walk' ? 30 : 0) - carpetLight.intensity) * (1 - Math.exp(-dt * 2));

    composer.render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    setMode,
    get mode() { return mode; },
    focusDecade(i) { focusIdx = (i + boards.length) % boards.length; return focusIdx; },
    get decadeCount() { return boards.length; },
    burst,
    rain(n = 400) { burst(V(0, 9, 2), n, 0, true); },
    minisBurst(i) { const s = miniSlot(i); burst(V(s.x, 0.9, s.z), 50, 3); },
    awardMini,
    clearMinis,
    setPlaque,
    buildBoardTextures,
    celebrate(v = 1) { celebrate = v; },
    spinStatue(v = 1.2) { spinVel += v; },
    fireworks(on) { fireworksOn = on; fwTimer = 0; },
    set onFirework(fn) { onFirework = fn; },
    showCake,
    blowCandle,
    blowAll() { candles.forEach((_, i) => blowCandle(i)); },
    candlesLit,
    cakeTopWorld() { return cake.localToWorld(V(0, cy + 0.4, 0)); },
  };
}
