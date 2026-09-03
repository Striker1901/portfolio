/* hero-pixels.js — Portfolio
   ════════════════════════════════════════════════════════════════════════════
   WHAT  Uma grelha fina de pequenos quadrados brancos por trás do título do
         hero — cada célula muda de intensidade sozinha, devagar e ao acaso,
         como uma textura viva em vez de um efeito a chamar a atenção sempre
         da mesma forma. Trazido do site da SOLITSU (assets/js/hero-pixels.js),
         03-09-2026, a pedido do Francisco: mais forte e a branco em vez do
         laranja subtil original.
   TERM  `<canvas>` — elemento onde se desenha pixel a pixel via JavaScript. A
         grelha real tem dezenas de milhares de células (ver AJUSTES); criar um
         `<div>` por célula seria impraticável para o browser.
   ════════════════════════════════════════════════════════════════════════════ */

/* WHAT  Todo o ficheiro vive dentro de uma função que corre e desaparece.
   TERM  "IIFE" — uma função declarada e chamada na mesma linha.
   WHY   `main.js` e `nav.js` já usam o mesmo embrulho, pela mesma razão: sem
         ele, uma variável aqui podia colidir com outra do mesmo nome noutro
         ficheiro, já que todos correm no mesmo espaço global. */
(() => {
  'use strict';

  const hero = document.querySelector('.hero');       // secção-mãe — é dela que lemos a largura/altura reais
  const canvas = document.querySelector('.hero-pixels');  // a tela — ver a regra do mesmo nome em style.css
  if (!hero || !canvas) return;                        // sem os dois, não há onde desenhar — sai em silêncio
  const ctx = canvas.getContext('2d');                 // a "caneta" 2D da tela
  if (!ctx) return;                                    // browsers muito antigos podem não dar contexto — mesma saída em silêncio

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;  // lido uma só vez, cedo

  /* ── AJUSTES ────────────────────────────────────────────────────────────────
     Os números que vale a pena mexer estão todos aqui, com nome. Depois de
     várias voltas na intensidade geral (03-09-2026: SOLITSU 0.12/0.32 → mais
     forte 0.25/0.65 → 10%/1%/5% desse valor), o Francisco pediu uma coisa
     diferente: em vez de TODAS as células terem a mesma gama de opacidade
     ("ruído uniforme"), só uma pequena fracção deve "acender" — e essas,
     quando acendem, vão bem mais fortes. Dois níveis de opacidade em vez de
     um só (ver `randomAlpha()` mais abaixo). */
  const CELL = 5;               // tamanho da célula em px CSS. Maior = grelha mais grossa
  const SQUARE = 2;              // tamanho do quadrado aceso dentro de cada célula, em px CSS
  const SPARK_CHANCE = 0.025;    // probabilidade de uma célula virar "faísca" em vez de ficar apagada — sobe para mais pontos acesos ao mesmo tempo
  const SPARK_MIN_ALPHA = 0.10;  // opacidade mais baixa de uma faísca — sobe para faíscas sempre bem visíveis (reduzido de 0.5 → 0.28 → 0.16 → 0.10, pedido 03-09-2026)
  const SPARK_MAX_ALPHA = 0.16;  // opacidade mais alta de uma faísca — sobe para um brilho ainda mais forte no pico (reduzido de 0.7 → 0.42 → 0.26 → 0.16)
  const DIM_MIN_ALPHA = 0;       // opacidade mais baixa de uma célula "apagada" (a maioria) — sobe se quiseres um fundo nunca 100% preto
  const DIM_MAX_ALPHA = 0.03;    // opacidade mais alta de uma célula "apagada" — sobe para mais textura de fundo por trás das faíscas
  const REPAINT_FRACTION_MIN = 0.010;  // menor fracção de células que um passo pode tocar — um passo "calmo"
  const REPAINT_FRACTION_MAX = 0.045;  // maior fracção — um passo "em rajada". Sorteado de novo a cada passo, nunca o mesmo valor duas vezes seguidas
  const STEP_MS_MIN = 40;         // intervalo mais curto possível entre passos — o ritmo mais rápido que o campo pode ter
  const STEP_MS_MAX = 220;        // intervalo mais longo possível — a DIFERENÇA entre este e o mínimo é o que quebra o metrónomo (ver WHY em `step`)

  let cols = 0, rows = 0;        // quantas células cabem na largura/altura actuais do hero
  let alpha = null;               // Float32Array — a opacidade actual de cada célula, uma entrada por célula
  let pixelR = 242, pixelG = 242, pixelB = 242;  // branco lido de `--ink` no arranque — nunca um hex à parte no JS, uma só fonte de verdade
  let rafId = 0;                  // guarda o pedido de frame activo, para saber se o ciclo já está a correr
  let lastStep = 0;               // carimbo de tempo do último passo — controla o `nextDelay` abaixo
  let nextDelay = 0;               // quanto tempo falta até ao próximo passo — sorteado de novo depois de cada passo, nunca fixo
  let visible = true;             // falso quando o hero sai do ecrã (IntersectionObserver) ou a aba fica escondida

  /* WHAT  Lê `--ink` do CSS uma única vez, em vez de escrever a cor aqui.
     TERM  `getComputedStyle` — pergunta ao browser o valor final de uma
           variável CSS, já resolvido, tal como qualquer regra o usaria.
     WHY   Se o branco do site mudar um dia em `style.css`, este ficheiro não
           precisa de ser tocado — lê o valor novo sozinho. */
  function readPixelColor() {
    const hex = getComputedStyle(document.documentElement)   // lê a variável no elemento raiz, onde `style.css` a define
      .getPropertyValue('--ink').trim();                      // remove espaços — `getPropertyValue` às vezes devolve-os
    const m = /^#?([0-9a-f]{6})$/i.exec(hex);                  // aceita "#f2f2f2" ou "f2f2f2"
    if (!m) return;                                            // formato inesperado — fica com o valor de reserva já definido acima
    const n = parseInt(m[1], 16);                              // "f2f2f2" → número inteiro
    pixelR = (n >> 16) & 255;                                  // byte vermelho
    pixelG = (n >> 8) & 255;                                   // byte verde
    pixelB = n & 255;                                          // byte azul
  }

  /* WHAT  Decide a opacidade de UMA célula — na maioria das vezes "apagada"
           (quase invisível), raramente uma "faísca" bem mais forte.
     WHY   Substitui o antigo cálculo de uma gama só (`MIN_ALPHA` +
           aleatório até `MAX_ALPHA`) — com uma gama só, todas as células
           liam-se como "ruído uniforme"; com duas gamas e uma hipótese rara
           de cair na mais forte, a maioria fica discreta e só pontos raros
           saltam à vista, como faíscas. */
  function randomAlpha() {
    if (Math.random() < SPARK_CHANCE) {                // sorteia se esta célula fica "faísca" desta vez
      return SPARK_MIN_ALPHA + Math.random() * (SPARK_MAX_ALPHA - SPARK_MIN_ALPHA);  // faísca: sempre bem visível
    }
    return DIM_MIN_ALPHA + Math.random() * (DIM_MAX_ALPHA - DIM_MIN_ALPHA);  // caso comum: quase invisível
  }

  /* ── CONSTRUIR (ao carregar e a cada redimensionamento) ─────────────────────
     WHAT  Mede o hero, decide quantas células cabem, dimensiona a tela à
           densidade real do ecrã, e dá a cada célula uma opacidade inicial.
     TERM  `devicePixelRatio` — pixels físicos do ecrã por cada pixel CSS (2
           num Mac Retina). A tela nasce maior por dentro e é encolhida por
           CSS, senão os quadrados de 2px saem esborratados — é esse detalhe
           que faz o efeito ler como "pixel" e não como mancha desfocada. */
  function build() {
    const box = hero.getBoundingClientRect();     // tamanho real do hero neste instante, em px CSS
    const W = box.width;                           // largura da tela a desenhar
    const H = box.height;                          // altura da tela a desenhar
    if (W < 2 || H < 2) return;                     // hero ainda sem layout (ex.: fontes por carregar) — tenta na próxima chamada

    cols = Math.ceil(W / CELL);                     // quantas colunas de células cabem na largura
    rows = Math.ceil(H / CELL);                     // quantas linhas cabem na altura

    const dpr = Math.min(2, window.devicePixelRatio || 1);  // limitado a 2 — a 3ª/4ª densidade de alguns telemóveis não acrescenta nada visível
    canvas.width = Math.round(W * dpr);              // largura real do buffer, em pixels físicos
    canvas.height = Math.round(H * dpr);              // altura real do buffer, em pixels físicos
    canvas.style.width = W + 'px';                   // tamanho em ecrã continua em px CSS — o encolhimento é o que dá nitidez
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);          // a partir daqui, todas as coordenadas que desenhamos são em px CSS — o browser converte sozinho

    alpha = new Float32Array(cols * rows);           // uma opacidade por célula, todas a zero para começar
    for (let i = 0; i < alpha.length; i++) {
      alpha[i] = randomAlpha();                        // cada célula nasce apagada, ou raramente já uma faísca
    }
    paintAll();                                      // primeiro desenho completo — só acontece aqui e a seguir a um redimensionamento
  }

  /* WHAT  Desenha o quadrado de UMA célula, com a opacidade guardada em `alpha[i]`.
     WHY   Chamada tanto no desenho completo inicial como, depois, célula a
           célula — mantém a mesma matemática de posição num único sítio. */
  function paintCell(i) {
    const gx = i % cols;                             // coluna desta célula
    const gy = (i / cols) | 0;                        // linha desta célula (`| 0` trunca para inteiro, mais rápido que `Math.floor` aqui)
    const x = gx * CELL;                              // canto esquerdo da célula, em px CSS
    const y = gy * CELL;                              // canto superior da célula
    ctx.clearRect(x, y, CELL, CELL);                  // apaga só esta célula — nunca a tela toda, é o que mantém o custo baixo
    ctx.fillStyle = `rgba(${pixelR}, ${pixelG}, ${pixelB}, ${alpha[i]})`;  // branco à opacidade actual desta célula
    ctx.fillRect(x, y, SQUARE, SQUARE);                // o quadrado aceso — mais pequeno que a célula, o resto fica vazio
  }

  function paintAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // única vez em que se limpa a tela toda — arranque e redimensionamento
    for (let i = 0; i < alpha.length; i++) paintCell(i);  // desenha as dezenas de milhares de células uma vez só
  }

  /* ── PASSO (repete devagar, nunca a 60fps, nunca ao mesmo ritmo) ─────────────
     WHAT  De vez em quando — nunca ao mesmo intervalo duas vezes seguidas —
           escolhe um número de células ao acaso (também ele variável) e dá-
           lhes uma nova opacidade. Só essas são reapagadas/redesenhadas.
     TERM  `requestAnimationFrame` — pede ao browser para chamar esta função
           antes do próximo desenho do ecrã, em vez de um temporizador cego.
     WHY   Um intervalo fixo e sempre a mesma fracção de células por passo lê-
           se como "está a piscar" (regular como um metrónomo), não como "está
           vivo". Sorteando de novo, a cada passo, tanto quanto tempo falta
           até ao seguinte como quantas células mudam nesse passo, o padrão
           deixa de ter qualquer período. */
  function step(now) {
    rafId = requestAnimationFrame(step);              // agenda o próximo passo já, antes de qualquer verificação — nunca deixa o ciclo morrer sozinho
    if (!visible) return;                             // hero fora do ecrã ou aba escondida — poupa trabalho, mas mantém o ciclo pedido
    if (now - lastStep < nextDelay) return;            // ainda não passou o tempo sorteado para este passo — sai sem fazer nada
    lastStep = now;                                    // marca este instante como o último passo real
    nextDelay = STEP_MS_MIN + Math.random() * (STEP_MS_MAX - STEP_MS_MIN);  // sorteia já o intervalo do PRÓXIMO passo — nunca igual ao anterior

    const fraction = REPAINT_FRACTION_MIN + Math.random() * (REPAINT_FRACTION_MAX - REPAINT_FRACTION_MIN);  // sorteia também quão "cheio" é este passo
    const count = Math.max(1, Math.round(alpha.length * fraction));  // quantas células mudam neste passo em concreto
    for (let n = 0; n < count; n++) {
      const i = (Math.random() * alpha.length) | 0;    // célula ao acaso — `| 0` trunca para índice inteiro
      alpha[i] = randomAlpha();                        // nova intensidade — quase sempre apagada, raramente uma faísca
      paintCell(i);                                     // só esta célula é reapagada/redesenhada
    }
  }

  function start() {
    if (rafId || reducedMotion) return;                 // já a correr, ou a pessoa pediu menos movimento — não arranca
    lastStep = 0;                                        // força o primeiro passo a acontecer já no próximo frame
    rafId = requestAnimationFrame(step);
  }

  function stop() {
    cancelAnimationFrame(rafId);                         // liberta o pedido de frame pendente
    rafId = 0;                                            // marca como parado, para `start()` poder arrancar de novo depois
  }

  /* ── ARRANQUE ───────────────────────────────────────────────────────────────── */
  readPixelColor();

  if (reducedMotion) {
    build();                                              // grelha desenhada uma vez, com valores fixos — visível, só sem nenhum ciclo a mexer nela
  } else {
    build();
    start();

    /* WHAT  Suspende o ciclo quando o hero sai do ecrã por scroll.
       TERM  `IntersectionObserver` — o browser avisa quando um elemento entra
             ou sai da área visível, sem perguntar a cada evento de scroll.
       WHY   Sem isto, a tela continuava a mudar com a pessoa já a ler outra
             secção — trabalho gasto em algo que ninguém vê. */
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;  // conta tanto estar no ecrã como a aba estar activa
      if (visible) start();
    }, { threshold: 0 }).observe(hero);

    /* WHAT  Pausa também quando a ABA fica escondida (troca de separador),
             não só quando o hero sai do ecrã dentro da mesma aba.
       WHY   `IntersectionObserver` sozinho não sabe se a janela está em
             segundo plano — sem isto, mudar de separador não poupava nada. */
    document.addEventListener('visibilitychange', () => {
      visible = !document.hidden;                          // a intersecção com o hero mantém-se como estava; só a aba muda aqui
      if (visible) start();
    });

    /* Redimensionamento: reconstrói a grelha do zero, com um atraso curto para
       não repetir isto 60 vezes enquanto se arrasta o canto da janela. */
    let resizeTimer = 0;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    });
  }
})();
