// Francisco Martins — portfolio interactions
// Smooth scroll (GSAP em ambas as formas: scrollTop tweened à mão nas páginas de
// case study, ScrollSmoother na home/photography), scroll reveals, active work-list
// tracking, scroll progress line.
// All features guard on element existence so this file is shared by every page.

/* WHAT  Uma só verdade sobre se a pessoa pediu menos movimento ao sistema operativo —
         lida logo no topo do ficheiro, porque o scroll suave (a seguir) já precisa dela.
   TERM  `prefers-reduced-motion` — uma media query que lê essa preferência do sistema
         operativo, não do site; existe por causa de perturbações vestibulares reais
         (tonturas, náuseas) que animações grandes podem provocar.
   WHY   Sem isto, quem pediu menos movimento ficava com o scroll a "flutuar" na mesma —
         nem o tween de scroll nem o ScrollSmoother podem arrancar para essas pessoas,
         tem de haver uma verdade só, cedo. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* WHAT  Se esta página tem `.case-scroll` (só a litet_snitt.html, 13-09-2026), é ela
         que faz scroll — não a página inteira — sempre que o ecrã for largo o
         suficiente para caber a coluna de projectos ao lado.
   TERM  `SPLIT_BREAKPOINT` tem de bater certo com o `@media (max-width: 810px)` de
         style.css — é o mesmo ponto de corte que já desliga a coluna de projectos e
         a devolve ao fluxo normal da página no telemóvel.
   WHY   Nas outras 7 páginas `caseScroll` é `null` e `isSplitActive()` nunca dá
         verdadeiro — todo este bloco fica inerte, o comportamento de hoje continua
         exactamente igual. */
const caseScroll = document.querySelector('.case-scroll');
const SPLIT_BREAKPOINT = 810;
const splitQuery = matchMedia(`(max-width: ${SPLIT_BREAKPOINT}px)`);
const isSplitActive = () => !!(caseScroll && !splitQuery.matches);

/* ── SCROLL SUAVE — GSAP nas duas formas, cada uma no seu caso de uso ──
   WHAT  Tentei o ScrollSmoother real em todas as páginas (14-09-2026) — partiu nas
         de case study (`.case-scroll` é uma caixa PARCIAL de ecrã, dentro de um
         `body[data-split]{overflow:hidden}` sem scroll nativo nenhum; o
         ScrollSmoother precisa do viewport inteiro + scroll real do documento).
         Tentei outra vez num piloto (`litet_snitt.html`, mesmo dia, com a causa
         real corrigida) e o Francisco pediu para reverter — fica assente que as
         6 páginas de case study usam o tween à mão abaixo, ponto final.
   TERM  As páginas de case study animam directamente o `scrollTop` NATIVO de
         `.case-scroll` (que continua com `overflow-y:auto` de sempre, zero
         alterações de layout) a cada evento de roda do rato — teclado, barra de
         scroll e toque continuam a escrever no mesmo `scrollTop` sem conflito,
         só a roda é interceptada. Home/photography.html usam o ScrollSmoother
         real (sem `.case-scroll`, usam o par `#smooth-wrapper`/`#smooth-content`).
   WHY   Nenhum dos dois arranca se `reduced` for verdadeiro — nesse caso o scroll
         fica nativo em ambos os tipos de página, o comportamento correcto para
         quem pediu menos movimento, não uma regressão. */
let smoother = null;

if (caseScroll && !reduced) {
  const inner = caseScroll.querySelector('.case-scroll__inner');
  let target = null; // null até à 1ª roda — a partir daí segue o alvo, não o scrollTop ao vivo (que o próprio tween está a animar)
  let tween = null;

  caseScroll.addEventListener('wheel', (e) => {
    if (!isSplitActive()) return; // abaixo dos 810px `.case-scroll` volta a overflow:visible (style.css) — a página inteira faz scroll nativo normal, não vale a pena suavizar aí à força
    e.preventDefault();
    const max = inner.scrollHeight - caseScroll.clientHeight;
    const base = target === null ? caseScroll.scrollTop : target;
    target = Math.max(0, Math.min(base + e.deltaY * 1.3, max)); // 1.3 — mesmo multiplicador que o Lenis já usava aqui (wheelMultiplier), a reactividade não regride
    if (tween) tween.kill(); // mata o tween anterior antes de recriar — sem isto, os dois ficavam a competir pelo mesmo scrollTop
    tween = gsap.to(caseScroll, { scrollTop: target, duration: 0.6, ease: 'power2.out', overwrite: true });
  }, { passive: false });

  splitQuery.addEventListener('change', () => { target = null; }); // ao cruzar o breakpoint, esquece o alvo antigo — a próxima roda parte do scrollTop real
} else if (!reduced) {
  // Home e photography.html: sem `.case-scroll`, o ScrollSmoother usa o par
  // `#smooth-wrapper`/`#smooth-content` já no HTML (ver comentário lá). `effects: false`
  // — nunca liga o sistema de parallax por elemento (`data-speed`): fora do âmbito
  // desta troca, o pedido era só a sensação de suavidade, não parallax novo.
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 0.6, speed: 1.2, effects: false });
}

