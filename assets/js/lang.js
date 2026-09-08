/* lang.js — Portfolio
   WHAT  O dicionário EN/PT inteiro do site, mais a lógica que troca a língua visível ao
         clicar no botão "EN"/"PT" da nav — sem recarregar a página, no mesmo URL.
         Trazido do site da SOLITSU, 03-09-2026, adaptado ao Portfolio (língua nativa
         inglês, não português — ver a nota em `getLang()`).
   TERM  `data-i18n` — um atributo próprio que cada elemento traduzível ganha no HTML, com
         uma "chave" (ex.: `"nav.works"`) que aponta para o par EN/PT certo aqui dentro.
         `I18N` é só um objecto comum — duas secções, `en` e `pt`, com a MESMA forma por
         dentro, para nunca faltar uma chave numa língua que exista na outra.
   WHY   Pedido do Francisco (03-09-2026): "o mesmo toggle PT-EN que tenho no meu site
         SOLITSU, exatamente igual" — um PT/EN a sério, não um botão decorativo. Ficheiro
         próprio (não dentro de `main.js`), mesma separação que a SOLITSU já usa. */
const I18N = {
  en: {
    nav: {
      works: 'Works',
      about: 'About',
      ctaWork: 'Work with me',
      ctaContact: 'Get in touch',
      backIndex: '&larr; Index',
      backPhotography: '&larr; Photography',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      switchToPt: 'See in Portuguese',
      switchToEn: 'Switch to English',
    },
    hero: {
      title: 'PORTFOLIO',
      contact: 'Contact me',
      lookDown: 'Look down',
    },
    works: {
      poliDisc: 'Rebranding — Identity',
      litetDisc: 'Typeface Design',
      n1543Disc: 'Packaging — Special Edition',
      xadrezDisc: 'Rebranding — Identity',
      photoTitle: 'Photography',
      photoDisc: 'Portrait &amp; Film',
    },
    about: {
      p1: "I started out in Computer Engineering, then switched to Graphic Design and Multimedia, which I completed at ESAD.CR. That shift never erased the systems thinking I carry from engineering. It shows up in everything I design, from visual identity and branding to packaging and typography.",
      p2: "That technical background is a real asset today. Understanding technology from the inside gives me the confidence to navigate this new era where design and AI increasingly overlap, and I use AI tools as execution assistants: they speed up the process, they never replace creative direction.",
      p3: "I'm determined and focused on whatever I set out to do, and that same technical rigor is what I bring to every project.",
      p4: 'I split the rest of my time between piano, photography, drawing, and 3D printing, more out of curiosity than as hobbies in the usual sense. I genuinely love learning new things, and that curiosity runs through everything I do, on and off the screen.',
    },
    footer: {
      location: 'Lisbon, Portugal',
      credit: 'Designed &amp; built by Francisco',
    },
    caseLabel: {
      discipline: 'Discipline', for: 'For', scope: 'Scope',
      context: 'Context', objective: 'Objective', finalProposal: 'Final Proposal',
      previous: 'Previous', next: 'Next', back: 'Back',
    },
    poli: {
      tagline: 'The largest entrepreneurship network in Portuguese polytechnic higher education.',
      discipline: 'Rebranding — Visual Identity',
      for: 'National competition',
      scope: 'Logo, posters, stationery, merchandising',
      context: 'Poliempreende is a national entrepreneurship network connected to polytechnic higher-education institutions across Portugal.',
      objective: 'The competition called for a redesign of the visual identity, with the goal of modernising the brand and reinforcing its relevance among students, young entrepreneurs and investors.',
      finalProposal: 'The final proposal modernises the visual identity to convey dynamism and the capacity to adapt.',
      navPrev: '&larr; Index',
      navNext: 'Litet Snitt &rarr;',
    },
    litet: {
      tagline: 'A geometric, futuristic typeface inspired by Scandinavian typography.',
      discipline: 'Typeface Design — Editorial',
      for: 'Typography course, ESAD.CR',
      scope: 'Typeface, specimen, editorial composition',
      context: 'Developed in the Typography course at ESAD.CR, this project explores typography as the main element of visual communication, through a contemporary editorial composition.',
      objective: "To build a structured typographic composition, applying principles of hierarchy, alignment, rhythm and modular organisation to bring out the typeface's legibility and expression.",
      finalProposal: 'The final proposal takes a minimalist approach built on a modular grid, combining visual hierarchy, contrast of scale and negative space to create a clean, balanced and functional composition.',
      navPrev: '&larr; Poliempreende',
      navNext: '1543 &rarr;',
    },
    n1543: {
      tagline: 'Portugal and Japan, 1543.',
      discipline: 'Packaging — Special Edition',
      for: 'Academic brief, ESAD.CR',
      scope: 'Label, box, logotype',
      context: 'Developed for an academic brief focused on special-edition packaging design. The challenge: create a label and packaging for a limited-edition olive oil celebrating the historic encounter between Portugal and Japan in 1543 — the year the first Portuguese landed in Japan, beginning one of the most significant cultural exchanges of the Age of Discovery.',
      objective: 'To develop a packaging identity able to visually translate the dialogue between two distinct cultures — Portuguese and Japanese — into a coherent, contemporary piece with the presence of a premium product, carrying the historical weight of the 1543 encounter.',
      finalProposal: 'The final proposal builds on the visual tension between two opposite yet complementary aesthetic systems: the restraint and emptiness of Japanese tradition, and the ornamentation and expressiveness of Portuguese culture. The result is a special-edition package that uses typography, composition and materials to evoke that historic fusion.',
      navPrev: '&larr; Litet Snitt',
      navNext: 'Clube de Xadrez do Barreiro &rarr;',
    },
    xadrez: {
      tagline: 'The largest chess association in Barreiro, with more than 25 years of history.',
      discipline: 'Rebranding — Visual Identity',
      for: 'Clube de Xadrez do Barreiro',
      scope: 'Identity, posters, signage, stationery, merchandising',
      context: 'A rebranding project developed for Clube de Xadrez do Barreiro, a non-profit association with more than 25 years of activity promoting chess and the local community.',
      objective: "To modernise the club's visual identity, making it more contemporary, recognisable and adaptable across different communication media, without losing the connection to the association's tradition.",
      finalProposal: 'The final proposal presents a minimal, strategic visual identity built on simple shapes, typographic contrast and a clean graphic language — able to represent, at once, the logic, concentration and competitiveness associated with chess.',
      navPrev: '&larr; 1543',
      navNext: 'Filipa &rarr;',
    },
    photo: {
      title: 'Photography',
      tagline: 'Portrait series — natural light, studio, and film.',
      filipaDisc: 'Seaside &amp; studio sessions',
      beahDisc: 'Studio sessions',
      navBack: '&larr; Index',
    },
    filipa: {
      tagline: 'Portrait series — a seaside session at golden hour.',
      navPrev: '&larr; Clube de Xadrez do Barreiro',
      navNext: 'Beah &rarr;',
    },
    beah: {
      tagline: 'Portrait series — two studio sessions, monochrome and warm light.',
      navPrev: '&larr; Filipa',
      navNext: 'Index &rarr;',
    },
    meta: {
      home: 'Francisco Martins — Brand &amp; Web Designer',
      photo: 'Photography — Francisco Martins',
    },
  },
  pt: {
    nav: {
      works: 'Trabalhos',
      about: 'Sobre',
      ctaWork: 'Trabalha comigo',
      ctaContact: 'Fala comigo',
      backIndex: '&larr; Índice',
      backPhotography: '&larr; Fotografia',
      openMenu: 'Abrir menu',
      closeMenu: 'Fechar menu',
      switchToPt: 'Mudar para português',
      switchToEn: 'Ver em inglês',
    },
    hero: {
      title: 'PORTFÓLIO',
      contact: 'Contacta-me',
      lookDown: 'Desce',
    },
    works: {
      poliDisc: 'Rebranding — Identidade',
      litetDisc: 'Design de Tipografia',
      n1543Disc: 'Packaging — Edição Especial',
      xadrezDisc: 'Rebranding — Identidade',
      photoTitle: 'Fotografia',
      photoDisc: 'Retrato &amp; Filme',
    },
    about: {
      p1: 'Comecei o percurso académico em Engenharia Informática, mas mudei para Design Gráfico e Multimédia, curso que terminei na ESAD.CR. Essa mudança não apagou a lógica de sistema que trago da engenharia: está presente em tudo o que desenho, seja identidade visual, branding, packaging ou tipografia.',
      p2: 'Esse background técnico é hoje uma vantagem concreta. Perceber tecnologia por dentro dá-me confiança para navegar esta nova era em que design e IA se cruzam cada vez mais, e uso ferramentas de IA como assistentes de execução: aceleram o processo, nunca substituem a direção criativa.',
      p3: 'Sou determinado e focado no que me proponho a fazer, e é esse rigor técnico que levo para cada projeto.',
      p4: 'Divido o resto do tempo a tocar piano, fotografia, desenho e impressão 3D, mais por curiosidade do que por hobby propriamente dito. Gosto genuinamente de aprender coisas novas, e essa vontade atravessa tudo o que faço, dentro e fora do ecrã.',
    },
    footer: {
      location: 'Lisboa, Portugal',
      credit: 'Concebido e construído pelo Francisco',
    },
    caseLabel: {
      discipline: 'Disciplina', for: 'Para', scope: 'Âmbito',
      context: 'Contexto', objective: 'Objetivo', finalProposal: 'Proposta Final',
      previous: 'Anterior', next: 'Seguinte', back: 'Voltar',
    },
    poli: {
      tagline: 'A maior rede de empreendedorismo do ensino superior politécnico português.',
      discipline: 'Rebranding — Identidade Visual',
      for: 'Concurso nacional',
      scope: 'Logótipo, cartazes, papelaria, merchandising',
      context: 'A Poliempreende é uma rede nacional de empreendedorismo ligada a instituições de ensino superior politécnico em todo o país.',
      objective: 'O concurso pedia um redesenho da identidade visual, com o objetivo de modernizar a marca e reforçar a sua relevância junto de estudantes, jovens empreendedores e investidores.',
      finalProposal: 'A proposta final moderniza a identidade visual para transmitir dinamismo e capacidade de adaptação.',
      navPrev: '&larr; Índice',
      navNext: 'Litet Snitt &rarr;',
    },
    litet: {
      tagline: 'Uma tipografia geométrica e futurista, inspirada na tipografia escandinava.',
      discipline: 'Design de Tipografia — Editorial',
      for: 'Cadeira de Tipografia, ESAD.CR',
      scope: 'Tipografia, specimen, composição editorial',
      context: 'Desenvolvido na cadeira de Tipografia da ESAD.CR, este projeto explora a tipografia como elemento principal da comunicação visual, através de uma composição editorial contemporânea.',
      objective: 'Construir uma composição tipográfica estruturada, aplicando princípios de hierarquia, alinhamento, ritmo e organização modular para valorizar a legibilidade e a expressão da tipografia.',
      finalProposal: 'A proposta final segue uma abordagem minimalista assente numa grelha modular, combinando hierarquia visual, contraste de escala e espaço negativo para criar uma composição limpa, equilibrada e funcional.',
      navPrev: '&larr; Poliempreende',
      navNext: '1543 &rarr;',
    },
    n1543: {
      tagline: 'Portugal e o Japão, 1543.',
      discipline: 'Packaging — Edição Especial',
      for: 'Trabalho académico, ESAD.CR',
      scope: 'Rótulo, caixa, logótipo',
      context: 'Desenvolvido para um trabalho académico focado em design de packaging de edição especial. O desafio: criar um rótulo e embalagem para um azeite de edição limitada que celebra o encontro histórico entre Portugal e o Japão em 1543 — o ano em que os primeiros portugueses desembarcaram no Japão, dando início a uma das trocas culturais mais significativas da Era dos Descobrimentos.',
      objective: 'Desenvolver uma identidade de packaging capaz de traduzir visualmente o diálogo entre duas culturas distintas — portuguesa e japonesa — numa peça coerente e contemporânea, com a presença de um produto premium, e que carregue o peso histórico do encontro de 1543.',
      finalProposal: 'A proposta final constrói-se sobre a tensão visual entre dois sistemas estéticos opostos mas complementares: a contenção e o vazio da tradição japonesa, e a ornamentação e expressividade da cultura portuguesa. O resultado é uma embalagem de edição especial que usa tipografia, composição e materiais para evocar essa fusão histórica.',
      navPrev: '&larr; Litet Snitt',
      navNext: 'Clube de Xadrez do Barreiro &rarr;',
    },
    xadrez: {
      tagline: 'A maior associação de xadrez do Barreiro, com mais de 25 anos de história.',
      discipline: 'Rebranding — Identidade Visual',
      for: 'Clube de Xadrez do Barreiro',
      scope: 'Identidade, cartazes, sinalética, papelaria, merchandising',
      context: 'Um projeto de rebranding desenvolvido para o Clube de Xadrez do Barreiro, uma associação sem fins lucrativos com mais de 25 anos de atividade a promover o xadrez e a comunidade local.',
      objective: 'Modernizar a identidade visual do clube, tornando-a mais contemporânea, reconhecível e adaptável a diferentes suportes de comunicação, sem perder a ligação à tradição da associação.',
      finalProposal: 'A proposta final apresenta uma identidade visual minimal e estratégica, construída sobre formas simples, contraste tipográfico e uma linguagem gráfica limpa — capaz de representar, ao mesmo tempo, a lógica, a concentração e a competitividade associadas ao xadrez.',
      navPrev: '&larr; 1543',
      navNext: 'Filipa &rarr;',
    },
    photo: {
      title: 'Fotografia',
      tagline: 'Série de retratos — luz natural, estúdio e filme.',
      filipaDisc: 'Sessões à beira-mar &amp; estúdio',
      beahDisc: 'Sessões de estúdio',
      navBack: '&larr; Índice',
    },
    filipa: {
      tagline: 'Série de retratos — uma sessão à beira-mar na hora dourada.',
      navPrev: '&larr; Clube de Xadrez do Barreiro',
      navNext: 'Beah &rarr;',
    },
    beah: {
      tagline: 'Série de retratos — duas sessões de estúdio, monocromático e luz quente.',
      navPrev: '&larr; Filipa',
      navNext: 'Índice &rarr;',
    },
    meta: {
      home: 'Francisco Martins — Design de Marca &amp; Web',
      photo: 'Fotografia — Francisco Martins',
    },
  },
};

