/**
 * Profile Card — script.js
 * Handles: live epoch time, control-panel reactivity, avatar upload/URL.
 * Pure vanilla JS, no dependencies. Runs after HTML is parsed.
 */
(function () {
  'use strict';

  /* ── Element refs ──────────────────────────────────────────────────── */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelector(sel);

  const els = {
    /* Control panel inputs */
    nameInput: $('nameInput'),
    roleInput: $('roleInput'),
    bioInput: $('bioInput'),
    avatarUrlInput: $('avatarUrlInput'),
    avatarFileInput: $('avatarFileInput'),
    twitterInput: $('twitterInput'),
    linkedinInput: $('linkedinInput'),
    githubInput: $('githubInput'),
    websiteInput: $('websiteInput'),

    /* Card display elements */
    card: $$('[data-testid="test-profile-card"]'),
    profileName: $('profileName'),
    profileBio: $('profileBio'),
    profileRole: $('profileRole'),
    profileAvatar: $('profileAvatar'),
    profileTime: $('profileTime'),

    /* Splash elements */
    splashScreen: $('splashScreen'),
    splashProgressFill: $('splashProgressFill'),
    splashProgressText: $('splashProgressText'),

    /* Social links */
    socialTwitter: $$('[data-testid="test-user-social-twitter"]'),
    socialGitHub: $$('[data-testid="test-user-social-github"]'),
    socialLinkedIn: $$('[data-testid="test-user-social-linkedin"]'),
    socialWebsite: $$('[data-testid="test-user-social-website"]'),
  };

  /* ── Avatar fallback ────────────────────────────────────────────────── */
  const defaultAvatarSrc = els.profileAvatar ? els.profileAvatar.src : '';

  /* ── Splash sequence ────────────────────────────────────────────────── */
  function runSplashSequence() {
    if (!els.splashScreen || !els.splashProgressFill || !els.splashProgressText) {
      document.body.classList.remove('is-splash-active');
      document.body.classList.add('is-splash-complete');
      return;
    }

    const splashDurationMs = 1500;
    const transitionOutMs = 520;
    const startTs = performance.now();

    function step(nowTs) {
      const progress = Math.min((nowTs - startTs) / splashDurationMs, 1);
      const pct = Math.round(progress * 100);

      els.splashProgressFill.style.transform = `scaleX(${progress})`;
      els.splashProgressText.textContent = `${pct}%`;

      if (progress < 1) {
        requestAnimationFrame(step);
        return;
      }

      document.body.classList.add('is-transitioning-in');

      window.setTimeout(function () {
        document.body.classList.remove('is-splash-active');
        document.body.classList.remove('is-transitioning-in');
        document.body.classList.add('is-splash-complete');
      }, transitionOutMs);
    }

    requestAnimationFrame(step);
  }

  /* ── URL sanitiser ──────────────────────────────────────────────────── */
  function sanitizeUrl(raw) {
    if (!raw) return '';
    try {
      const u = new URL(raw);
      return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '';
    } catch { return ''; }
  }

  /* ── Text content update ────────────────────────────────────────────── */
  function updateText() {
    const name = els.nameInput.value.trim() || 'Aalo Lawrence Baridomale';
    const role = els.roleInput.value.trim() || 'Cybersecurity Expert & Frontend Engineer';
    const bio = els.bioInput.value.trim() || 'A results-driven Cybersecurity Specialist and Frontend Developer with a strong focus on building secure, user-centric digital experiences. I anticipate threats and bolster application resilience. On the front end, I specialize in responsive, high-performance interfaces that balance aesthetics, functionality, and seamless, secure user interaction.';

    els.profileName.textContent = name;
    els.profileRole.textContent = role;
    els.profileBio.textContent = bio;
    els.profileAvatar.alt = `${name} — professional headshot`;
    els.card.setAttribute('aria-label', `Profile card for ${name}`);
  }

  /* ── Social link update ─────────────────────────────────────────────── */
  function setSocialLink(anchor, raw) {
    const url = sanitizeUrl(raw);
    if (url) {
      anchor.href = url;
      anchor.removeAttribute('aria-disabled');
      anchor.style.opacity = '';
      anchor.style.pointerEvents = '';
    } else {
      anchor.href = '#';
      anchor.setAttribute('aria-disabled', 'true');
      anchor.style.opacity = '0.4';
      anchor.style.pointerEvents = 'none';
    }
  }

  function updateSocials() {
    setSocialLink(els.socialTwitter, els.twitterInput.value.trim());
    setSocialLink(els.socialGitHub, els.githubInput.value.trim());
    setSocialLink(els.socialLinkedIn, els.linkedinInput.value.trim());
    setSocialLink(els.socialWebsite, els.websiteInput.value.trim());
  }

  /* ── Avatar URL update ──────────────────────────────────────────────── */
  function updateAvatarFromUrl() {
    const url = sanitizeUrl(els.avatarUrlInput.value.trim());
    els.profileAvatar.src = url || defaultAvatarSrc;
  }

  /* ── Epoch time ticker ──────────────────────────────────────────────── */
  function tick() {
    const now = String(Date.now());
    if (els.profileTime.textContent !== now) {
      els.profileTime.textContent = now;
    }
  }

  /* ── Avatar file upload ─────────────────────────────────────────────── */
  els.avatarFileInput.addEventListener('change', function () {
    const file = this.files && this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target.result === 'string') {
        els.profileAvatar.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  });

  /* Fallback if avatar src errors (URL unreachable etc.) */
  els.profileAvatar.addEventListener('error', function () {
    // import the first tsask to thmain reposoroty
    if (this.src !== defaultAvatarSrc) this.src = defaultAvatarSrc;
  });

  /* ── Control panel live binding ─────────────────────────────────────── */
  const profileControls = document.getElementById('profileControls');

  profileControls.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  profileControls.addEventListener('input', function (e) {
    const t = e.target;
    if (t === els.nameInput || t === els.roleInput || t === els.bioInput) updateText();
    if (t === els.twitterInput || t === els.linkedinInput || t === els.githubInput || t === els.websiteInput) updateSocials();
    if (t === els.avatarUrlInput) updateAvatarFromUrl();
  });

  /* ── Initialise ─────────────────────────────────────────────────────── */
  updateText();
  updateSocials();
  updateAvatarFromUrl();
  tick();
  runSplashSequence();

  /* Tick every 750 ms — a balance between real-time feel and aria-live
     reader churn on polite live regions.                                 */
  setInterval(tick, 750);

})();

