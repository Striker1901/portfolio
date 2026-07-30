// Francisco Martins — portfolio interactions
// Scroll reveals, active work-list tracking, scroll progress line.
// All features guard on element existence so this file is shared by every page.

/* ---------- Google Analytics — gated behind explicit cookie consent ---------- */
/* Runs outside the DOMContentLoaded block below so the banner appears (and,
   if already accepted, GA fires) as early as possible. RGPD: tracking cookies
   cannot be set before consent — do not remove the consent gate. */
const GA_MEASUREMENT_ID = 'G-ZFYNMVWVBT';
const GA_CONSENT_KEY = 'portfolio_cookie_consent'; // "accepted" | "rejected"

function loadGoogleAnalytics() {
  if (window.__gaLoaded) return;
  window.__gaLoaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
}

function getCookieConsent() {
  try { return window.localStorage.getItem(GA_CONSENT_KEY); } catch (e) { return null; }
}
function setCookieConsent(value) {
  try { window.localStorage.setItem(GA_CONSENT_KEY, value); } catch (e) {}
}

function showCookieBanner() {
  if (document.getElementById('cookie-banner')) return;
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.id = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Consentimento de cookies');
  banner.innerHTML =
    '<p>This site uses Google Analytics to understand traffic. You can accept or decline — it won’t affect browsing.</p>' +
    '<div class="cookie-banner__actions">' +
      '<button type="button" class="cookie-banner__reject" id="cookie-reject">Decline</button>' +
      '<button type="button" class="cookie-banner__accept" id="cookie-accept">Accept</button>' +
    '</div>';
  document.body.appendChild(banner);
  document.getElementById('cookie-accept').addEventListener('click', () => {
    setCookieConsent('accepted');
    loadGoogleAnalytics();
    banner.remove();
  });
  document.getElementById('cookie-reject').addEventListener('click', () => {
    setCookieConsent('rejected');
    banner.remove();
  });
}

function initCookieConsent() {
  const consent = getCookieConsent();
  if (consent === 'accepted') { loadGoogleAnalytics(); return; }
  if (consent === 'rejected') { return; }
  showCookieBanner();
}