/* WHAT  Lê a língua actual a partir do `<html>` — a mesma fonte que `lang-flag.js` já
         escreveu antes deste ficheiro correr.
   TERM  `document.documentElement.dataset.lang` — o atributo `data-lang`; `'en'` por
         omissão cobre o caso (raro) de este script correr antes do `lang-flag.js` ter
         tido oportunidade de o escrever. */
function getLang() {
  return document.documentElement.dataset.lang === 'pt' ? 'pt' : 'en';
}

/* WHAT  Vai a `I18N[lang]` buscar o valor de uma chave composta como `"poli.objective"`.
   TERM  `"a.b".split('.')` — parte a chave nos pontos, para descer nível a nível dentro do
         dicionário sem escrever um `if` por secção.
   WHY   Cada `data-i18n` no HTML é uma chave destas — uma função só, reutilizada por todos
         os elementos traduzíveis do site, em vez de um `switch` gigante. */
function textFor(lang, key) {
  return key.split('.').reduce((node, part) => (node ? node[part] : undefined), I18N[lang]);
}

/* WHAT  Troca o texto de TODO elemento com `data-i18n` para a língua pedida.
   TERM  `el.innerHTML = ...` em vez de `el.textContent` — algumas frases do dicionário têm
         entidades HTML (`&rarr;`, `&larr;`, `&amp;`) que `textContent` mostraria como texto
         literal em vez do símbolo/carácter real. Usar `innerHTML` aqui é seguro porque TODO
         o conteúdo de `I18N` acima é escrito por mim, nunca vem de um utilizador.
   WHY   Uma função só percorre todas as chaves; não há uma versão à parte para as que têm
         entidades HTML lá dentro. */
