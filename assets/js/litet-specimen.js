/* ============================================================================
   LITET SNITT — SPECIMEN ANIMADO — litet-specimen.js
   Troca o caracter dentro de `.litet-specimen__glyph` a cada 100ms (3 frames a
   30fps — o mesmo timing do <video> do After Effects que este ficheiro
   substituiu). Só corre nesta página (litet_snitt.html); não é um componente
   partilhado como nav.js/main.js.

   Sai em silêncio se o bloco não existir no HTML (mesmo padrão de nav.js) —
   nunca faz mais nenhuma página partir por este ficheiro estar carregado.
   ============================================================================ */
(() => {
  'use strict';

  const wrap  = document.querySelector('.litet-specimen');
  const glyph = wrap ? wrap.querySelector('.litet-specimen__glyph') : null;
  if (!wrap || !glyph) return; // sem os dois elementos, não há nada a animar

  /* ── OS 216 GLIFOS — mesma sequência exacta validada em preview.html ──────
     Gerada a partir do próprio ficheiro OTF (LitetSnitt-Regular.otf), não
     escrita à mão — ver Motion/Litet-Snitt-Specimen/build_glyph_order.py
     (fora deste repo). Ordem: A-Z, a-z, 0-9, pontuação, maiúsculas acentuadas,
     minúsculas acentuadas, ligaduras/especiais, moeda+símbolos, setas/matemática. */
  const GLYPHS = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
    '0','1','2','3','4','5','6','7','8','9',
    '!','"','#','$','%','&','\'','(',')','*','+',',','-','.','/',':',';','<','=','>','?','@','[','\\',']','_','`','{','|','}',
    'À','Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë','Ì','Í','Î','Ï',
    'Ð','Ñ','Ò','Ó','Ô','Õ','Ö','Ø','Ù','Ú','Û','Ü','Ý','Þ',
    'Ŵ','Ŷ','Ÿ','Ž','Ẁ','Ẃ','Ẅ','Ỳ',
    'à','á','â','ã','ä','å','æ','ç','è','é','ê','ë','ì','í','î','ï',
    'ð','ñ','ò','ó','ô','õ','ö','ø','ù','ú','û','ü','ý','þ','ÿ',
    'š','ŵ','ŷ','ẁ','ẃ','ẅ','ỳ',
    'ﬁ','ﬂ','ĳ','Œ','œ','ß','ı','ȷ',
    '¡','£','¥','¨','©','ª','«','®','±','´','¶','¸','º','»','¿','÷',
    'ˆ','ˇ','˙','˜',
    '–','—','‘','’','“','”','…','‰','€','™',
    '←','↑','→','↓','↖','↗','↘','↙','−','≠',
  ];

  const FRAME_MS = 100; // 3 frames a 30fps — igual ao vídeo/preview.html originais

  /* ── CORRECÇÃO DE DESCENDENTES — a letra "salta" ao trocar (13-09-2026) ────
     WHAT  `align-items:center` no `.litet-specimen` centra a CAIXA da linha
           (altura fixa = font-size × line-height, igual para qualquer letra),
           não a TINTA de cada glifo. Uma letra com descendente (g/j/p/q/y)
           desenha tinta ATÉ ABAIXO da linha de base, numa zona que as outras
           letras deixam vazia — por isso parece "cair" ao trocar, mesmo a
           caixa nunca se mexendo (confirmado por medição: a caixa do `<span>`
           fica sempre no mesmo sítio, para qualquer uma das 216 letras).
     TERM  Os valores abaixo (`-0.1em`/`-0.08em`) vêm de medir a tinta real de
           cada letra com `CanvasRenderingContext2D.measureText().
           actualBoundingBoxDescent` a `1000px` (ver sessão de 13-09-2026) —
           `g/j/p/q/y` e as suas variantes descem 200/1000 = 0.2em abaixo da
           linha de base, `ç/Ç` descem só 160/1000 = 0.16em (a cauda da
           cedilha é mais curta que um descendente inteiro). A correcção sobe
           cada letra METADE do seu próprio descendente — não o descendente
           inteiro, para não parecer "flutuada" acima da linha das outras.
           Valores fixos (não medidos ao vivo) de propósito: medir com canvas
           precisa da webfont já carregada, e este specimen passou a ser a
           primeira coisa da página (13-09-2026) — arrisca a correr antes da
           fonte chegar e medir com a serif de recurso, dando números errados.
     WHY   Só as LETRAS entram nesta lista — não pontuação como `(`/`[`/`_`,
           que TAMBÉM mede descendente mas está DESENHADA de propósito para
           ultrapassar a linha de base (um parêntesis existe para abraçar uma
           letra alta E uma baixa ao mesmo tempo); corrigi-las do mesmo jeito
           ficaria errado. A lista cobre "g/j/p/q/y" (o pedido do Francisco) e
           as suas variantes com cedilha/acento que também têm descendente
           real neste tipo de letra (ç/Ç, ý/ÿ/ŷ/ỳ/þ, e as ligaduras ĳ/ȷ). */
  const CORRECCOES = new Map([
    ['g', -0.1], ['j', -0.1], ['p', -0.1], ['q', -0.1], ['y', -0.1],
    ['ý', -0.1], ['ÿ', -0.1], ['ŷ', -0.1], ['ỳ', -0.1], ['þ', -0.1], ['ĳ', -0.1], ['ȷ', -0.1],
    ['ç', -0.08], ['Ç', -0.08],
  ]);

  /* Quem pede menos movimento não vê 216 caracteres a trocar 10×/segundo —
     fica com um único glifo fixo. Lido uma vez: se a preferência mudar a meio
     da visita, só se reflecte num reload (comportamento aceitável aqui). */
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    glyph.textContent = 'A';
    return; // sem intervalo nenhum a correr
  }

  let i = 0;               // índice do glifo actual em GLYPHS
  let timer = null;        // guarda o setInterval activo para poder parar/retomar

  function start() {
    if (timer) return;     // já está a correr — não duplica o intervalo
    timer = setInterval(() => {
      i = (i + 1) % GLYPHS.length; // avança um glifo, volta ao início no fim (loop)
      const c = GLYPHS[i];
      glyph.textContent = c;
      glyph.style.transform = `translateY(${CORRECCOES.get(c) || 0}em)`; // sobe as letras com descendente real; as outras voltam a 0
    }, FRAME_MS);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
  }

  /* Só anima enquanto o bloco está mesmo visível — poupa CPU/bateria quando o
     visitante já desceu a página (mesmo espírito do `loading="lazy"` nas
     imagens desta secção). */
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => { entry.isIntersecting ? start() : stop(); });
  }).observe(wrap);
})();