document.addEventListener('DOMContentLoaded', () => {

  initCookieConsent();

  const pfLinks = document.querySelector('.pf-links');
  if (pfLinks && !document.getElementById('footer-cookie-settings')) {
    const settingsBtn = document.createElement('button');
    settingsBtn.type = 'button';
    settingsBtn.id = 'footer-cookie-settings';
    settingsBtn.className = 'pf-cookie-settings';
    settingsBtn.textContent = 'Cookie settings';
    settingsBtn.addEventListener('click', () => {
      try { window.localStorage.removeItem(GA_CONSENT_KEY); } catch (e) {}
      showCookieBanner();
    });
    pfLinks.appendChild(settingsBtn);
  }

  /* ---------- Scroll reveals ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach((el) => {
      // Elements already in the initial viewport appear immediately on load
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        requestAnimationFrame(() => el.classList.add('is-visible'));
      } else {
        io.observe(el);
      }
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Active work-list tracking (home) ---------- */
  const workList = document.querySelector('.work-list');
  const workEntries = document.querySelectorAll('.work-entry');

  if (workList && workEntries.length && 'IntersectionObserver' in window) {
    const links = workList.querySelectorAll('a[data-target]');

    const setActive = (id) => {
      links.forEach((a) => {
        a.classList.toggle('is-active', a.dataset.target === id);
      });
    };

    const entryIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -40% 0px' });

    workEntries.forEach((el) => entryIO.observe(el));

    // Show the list only while the works section is on screen
    const works = document.querySelector('.works');
    if (works) {
      const showIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          workList.classList.toggle('is-shown', entry.isIntersecting);
        });
      }, { rootMargin: '-20% 0px -20% 0px' });
      showIO.observe(works);
    }
  }

  /* ---------- Scroll progress line ---------- */
  const progress = document.querySelector('.progress-line');

  if (progress) {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progress.style.transform = 'scaleY(' + ratio + ')';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Terminal hero (home): type the lines out in sequence ---------- */
  const term = document.querySelector('.hero .term');
  let heroTyped = false;

  const startHeroType = () => {
    if (!term || heroTyped) return;
    heroTyped = true;

    const lines = Array.from(term.querySelectorAll('.t-line'));
    const caret = term.querySelector('.term-caret');

    // No animation: just show everything (also the no-JS default state).
    if (reduceMotion) return;

    term.classList.add('is-typing');

    // Stash command text so we can retype it char-by-char.
    const cmds = lines.map((line) => {
      const typed = line.querySelector('.t-typed');
      if (typed) { const t = typed.textContent; typed.textContent = ''; return t; }
      return null;
    });

    let i = 0;
    const nextLine = () => {
      if (i >= lines.length) return;
      const line = lines[i];
      line.classList.add('is-shown');
      if (caret && line.classList.contains('t-cmd')) line.appendChild(caret);

      if (cmds[i] != null) {
        // command line: type the command, then move on
        const typedEl = line.querySelector('.t-typed');
        const text = cmds[i];
        let c = 0;
        const tick = () => {
          typedEl.textContent = text.slice(0, c);
          if (c++ < text.length) { setTimeout(tick, 42); }
          else { i++; setTimeout(nextLine, 260); } // pause, then output/next
        };
        tick();
      } else {
        // output / comment line: appears at once
        if (caret && line.classList.contains('t-comment')) line.appendChild(caret);
        i++;
        setTimeout(nextLine, line.classList.contains('t-out') ? 360 : 0);
      }
    };
    setTimeout(nextLine, 250);
  };

  /* ---------- Hero LED "digital grain" fill (pharmacy-cross style) ----------
     Orange neon grains rain down and stack to fill the hero, hold, then switch
     off — and loop. Lives behind the terminal window (z-index 0). Paused while
     the hero is off-screen; skipped entirely under reduced-motion.            */
  const startHeroGrain = () => {
    const canvas = document.querySelector('.hero .hero-grain');
    if (!canvas || reduceMotion) return;
    const hero = canvas.closest('.hero');
    const ctx = canvas.getContext('2d');

    const CELL = 16;          // grid cell size (CSS px)
    const DOT  = 7;           // lit LED diameter (CSS px)
    const FALL = 760;         // grain fall speed (px / s)
    const FILL_SECONDS = 4.5; // target time to fill the whole field
    const BAND = CELL * 9;    // scatter zone above the rising front (gradual fill)

    let dpr, w, h, cols, rows, total, offY;
    let stack, pending, grains, lit;
    let settled, sctx;        // offscreen layer of already-lit LEDs
    let sprite;               // pre-rendered glowing dot (avoids per-cell shadowBlur)
    let phase, phaseT, spawnAcc, last;
    let running = false, rafId = 0;

    // pre-render one glowing orange LED into an offscreen canvas
    const makeSprite = () => {
      const s = Math.ceil(CELL * dpr);
      const c = document.createElement('canvas');
      c.width = c.height = s;
      const g = c.getContext('2d');
      const cx = s / 2, r = (DOT * dpr) / 2;
      const halo = g.createRadialGradient(cx, cx, 0, cx, cx, r * 2.3);
      halo.addColorStop(0,    'rgba(255, 190, 110, 0.95)');
      halo.addColorStop(0.45, 'rgba(255, 92, 0, 0.85)');
      halo.addColorStop(1,    'rgba(255, 92, 0, 0)');
      g.fillStyle = halo;
      g.beginPath(); g.arc(cx, cx, r * 2.3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255, 214, 160, 0.95)'; // bright core
      g.beginPath(); g.arc(cx, cx, r * 0.62, 0, Math.PI * 2); g.fill();
      sprite = c;
    };

    const reset = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // canvas stops above the divider bar — size to the canvas, not the hero
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.floor(h / CELL);          // whole rows only — no clipped bottom row
      offY = h - rows * CELL;               // bottom-align: remainder absorbed at the top
      total = cols * rows;
      stack = new Array(cols).fill(0);   // settled LEDs per column (from bottom)
      pending = new Array(cols).fill(0); // grains currently falling toward a column
      grains = [];
      lit = 0;
      makeSprite();
      settled = document.createElement('canvas');
      settled.width = canvas.width; settled.height = canvas.height;
      sctx = settled.getContext('2d');
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      phase = 'fill'; phaseT = 0; spawnAcc = 0; last = 0;
    };

    const stamp = (col, level) => { // paint a settled LED onto the offscreen layer
      const x = col * CELL;
      const y = offY + (rows - 1 - level) * CELL;
      sctx.drawImage(sprite, x, y, CELL, CELL);
    };

    const frame = (t) => {
      if (!running) return;
      if (!last) last = t;
      let dt = (t - last) / 1000; last = t;
      if (dt > 0.05) dt = 0.05; // clamp after tab-switches
      phaseT += dt;

      ctx.clearRect(0, 0, w, h);

      if (phase === 'fill') {
        // spawn new grains into not-yet-claimed columns
        spawnAcc += (total / FILL_SECONDS) * dt;
        let toSpawn = Math.floor(spawnAcc);
        spawnAcc -= toSpawn;
        let guard = cols * 2;
        while (toSpawn > 0 && lit + grains.length < total && guard-- > 0) {
          const col = (Math.random() * cols) | 0;
          if (stack[col] + pending[col] < rows) {
            // appear in a short scatter band just above this column's surface,
            // so the lit dots hug a rising front instead of a full-height curtain
            const surfaceY = offY + (rows - 1 - stack[col]) * CELL;
            grains.push({ col, y: surfaceY - (CELL + Math.random() * BAND) });
            pending[col]++;
            toSpawn--;
          }
        }
        // lowest grains settle first so columns stack cleanly
        grains.sort((a, b) => b.y - a.y);
        for (let k = grains.length - 1; k >= 0; k--) {
          const gr = grains[k];
          gr.y += FALL * dt;
          const surface = offY + (rows - 1 - stack[gr.col]) * CELL; // top of next empty cell
          if (gr.y >= surface) {
            stamp(gr.col, stack[gr.col]);
            stack[gr.col]++; pending[gr.col]--; lit++;
            grains.splice(k, 1);
          }
        }
        // draw settled field + the falling grains (with a faint trail)
        ctx.drawImage(settled, 0, 0, w, h);
        for (const gr of grains) {
          const x = gr.col * CELL;
          ctx.globalAlpha = 0.35;
          ctx.drawImage(sprite, x, gr.y - CELL, CELL, CELL);
          ctx.globalAlpha = 1;
          ctx.drawImage(sprite, x, gr.y, CELL, CELL);
        }
        if (lit >= total) { phase = 'hold'; phaseT = 0; }

      } else if (phase === 'hold') {
        ctx.drawImage(settled, 0, 0, w, h); // fully lit — brief glow
        if (phaseT > 0.9) { phase = 'off'; phaseT = 0; }

      } else if (phase === 'off') {
        const k = Math.min(phaseT / 0.7, 1);             // fade the whole field out
        ctx.globalAlpha = (1 - k) * (0.85 + Math.random() * 0.15); // LED flicker
        ctx.drawImage(settled, 0, 0, w, h);
        ctx.globalAlpha = 1;
        if (k >= 1) { phase = 'wait'; phaseT = 0; }

      } else { // 'wait' — dark beat before looping
        if (phaseT > 0.8) reset();
      }

      rafId = requestAnimationFrame(frame);
    };

    const start = () => { if (!running) { running = true; last = 0; rafId = requestAnimationFrame(frame); } };
    const stop  = () => { running = false; if (rafId) cancelAnimationFrame(rafId); };

    reset();
    start();

    // pause while the hero is scrolled out of view (battery + focus)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => e.isIntersecting ? start() : stop());
      }, { threshold: 0 }).observe(hero);
    }

    // re-fit on resize (debounced)
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { stop(); reset(); start(); }, 200);
    }, { passive: true });
  };

  /* ---------- Hero: start the terminal type-out + LED grain on load ---------- */
  startHeroType();
  startHeroGrain();

});
