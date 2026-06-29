/* ===== NAV SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ===== BURGER MENU ===== */
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ===== SCROLL ANIMATIONS ===== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

/* ===== PARTICLE CANVAS ===== */
(function () {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6,182,212,${p.alpha})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    // draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(6,182,212,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ===== GAUGE CHARTS ===== */
function drawGauge(canvas, value, color) {
  const ctx = canvas.getContext('2d');
  const cx = 60, cy = 60, r = 48;
  const startAngle = Math.PI * 0.75;
  const fullAngle = Math.PI * 1.5;
  const endAngle = startAngle + (value / 100) * fullAngle;

  ctx.clearRect(0, 0, 120, 120);

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, startAngle + fullAngle);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Fill
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, color);
  grad.addColorStop(1, color + 'aa');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function initGauges() {
  document.querySelectorAll('.gauge-item').forEach(item => {
    const canvas = item.querySelector('.gauge-canvas');
    const value = parseFloat(item.dataset.value);
    const color = item.dataset.color;
    drawGauge(canvas, value, color);
  });
}
// Delay to ensure DOM is ready
window.addEventListener('load', initGauges);

/* ===== TABS ===== */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + tab).classList.add('active');
  });
});

/* ===== SLIDER DISPLAY ===== */
function updateSlider(inputId, displayId) {
  const val = document.getElementById(inputId).value;
  const display = document.getElementById(displayId);
  if (inputId === 'salary') display.textContent = '$' + parseInt(val).toLocaleString();
  else if (inputId === 'experience') display.textContent = val + ' years';
  else if (inputId === 'projects') display.textContent = val + ' projects';
}

/* ===== COPY CODE ===== */
function copyCode() {
  const code = document.querySelector('.code-block').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

/* ===== DEMO PREDICTION (heuristic simulation) ===== */
const HIGH_VALUE_SKILLS = ['python', 'machine learning', 'tensorflow', 'pytorch', 'sql', 'deep learning', 'nlp', 'data science', 'ethical hacking', 'kubernetes', 'docker'];

function runPrediction() {
  const btn = document.getElementById('predictBtn');
  btn.textContent = 'Analyzing...';
  btn.disabled = true;

  setTimeout(() => {
    const skills = document.getElementById('skills').value.toLowerCase();
    const exp = parseInt(document.getElementById('experience').value);
    const education = document.getElementById('education').value;
    const certs = document.getElementById('certifications').value;
    const role = document.getElementById('jobrole').value;
    const salary = parseInt(document.getElementById('salary').value);
    const projects = parseInt(document.getElementById('projects').value);

    // Score each factor
    let score = 0.3; // base
    let factors = [];

    // Experience
    const expScore = Math.min(exp / 10, 1) * 0.25;
    score += expScore;
    factors.push({ label: 'Experience', score: Math.round(expScore * 400) + '/100' });

    // Skills
    const skillList = skills.split(',').map(s => s.trim());
    const matchedSkills = skillList.filter(s => HIGH_VALUE_SKILLS.some(h => s.includes(h))).length;
    const skillScore = Math.min(matchedSkills / 4, 1) * 0.25;
    score += skillScore;
    factors.push({ label: 'Skill Match', score: matchedSkills + ' high-value skills' });

    // Education
    const eduMap = { 'PhD': 0.08, 'M.Tech': 0.07, 'MBA': 0.06, 'B.Tech': 0.05, 'BBA': 0.03, 'High School': 0 };
    const eduScore = eduMap[education] || 0.04;
    score += eduScore;
    factors.push({ label: 'Education', score: education });

    // Certs
    const certScore = certs !== 'None' ? 0.05 : 0;
    score += certScore;
    factors.push({ label: 'Certifications', score: certs });

    // Projects
    const projScore = Math.min(projects / 15, 1) * 0.12;
    score += projScore;
    factors.push({ label: 'Projects', score: projects + ' projects' });

    // Salary expectation penalty
    const salaryPenalty = salary > 120000 ? -0.08 : salary > 90000 ? -0.03 : 0;
    score += salaryPenalty;
    factors.push({ label: 'Salary Fit', score: salary > 120000 ? '⚠ High' : '✓ Reasonable' });

    score = Math.max(0.05, Math.min(0.99, score));
    const hired = score >= 0.55;
    const pct = Math.round(score * 100);

    // Show results
    document.getElementById('resultPlaceholder').classList.add('hidden');
    const content = document.getElementById('resultContent');
    content.classList.remove('hidden');

    const verdict = document.getElementById('resultVerdict');
    verdict.textContent = hired ? '✅ Likely Hired' : '❌ Likely Rejected';
    verdict.className = 'result-verdict ' + (hired ? 'hired' : 'rejected');

    const probBar = document.getElementById('probBar');
    probBar.style.width = '0%';
    setTimeout(() => probBar.style.width = pct + '%', 50);

    const probPct = document.getElementById('probPct');
    probPct.textContent = pct + '%';

    const factorsEl = document.getElementById('resultFactors');
    factorsEl.innerHTML = '<div style="font-size:0.82rem;font-weight:600;color:#94a3b8;margin-bottom:4px">Score Breakdown</div>' +
      factors.map(f => `<div class="factor-item"><span class="factor-label">${f.label}</span><span class="factor-score">${f.score}</span></div>`).join('');

    btn.textContent = 'Run Prediction →';
    btn.disabled = false;
  }, 900);
}