/* ==========================================================================
   3D TILT / PARALLAX HOVER
   Smooth card tilt based on mouse position using requestAnimationFrame.
   ========================================================================== */
(function () {
  'use strict';

  const card = document.querySelector('[data-testid="test-profile-card"]');
  if (!card) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let isHovering = false;
  const maxTilt = 8; // degrees

  /* Track mouse movement */
  document.addEventListener('mousemove', function (e) {
    if (!isHovering) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    /* Calculate normalized position (-1 to 1) */
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    /* Convert to rotation angles */
    targetRotateX = -y * maxTilt;
    targetRotateY = x * maxTilt;

    /* Update glare position (--glare-x, --glare-y) */
    const glareX = (x + 1) * 50;
    const glareY = (y + 1) * 50;

    /* Professional Conditional Check:
       Determine theme mode to potentially apply specific glare logic.
       The actual visibility is handled via CSS [data-theme], but we
       sync the position variables here. */
    const theme = document.documentElement.getAttribute('data-theme');
    const isLightMode = (theme === 'glass' || theme === 'editorial');

    if (isLightMode) {
      /* Specific logic for light mode glare if needed in future */
    } else {
      /* Specific logic for dark mode glare if needed in future */
    }

    card.style.setProperty('--glare-x', `${glareX}%`);
    card.style.setProperty('--glare-y', `${glareY}%`);
  });

  card.addEventListener('mouseenter', function () {
    isHovering = true;
  });

  card.addEventListener('mouseleave', function () {
    isHovering = false;
    targetRotateX = 0;
    targetRotateY = 0;
  });

  /* Smooth animation loop using requestAnimationFrame */
  function animateTilt() {
    /* Lerp (linear interpolation) for smooth damping */
    currentRotateX += (targetRotateX - currentRotateX) * 0.15;
    currentRotateY += (targetRotateY - currentRotateY) * 0.15;

    card.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;

    /* Update parallax offsets (inverse of rotation for 'float' effect) */
    card.style.setProperty('--p-x', `${currentRotateY * -1}px`);
    card.style.setProperty('--p-y', `${currentRotateX * 1}px`);

    requestAnimationFrame(animateTilt);
  }

  animateTilt();

})();

