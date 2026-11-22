/* ============================================
   EYAD EMAD SHAKER — script.js
   Three.js + Particles + Cursor + Animations
   ============================================ */

// ===================== INTRO LOADER =====================
(function runIntro() {
  const canvas = document.getElementById('intro-canvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  let warp = 1, launch = false;
  const stars = Array.from({ length: 650 }, () => ({
    x: (Math.random() - 0.5) * canvas.width * 2,
    y: (Math.random() - 0.5) * canvas.height * 2,
    z: Math.random() * canvas.width,
    c: Math.random() < 0.3 ? '0,229,255' : '255,255,255'
  }));
  let raf;
  function drawIntroStars() {
    if (launch) warp = Math.min(70, warp * 1.1 + 0.3);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2, cy = canvas.height / 2;
    stars.forEach(s => {
      const pz = s.z; s.z -= warp * 2.4;
      if (s.z <= 1) { s.x = (Math.random() - 0.5) * canvas.width * 2; s.y = (Math.random() - 0.5) * canvas.height * 2; s.z = canvas.width; return; }
      const k = 1 - s.z / canvas.width;
      ctx.strokeStyle = `rgba(${s.c},${Math.min(1, k * 1.3)})`;
      ctx.lineWidth = Math.max(0.4, k * 2.2);
      ctx.beginPath();
      ctx.moveTo(cx + s.x / pz * 300, cy + s.y / pz * 300);
      ctx.lineTo(cx + s.x / s.z * 300, cy + s.y / s.z * 300);
      ctx.stroke();
    });
    raf = requestAnimationFrame(drawIntroStars);
  }
  drawIntroStars();

  const fill   = document.getElementById('intro-fill');
  const label  = document.getElementById('intro-label');
  const rocket = document.getElementById('intro-rocket');
  const boot   = document.getElementById('boot');
  const intro  = document.getElementById('intro');
  const msgs   = ['LOADING MODULES', 'INITIALIZING 3D ENGINE', 'RENDERING EXPERIENCE', 'READY'];
  const logs   = [[3, 'mounting universe...'], [25, 'loading 3D engine...'], [50, 'calibrating thrusters...'], [75, 'plotting course: Cairo, Egypt'], [100, 'all systems go. launching']];
  let li = 0, left = false, pct = 0;

  function exit() {
    if (left) return;
    left = true; clearInterval(interval); cancelAnimationFrame(raf);
    intro.style.opacity = '0'; intro.style.transform = 'scale(1.3)';
    setTimeout(() => {
      intro.style.display = 'none';
      document.getElementById('site').style.display = 'block';
      initSite();
    }, 500);
  }
  document.getElementById('intro-skip').addEventListener('click', exit);
  addEventListener('keydown', exit, { once: true });

  const interval = setInterval(() => {
    pct += Math.random() * 4 + 2;
    if (pct >= 100) { pct = 100; clearInterval(interval); }
    fill.style.width = pct + '%';
    rocket.style.left = pct + '%';
    if (!launch) warp = 1 + (pct / 100) * 10;
    while (li < logs.length && pct >= logs[li][0]) {
      const d = document.createElement('div'); d.textContent = '> ' + logs[li][1]; boot.appendChild(d); li++;
    }
    label.textContent = pct < 100 ? msgs[Math.min(3, Math.floor(pct / 25))] + '  ' + Math.floor(pct) + '%' : 'LIFTOFF';
    if (pct === 100) { launch = true; intro.classList.add('go'); setTimeout(exit, 800); }
  }, 40);
})();

// ===================== SITE INIT =====================
function initSite() {
  initCursor();
  initThreeHero();
  initNavbar();
  initReveal();
  initCounters();
  initSkillBars();
  initFX();
}

// ===================== CURSOR =====================
function initCursor() {
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');
  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  function animCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();
}

// ===================== THREE.JS HERO =====================
function initThreeHero() {
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // ---- Stars (background particles) ----
  const starGeo  = new THREE.BufferGeometry();
  const starCount = innerWidth < 768 ? 900 : 1600;
  const starPos   = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 200;
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Points(starGeo, starMat));

  // ---- Floating particles (close ring) ----
  const partGeo  = new THREE.BufferGeometry();
  const partCount = innerWidth < 768 ? 250 : 450;
  const partPos   = new Float32Array(partCount * 3);
  const partVel   = [];
  for (let i = 0; i < partCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 3 + Math.random() * 4;
    partPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    partPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    partPos[i*3+2] = r * Math.cos(phi);
    partVel.push({ speed: 0.002 + Math.random() * 0.003, angle: Math.random() * Math.PI * 2 });
  }
  partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
  const partMat = new THREE.PointsMaterial({
    color: 0x00e5ff, size: 0.06, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const particles = new THREE.Points(partGeo, partMat);
  scene.add(particles);

  // ---- Wireframe Icosahedron (center 3D orb) ----
  const orbGeo = new THREE.IcosahedronGeometry(1.4, 1);
  const orbMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.18
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  scene.add(orb);

  // ---- Inner glowing orb ----
  const innerGeo = new THREE.IcosahedronGeometry(0.9, 2);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.12
  });
  const innerOrb = new THREE.Mesh(innerGeo, innerMat);
  scene.add(innerOrb);

  // ---- Ring ----
  const ringGeo = new THREE.TorusGeometry(2.2, 0.006, 2, 200);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.3 });
  const ring    = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.5;
  scene.add(ring);

  const ring2    = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.004, 2, 200), new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.2 }));
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.z = 0.5;
  scene.add(ring2);

  // ---- Mouse parallax ----
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ---- Resize ----
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---- Animate ----
  let t = 0, heroOn = true;
  new IntersectionObserver(es => { heroOn = es[0].isIntersecting; }).observe(canvas);
  function animate() {
    requestAnimationFrame(animate);
    if (!heroOn || document.hidden) return;
    t += 0.005;

    orb.rotation.x += 0.003;
    orb.rotation.y += 0.005;
    innerOrb.rotation.x -= 0.004;
    innerOrb.rotation.z += 0.003;
    ring.rotation.z  += 0.002;
    ring2.rotation.z -= 0.003;
    particles.rotation.y += 0.001;

    // Breathing scale
    const breathe = 1 + Math.sin(t) * 0.04;
    orb.scale.setScalar(breathe);

    // Parallax tilt
    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
    camera.position.z += (5 + Math.min(window.scrollY / 300, 4) - camera.position.z) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
}

