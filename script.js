// const textElement = document.getElementById("typing-text");

// const words = [
//   "Digital Creator",
//   "Software Developer"
// ];

// let wordIndex = 0;
// let charIndex = 0;
// let isDeleting = false;

// function typeEffect() {
//   const currentWord = words[wordIndex];
  
//   if (!isDeleting) {
//     textElement.textContent = currentWord.substring(0, charIndex + 1);
//     charIndex++;
//   } else {
//     textElement.textContent = currentWord.substring(0, charIndex - 1);
//     charIndex--;
//   }

//   let speed = isDeleting ? 60 : 100;

//   if (!isDeleting && charIndex === currentWord.length) {
//     speed = 1500; 
//     isDeleting = true;
//   } 
//   else if (isDeleting && charIndex === 0) {
//     isDeleting = false;
//     wordIndex = (wordIndex + 1) % words.length;
//     speed = 500;
//   }

//   setTimeout(typeEffect, speed);
// }

// typeEffect();
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ------------------------------------------------------------------
     1. Typing effect (your original logic, kept)
  ------------------------------------------------------------------ */
  const textElement = document.getElementById('typing-text');
  const words = ['Digital Creator', 'Software Developer'];

  if (textElement) {
    if (reduceMotion) {
      textElement.textContent = words[words.length - 1];
    } else {
      let wordIndex = 0;
      let charIndex = 0;
      let isDeleting = false;

      const typeEffect = () => {
        const currentWord = words[wordIndex];

        if (!isDeleting) {
          textElement.textContent = currentWord.substring(0, charIndex + 1);
          charIndex++;
        } else {
          textElement.textContent = currentWord.substring(0, charIndex - 1);
          charIndex--;
        }

        let speed = isDeleting ? 60 : 100;

        if (!isDeleting && charIndex === currentWord.length) {
          speed = 1500;
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          speed = 500;
        }

        setTimeout(typeEffect, speed);
      };

      typeEffect();
    }
  }

  /* ------------------------------------------------------------------
     2. Nav: scrolled state + mobile menu
  ------------------------------------------------------------------ */
  const nav = $('#nav');
  const toggle = $('#navToggle');
  const menu = $('#navMenu');

  const onScrollNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ------------------------------------------------------------------
     3. Hero: kinetic name (variable-font weight follows the cursor)
        + dot field that parts around the pointer
  ------------------------------------------------------------------ */
  const hero = $('.hero');
  const canvas = $('#field');
  const ctx = canvas.getContext('2d');

  // split the name into letters
  $$('[data-split]').forEach((el, lineIdx) => {
    const text = el.textContent;
    el.textContent = '';
    Array.from(text).forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ltr';
      s.textContent = ch;
      s.style.setProperty('--i', String(i + lineIdx * 5));
      el.appendChild(s);
    });
  });
  const letters = $$('.ltr');
  const weights = letters.map(() => 420);

  const pointer = { x: -9999, y: -9999, seen: false };
  const trackPointer = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.seen = true; };
  hero.addEventListener('pointermove', trackPointer);
  hero.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; });

  let W = 0, H = 0, dpr = 1;
  const resizeCanvas = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const SPACING = 30;
  const RADIUS = 170;

  const drawField = (t) => {
    const rect = canvas.getBoundingClientRect();
    const px = pointer.x - rect.left;
    const py = pointer.y - rect.top;

    ctx.clearRect(0, 0, W, H);

    const hot = [];
    ctx.fillStyle = 'rgba(241, 230, 211, 0.16)';
    ctx.beginPath();

    for (let x = SPACING / 2; x < W; x += SPACING) {
      for (let y = SPACING / 2; y < H; y += SPACING) {
        const wave = Math.sin(x * 0.011 + t / 1500) * Math.cos(y * 0.011 - t / 1900);
        let r = 1.1 + (wave + 1) * 0.42;
        let dx = x;
        let dy = y;

        const ddx = x - px;
        const ddy = y - py;
        const d = Math.hypot(ddx, ddy);
        if (d < RADIUS) {
          const f = Math.pow(1 - d / RADIUS, 2);
          const push = f * 16;
          dx += (ddx / (d || 1)) * push;
          dy += (ddy / (d || 1)) * push;
          hot.push([dx, dy, 1.4 + f * 4.6, 0.35 + f * 0.65]);
        } else {
          ctx.moveTo(dx + r, dy);
          ctx.arc(dx, dy, r, 0, Math.PI * 2);
        }
      }
    }
    ctx.fill();

    hot.forEach(([x, y, r, a]) => {
      ctx.fillStyle = `rgba(244, 182, 207, ${a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const updateLetters = (t) => {
    // read all geometry first, then write styles (avoids layout thrash)
    const centers = letters.map((el) => {
      const r = el.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    });

    letters.forEach((el, i) => {
      const [cx, cy] = centers[i];
      const d = Math.hypot(pointer.x - cx, (pointer.y - cy) * 0.8);
      const near = Math.max(0, 1 - d / 320);
      const idle = (Math.sin(t / 900 + i * 0.75) + 1) / 2; // 0..1
      const target = clamp(360 + idle * 110 + near * near * 360, 200, 800);
      weights[i] += (target - weights[i]) * 0.12;
    });

    letters.forEach((el, i) => {
      el.style.fontVariationSettings = `'wght' ${weights[i].toFixed(0)}, 'wdth' 90`;
    });
  };

  let heroVisible = true;
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }, { threshold: 0 }).observe(hero);

  if (reduceMotion) {
    drawField(0);
    window.addEventListener('resize', () => drawField(0));
  } else {
    const loop = (t) => {
      if (heroVisible) {
        drawField(t);
        updateLetters(t);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------
     4. Statement: words light up as you scroll through it
  ------------------------------------------------------------------ */
  const statement = $('#statement');
  if (statement) {
    const raw = statement.textContent.trim().split(/\s+/);
    statement.textContent = '';
    raw.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'word';
      s.textContent = w;
      statement.appendChild(s);
      if (i < raw.length - 1) statement.appendChild(document.createTextNode(' '));
    });
    const spans = $$('.word', statement);

    const paint = () => {
      const r = statement.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = reduceMotion ? 1 : clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25), 0, 1);
      const upTo = Math.round(progress * spans.length);
      spans.forEach((s, i) => s.classList.toggle('is-on', i < upTo));
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { paint(); ticking = false; });
    };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* ------------------------------------------------------------------
     5. Count-up numbers
  ------------------------------------------------------------------ */
  const counters = $$('[data-count]');
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target.toLocaleString('en-CA') + suffix; return; }
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased).toLocaleString('en-CA') + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => counterObserver.observe(el));

  /* ------------------------------------------------------------------
     6. Project rows: floating image preview follows the cursor
  ------------------------------------------------------------------ */
  const peek = $('#peek');
  if (peek && finePointer && !reduceMotion) {
    const peekImg = $('img', peek);
    let px = 0, py = 0, tx = 0, ty = 0;
    let running = false;

    const render = () => {
      const vx = tx - px;
      px += vx * 0.14;
      py += (ty - py) * 0.14;
      const tilt = clamp(vx * 0.05, -9, 9);
      const h = peek.offsetHeight || 380;
      peek.style.transform = `translate3d(${px + 36}px, ${py - h / 2}px, 0) rotate(${tilt}deg)`;
      if (peek.classList.contains('is-on') || Math.abs(vx) > 0.3) {
        requestAnimationFrame(render);
      } else {
        running = false;
      }
    };
    const start = () => { if (!running) { running = true; requestAnimationFrame(render); } };

    $$('.project[data-img]').forEach((row) => {
      row.addEventListener('pointerenter', (e) => {
        peekImg.src = row.dataset.img;
        tx = px = e.clientX;
        ty = py = e.clientY;
        peek.classList.add('is-on');
        start();
      });
      row.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
      row.addEventListener('pointerleave', () => peek.classList.remove('is-on'));
    });
  }

  /* ------------------------------------------------------------------
     7. Footer year
  ------------------------------------------------------------------ */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();