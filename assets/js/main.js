// Francisco Martins — portfolio interactions
// Smooth scroll (Lenis), scroll reveals, active work-list tracking, scroll progress line.
// All features guard on element existence so this file is shared by every page.

/* WHAT  Uma só verdade sobre se a pessoa pediu menos movimento ao sistema operativo —
         lida logo no topo do ficheiro, porque o scroll suave (a seguir) já precisa dela.
   TERM  `prefers-reduced-motion` — uma media query que lê essa preferência do sistema
         operativo, não do site; existe por causa de perturbações vestibulares reais
         (tonturas, náuseas) que animações grandes podem provocar.
   WHY   Sem isto, quem pediu menos movimento ficava com o scroll a "flutuar" na mesma —
         o Lenis não pode arrancar para essas pessoas, tem de haver uma verdade só, cedo. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── SCROLL SUAVE (Lenis) ──────────────────────────────────────
   WHAT  Toda a página passa a deslizar com inércia — tanto ao rodar a roda do rato/trackpad
         como ao clicar num link âncora — em vez de saltar em blocos abruptos. Trazido do
         site da SOLITSU (mesma biblioteca, mesmo mecanismo), 03-09-2026.
   TERM  `Lenis` — biblioteca externa, auto-alojada em `assets/js/vendor/lenis.min.js`;
         intercepta o scroll e anima a posição real da página a cada frame
         (`requestAnimationFrame`), em vez de a mover de repente. `anchors: false` (o
         valor por omissão) porque o clique num link âncora é tratado à parte, mais
         abaixo — o auto-tratamento embutido do Lenis não chama `preventDefault()`, o
         que deixaria o salto instantâneo nativo do browser a competir com a animação
         do Lenis ao mesmo tempo.
   WHY   Não arranca de todo se `reduced` for verdadeiro — nesse caso o scroll fica
         nativo e instantâneo, o comportamento correcto para quem pediu menos
         movimento, não uma regressão. */
let lenis = null;
if (!reduced) {
  lenis = new Lenis();
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

/* WHAT  Clicar num link âncora (nav, hero, sidebar de trabalhos) desliza suavemente até
         à secção, com folga por cima para a nav fixa não tapar o título de chegada.
   TERM  `lenis.scrollTo(alvo, { offset })` — pede ao Lenis para animar até esse elemento;
         `offset: -118` desloca o destino 118px página abaixo do que seria o alvo exacto —
         a nav (`.site-header`) mede sempre 102px do topo real do ecrã até ao seu fundo
         (repouso e encolhida, medido ao vivo), mais uma pequena folga. O mesmo valor
         está no `scroll-padding-top` de `style.css`, para o salto nativo (sem JS) bater
         certo também — os dois têm de mudar juntos se a altura da nav mudar.
   WHY   Sem isto, o `href="#secao"` de cada link ainda funcionaria (é HTML nativo), mas
         saltaria instantâneo em vez de animado — o resto da página desliza suave, só os
         links âncora ficariam abruptos, uma inconsistência visível. */
if (lenis) {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return; // só "#" sozinho, sem destino real
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -118 });
    });
  });
}

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

  /* ── NAV ACTIVO AO FAZER SCROLL ──────────────────────────────
     WHAT  Enquanto se percorre a página, o link do menu que corresponde à secção visível
           ganha o mesmo sublinhado que já aparece ao passar o rato — para se saber sempre
           "em que secção estou", mesmo sem mexer no rato. Trazido do main.js da SOLITSU,
           03-09-2026, sem alterações — a CSS do sublinhado (`.nav__links a::after` /
           `.is-active`) já vinha com a componente Nav Island, só faltava isto a ligar
           a classe.
     TERM  `IntersectionObserver` — a mesma API já usada no scroll-reveal e no work-list
           acima, aqui a vigiar as secções da página em vez de elementos que aparecem
           uma vez. `rootMargin` negativo nos dois lados cria uma faixa fina a meio do
           ecrã; uma secção só conta como "actual" quando o seu conteúdo passa por essa
           faixa.
     WHY   Nas páginas de case study o único link da nav é `href="index.html#works"`
           (não começa por "#"), por isso `sectionsByLink` fica vazio lá e o observer
           nem chega a ser criado — não precisa de nenhuma guarda extra, o próprio
           selector já isola isto à home. */
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
  const sectionsByLink = new Map();
  navLinks.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) sectionsByLink.set(section, link);
  });

  if (sectionsByLink.size) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        sectionsByLink.get(entry.target)?.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sectionsByLink.forEach((_, section) => spy.observe(section));
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

});
