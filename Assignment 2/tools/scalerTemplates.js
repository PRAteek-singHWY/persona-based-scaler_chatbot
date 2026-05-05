/**
 * scalerTemplates.js
 * Returns pre-built HTML sections for the Scaler Academy clone.
 * The agent calls getScalerTemplate(section) to retrieve each chunk,
 * then assembles and writes the final file — keeping LLM tokens low.
 *
 * Sections: "header" | "hero" | "features" | "footer" | "styles" | "scripts"
 */

export function getScalerTemplate(section = "") {
  const map = {
    styles: STYLES,
    header: HEADER,
    hero:   HERO,
    features: FEATURES,
    footer: FOOTER,
    scripts: SCRIPTS,
  };

  const key = section.toLowerCase().trim();
  if (!map[key]) {
    return `Unknown section "${section}". Valid sections: ${Object.keys(map).join(", ")}`;
  }
  return map[key];
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const STYLES = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --orange:   #F15A23;
    --orange-d: #D94E1A;
    --navy:     #0D0D1A;
    --navy2:    #16213E;
    --navy3:    #0F3460;
    --white:    #FFFFFF;
    --gray:     #A0AEC0;
    --gray-l:   #F7F8FA;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--navy);
    color: var(--white);
    line-height: 1.6;
  }

  a { text-decoration: none; color: inherit; }

  /* ── NAV ── */
  .nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 5%; height: 68px;
    background: rgba(13,13,26,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .nav-logo { display: flex; align-items: center; gap: 10px; }
  .nav-logo svg { width: 32px; height: 32px; }
  .nav-logo span { font-size: 1.3rem; font-weight: 800; letter-spacing: -0.5px; }
  .nav-logo .accent { color: var(--orange); }

  .nav-links { display: flex; gap: 28px; list-style: none; }
  .nav-links a {
    font-size: 0.85rem; font-weight: 500; color: var(--gray);
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--white); }

  .nav-right { display: flex; align-items: center; gap: 12px; }
  .btn { display: inline-flex; align-items: center; justify-content: center;
    border-radius: 8px; font-weight: 600; cursor: pointer;
    transition: all 0.2s; border: none; font-family: inherit; }
  .btn-ghost {
    background: transparent; color: var(--white);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 8px 18px; font-size: 0.85rem;
  }
  .btn-ghost:hover { border-color: var(--orange); color: var(--orange); }
  .btn-orange {
    background: var(--orange); color: var(--white);
    padding: 10px 22px; font-size: 0.88rem;
    box-shadow: 0 4px 14px rgba(241,90,35,0.35);
  }
  .btn-orange:hover { background: var(--orange-d); transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(241,90,35,0.45); }
  .btn-outline {
    background: transparent; color: var(--white);
    border: 1.5px solid rgba(255,255,255,0.35);
    padding: 10px 22px; font-size: 0.88rem;
  }
  .btn-outline:hover { border-color: var(--white); }

  /* ── HERO ── */
  .hero {
    min-height: 92vh; display: flex; align-items: center;
    padding: 80px 5% 60px;
    background: linear-gradient(135deg, #0D0D1A 0%, #16213E 50%, #0F3460 100%);
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 60% at 60% 40%, rgba(241,90,35,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-inner { max-width: 680px; position: relative; z-index: 1; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(241,90,35,0.12); border: 1px solid rgba(241,90,35,0.3);
    border-radius: 100px; padding: 6px 16px;
    font-size: 0.78rem; font-weight: 600; color: var(--orange);
    letter-spacing: 0.5px; margin-bottom: 28px;
    animation: fadeInDown 0.6s ease both;
  }
  .hero-badge span { width: 6px; height: 6px; border-radius: 50%;
    background: var(--orange); animation: pulse 1.5s infinite; }
  .hero h1 {
    font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 900;
    line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 22px;
    animation: fadeInUp 0.6s 0.1s ease both;
  }
  .hero h1 em { font-style: normal; color: var(--orange); }
  .hero-sub {
    font-size: 1.05rem; color: var(--gray); max-width: 560px;
    margin-bottom: 36px; line-height: 1.7;
    animation: fadeInUp 0.6s 0.2s ease both;
  }
  .hero-cta { display: flex; gap: 14px; flex-wrap: wrap;
    animation: fadeInUp 0.6s 0.3s ease both; }
  .hero-stats {
    display: flex; gap: 40px; margin-top: 52px; flex-wrap: wrap;
    animation: fadeInUp 0.6s 0.4s ease both;
  }
  .stat-num { font-size: 2rem; font-weight: 800; color: var(--white); }
  .stat-num span { color: var(--orange); }
  .stat-label { font-size: 0.78rem; color: var(--gray); margin-top: 2px; }

  /* ── FEATURES ── */
  .features {
    padding: 90px 5%;
    background: linear-gradient(180deg, #0F1930 0%, #0D0D1A 100%);
  }
  .section-tag {
    font-size: 0.75rem; font-weight: 700; letter-spacing: 2px;
    color: var(--orange); text-transform: uppercase; margin-bottom: 14px;
  }
  .section-title {
    font-size: clamp(1.8rem, 3.5vw, 2.6rem); font-weight: 800;
    line-height: 1.2; letter-spacing: -0.5px; margin-bottom: 14px;
  }
  .section-sub { color: var(--gray); max-width: 520px; margin-bottom: 56px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap: 24px; }
  .card {
    background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 32px 28px;
    transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
  }
  .card:hover { transform: translateY(-6px);
    border-color: rgba(241,90,35,0.3);
    box-shadow: 0 16px 40px rgba(241,90,35,0.1); }
  .card-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: rgba(241,90,35,0.12); display: flex;
    align-items: center; justify-content: center;
    font-size: 1.5rem; margin-bottom: 20px;
  }
  .card h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 10px; }
  .card p  { font-size: 0.88rem; color: var(--gray); line-height: 1.65; }

  /* ── FOOTER ── */
  .footer {
    background: #08080F; border-top: 1px solid rgba(255,255,255,0.06);
    padding: 70px 5% 30px;
  }
  .footer-top { display: grid;
    grid-template-columns: 1.8fr repeat(4, 1fr); gap: 48px; margin-bottom: 52px; }
  .footer-brand p { font-size: 0.85rem; color: var(--gray);
    margin: 16px 0 20px; line-height: 1.7; max-width: 280px; }
  .footer-brand address { font-style: normal; font-size: 0.78rem; color: var(--gray); }
  .footer-col h4 { font-size: 0.8rem; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 18px; }
  .footer-col ul { list-style: none; }
  .footer-col li { margin-bottom: 12px; }
  .footer-col a { font-size: 0.87rem; color: var(--gray);
    transition: color 0.2s; }
  .footer-col a:hover { color: var(--orange); }
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 24px; display: flex;
    justify-content: space-between; align-items: center; flex-wrap: gap;
  }
  .footer-bottom p { font-size: 0.8rem; color: var(--gray); }
  .socials { display: flex; gap: 12px; }
  .social-link {
    width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; color: var(--gray);
    transition: all 0.2s;
  }
  .social-link:hover { border-color: var(--orange); color: var(--orange); }

  /* ── ANIMATIONS ── */
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .nav-links { display: none; }
    .footer-top { grid-template-columns: 1fr 1fr; }
    .hero-stats { gap: 24px; }
  }
