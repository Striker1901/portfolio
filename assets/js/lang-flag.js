/* lang-flag.js — Portfolio
   WHAT  Decide a língua da página (EN ou PT) e marca-a no `<html>` ANTES de qualquer CSS
         carregar. Trazido do site da SOLITSU, 03-09-2026 — mesma técnica, só a omissão
         invertida: aqui o HTML puro já é INGLÊS (lá era português), por isso sem escolha
         guardada fica em `en`, não `pt`.
   TERM  `document.documentElement` — o `<html>`, o elemento mais cedo disponível para um
         script no `<head>` mexer, antes até do resto do `<head>` carregar.
   WHY   Sem isto, uma visita que já tinha escolhido português numa visita anterior via
         `<html lang="en">` incorrecto durante o instante entre "a página aparece" e "o
         resto do JS corre lá em baixo" — o `lang` errado é um problema de acessibilidade
         real (um leitor de ecrã escolhe a voz/pronúncia a partir deste atributo). O texto
         visível só troca mais tarde, em `lang.js` — este ficheiro só acerta o ATRIBUTO,
         que é barato e crítico; o texto é caro e menos crítico. */
try {
  // `localStorage` guarda a escolha entre visitas; `catch` cobre o caso raro de o browser
  // recusar localStorage (modo privado estrito) — nesse caso cai sempre em inglês.
  const saved = localStorage.getItem('portfolio:lang'); // 'en' | 'pt' | null (nunca visitou)
  const lang = saved === 'pt' ? 'pt' : 'en'; // por omissão inglês, tal como o HTML puro
  document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en'; // atributo `lang` real, para leitores de ecrã
  document.documentElement.dataset.lang = lang; // `data-lang`, para o CSS/JS reagirem se precisarem
} catch {
  // localStorage indisponível — fica no inglês por omissão, que já é o que o HTML puro mostra.
}
