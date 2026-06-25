// Francisco Martins — portfolio interactions
// Scroll reveals, active work-list tracking, scroll progress line.
// All features guard on element existence so this file is shared by every page.

document.addEventListener('DOMContentLoaded', () => {

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

  /* ---------- Header adapts over any dark section (hero + work-with-me) ---------- */
  const header = document.querySelector('.site-header');
  const darkSections = Array.from(document.querySelectorAll('.dark-section, .page-footer'));
  if (header && darkSections.length) {
    let hTicking = false;
    const syncHeader = () => {
      const hb = header.offsetHeight; // top header band
      const onDark = darkSections.some((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= hb && r.bottom > hb; // section sits behind the header band
      });
      header.classList.toggle('on-dark', onDark);
      hTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!hTicking) { hTicking = true; requestAnimationFrame(syncHeader); }
    }, { passive: true });
    window.addEventListener('resize', syncHeader, { passive: true });
    syncHeader();
  }

  /* ---------- Hero: start the terminal type-out on load ---------- */
  startHeroType();

});