function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = textFor(lang, el.dataset.i18n); // a frase certa para esta língua
    if (value !== undefined) el.innerHTML = value; // só troca se a chave existir mesmo
  });
}

/* WHAT  Marca qual dos dois botões "EN"/"PT" está activo (`aria-pressed`); só o botão
         INACTIVO ganha uma legenda extra ("See in Portuguese"/"Mudar para português") —
         o activo fica só com o seu próprio texto ("EN"/"PT") + `aria-pressed="true"`.
   TERM  `aria-pressed` — o mesmo tipo de atributo de estado que `aria-expanded` já usa no
         hambúrguer (ver `nav.js`), aqui aplicado a um botão de alternância. */
function updateToggleButtons(lang) {
  document.querySelectorAll('.lang-toggle__option').forEach((btn) => {
    const isActive = btn.dataset.langOption === lang; // este botão corresponde à língua actual?
    btn.setAttribute('aria-pressed', String(isActive));
    if (isActive) {
      btn.removeAttribute('aria-label'); // o texto "EN"/"PT" + aria-pressed já chega sozinho
    } else {
      btn.setAttribute(
        'aria-label',
        btn.dataset.langOption === 'pt' ? I18N[lang].nav.switchToPt : I18N[lang].nav.switchToEn,
      );
    }
  });
}