/* ==========================================================================
   THEME MANAGER
   Persists selection in localStorage. Applies data-theme on <html>.
   Wires the FAB toggle and outside-click-to-close.
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'profile-card-theme';
  const VALID_THEMES = ['dark', 'cyber', 'glass', 'editorial'];
  const DEFAULT = 'dark';

  const html = document.documentElement;
  const fab = document.getElementById('themeToggleBtn');
  const panel = document.getElementById('themePanel');
  const switcher = document.getElementById('themeSwitcher');
  const opts = document.querySelectorAll('.theme-opt[data-theme-pick]');

  /* ── Apply theme ──────────────────────────────────────────────────────── */
  function applyTheme(theme) {
    if (!VALID_THEMES.includes(theme)) theme = DEFAULT;

    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    /* Sync aria-pressed on every option button */
    opts.forEach(function (btn) {
      var active = btn.dataset.themePick === theme;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  /* ── Toggle panel ────────────────────────────────────────────────────── */
  function openPanel() {
    panel.removeAttribute('hidden');
    fab.setAttribute('aria-expanded', 'true');
    /* Re-trigger slide-in animation */
    panel.style.animation = 'none';
    panel.offsetHeight;            /* reflow */
    panel.style.animation = '';
  }

  function closePanel() {
    panel.setAttribute('hidden', '');
    fab.setAttribute('aria-expanded', 'false');
  }

  function togglePanel() {
    panel.hasAttribute('hidden') ? openPanel() : closePanel();
  }

  /* ── Wire events ─────────────────────────────────────────────────────── */
  fab.addEventListener('click', function (e) {
    e.stopPropagation();
    togglePanel();
  });

  opts.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyTheme(btn.dataset.themePick);
      closePanel();
    });
  });

  /* Close when clicking outside the switcher */
  document.addEventListener('click', function (e) {
    if (!switcher.contains(e.target)) closePanel();
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
  });

  /* ── Initialise from localStorage (before first paint via data-theme on
     <html> set inline, but we still sync button states) ────────────────── */
  var saved = localStorage.getItem(STORAGE_KEY) || DEFAULT;
  applyTheme(saved);

})();

/* ==========================================================================
   QR CODE MANAGER
   Generates a QR code for the current URL using a public API.
   Handles modal state and URL copying.
   ========================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const els = {
    shareBtn: $('viewQrBtn'),
    qrModal: $('qrModal'),
    qrOverlay: $('qrOverlay'),
    qrClose: $('closeQrBtn'),
    qrContainer: $('qrCodeContainer'),
    qrUrl: $('qrUrlText'),
    copyBtn: $('copyUrlBtn')
  };

  if (!els.shareBtn || !els.qrModal) return;

  /* ── Generate & Open ─────────────────────────────────────────────────── */
  function openQR() {
    const prodUrl = 'https://stage1b-testable-profile-card.vercel.app/';
    const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(prodUrl)}&bgcolor=ffffff&color=000000&margin=10`;
    
    els.qrContainer.innerHTML = `<img src="${qrApi}" alt="Profile QR Code" loading="lazy" />`;
    els.qrUrl.textContent = prodUrl;
    els.qrModal.removeAttribute('hidden');
    
    /* Accessibility */
    els.qrClose.focus();
  }

  function closeQR() {
    els.qrModal.setAttribute('hidden', '');
    els.shareBtn.focus();
  }

  /* ── Copy URL ────────────────────────────────────────────────────────── */
  async function copyUrl() {
    const prodUrl = 'https://stage1b-testable-profile-card.vercel.app/';
    try {
      await navigator.clipboard.writeText(prodUrl);
      const originalSvg = els.copyBtn.innerHTML;
      
      /* Success feedback */
      els.copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      els.copyBtn.style.color = 'var(--emerald)';
      
      setTimeout(() => {
        els.copyBtn.innerHTML = originalSvg;
        els.copyBtn.style.color = '';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  /* ── Wire events ─────────────────────────────────────────────────────── */
  els.shareBtn.addEventListener('click', openQR);
  els.qrClose.addEventListener('click', closeQR);
  els.qrOverlay.addEventListener('click', closeQR);
  els.copyBtn.addEventListener('click', copyUrl);

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.qrModal.hasAttribute('hidden')) closeQR();
  });

})();

/* ==========================================================================
   SHARE MENU MANAGER
   Handles the sharing options menu (QR & PDF).
   ========================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const switcher = $('shareSwitcher');
  const toggleBtn = $('shareToggleBtn');
  const panel = $('sharePanel');
  const qrBtn = $('viewQrBtn');
  const pdfBtn = $('downloadPdfBtn');

  if (!switcher || !toggleBtn) return;

  function openMenu() {
    panel.removeAttribute('hidden');
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    panel.setAttribute('hidden', '');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    panel.hasAttribute('hidden') ? openMenu() : closeMenu();
  }

  /* ── Events ──────────────────────────────────────────────────────────── */
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  qrBtn.addEventListener('click', () => {
    closeMenu();
    // openQR is handled by the other IIFE's listener on this button
  });

  pdfBtn.addEventListener('click', () => {
    closeMenu();
    window.print();
  });

  /* Close when clicking outside */
  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) closeMenu();
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

})();


