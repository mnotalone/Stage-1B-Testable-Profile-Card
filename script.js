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

    /* Social links */
    socialTwitter:  $$('[data-testid="test-user-social-twitter"]'),
    socialGitHub:   $$('[data-testid="test-user-social-github"]'),
    socialLinkedIn: $$('[data-testid="test-user-social-linkedin"]'),
    socialWebsite:  $$('[data-testid="test-user-social-website"]'),
  };

  /* ── Avatar fallback ────────────────────────────────────────────────── */
  const defaultAvatarSrc = els.profileAvatar ? els.profileAvatar.src : '';

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

  /* Tick every 750 ms — a balance between real-time feel and aria-live
     reader churn on polite live regions.                                 */
  setInterval(tick, 750);

})();