</style>
`.trim();

// ─── HEADER ──────────────────────────────────────────────────────────────────
const HEADER = `
<header>
  <nav class="nav" id="main-nav">
    <div class="nav-logo">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#F15A23"/>
        <path d="M8 20L16 12L24 20" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11 23L16 18L21 23" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Scaler<span class="accent"> Academy</span></span>
    </div>

    <ul class="nav-links">
      <li><a href="#hero">MASTERCLASS</a></li>
      <li><a href="#features">AI LABS</a></li>
      <li><a href="#features">ALUMNI</a></li>
      <li><a href="#features">Curriculum</a></li>
      <li><a href="#features">Projects</a></li>
      <li><a href="#features">Instructors</a></li>
      <li><a href="#features">Reviews</a></li>
      <li><a href="#footer">FAQ</a></li>
    </ul>

    <div class="nav-right">
      <button class="btn btn-ghost" onclick="alert('Login coming soon!')">Login</button>
      <button class="btn btn-orange" id="nav-cta" onclick="alert('Our advisor will call you shortly!')">
        Request A Callback
      </button>
    </div>
  </nav>
</header>
`.trim();

// ─── HERO ────────────────────────────────────────────────────────────────────
const HERO = `
<section class="hero" id="hero">
  <div class="hero-inner">
    <div class="hero-badge">
      <span></span> AI-INTEGRATED CURRICULUM · 2026
    </div>

    <h1>Modern Software<br>and <em>AI Engineering.</em></h1>

    <p class="hero-sub">
      Software Engineering hasn't changed. What it takes to be great at it has.
      Stronger fundamentals, faster delivery, and AI fluency built into how you
      learn — not just an add-on.
    </p>

    <div class="hero-cta">
      <button class="btn btn-orange" onclick="alert('Brochure download triggered!')">
        ⬇ Download Brochure
      </button>
      <button class="btn btn-outline" onclick="alert('Connecting you to an advisor...')">
        Talk to an Advisor →
      </button>
    </div>

    <div class="hero-stats">
      <div>
        <div class="stat-num">37<span>K+</span></div>
        <div class="stat-label">Learners Enrolled</div>
      </div>
      <div>
        <div class="stat-num">900<span>+</span></div>
        <div class="stat-label">Hiring Partners</div>
      </div>
      <div>
        <div class="stat-num">163<span>%</span></div>
        <div class="stat-label">Growth in AI Jobs</div>
      </div>
      <div>
        <div class="stat-num">₹206<span>K</span></div>
        <div class="stat-label">Avg AI Eng. Salary</div>
      </div>
    </div>
  </div>