/* WHAT  Mede a posição/largura REAIS do botão activo dentro do seu `.lang-toggle__track`
         e escreve-as em duas variáveis CSS — é o chip que lê essas variáveis para deslizar
         e redimensionar-se até lá, sempre com a mesma ALTURA fixa (`--lang-thumb-d`).
   TERM  `getBoundingClientRect()` — mede a posição de um botão RELATIVA ao seu próprio
         `.lang-toggle__track`, não à página inteira.
   WHY   Nem "EN" nem "PT" têm uma largura/posição fixa em CSS (dependem da fonte/tamanho
         real do texto) — medir ao vivo é mais robusto do que adivinhar um número fixo. */
function updateToggleIndicator() {
  document.querySelectorAll('.lang-toggle__track').forEach((track) => {
    const active = track.querySelector('.lang-toggle__option[aria-pressed="true"]');
    if (!active) return;
    const trackRect = track.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    track.style.setProperty('--lang-indicator-x', `${activeRect.left - trackRect.left}px`); // canto esquerdo do botão activo, relativo ao track
    track.style.setProperty('--lang-indicator-w', `${activeRect.width}px`); // largura real do botão activo — o chip copia-a, não o inverso
  });
}

/* WHAT  Decide o título certo para ESTA página, a partir de `data-page` no `<body>`.
   TERM  Só `index.html` (`data-page="home"`) e `photography.html` (`data-page="photo"`)
         têm um título que muda mesmo entre línguas — nas páginas de case study o título
         é sempre "{Nome do projecto} — Francisco Martins", e o nome do projecto não se
         traduz, por isso não há nada em `I18N[lang].meta` para essas páginas.
   WHY   Sem `data-page`, teria de adivinhar a página a partir do `pathname` do URL —
         frágil se algum ficheiro for renomeado. Um atributo explícito no `<body>` não
         depende de nada disso. */