/* WHAT  Clicar num link âncora (nav, hero, sidebar de trabalhos) desliza suavemente até
         à secção, com folga por cima para a nav fixa não tapar o título de chegada.
   TERM  `- 118` desloca o alvo 118px página abaixo do que seria a posição exacta — a
         nav (`.site-header`) mede sempre 102px do topo real do ecrã até ao seu fundo
         (repouso e encolhida, medido ao vivo), mais uma pequena folga. O mesmo valor
         está no `scroll-padding-top` de `style.css`, para o salto nativo (sem JS) bater
         certo também — os dois têm de mudar juntos se a altura da nav mudar.
   WHY   Só existe `smoother` na home/photography.html — as páginas de case study não
         têm nenhum link `href="#..."` (confirmado por grep: o único link da nav lá é
         `href="index.html#works"`, que não começa por "#"), por isso este bloco fica
         inerte nelas mesmo sem guarda extra. Sem isto, o `href="#secao"` de cada link
         ainda funcionaria (é HTML nativo), mas saltaria instantâneo em vez de animado. */
if (smoother) {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return; // só "#" sozinho, sem destino real
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      smoother.scrollTo(smoother.offset(target, 'top top') - 118, true);
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

  /* ---------- Scroll progress line ----------
     WHAT  A barra fininha à direita do ecrã que enche à medida que se avança na
           página. Na home/photography.html lê `smoother.progress` (0–1, já
           normalizado pelo GSAP); nas páginas de case study e sob
           `prefers-reduced-motion` cai para a leitura manual de `window`/
           `.case-scroll` — funciona correctamente nas páginas de case study
           porque o scroll suave à mão (ver bloco acima) anima o `scrollTop`
           NATIVO de `.case-scroll`, não uma posição virtual — um `scroll`
           listener normal já lê o valor certo em tempo real.
     WHY   Nenhuma página tem as duas coisas ao mesmo tempo (`smoother` só existe
           na home/photography.html) — por isso basta verificar `smoother`, não
           precisa de saber se está sob reduced-motion ou numa página de case
           study, os dois casos caem no mesmo `else`. */
  const progress = document.querySelector('.progress-line');

  if (progress) {
    if (smoother) {
      const updateProgress = () => {
        progress.style.transform = 'scaleY(' + smoother.progress + ')';
        requestAnimationFrame(updateProgress);
      };
      requestAnimationFrame(updateProgress);
    } else {
      // fallback: páginas de case study (scrollTop nativo, lido directamente) e
      // prefers-reduced-motion na home/photography.html (sem ScrollSmoother a
      // correr) — mesma lógica de sempre: lê window ou .case-scroll à mão.
      let ticking = false;
      let currentSource = null;

      const update = () => {
        let max, pos;
        if (currentSource === window) {
          max = document.documentElement.scrollHeight - window.innerHeight;
          pos = window.scrollY;
        } else {
          max = currentSource.scrollHeight - currentSource.clientHeight;
          pos = currentSource.scrollTop;
        }
        const ratio = max > 0 ? Math.min(pos / max, 1) : 0;
        progress.style.transform = 'scaleY(' + ratio + ')';
        ticking = false;
      };

      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      };

      const attach = () => {
        if (currentSource) currentSource.removeEventListener('scroll', onScroll); // larga a fonte antiga, se havia uma
        currentSource = isSplitActive() ? caseScroll : window; // escolhe a fonte certa para o estado actual
        currentSource.addEventListener('scroll', onScroll, { passive: true });
        update(); // recalcula já, sem esperar pelo próximo scroll — evita a barra "congelada" no valor antigo até a pessoa mexer
      };

      attach();
      if (caseScroll) splitQuery.addEventListener('change', attach); // troca de fonte ao cruzar os 810px em direto
    }
  }

});
