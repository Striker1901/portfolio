/* ============================================================================
   LITET SNITT — PLANOS DE AJUSTE — litet-construct.js

   Quatro PLANOS (no sentido de cinema: um plano = um enquadramento entre dois
   cortes). Cada plano abre JÁ em grande plano sobre um detalhe de uma letra —
   sempre um sítio onde uma recta encontra uma curva — com uma pega de Bézier
   fora do eixo. A pega roda até assentar no eixo certo, a curva acompanha, e o
   detalhe fica na forma verdadeira da fonte. Depois corta a seco para a letra
   seguinte. Sem linhas-guia, sem etiquetas, sem fundidos.

   Porque é que rodar a pega se lê como "ajustar": nesta fonte as pegas dos
   extremos são exactamente horizontais ou verticais, e o segmento anterior é
   sempre uma recta. Com a pega fora do eixo nasce um bico visível na âncora;
   quando ela assenta, o bico desaparece e a curva fica tangente à recta. O
   olho percebe qual é o estado certo sem precisar de uma régua no ecrã.

   Referência visual: portorocha.com/robinhood — contorno de 1px sem
   preenchimento, quadrados brancos grandes nos pontos, preto puro, cortes
   secos de ~1s entre enquadramentos muito fechados.

   Os contornos NÃO são desenhados à mão: vêm de assets/js/litet-outlines.js,
   gerado a partir do próprio ficheiro LitetSnitt-Regular.otf. Por isso o que
   se vê são os pontos reais da tipografia, não uma imitação.

   Só corre em litet_snitt.html — sai em silêncio em qualquer outra página
   (mesmo padrão de litet-specimen.js e nav.js).
   ============================================================================ */
