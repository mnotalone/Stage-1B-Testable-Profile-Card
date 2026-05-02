/**
 * Profile Card — script.js
 * Handles: live epoch time, control-panel reactivity, avatar upload/URL.
 * Pure vanilla JS, no dependencies. Runs after HTML is parsed.
 */
(function () {
  'use strict';

  /* ── Element refs ──────────────────────────────────────────────────── */
  const $  = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelector(sel);

  const els = {
    /* Control panel inputs */
    nameInput:       $('nameInput'),
    roleInput:       $('roleInput'),
    bioInput:        $('bioInput'),
    avatarUrlInput:  $('avatarUrlInput'),
    avatarFileInput: $('avatarFileInput'),
    twitterInput:    $('twitterInput'),
    linkedinInput:   $('linkedinInput'),
    githubInput:     $('githubInput'),
    websiteInput:    $('websiteInput'),
    
    /* Card display elements */
    card:         $$('[data-testid="test-profile-card"]'),
    profileName:  $('profileName'),
    profileBio:   $('profileBio'),
    profileRole:  $('profileRole'),
    profileAvatar:$('profileAvatar'),
    profileTime:  $('profileTime'),
    
    /* Splash elements */
    splashScreen:       $('splashScreen'),
    splashProgressFill: $('splashProgressFill'),
    splashProgressText: $('splashProgressText'),

    /* Social links */
    socialTwitter:  $$('[data-testid="test-user-social-twitter"]'),
    socialGitHub:   $$('[data-testid="test-user-social-github"]'),
    socialLinkedIn: $$('[data-testid="test-user-social-linkedin"]'),
    socialWebsite:  $$('[data-testid="test-user-social-website"]'),
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
    const bio  = els.bioInput.value.trim()  || 'A results-driven Cybersecurity Specialist and Frontend Developer with a strong focus on building secure, user-centric digital experiences. I anticipate threats and bolster application resilience. On the front end, I specialize in responsive, high-performance interfaces that balance aesthetics, functionality, and seamless, secure user interaction.';

    els.profileName.textContent  = name;
    els.profileRole.textContent  = role;
    els.profileBio.textContent   = bio;
    els.profileAvatar.alt        = `${name} — professional headshot`;
    els.card.setAttribute('aria-label', `Profile card for ${name}`);
  }

  /* ── Social link update ─────────────────────────────────────────────── */
  function setSocialLink(anchor, raw) {
    const url = sanitizeUrl(raw);
    if (url) {
      anchor.href = url;
      anchor.removeAttribute('aria-disabled');
      anchor.style.opacity        = '';
      anchor.style.pointerEvents  = '';
    } else {
      anchor.href = '#';
      anchor.setAttribute('aria-disabled', 'true');
      anchor.style.opacity        = '0.4';
      anchor.style.pointerEvents  = 'none';
    }
  }

  function updateSocials() {
    setSocialLink(els.socialTwitter,  els.twitterInput.value.trim());
    setSocialLink(els.socialGitHub,   els.githubInput.value.trim());
    setSocialLink(els.socialLinkedIn, els.linkedinInput.value.trim());
    setSocialLink(els.socialWebsite,  els.websiteInput.value.trim());
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
   THEME MANAGER
   Persists selection in localStorage. Applies data-theme on <html>.
   Wires the FAB toggle and outside-click-to-close.
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY  = 'profile-card-theme';
  const VALID_THEMES = ['dark', 'cyber', 'glass', 'editorial'];
  const DEFAULT      = 'dark';

  const html       = document.documentElement;
  const fab        = document.getElementById('themeToggleBtn');
  const panel      = document.getElementById('themePanel');
  const switcher   = document.getElementById('themeSwitcher');
  const opts       = document.querySelectorAll('.theme-opt[data-theme-pick]');

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