function titleFor(lang) {
  const page = document.body.dataset.page;
  const entry = page && I18N[lang].meta[page];
  return entry || document.title; // sem entrada nesta página → título fica como está
}

/* WHAT  Corrige a legenda do hambúrguer ("Open menu"/"Abrir menu") para a língua actual,
         sem mudar se o menu está aberto ou fechado.
   TERM  `header.dataset.open` — o mesmo atributo que `nav.js` já liga/desliga; este
         ficheiro só lê o valor actual para escolher a frase certa, nunca o escreve. */
function updateHamburgerLabel(lang) {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav__toggle');
  if (!header || !toggle) return;
  const open = header.dataset.open === 'true';
  toggle.setAttribute('aria-label', open ? I18N[lang].nav.closeMenu : I18N[lang].nav.openMenu);
}

/* WHAT  A troca de língua inteira, num só sítio.
   TERM  `localStorage.setItem('portfolio:lang', lang)` — guarda a escolha para a próxima
         visita e para as OUTRAS páginas do site (mudar de língua aqui e depois navegar
         para uma página de case study mantém a escolha, porque `lang-flag.js` lê a mesma
         chave em todas as páginas).
   WHY   Pedido do Francisco: um toggle "a sério", não decorativo — clicar em "PT" tem de
         mudar tudo o que existe nesta página de uma vez. */