(() => {
  'use strict';

  const wrap = document.querySelector('.litet-construct');            // bloco que envolve a animação — se não existir, esta página não é a do Litet Snitt
  const canvas = wrap ? wrap.querySelector('canvas') : null;          // a tela onde tudo é desenhado; procurada DENTRO do bloco para nunca apanhar outro canvas da página
  const DADOS = window.LITET_OUTLINES;                                // os contornos extraídos da fonte — definidos por litet-outlines.js, que tem de ser carregado ANTES deste ficheiro
  if (!wrap || !canvas || !DADOS) return;                             // falta qualquer uma das três peças: não faz nada e não parte nada

  /* ── AJUSTES — muda aqui, não mais abaixo no ficheiro ─────────────────── */

  // A lista de planos. Cada linha é um corte. `seg` é o índice do segmento
  // curvo dentro do contorno, e `pega` diz qual das duas pegas do segmento é a
  // que roda: 'c1' sai da âncora inicial, 'c2' chega à âncora final.
  //
  // Só glifos com curvas servem: esta fonte é uma grotesca racionalista e o
  // A, N, K e M não têm UMA curva sequer. Descartados também o S e o s (a
  // curva do espinho afasta-se só 9% da sua corda — em grande plano lê-se como
  // uma recta), o 2 (cordas de 22 e 34 unidades, invisíveis) e o B e o R
  // (caixas de 84×325 e 157×307 — estreitas de mais para encher o ecrã).
  // O & tem 14 curvas e é o substituto natural se algum destes desiludir.
  const PLANOS = [
    { ch: 'O', contorno: 0, seg: 4,  pega: 'c1', desvio: -27, estica: 1.22, enquadra: 0.95, camara:  0.035, foco: [0.30, 0.38] },  // topo achatado a virar para o extremo direito — a maior curva da fonte
    { ch: 'e', contorno: 0, seg: 7,  pega: 'c1', desvio:  25, estica: 1.18, enquadra: 0.80, camara:  0,     foco: [0.56, 0.62] },  // a abertura do e: a barra horizontal parte em curva vertical sobre o ombro; plano TRAVADO de propósito
    { ch: 'g', contorno: 0, seg: 1,  pega: 'c1', desvio:  30, estica: 1.15, enquadra: 1.05, camara: -0.025, foco: [0.26, 0.70] },  // a cauda do g, o único plano abaixo da linha de base; câmara a AFASTAR-SE em vez de aproximar
    { ch: 'a', contorno: 0, seg: 12, pega: 'c2', desvio: -24, estica: 1.20, enquadra: 0.68, camara:  0.02,  foco: [0.38, 0.66] },  // junção da pança com a haste; o mais aberto dos quatro, para o último fotograma ainda se ler como letra
  ];
  const FASES = {                                                     // duração de cada fase EM MILISSEGUNDOS, dentro de um plano
    entrada: 196,                                                     // o detalhe fica parado no estado errado — dá tempo ao olho para ler o enquadramento depois do corte (-30%, 2026-09-14)
    ajuste:  532,                                                     // a pega roda até ao eixo; curta de propósito, é um gesto seco (-30%, 2026-09-14)
    fixa:    490,                                                     // a forma verdadeira fica parada antes do corte seguinte (-30%, 2026-09-14)
  };
  const FIXA_FINAL = 840;                                             // o ÚLTIMO plano segura mais tempo antes de a sequência recomeçar — é o fotograma que fica na cabeça (-30%, 2026-09-14)
  const ENQ_MIN = 4 / 3;                                              // proporção mais estreita que o bloco chega a ter (o CSS põe 4/3 abaixo de 810px) — é ela que manda no enquadramento
  const COR = '255,255,255';                                          // cor base em RGB sem parênteses — o código junta-lhe a opacidade de cada camada
  const TRACO = 1.25;                                                 // espessura do contorno em píxeis de CSS — fino de propósito, é o contraste com os quadrados que dá o ar de editor
  // Os quadrados são medidos como FRACÇÃO DA ALTURA do bloco, não em píxeis
  // fixos: a referência tem-nos a ~2,4% da altura, e um valor fixo que fica
  // certo no ecrã largo aparece três vezes mais gordo no bloco 4/3 do
  // telemóvel, que tem um terço da altura.
  const LADO_ANCORA = 0.022;                                          // lado do quadrado das âncoras, em fracção da altura do bloco — sobe para pontos mais pesados
  const LADO_CONTROLO = 0.015;                                        // o mesmo para as pontas das pegas — pouco menor que as âncoras, como na referência
  const LADO_MIN = 7;                                                 // lado mínimo em píxeis, para os pontos não desaparecerem num bloco muito baixo
  const ALPHA_PEGAS = 0.4;                                            // opacidade das pegas que NÃO estão a ser mexidas — discretas, para a que roda se destacar sozinha
  const ESCALA_MAX = 4000;                                            // tecto da ampliação (píxeis por unidade da fonte) — trava coordenadas absurdas se algum plano for afinado para um detalhe minúsculo
  /* ─────────────────────────────────────────────────────────────────────── */

  const ctx = canvas.getContext('2d');                                // contexto 2D — o objecto com todos os comandos de desenho

  /* ══ 1 · MATEMÁTICA DE APOIO ═══════════════════════════════════════════ */

  const limita = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);                  // prende um número ao intervalo 0–1 — evita progressos negativos ou acima de 1
  const mistura = (a, b, t) => a + (b - a) * t;                       // interpolação linear: devolve o ponto entre a e b à fracção t

  // `easing` = curva que substitui o avanço constante do tempo por um avanço
  // com aceleração. Aqui é um easeOutQuint: arranca de repente e TRAVA a
  // fundo no fim. É o contrário de um easeInOut suave, e é essa chegada seca
  // que faz a pega parecer pousada por uma mão em vez de deslizar até parar.
  const chega = (t) => 1 - Math.pow(1 - t, 5);                        // sobe o expoente para uma chegada ainda mais brusca; baixa para um movimento mais mole

  /* ══ 2 · PREPARAR CADA PLANO (uma vez, no arranque) ════════════════════ */

  // Converte uma linha de PLANOS numa estrutura pronta a animar: encontra o
  // segmento, descobre qual é a âncora que serve de pivô à pega escolhida,
  // mede o ângulo e o comprimento VERDADEIROS dessa pega, e calcula a caixa
  // que o enquadramento tem de conter.
  function prepara(plano) {
    const g = DADOS.glyphs[plano.ch];                                 // procura o glifo no ficheiro gerado
    if (!g) return null;                                              // não foi extraído: devolve null e é filtrado mais abaixo
    const c = g.contours[plano.contorno];                             // o contorno escolhido (0 é sempre o de fora)
    if (!c) return null;                                              // índice de contorno errado: descarta o plano em vez de rebentar

    // Os pontos de ancoragem são o início do contorno + o fim de cada segmento,
    // MENOS o último — porque esse volta ao início e repetiria o primeiro ponto.
    const anchors = [c.start, ...c.segs.slice(0, -1).map((s) => s.p)];  // lista dos pontos on-curve, pela ordem em que a fonte os define
    const curva = c.segs[plano.seg];                                  // o segmento que vai ser trabalhado neste plano — chamado `curva` e NÃO `seg` de propósito: o objecto devolvido já leva um `seg` com o ÍNDICE, e repetir o nome apagava-o
    if (!curva || curva.t !== 'c') return null;                       // só um segmento CURVO tem pegas para rodar — uma recta não serve

    const iFim = (plano.seg + 1) % anchors.length;                    // índice da âncora onde o segmento termina; o resto da divisão fecha o contorno no ponto 0
    const pivo = plano.pega === 'c1' ? anchors[plano.seg] : anchors[iFim];  // a pega c1 nasce na âncora inicial, a c2 na final — é à volta dela que a pega roda
    const ponta = curva[plano.pega];                                  // a ponta da pega na posição verdadeira da fonte
    const vx = ponta[0] - pivo[0], vy = ponta[1] - pivo[1];           // o vector da pega, medido a partir do seu pivô

    const anguloCerto = Math.atan2(vy, vx);                           // direcção verdadeira da pega, em radianos — nesta fonte dá sempre um múltiplo exacto de 90°
    const magCerta = Math.hypot(vx, vy);                              // comprimento verdadeiro da pega
    const anguloErrado = anguloCerto + (plano.desvio * Math.PI) / 180;  // direcção de partida: a mesma, desviada os graus pedidos em PLANOS
    const magErrada = magCerta * plano.estica;                        // comprimento de partida: um pouco esticado de mais, como um primeiro esboço

    // A caixa a enquadrar junta os quatro pontos do segmento nos DOIS estados
    // (errado e certo), para que a pega não saia do ecrã a meio da rotação.
    const pontaErrada = [pivo[0] + Math.cos(anguloErrado) * magErrada,  // onde a ponta da pega começa, em X
                         pivo[1] + Math.sin(anguloErrado) * magErrada];  // e em Y
    const pontaCerta = ponta;                                         // guardada com este nome para o enquadramento poder testar os dois extremos do gesto
    const juntos = [anchors[plano.seg], curva.c1, curva.c2, anchors[iFim], pontaErrada];  // todos os pontos que têm de caber no enquadramento: os quatro do segmento mais a ponta no estado errado
    const xs = juntos.map((q) => q[0]), ys = juntos.map((q) => q[1]);  // separa as coordenadas para achar os extremos
    const bw = Math.max(...xs) - Math.min(...xs);                     // largura da caixa, em unidades da fonte
    const bh = Math.max(...ys) - Math.min(...ys);                     // altura da caixa, nas mesmas unidades

    const duracao = FASES.entrada + FASES.ajuste + FASES.fixa;        // duração base deste plano; o último leva um acréscimo logo a seguir
    return { ...plano, contornos: g.contours, pivo, pontaCerta, pontaErrada, anguloCerto, magCerta, anguloErrado, magErrada, bw, bh, duracao };
  }

  const CENA = PLANOS.map(prepara).filter(Boolean);                   // prepara todos os planos e deita fora os que não sejam utilizáveis
  if (!CENA.length) return;                                           // nenhum plano válido: não vale a pena montar o loop
  CENA[CENA.length - 1].duracao += FIXA_FINAL - FASES.fixa;           // alonga a pausa final do último plano, sem mexer nos outros

  /* ══ 3 · O GESTO — a pega a rodar para o eixo ══════════════════════════ */

  // Devolve os contornos do glifo com UMA só ponta de pega mudada, na posição
  // que lhe corresponde no instante `t` (0 = estado errado, 1 = fonte real).
  //
  // A rotação é interpolada em coordenadas POLARES — ângulo e comprimento em
  // separado — e não como uma linha recta entre as duas pontas. Interpolar a
  // direito cortava caminho pelo interior do arco e encurtava a pega a meio do
  // movimento, o que se vê logo: a pega parecia encolher e voltar a crescer.
  //
  // Só a ponta da pega muda: as âncoras nunca se mexem. É isso que garante que
  // o resto do contorno fica agarrado e que nenhum segmento vizinho se
  // descola — um problema real quando se mexe num ponto partilhado.
  function geometria(p, t) {
    const ang = mistura(p.anguloErrado, p.anguloCerto, t);            // direcção da pega neste instante
    const mag = mistura(p.magErrada, p.magCerta, t);                  // comprimento da pega neste instante
    const nova = [p.pivo[0] + Math.cos(ang) * mag,                    // ponta da pega em X, recalculada a partir do pivô
                  p.pivo[1] + Math.sin(ang) * mag];                   // e em Y

    return p.contornos.map((c, ci) => {                               // percorre os contornos do glifo (um "o" tem dois: fora e dentro)
      if (ci !== p.contorno) return c;                                // contorno que não é o deste plano: devolvido tal e qual, sem cópia
      return {
        start: c.start,                                               // o início do contorno nunca muda
        segs: c.segs.map((s, i) => (i === p.seg ? { ...s, [p.pega]: nova } : s)),  // só o segmento do plano leva a pega nova; os outros passam intactos
      };
    });
  }

  /* ══ 4 · DESENHO ═══════════════════════════════════════════════════════ */

  let larguraCSS = 0, alturaCSS = 0;                                  // tamanho do bloco em píxeis de CSS — actualizado pelo ResizeObserver lá em baixo

  // `devicePixelRatio` é quantos píxeis físicos do ecrã cabem num píxel de CSS
  // (2 ou 3 num ecrã Retina). Sem o multiplicar aqui, tudo sairia desfocado.
  function redimensiona() {
    const r = wrap.getBoundingClientRect();                           // mede o bloco já com o tamanho que o CSS lhe deu
    if (!r.width || !r.height) return;                                // bloco ainda sem tamanho (ex: display:none): não mexe no canvas
    const dpr = Math.min(window.devicePixelRatio || 1, 2);            // limitado a 2 — num ecrã a 3× o ganho visual é nulo e o custo de desenho é +125%
    larguraCSS = r.width;                                             // guarda a largura em píxeis de CSS, que é a unidade usada em todo o desenho
    alturaCSS = r.height;                                             // idem para a altura
    canvas.width = Math.round(r.width * dpr);                         // número REAL de píxeis do canvas na horizontal
    canvas.height = Math.round(r.height * dpr);                       // idem na vertical
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);                           // diz ao contexto para multiplicar tudo por dpr — assim o resto do código pensa sempre em píxeis de CSS
  }

  // A objectiva do plano. Na fonte o Y cresce PARA CIMA a partir da linha de
  // base; no canvas cresce para baixo — por isso o Y leva um sinal menos.
  //
  // A ampliação é fixada pela ALTURA, não pela menor das duas medidas. A altura
  // é o lado curto nas duas proporções que o bloco tem (16/9 e 4/3), por isso é
  // ela que garante que o detalhe nunca cai fora no telemóvel; o ecrã largo
  // limita-se a mostrar mais letra para os lados. Dividir a largura por ENQ_MIN
  // antes de comparar é o que impede que um detalhe achatado fique minúsculo
  // no meio de um ecrã vazio — a armadilha clássica de encaixar pela menor das
  // escalas.
  function objectiva(p, zoom) {
    const campo = Math.max(p.bh, p.bw / ENQ_MIN) / p.enquadra;        // quantas unidades da fonte cabem na altura do bloco; sobe `enquadra` no plano para fechar mais o enquadramento
    const escala = Math.min(alturaCSS / campo, ESCALA_MAX) * zoom;    // píxeis por unidade da fonte, já com o movimento de câmara aplicado

    // O `foco` de cada plano diz onde o pivô deve ficar no ecrã, mas é só uma
    // preferência de composição: a pega tem comprimento fixo em píxeis e, num
    // bloco 4/3 de telemóvel, uma preferência boa no ecrã largo atira-a para
    // fora do enquadramento. Por isso o foco é EMPURRADO para dentro até as
    // duas posições extremas da ponta (a errada e a certa) caberem na margem.
    // Sem isto o gesto continua a acontecer — mas fora do ecrã, invisível.
    const margem = Math.min(larguraCSS, alturaCSS) * 0.07;            // folga mínima entre a ponta da pega e o bordo; sobe para as pontas ficarem mais afastadas das margens
    const enquadraEixo = (tamanho, preferido, deslocs) => {           // devolve a fracção 0–1 já corrigida, para um eixo
      let min = 0, max = 1;                                           // intervalo de fracções admissíveis, começa aberto
      deslocs.forEach((d) => {                                        // cada extremo da pega, já em píxeis relativos ao pivô
        min = Math.max(min, (margem - d) / tamanho);                  // o pivô não pode estar tão atrás que a ponta caia antes da margem
        max = Math.min(max, (tamanho - margem - d) / tamanho);        // nem tão à frente que a ponta passe a margem oposta
      });
      if (min > max) return limita((tamanho / 2 - (Math.min(...deslocs) + Math.max(...deslocs)) / 2) / tamanho);  // pega maior que o bloco: centra o seu percurso e aceita perder as pontas
      return Math.min(Math.max(preferido, min), max);                 // caso normal: a preferência do plano, empurrada para dentro do intervalo
    };
    const dx = [p.pontaCerta, p.pontaErrada].map((q) => (q[0] - p.pivo[0]) * escala);  // deslocamento horizontal de cada extremo, em píxeis
    const dy = [p.pontaCerta, p.pontaErrada].map((q) => -(q[1] - p.pivo[1]) * escala);  // idem na vertical, já com o eixo invertido
    const fx = enquadraEixo(larguraCSS, p.foco[0], dx);               // fracção horizontal final
    const fy = enquadraEixo(alturaCSS, p.foco[1], dy);                // fracção vertical final

    return {
      X: (x) => larguraCSS * fx + (x - p.pivo[0]) * escala,           // converte X pondo o pivô no ponto do ecrã que o foco corrigido pedir
      Y: (y) => alturaCSS * fy - (y - p.pivo[1]) * escala,            // converte Y invertendo o sentido — o menos é a inversão do eixo
    };
  }

  const rgba = (a) => `rgba(${COR},${a})`;                            // monta a cor com a opacidade pedida — evita repetir a string em cada camada

  // Quadrado centrado num ponto. Os pontos de um editor de fontes são sempre
  // quadrados do MESMO tamanho no ecrã, independentemente do zoom — por isso o
  // lado é dado em píxeis e nunca passa pela escala da letra.
  function quadrado(x, y, fraccao) {
    const lado = Math.max(LADO_MIN, alturaCSS * fraccao);             // converte a fracção da altura do bloco em píxeis, nunca abaixo do mínimo
    ctx.fillRect(x - lado / 2, y - lado / 2, lado, lado);             // desenha a partir do canto superior esquerdo, daí subtrair metade do lado em cada eixo
  }

  // O contorno inteiro do glifo, de uma assentada. A maior parte fica fora do
  // ecrã em grande plano — e é isso que faz o enquadramento parecer um recorte
  // de uma letra a sério, em vez de uma forma solta desenhada à medida.
  function desenhaContorno(contornos, proj) {
    ctx.strokeStyle = rgba(1);                                        // branco cheio — na referência o contorno não é apagado, é só finíssimo
    ctx.lineWidth = TRACO;                                            // espessura definida nos AJUSTES
    ctx.lineJoin = 'round';                                           // cantos arredondados na junção de dois segmentos — evita bicos nos ângulos fechados
    ctx.beginPath();                                                  // um único traçado para a letra toda, para o contorno sair contínuo

    contornos.forEach((c) => {                                        // percorre os contornos (exterior, interior…)
      ctx.moveTo(proj.X(c.start[0]), proj.Y(c.start[1]));             // levanta a caneta e põe-na no início deste contorno
      c.segs.forEach((s) => {                                         // percorre os segmentos pela ordem da fonte
        if (s.t === 'l') ctx.lineTo(proj.X(s.p[0]), proj.Y(s.p[1]));  // segmento recto: basta o ponto de chegada
        else ctx.bezierCurveTo(proj.X(s.c1[0]), proj.Y(s.c1[1]),      // curva cúbica: primeiro ponto de controlo
                               proj.X(s.c2[0]), proj.Y(s.c2[1]),      // segundo ponto de controlo
                               proj.X(s.p[0]), proj.Y(s.p[1]));       // e o ponto de chegada
      });
    });
    ctx.stroke();                                                     // pinta de uma vez o traçado inteiro montado acima
  }

  // As pegas de Bézier: a linha do ponto de ancoragem até ao seu ponto de
  // controlo, com um quadrado na ponta. A pega que está a ser trabalhada
  // desenha-se a branco cheio; as outras ficam apagadas, para o olho saber
  // sozinho onde é a acção sem precisar de nenhuma marca a apontar.
  function desenhaPegas(contornos, proj, p) {
    contornos.forEach((c, ci) => {                                    // percorre os contornos do glifo
      const anchors = [c.start, ...c.segs.slice(0, -1).map((s) => s.p)];  // reconstrói a lista de âncoras deste contorno, como no prepara()
      c.segs.forEach((s, i) => {                                      // percorre os segmentos
        if (s.t !== 'c') return;                                      // rectas não têm pontos de controlo — não há pega nenhuma a desenhar
        const fim = (i + 1) % anchors.length;                         // índice da âncora onde o segmento termina
        const pares = [['c1', anchors[i], s.c1], ['c2', anchors[fim], s.c2]];  // as duas pegas: uma sai da âncora inicial, a outra chega à final

        pares.forEach(([nome, ancora, controlo]) => {
          const heroi = ci === p.contorno && i === p.seg && nome === p.pega;  // é esta a pega que roda neste plano?
          ctx.strokeStyle = rgba(heroi ? 1 : ALPHA_PEGAS);            // a LINHA da pega em acção fica a branco cheio, as restantes esbatidas — só a linha, não o quadrado (2026-09-14)
          ctx.lineWidth = 1;                                          // as pegas são sempre finas, mesmo que o contorno engrosse
          ctx.beginPath();                                            // traçado próprio por pega
          ctx.moveTo(proj.X(ancora[0]), proj.Y(ancora[1]));           // começa no ponto de ancoragem
          ctx.lineTo(proj.X(controlo[0]), proj.Y(controlo[1]));       // vai até à ponta
          ctx.stroke();                                               // pinta a linha da pega
          ctx.fillStyle = rgba(1);                                    // o quadrado da ponta é SEMPRE branco cheio, igual às âncoras — deixou de herdar a opacidade esbatida da linha (2026-09-14)
          quadrado(proj.X(controlo[0]), proj.Y(controlo[1]), LADO_CONTROLO);  // quadradinho na ponta, menor que o das âncoras
        });
      });
    });
  }

  // Os pontos de ancoragem, todos ao mesmo tamanho e todos presentes desde o
  // primeiro fotograma do plano: aqui não se assiste à construção da letra,
  // entra-se a meio do trabalho já feito.
  function desenhaAncoras(contornos, proj) {
    ctx.fillStyle = rgba(1);                                          // branco cheio — são a marca gráfica mais forte do enquadramento
    contornos.forEach((c) => {                                        // percorre os contornos
      const anchors = [c.start, ...c.segs.slice(0, -1).map((s) => s.p)];  // as âncoras deste contorno
      anchors.forEach(([x, y]) => quadrado(proj.X(x), proj.Y(y), LADO_ANCORA));  // um quadrado por ponto, do tamanho fixo dos AJUSTES
    });
  }

  /* ══ 5 · UM FOTOGRAMA ══════════════════════════════════════════════════ */

  // Desenha o plano `p` no instante `tempo` (em ms dentro desse plano).
  function fotograma(p, tempo) {
    ctx.clearRect(0, 0, larguraCSS, alturaCSS);                       // apaga o fotograma anterior — sem isto os rastos acumulam-se

    const bruto = limita((tempo - FASES.entrada) / FASES.ajuste);     // progresso cru do gesto: 0 durante a entrada, sobe durante o ajuste, fica em 1 na pausa
    const t = chega(bruto);                                           // passa pela curva de aceleração — é aqui que o movimento ganha a chegada seca
    const zoom = 1 + p.camara * (tempo / p.duracao);                  // movimento de câmara ao longo do plano: positivo aproxima, negativo afasta, 0 trava
    const contornos = geometria(p, t);                                // a geometria deste instante, com a pega já na posição que lhe toca
    const proj = objectiva(p, zoom);                                  // a conversão de coordenadas deste instante

    desenhaContorno(contornos, proj);                                 // camada 1: o contorno da letra
    desenhaPegas(contornos, proj, p);                                 // camada 2: as pegas, com a que roda em destaque
    desenhaAncoras(contornos, proj);                                  // camada 3: os quadrados das âncoras, sempre por cima de tudo o resto
  }

  /* ══ 6 · ARRANQUE E CICLO ══════════════════════════════════════════════ */

  redimensiona();                                                     // primeira medição, antes de desenhar o que quer que seja

  // Quem pede menos movimento no sistema não vê animação nenhuma: fica com o
  // ÚLTIMO plano na sua forma verdadeira — o mesmo fotograma em que a sequência
  // acaba. Mesma decisão de litet-specimen.js.
  const ULTIMO = CENA[CENA.length - 1];                               // o plano final, que é também o cartaz da versão parada
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const parado = () => fotograma(ULTIMO, ULTIMO.duracao);           // desenha-o no seu último instante, com o gesto já concluído
    parado();                                                         // pinta uma vez
    new ResizeObserver(() => { redimensiona(); parado(); }).observe(wrap);  // mesmo parado, o bloco tem de se redesenhar quando a janela muda de tamanho
    return;                                                           // não monta o loop de animação
  }

  let planoActual = 0;                                                // índice do plano em CENA que está no ar
  let decorrido = 0;                                                  // tempo já passado dentro do plano actual, em ms
  let ultimo = 0;                                                     // instante do fotograma anterior, para calcular o intervalo entre fotogramas
  let pedido = null;                                                  // identificador do próximo fotograma agendado — guardado para o poder cancelar

  function passo(agora) {
    const delta = ultimo ? Math.min(agora - ultimo, 100) : 16;        // tempo desde o último fotograma; o tecto de 100ms evita um salto enorme ao voltar de um separador em segundo plano
    ultimo = agora;                                                   // guarda este instante para o fotograma seguinte
    decorrido += delta;                                               // avança o relógio do plano actual

    if (decorrido >= CENA[planoActual].duracao) {                     // este plano chegou ao fim
      decorrido = 0;                                                  // reinicia o relógio
      planoActual = (planoActual + 1) % CENA.length;                  // corte seco para o plano seguinte, voltando ao primeiro no fim da lista
    }

    fotograma(CENA[planoActual], decorrido);                          // desenha o estado actual
    pedido = requestAnimationFrame(passo);                            // agenda o próximo fotograma, sincronizado com o ecrã
  }

  function arranca() {
    if (pedido) return;                                               // já está a correr — não duplica o ciclo
    ultimo = 0;                                                       // esquece o instante antigo, senão o primeiro delta seria o tempo todo em que esteve parado
    decorrido = 0;                                                    // recomeça o plano actual do princípio, para nunca reaparecer a meio de um gesto
    pedido = requestAnimationFrame(passo);                            // pede o primeiro fotograma
  }
  function para() {
    cancelAnimationFrame(pedido);                                     // cancela o fotograma agendado
    pedido = null;                                                    // marca como parado, para o arranca() saber que pode voltar a pedir
  }

  new ResizeObserver(redimensiona).observe(wrap);                     // sempre que o bloco mudar de tamanho (rodar o telemóvel, redimensionar a janela), remede o canvas

  // Só anima com o bloco mesmo à vista — poupa CPU e bateria, e o limiar de
  // 0.3 impede que a sequência arranque quando só 1px assomou no fundo do ecrã.
  new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { e.isIntersecting ? arranca() : para(); });  // entrou no ecrã: arranca; saiu: pára
  }, { threshold: 0.3 }).observe(wrap);                               // passa a vigiar o bloco da animação; sobe o limiar para arrancar só com o bloco mais visível
})();