</section>
`.trim();

// ─── FEATURES ────────────────────────────────────────────────────────────────
const FEATURES = `
<section class="features" id="features">
  <div class="section-tag">WHY SCALER</div>
  <h2 class="section-title">AI didn't replace engineers.<br>It raised the bar.</h2>
  <p class="section-sub">
    The roles being created now require stronger fundamentals, faster execution,
    and the ability to build with AI.
  </p>

  <div class="cards">
    <div class="card">
      <div class="card-icon">🧠</div>
      <h3>AI-Integrated Curriculum</h3>
      <p>AI built into every module — not bolted on after. Every step runs on a Prompt → Review → Own workflow.</p>
    </div>
    <div class="card">
      <div class="card-icon">🏗️</div>
      <h3>Fundamentals First</h3>
      <p>Foundations that last. DSA, System Design, and Backend Architecture taught by ICPC finalists and ex-FAANG engineers.</p>
    </div>
    <div class="card">
      <div class="card-icon">♾️</div>
      <h3>Lifelong Access</h3>
      <p>Curriculum updates forever — no extra cost. Live sessions, recordings, and future modules included.</p>
    </div>
    <div class="card">
      <div class="card-icon">🎯</div>
      <h3>AI Mock Interviews</h3>
      <p>Practice with avatars trained on real SWE interview formats across DSA, LLD, and System Design.</p>
    </div>
    <div class="card">
      <div class="card-icon">🚀</div>
      <h3>AI-Driven Projects</h3>
      <p>Every project goes from problem statement to deployed, AI-integrated product with end-to-end ownership.</p>
    </div>
    <div class="card">
      <div class="card-icon">🤝</div>
      <h3>Career Support</h3>
      <p>Resume review, mock interviews, placement assistance, and access to 1,00,000+ Scaler alumni network.</p>
    </div>
  </div>
</section>
`.trim();

// ─── FOOTER ──────────────────────────────────────────────────────────────────
const FOOTER = `
<footer class="footer" id="footer">
  <div class="footer-top">
    <div class="footer-brand">
      <div class="nav-logo">
        <svg viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#F15A23"/>
          <path d="M8 20L16 12L24 20" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11 23L16 18L21 23" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Scaler<span class="accent"> Academy</span></span>
      </div>
      <p>Master DSA, System Design, Full Stack & AI Engineering with industry mentors. 12-month AI-integrated program.</p>
      <address>5th Floor, Surya Park II, Electronic City Phase 1,<br>Bengaluru, Karnataka 560100</address>
    </div>

    <div class="footer-col">
      <h4>Explore</h4>
      <ul>
        <li><a href="#">Modern Software & AI Eng.</a></li>
        <li><a href="#">Data Science & ML</a></li>
        <li><a href="#">DevOps & Cloud</a></li>
        <li><a href="#">Advanced AI & ML</a></li>
        <li><a href="#">IIT Roorkee AI Cert.</a></li>
        <li><a href="#">Masters in AI & ML</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Resources</h4>
      <ul>
        <li><a href="#">Alumni Reviews</a></li>
        <li><a href="#">Blog</a></li>
        <li><a href="#">Contact Us</a></li>
        <li><a href="#">Careers</a></li>
        <li><a href="#">Free Courses</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Company</h4>
      <ul>
        <li><a href="#">About Us</a></li>
        <li><a href="#">Become a Mentor</a></li>
        <li><a href="#">Become a TA</a></li>
        <li><a href="#">Hire From Us</a></li>
        <li><a href="#">Terms of Use</a></li>
        <li><a href="#">Privacy Policy</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4>Trending</h4>
      <ul>
        <li><a href="#">Full Stack Developer</a></li>
        <li><a href="#">Machine Learning</a></li>
        <li><a href="#">DSA Course</a></li>
        <li><a href="#">Web Development</a></li>
        <li><a href="#">System Design</a></li>
      </ul>
    </div>
  </div>

  <div class="footer-bottom">
    <p>©️ 2026 InterviewBit Software Services Pvt. Ltd. All Rights Reserved.</p>
    <div class="socials">
      <a class="social-link" href="#" title="YouTube">▶</a>
      <a class="social-link" href="#" title="LinkedIn">in</a>
      <a class="social-link" href="#" title="Twitter">𝕏</a>
      <a class="social-link" href="#" title="Instagram">📷</a>
      <a class="social-link" href="#" title="Facebook">f</a>
    </div>
  </div>
</footer>
`.trim();

// ─── SCRIPTS ─────────────────────────────────────────────────────────────────
const SCRIPTS = `
<script>
  // Sticky nav shadow on scroll
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('main-nav');
    if (window.scrollY > 10) {
      nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
    } else {
      nav.style.boxShadow = 'none';
    }
  });

  // Animate cards on scroll (Intersection Observer)
  const cards = document.querySelectorAll('.card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = \`opacity 0.5s \${i * 0.08}s ease, transform 0.5s \${i * 0.08}s ease\`;
    observer.observe(card);
  });
</script>
`.trim();