function setLang(lang) {
  const safe = lang === 'pt' ? 'pt' : 'en'; // nunca aceita um valor fora destes dois
  document.documentElement.lang = safe === 'pt' ? 'pt-PT' : 'en'; // atributo `lang` real (acessibilidade)
  document.documentElement.dataset.lang = safe; // `data-lang`, para CSS/JS reagirem
  try {
    localStorage.setItem('portfolio:lang', safe); // guarda a escolha para a próxima visita/página
  } catch {
    // localStorage indisponível — a escolha só vale para esta visita, sem quebrar o resto.
  }
  applyTranslations(safe); // troca todas as frases da página
  updateToggleButtons(safe); // actualiza aria-pressed/aria-label dos 2 botões EN/PT
  updateToggleIndicator(); // desliza o chip até ao botão que acabou de ficar activo
  updateHamburgerLabel(safe); // corrige "Open/Abrir menu" para a língua nova
  document.title = titleFor(safe); // a aba do browser também muda, título certo por página
}

/* WHAT  Ao terminar de ler o HTML todo — não antes, os `.lang-toggle__option` e os
         elementos `data-i18n` só existem depois disso — aplica a língua já decidida por
         `lang-flag.js` e liga os cliques dos dois botões EN/PT. */
document.addEventListener('DOMContentLoaded', () => {
  const lang = getLang(); // a língua já decidida por lang-flag.js, antes deste script correr
  applyTranslations(lang);
  updateToggleButtons(lang);
  updateToggleIndicator();
  updateHamburgerLabel(lang);
  document.title = titleFor(lang);
  // A fonte de marca (PP Telegraf) só chega via `@font-face` — antes de carregar, "EN"/"PT"
  // medem-se com a fonte de reserva do sistema, uma largura ligeiramente diferente.
  // `document.fonts.ready` avisa quando a fonte troca a sério, para o chip não ficar
  // desalinhado do texto real depois da troca.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateToggleIndicator);
  }
  // Ecrã a mudar de largura (rodar o telemóvel, redimensionar a janela) pode mudar a
  // largura do próprio `.lang-toggle__track` — sem isto, o chip ficava preso na posição
  // medida no carregamento, errado depois de qualquer mudança de layout.
  window.addEventListener('resize', updateToggleIndicator);
  document.querySelectorAll('.lang-toggle__option').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.langOption));
  });
});
