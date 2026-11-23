/* ============================================================================
   SMOOTH — PÁGINA DO CASE STUDY — smooth-page.js  (23-11-2026)
   Duas coisas, só para smooth.html:
   1. `specimen` animado — troca a letra dentro de `.smooth-specimen__glyph`
      a cada 100ms, igual ao da Litet Snitt (litet-specimen.js, que fica
      intocado — este é uma cópia adaptada, não um componente partilhado).
   2. Filme — botão de som por cima do <video>, e pausa total para quem pede
      menos movimento (`prefers-reduced-motion`).
   Cada parte sai em silêncio se o seu bloco não existir no HTML.
   ============================================================================ */
(() => {
  'use strict'; // modo estrito: erros de escrita viram erros a sério em vez de falharem calados

  /* ── PREFERÊNCIA DE MOVIMENTO ─────────────────────────────────────────────
     `matchMedia` lê a definição do sistema "reduzir movimento". Lida uma vez. */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches; // true = o visitante pediu menos animação

  /* ── 1. SPECIMEN ──────────────────────────────────────────────────────── */
  const wrap  = document.querySelector('.smooth-specimen');                    // o bloco preto 16:9
  const glyph = wrap ? wrap.querySelector('.smooth-specimen__glyph') : null;  // o <span> com a letra

  /* Os 286 glifos visíveis da Smooth — gerados a partir do próprio
     Smooth-Regular.otf com fontTools (não escritos à mão). Ordem: A-Z, a-z,
     0-9, depois o resto por código Unicode. Ficam de fora os acentos soltos
     (U+0300–036F), que sozinhos aparecem a flutuar sem letra por baixo.
     Para mudar a lista: apagar/acrescentar caracteres aqui. */
  const GLYPHS = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
    '0','1','2','3','4','5','6','7','8','9','!','"','#','$','%','&','\'','(',')','*','+',',','-','.','/',':',
    ';','<','=','>','?','@','[','\\',']','^','_','`','{','|','}','~','¡','¢','£','¥','¦','§','¨','©','ª','«',
    '¬','®','¯','°','±','´','¶','·','¸','º','»','¿','À','Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë','Ì','Í',
    'Î','Ï','Ð','Ñ','Ò','Ó','Ô','Õ','Ö','×','Ù','Ú','Û','Ü','Ý','Þ','ß','à','á','â','ã','ä','å','æ','ç','è',
    'é','ê','ë','ì','í','î','ï','ñ','ò','ó','ô','õ','ö','÷','ø','ù','ú','û','ü','ý','þ','ÿ','Ā','ā','Ă','ă',
    'Ć','ć','Ĉ','ĉ','Č','č','Ď','Đ','Ē','ē','Ě','ě','Ĝ','ĝ','Ğ','Ĥ','Ĩ','ĩ','Ī','ı','Ĳ','ĳ','Œ','œ','Ŝ','ŝ',
    'Ş','Ũ','ũ','Ŭ','ŭ','Ŵ','ŵ','Ŷ','ŷ','Ÿ','Ǎ','ǎ','ȷ','ˆ','ˇ','˘','˚','˛','˜','˝','฿','Ẁ','ẁ','Ẃ','ẃ','Ẅ',
    'ẅ','ẞ','Ẽ','ẽ','Ỳ','ỳ','Ỹ','ỹ','–','—','‘','’','‚','“','”','„','†','‡','•','…','‰','‹','›','₩','€','₵',
    '™','←','↑','→','↓','↔','↕','↖','↗','↘','↙','∂','∆','∏','∑','−','√','∞','∫','≈','≠','≤','≥','◊','ﬁ','ﬂ',
  ];

  const FRAME_MS = 100; // tempo de cada letra no ecrã, em ms — maior = mais lento

  /* `CORRECOES` — sobe as letras com descendente (g/j/p/q/y…) METADE do
     descendente real, para não parecerem "cair" ao trocar. Valores medidos no
     .otf (descendente de 0.20–0.22em → correcção de -0.1/-0.11em), mesma regra
     da Litet Snitt. Para afinar: mexer no número (em = fracção do tamanho). */
  const CORRECOES = new Map([
    ['g', -0.11], ['ĝ', -0.11], ['ç', -0.11], ['Ç', -0.11], ['Ş', -0.11], // descendente 0.22em
    ['j', -0.1], ['p', -0.1], ['q', -0.1], ['y', -0.1], ['ý', -0.1],      // descendente 0.20em
    ['ÿ', -0.1], ['ŷ', -0.1], ['ỳ', -0.1], ['ỹ', -0.1], ['ĳ', -0.1], ['ȷ', -0.1],
    ['þ', -0.09],                                                          // descendente 0.18em
  ]);

  if (wrap && glyph) {
    if (reduceMotion) {
      glyph.textContent = 'S'; // uma letra fixa, sem animação
    } else {
      let i = 0;          // posição actual na lista GLYPHS
      let timer = null;   // o intervalo activo (null = parado)

      const start = () => {
        if (timer) return; // já está a correr, não duplica
        timer = setInterval(() => {
          i = (i + 1) % GLYPHS.length;  // avança uma letra; no fim volta ao início
          const c = GLYPHS[i];          // a letra nova
          glyph.textContent = c;        // põe-na no ecrã
          glyph.style.transform = `translateY(${CORRECOES.get(c) || 0}em)`; // corrige descendentes; as outras ficam a 0
        }, FRAME_MS);
      };
      const stop = () => { clearInterval(timer); timer = null; }; // pára o intervalo

      /* `IntersectionObserver` — só anima quando o bloco está à vista (poupa bateria). */
      new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? start() : stop())); // visível = corre, fora = pára
      }).observe(wrap);
    }
  }

  /* ── 2. FILME ─────────────────────────────────────────────────────────── */
  const film  = document.querySelector('.smooth-film video');         // o <video> do filme
  const sound = document.querySelector('.smooth-film__sound');        // o botão "Sound on/off"
  if (!film) return; // página sem filme: nada mais a fazer

  if (reduceMotion) {
    film.removeAttribute('autoplay'); // não arranca sozinho
    film.pause();                     // garante que fica parado no poster
    film.controls = true;             // dá os controlos nativos para quem quiser ver na mesma
  }

  if (sound) {
    /* Os browsers só deixam um vídeo arrancar sozinho se estiver SEM som —
       por isso começa `muted` no HTML e este botão liga/desliga o som. */
    sound.addEventListener('click', () => {
      film.muted = !film.muted;                               // troca o estado do som
      if (!film.muted && film.paused) film.play();             // se estava parado, ligar o som também o põe a tocar
      sound.setAttribute('aria-pressed', String(!film.muted)); // diz ao leitor de ecrã se o som está ligado
      sound.dataset.state = film.muted ? 'off' : 'on';         // o CSS troca o texto visível a partir disto
    });
  }
})();