// ===================== NAVBAR SCROLL =====================
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ===================== SCROLL REVEAL =====================
function initReveal() {
  const els = document.querySelectorAll(
    '#about .about-grid, #skills .galaxy, #skills .legend > div, #services .service-card, #projects .service-card, #process .path, #contact .contact-item, .cta-box, .section-title, .section-tag'
  );
  els.forEach(el => el.classList.add('reveal'));

  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => obs.observe(el));
}

// ===================== COUNTERS =====================
function initCounters() {
  const nums = document.querySelectorAll('.stat-num');
  const obs  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target);
      let current  = 0;
      const step   = target / 60;
      const timer  = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
      }, 20);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => obs.observe(n));
}

// ===================== SKILL BARS =====================
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  const obs  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      setTimeout(() => { el.style.width = el.dataset.w + '%'; }, 200);
      obs.unobserve(el);
    });
  }, { threshold: 0.3 });
  bars.forEach(b => obs.observe(b));
}
// ===================== EXTRA FX =====================
function initFX() {
  // scroll progress
  const bar = document.getElementById('progress');
  addEventListener('scroll', () => {
    bar.style.width = (scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
  });

  // typewriter
  const words = ['websites', 'Android apps', 'iOS apps', 'growth campaigns', 'ideas into products'];
  const typed = document.getElementById('typed');
  let wi = 0, ci = 0, del = false;
  (function type() {
    const w = words[wi];
    typed.textContent = w.slice(0, del ? --ci : ++ci);
    let d = del ? 35 : 80;
    if (!del && ci === w.length) { del = true; d = 1400; }
    else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; d = 300; }
    setTimeout(type, d);
  })();

  // tech marquee
  const items = ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Python', 'Java', 'Go', 'Rust', 'Android', 'iOS', 'Git', 'APIs'];
  const track = document.getElementById('track');
  track.innerHTML = [...items, ...items].map(t => `<span>${t}</span><i>✦</i>`).join('');

  // shooting stars
  const neb = document.querySelector('.nebula');
  for (let i = 0; i < 7; i++) {
    const s = document.createElement('span');
    s.className = 'shoot';
    s.style.cssText = `top:${Math.random() * 60}%;left:${30 + Math.random() * 70}%;animation-delay:${i * 2.3 + Math.random() * 3}s`;
    neb.appendChild(s);
  }

  // magnetic buttons
  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
    });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });

  // 3D tilt + spotlight on cards
  document.querySelectorAll('.service-card, .skill-card, .portrait-card, .cta-box, .contact-item').forEach(c => {
    c.classList.add('tilt');
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--mx', x * 100 + '%');
      c.style.setProperty('--my', y * 100 + '%');
      c.style.transform = `perspective(700px) rotateY(${(x - 0.5) * 12}deg) rotateX(${(0.5 - y) * 12}deg) translateY(-4px)`;
    });
    c.addEventListener('mouseleave', () => c.style.transform = '');
  });

  // click star burst
  document.addEventListener('click', e => {
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('i');
      p.className = 'burst';
      const a = (i / 14) * Math.PI * 2, d = 40 + Math.random() * 50;
      p.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  });
}

