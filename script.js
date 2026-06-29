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

  const stars = Array.from({ length: 500 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.2,
    a: Math.random(),
    s: (Math.random() - 0.5) * 0.008
  }));

  let raf;
  function drawIntroStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.s;
      if (s.a > 1 || s.a < 0) s.s *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0,Math.min(1,s.a))})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(drawIntroStars);
  }
  drawIntroStars();

  const fill  = document.getElementById('intro-fill');
  const label = document.getElementById('intro-label');
  const msgs  = ['LOADING MODULES', 'INITIALIZING 3D ENGINE', 'RENDERING EXPERIENCE', 'READY'];

  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.random() * 3 + 1;
    if (pct >= 100) { pct = 100; clearInterval(interval); }
    fill.style.width = pct + '%';
    const idx = Math.min(3, Math.floor((pct / 100) * 4));
    label.textContent = msgs[idx];
    if (pct === 100) {
      setTimeout(() => {
        cancelAnimationFrame(raf);
        const intro = document.getElementById('intro');
        intro.style.opacity = '0';
        setTimeout(() => {
          intro.style.display = 'none';
          const site = document.getElementById('site');
          site.style.display = 'block';
          initSite();
        }, 800);
      }, 600);
    }
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // ---- Stars (background particles) ----
  const starGeo  = new THREE.BufferGeometry();
  const starCount = 3000;
  const starPos   = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 200;
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.7 });
  scene.add(new THREE.Points(starGeo, starMat));

  // ---- Floating particles (close ring) ----
  const partGeo  = new THREE.BufferGeometry();
  const partCount = 800;
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
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
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
    '#about .about-grid, #services .service-card, #contact .contact-item, .cta-box, .section-title, .section-tag'
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