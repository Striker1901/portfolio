/* ============================================================================
   NAV ISLAND — componente reutilizável — nav.js
   Original em ~/Desktop/Agency/AA-SOLITSU/Components/Nav-Island/ (extraída do
   site da SOLITSU, 02-09-2026). Copiado sem alterações para o Portfolio,
   03-09-2026 — o alternador de língua abaixo nunca activa aqui porque o
   Portfolio não tem `.lang-toggle` no HTML (sai em silêncio, por desenho).

   Sai em silêncio sempre que um elemento opcional não existir (o alternador
   de língua, o CTA, o hambúrguer) — remover um bloco do HTML nunca deve fazer
   o resto partir. Zero dependências externas.
   ============================================================================ */
(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const nav = header ? header.querySelector('.nav') : null;
  if (!header || !nav) return; // sem os dois, não há nav nenhuma a controlar

  /* ── LINKS — efeito "roll" gerado a partir do texto do <a> ────
     WHAT  Constrói a estrutura de 2 spans empilhados (uma cópia visível, uma
           `aria-hidden`) que `nav.css` anima ao passar o rato — a partir do
           texto simples que já está no <a>.
     TERM  Usa `textContent`, nunca `innerHTML` com o texto do link — o texto
           de um link nunca deve poder injectar HTML, mesmo sendo conteúdo do
           próprio dono do site, não de um visitante.
     WHY   Acrescentar um link novo é só `<li><a href="#x">Rótulo</a></li>` no
           HTML, sem escrever a estrutura de 3 spans à mão. Um link já com
           `.nav__roll-clip` dentro (por já ter sido processado) não é tocado
           outra vez. */
  function buildRollLinks() {
    nav.querySelectorAll('.nav__links a').forEach((a) => {
      if (a.querySelector('.nav__roll-clip')) return;
      const label = a.textContent.trim();
      a.textContent = '';
      const clip = document.createElement('span'); clip.className = 'nav__roll-clip';
      const roll = document.createElement('span'); roll.className = 'nav__roll';
      const visible = document.createElement('span'); visible.textContent = label;
      const hidden = document.createElement('span'); hidden.textContent = label; hidden.setAttribute('aria-hidden', 'true');
      roll.append(visible, hidden);
      clip.append(roll);
      a.append(clip);
    });
  }
  buildRollLinks();

  /* ── LARGURA DA PÍLULA ENCOLHIDA — medida, não adivinhada ─────
     WHAT  Mede a largura real que o conteúdo da nav (logo+links+CTA, sejam
           quais forem) precisa, e escreve-a em `--nav-tight-w` (um NÚMERO em
           px) — é essa variável que `.site-header[data-scrolled="true"]` usa
           como `max-width` (ver nav.css).
     TERM  A medição clona `.site-header` inteiro para fora do ecrã
           (`visibility:hidden`, `position:absolute`, `left:-9999px`) com
           `width: max-content` — isto força qualquer `margin-left:auto` lá
           dentro (ver `.nav__drawer`) a resolver para 0, porque não sobra
           espaço nenhum para distribuir numa caixa do tamanho exacto do seu
           conteúdo.
     WHY   Medir ao vivo elimina qualquer valor calibrado à mão que partiria
           assim que um link/CTA/logótipo mudasse. Corre no arranque, ao
           redimensionar a janela (debounced), e sempre que o CONTEÚDO da nav
           mudar (`MutationObserver`) — acrescentar um link ou trocar o texto
           do CTA actualiza a largura sozinho, sem chamar nada à mão. */
  function measureTightWidth() {
    const clone = header.cloneNode(true);
    clone.dataset.scrolled = 'true'; // a medição é sempre para a pílula ENCOLHIDA — força este estado no clone, independentemente do estado ao vivo do header no momento em que a função corre (evita medir com o padding do estado em repouso, que é diferente)
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.pointerEvents = 'none';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = 'max-content';
    clone.style.maxWidth = 'none';
    document.body.appendChild(clone);
    const width = clone.getBoundingClientRect().width;
    document.body.removeChild(clone);
    return width;
  }

  let widthRaf = null;
  function scheduleWidthUpdate() {
    if (widthRaf) cancelAnimationFrame(widthRaf);
    widthRaf = requestAnimationFrame(() => {
      buildRollLinks(); // apanha também um link acrescentado depois do arranque
      const w = measureTightWidth();
      if (w > 0) header.style.setProperty('--nav-tight-w', `${Math.ceil(w) + 2}px`); // +2px de folga
    });
  }
  scheduleWidthUpdate();

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scheduleWidthUpdate, 120);
  });

  new MutationObserver(scheduleWidthUpdate).observe(nav, {
    childList: true, subtree: true, characterData: true,
  });

  /* ── ESTADO DA NAV AO SCROLL — pílula flutuante ────────────────
     WHAT  Liga `data-scrolled="true"` no `.site-header` assim que a página
           deixa de estar no topo — o CSS trata da transição sozinho.
     TERM  Precisa de um elemento `#nav-scroll-sentinel` de 1px logo no topo do
           `<body>` — quando ele sai do ecrã, a página já não está no topo. Um
           `IntersectionObserver` só corre quando o sentinela de facto
           entra/sai, ao contrário de um listener de `scroll` (dispara
           centenas de vezes por segundo).
     WHY   Mecanismo idêntico ao da SOLITSU (`scroll-sentinel` + `nav-scroll.js`
           lá, `#nav-scroll-sentinel` aqui) — copiado tal e qual a pedido do
           Francisco (03-09-2026), incluindo o comportamento de só voltar ao
           repouso no topo absoluto do documento (não ao entrar de novo na
           hero a meio do scroll). Uma versão anterior desta sessão observava
           `.hero` directamente com `rootMargin`, dando repouso enquanto
           qualquer parte da hero estivesse visível — revertido: o Francisco
           confirmou que quer o comportamento literal da SOLITSU, não este. */
  const sentinel = document.getElementById('nav-scroll-sentinel');
  if (sentinel) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => { header.dataset.scrolled = String(!entry.isIntersecting); });
    }).observe(sentinel);
  }

  /* ── MENU MÓVEL — abre/fecha, Escape, clique fora ──────────────
     WHAT  Liga/desliga `data-open` no header quando se clica no hambúrguer;
           o CSS decide o que esse atributo faz visualmente.
     TERM  `NAV_BREAKPOINT` (820px) tem de bater certo com o `@media` do
           nav.css — os dois têm de mudar juntos se este número mudar. */
  const NAV_BREAKPOINT = 820;
  const compactQuery = matchMedia(`(max-width: ${NAV_BREAKPOINT}px)`);
  const toggle = header.querySelector('.nav__toggle');
  if (toggle) {
    const drawerId = toggle.getAttribute('aria-controls');
    const labelOpen = toggle.dataset.labelOpen || 'Abrir menu';
    const labelClose = toggle.dataset.labelClose || 'Fechar menu';
    const setOpen = (open) => {
      header.dataset.open = String(open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? labelClose : labelOpen);
    };
    toggle.addEventListener('click', () => setOpen(header.dataset.open !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', (e) => {
      if (compactQuery.matches && header.dataset.open === 'true' && !header.contains(e.target)) setOpen(false);
    });
    compactQuery.addEventListener('change', (e) => { if (!e.matches) setOpen(false); });
    void drawerId; // documenta a ligação; o valor real vem do próprio atributo HTML (ver nav.html)
  }

  /* ── ALTERNADOR DE LÍNGUA (opcional, não usado neste site) ──────
     WHAT  Desliza o chip até ao botão activo e troca `aria-pressed`. Não
           traduz nada sozinho: dispara um evento `nav:langchange` para o
           script de i18n de um site reagir — o Portfolio não tem nenhum, por
           isso este bloco inteiro nunca corre (guarda `if (langToggle)`
           abaixo falha em silêncio, sem `.lang-toggle` no HTML). Deixado no
           ficheiro para a componente continuar idêntica ao original — apagar
           só faria sentido se este ficheiro deixasse de ser a mesma
           componente reutilizável. */
  const langToggle = header.querySelector('.lang-toggle');
  if (langToggle) {
    const track = langToggle.querySelector('.lang-toggle__track');
    const options = Array.from(langToggle.querySelectorAll('.lang-toggle__option'));
    const updateIndicator = () => {
      const active = track.querySelector('.lang-toggle__option[aria-pressed="true"]') || options[0];
      if (!active) return;
      const trackRect = track.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      track.style.setProperty('--lang-indicator-x', `${activeRect.left - trackRect.left}px`);
      track.style.setProperty('--lang-indicator-w', `${activeRect.width}px`);
    };
    options.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('aria-pressed') === 'true') return;
        options.forEach((o) => o.setAttribute('aria-pressed', String(o === btn)));
        updateIndicator();
        header.dispatchEvent(new CustomEvent('nav:langchange', { bubbles: true, detail: { lang: btn.dataset.langOption } }));
      });
    });
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
  }
})();