// ===================== EXTRA FX 2 =====================
(function () {
  const old = initSite;
  window.initSite = initSite = function () {
    old();
    // hero parallax + fade
    const hc = document.getElementById('hero-content');
    addEventListener('scroll', () => {
      if (scrollY < innerHeight) {
        hc.style.transform = `translateY(${scrollY * 0.25}px)`;
        hc.style.opacity = Math.max(0, 1 - scrollY / (innerHeight * 0.8));
      }
    });
    // text scramble on section tags
    const chars = '01<>/{}#$%&*';
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, txt = el.dataset.t; let i = 0;
      const t = setInterval(() => {
        el.textContent = txt.split('').map((c, n) => n < i || c === ' ' ? c : chars[Math.floor(Math.random() * chars.length)]).join('');
        if ((i += 0.6) >= txt.length) { el.textContent = txt; clearInterval(t); }
      }, 35);
      so.unobserve(el);
    }), { threshold: 0.6 });
    document.querySelectorAll('.section-tag').forEach(el => { el.dataset.t = el.textContent; so.observe(el); });
  };
})();

// ===================== ROCKET TRANSITIONS + WOW 3 =====================
const NAMES = { hero: 'Home', about: 'About', skills: 'Skills', process: 'Process', services: 'Services', projects: 'Projects', contact: 'Contact' };
let rocketBusy = false;
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const t = document.getElementById(id);
  if (!t) return;
  e.preventDefault();
  const go = () => window.scrollTo({ top: t.getBoundingClientRect().top + scrollY, behavior: 'instant' });
  if (rocketBusy) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { go(); return; }
  rocketBusy = true;
  const w = document.getElementById('warp');
  w.querySelector('.wlabel').textContent = 'ENTERING  /  ' + (NAMES[id] || id).toUpperCase();
  w.style.visibility = 'visible';
  const anim = w.animate(
    [{ transform: 'translateY(100%)' }, { transform: 'translateY(-100%)' }],
    { duration: 900, easing: 'cubic-bezier(.7,0,.3,1)' }
  );
  setTimeout(go, 440);
  anim.onfinish = () => { w.style.visibility = 'hidden'; rocketBusy = false; history.replaceState(null, '', '#' + id); };
});

function initWow() {
  // side dots navigation
  const ids = ['hero', 'about', 'skills', 'services', 'projects', 'process', 'contact'];
  const dots = document.createElement('nav');
  dots.id = 'dots';
  dots.innerHTML = ids.map(i => `<a href="#${i}" data-n="${NAMES[i]}" aria-label="${NAMES[i]}"></a>`).join('');
  document.body.appendChild(dots);
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { loopRocket(); dots.querySelectorAll('a').forEach(d => d.classList.toggle('on', d.getAttribute('href') === '#' + e.target.id)); }
  }), { rootMargin: '-45% 0px -45% 0px' });
  ids.forEach(i => io.observe(document.getElementById(i)));

  // back-to-top rocket
  const tt = document.querySelector('.to-top');
  addEventListener('scroll', () => tt.classList.toggle('show', scrollY > 700));

  // comet trail (only animates while the mouse is moving)
  if (matchMedia('(hover: none)').matches) return;
  const cv = document.createElement('canvas');
  cv.className = 'trail';
  document.body.appendChild(cv);
  const g = cv.getContext('2d'), pts = [];
  let run = false;
  const rs = () => { cv.width = innerWidth; cv.height = innerHeight; };
  rs(); addEventListener('resize', rs);
  function f() {
    g.clearRect(0, 0, cv.width, cv.height);
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i]; p.a -= 0.035;
      if (p.a <= 0) { pts.splice(i, 1); continue; }
      g.beginPath(); g.arc(p.x, p.y, p.a * 5, 0, 7);
      g.fillStyle = `rgba(${p.a > 0.5 ? '0,229,255' : '124,58,237'},${p.a * 0.55})`; g.fill();
    }
    if (pts.length) requestAnimationFrame(f); else run = false;
  }
  addEventListener('mousemove', e => {
    pts.push({ x: e.clientX, y: e.clientY, a: 1 });
    if (pts.length > 40) pts.shift();
    if (!run) { run = true; requestAnimationFrame(f); }
  });

}
const __prevInit = initSite;
initSite = function () { __prevInit(); initWow(); };

// ===================== SCROLL ROCKET (light) =====================
let flyEl, flyIn, fx = 94, fy = 0, flyRaf = 0, lastY = 0, lastLoop = 0;
function loopRocket() {
  if (!flyIn || performance.now() - lastLoop < 1500) return;
  lastLoop = performance.now();
  flyIn.classList.remove('loop'); void flyIn.offsetWidth; flyIn.classList.add('loop');
}
function initFlyer() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  flyEl = document.createElement('div');
  flyEl.id = 'flyer';
  flyEl.innerHTML = '<div class="fin"><svg viewBox="0 0 60 130" width="30" height="65"><path class="fl" d="M22 92 Q30 140 38 92Z" fill="#ffb347"/><path d="M16 66 L2 98 L18 90Z" fill="#7c3aed"/><path d="M44 66 L58 98 L42 90Z" fill="#7c3aed"/><path d="M30 2 C45 24 47 52 44 92 H16 C13 52 15 24 30 2Z" fill="#e8f0ff"/><path d="M30 2 C37 12 40 20 41 30 H19 C20 20 23 12 30 2Z" fill="#00e5ff"/><circle cx="30" cy="52" r="8" fill="#04040f" stroke="#00e5ff" stroke-width="3"/></svg></div>';
  document.body.appendChild(flyEl);
  flyIn = flyEl.firstChild;
  const frame = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    const tx = 50 + 44 * Math.cos(p * Math.PI * 6);
    const ty = 62 + 14 * Math.sin(p * Math.PI * 9);
    const dx = tx - fx;
    fx += dx * 0.08; fy += (ty - fy) * 0.08;
    const speed = Math.abs(scrollY - lastY); lastY = scrollY;
    flyEl.style.transform = `translate(${fx * innerWidth / 100}px, ${fy * innerHeight / 100}px) rotate(${Math.max(-40, Math.min(40, dx * 5))}deg)`;
    flyEl.style.setProperty('--f', 1 + Math.min(speed / 25, 1.2));
    flyRaf = Math.abs(dx) > 0.05 ? requestAnimationFrame(frame) : 0;
  };
  addEventListener('scroll', () => { if (!flyRaf) flyRaf = requestAnimationFrame(frame); }, { passive: true });
  frame();
}
const __prevInit2 = initSite;
initSite = function () { __prevInit2(); initFlyer(); };

// ===================== SPACE ICONS =====================
(function () {
  const S = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const ICONS = {
    web: S('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.5 3.5 3.5 14.5 0 18M12 3c-3.5 3.5-3.5 14.5 0 18"/>'),
    mobile: S('<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M10.5 18h3"/>'),
    megaphone: S('<path d="M3 10v4h3l8 4V6L6 10H3zM17 9a4 4 0 010 6M19.5 6a8 8 0 010 12"/>'),
    spark: S('<path d="M12 2l2.6 6.4L21 11l-6.4 2.6L12 20l-2.6-6.4L3 11l6.4-2.6z"/>'),
    code: S('<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>'),
    server: S('<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/>'),
    gear: S('<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>'),
    car: S('<path d="M3 16v-4l2-5h14l2 5v4M3 16h18M3 16v3h3v-3M18 16v3h3v-3M6 12h12"/>'),
    rocket: S('<path d="M12 2c4 3 5.5 8 4 13H8c-1.5-5 0-10 4-13zM8 15l-3 4 4-1M16 15l3 4-4-1"/><circle cx="12" cy="9" r="1.6"/>'),
    file: S('<path d="M6 2h8l5 5v15H6zM14 2v5h5M9 13h7M9 17h7"/>'),
    mail: S('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 7l9 7 9-7"/>'),
    chat: S('<path d="M4 5h16v11H10l-6 4z"/><path d="M8 10h8"/>'),
    insta: S('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'),
    fb: S('<path d="M14 8h3V4h-3a4 4 0 00-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>'),
    linkedin: S('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7h.01M12 17v-4a2 2 0 014 0v4M12 10v7"/>')
  };
  document.querySelectorAll('.ico[data-i]').forEach(el => { el.innerHTML = ICONS[el.dataset.i] || ''; });
})();

// ===================== HERO HUD =====================
(function () {
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const tick = () => { clock.textContent = 'CAIRO ' + fmt.format(new Date()); };
  tick(); setInterval(tick, 1000);
  const hero = document.getElementById('hero'), name = document.getElementById('hero-name');
  if (matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', e => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      name.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
    });
    hero.addEventListener('mouseleave', () => { name.style.transform = ''; });
  }
})();

// pause heavy animations when off-screen
(function () {
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('off', !e.isIntersecting)));
  document.querySelectorAll('.galaxy, .marquee').forEach(el => io.observe(el));
})();
