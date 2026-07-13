// Nav scroll
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  const currentScrollY = window.scrollY;
  navbar.classList.toggle('scrolled', currentScrollY > 80);

  if (currentScrollY > lastScrollY && currentScrollY > 150) {
    navbar.classList.add('hidden');
  } else {
    navbar.classList.remove('hidden');
  }
  lastScrollY = currentScrollY;
});

// Mobile nav menu
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
const navOverlay = document.getElementById('navOverlay');
function toggleMenu(force) {
  const isOpen = typeof force === 'boolean' ? force : !navMenu.classList.contains('open');
  navMenu.classList.toggle('open', isOpen);
  navOverlay.classList.toggle('open', isOpen);
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
}
hamburger.addEventListener('click', () => toggleMenu());
navOverlay.addEventListener('click', () => toggleMenu(false));
document.querySelectorAll('.nav-menu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

// Reveal on scroll
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4 * 0.1) + 's';
  obs.observe(el);
});

// Counters
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      counterObs.unobserve(el);
      return;
    }
    let startTime = null;
    const step = ts => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / 2000, 1);
      el.textContent = Math.floor(p * target) + (p >= 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

// Slider (depoimentos)
const depoTrack = document.getElementById('testimonialSlider');
function slideMove(dir) {
  const bubble = depoTrack.querySelector('.depo-bubble');
  const step = bubble.offsetWidth + parseFloat(getComputedStyle(depoTrack).gap || 24);
  const atEnd = depoTrack.scrollLeft + depoTrack.clientWidth >= depoTrack.scrollWidth - 4;
  if (dir > 0 && atEnd) {
    depoTrack.scrollTo({ left: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  } else {
    depoTrack.scrollBy({ left: dir * step, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }
}

if (!prefersReducedMotion) {
  let depoAutoTimer = setInterval(() => slideMove(1), 4000);
  const pauseDepoAuto = () => clearInterval(depoAutoTimer);
  const resumeDepoAuto = () => {
    clearInterval(depoAutoTimer);
    depoAutoTimer = setInterval(() => slideMove(1), 4000);
  };
  depoTrack.addEventListener('mouseenter', pauseDepoAuto);
  depoTrack.addEventListener('touchstart', pauseDepoAuto, { passive: true });
  depoTrack.addEventListener('mouseleave', resumeDepoAuto);
}

// Chat mockup (contato) — múltiplas conversas em loop
const phoneChat = document.getElementById('phoneChat');
if (phoneChat) {
  const conversations = [
    [
      { who: 'in', text: 'Oi Amanda! Vi seu perfil e queria saber mais sobre as consultas 😊' },
      { who: 'out', text: 'Oi! Que bom te ver por aqui 💛 Me conta rapidinho, qual é o seu objetivo?' },
      { who: 'in', text: 'Quero ajustar minha alimentação na gestação' },
      { who: 'typing' },
      { who: 'out', text: 'Perfeito, essa é minha especialidade 🤍 Vamos marcar sua primeira consulta?' }
    ],
    [
      { who: 'in', text: 'Amanda, sinto inchaço e cansaço direto, isso tem solução?' },
      { who: 'out', text: 'Tem sim! Geralmente é a alimentação pedindo ajuda 👀' },
      { who: 'in', text: 'Sério? Achei que era só estresse' },
      { who: 'typing' },
      { who: 'out', text: 'Vamos investigar isso juntas na consulta 😉' }
    ],
    [
      { who: 'in', text: 'Vocês atendem quem quer emagrecer sem dieta maluca?' },
      { who: 'out', text: 'Sempre! Aqui é plano real, pro seu dia a dia 🍽️' },
      { who: 'in', text: 'Isso que eu precisava ouvir' },
      { who: 'typing' },
      { who: 'out', text: 'Então bora começar? Te espero na consulta 💛' }
    ]
  ];

  let convIndex = 0;

  function renderConversation(msgs) {
    phoneChat.innerHTML = '';
    let t = 300;
    const timers = [];
    msgs.forEach(m => {
      const duration = m.who === 'typing' ? 1300 : 900 + (m.text ? m.text.length * 12 : 0);
      const insertAt = t;

      timers.push(setTimeout(() => {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble ' + (m.who === 'in' ? 'chat-in' : 'chat-out');
        if (m.who === 'typing') {
          bubble.classList.add('chat-typing');
          bubble.innerHTML = '<span></span><span></span><span></span>';
        } else {
          bubble.textContent = m.text;
        }
        phoneChat.appendChild(bubble);
        requestAnimationFrame(() => bubble.classList.add('show'));

        if (m.who === 'typing') {
          setTimeout(() => bubble.remove(), duration - 150);
        }
      }, prefersReducedMotion ? 0 : insertAt));

      t += duration;
    });
    return { totalTime: t + 2200, timers };
  }

  let loopTimer = null;
  function playLoop() {
    const { totalTime } = renderConversation(conversations[convIndex]);
    convIndex = (convIndex + 1) % conversations.length;
    if (prefersReducedMotion) return;
    loopTimer = setTimeout(playLoop, totalTime);
  }

  const chatObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!loopTimer && phoneChat.innerHTML === '') playLoop();
      }
    });
  }, { threshold: 0.4 });
  chatObs.observe(phoneChat);
}

// FAQ
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// Form
function handleForm(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input');
  const name = inputs[0].value;
  const phone = inputs[1].value;
  const msg = encodeURIComponent(`Olá Amanda! Gostaria de agendar uma consulta.\nNome: ${name}\nTelefone: ${phone}`);
  window.open(`https://wa.me/5543991661741?text=${msg}`, '_blank');
}

// WA Float
setTimeout(() => document.querySelector('.wa-float')?.classList.add('show'), 1400);

// Parallax blobs
window.addEventListener('scroll', () => {
  document.querySelectorAll('.blob').forEach((b, i) => {
    b.style.transform = `translateY(${window.scrollY * (i % 2 === 0 ? .12 : -.1)}px)`;
  });
});

// Custom select dropdowns
document.querySelectorAll('.custom-select').forEach(cs => {
  const trigger = cs.querySelector('.cs-trigger');
  const valueEl = cs.querySelector('.cs-value');
  const options = cs.querySelectorAll('.cs-option');

  const closeSelect = () => {
    cs.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  };
  const closeAllOthers = () => {
    document.querySelectorAll('.custom-select.open').forEach(other => {
      if (other !== cs) other.classList.remove('open');
    });
  };

  trigger.addEventListener('click', () => {
    const isOpen = cs.classList.contains('open');
    closeAllOthers();
    cs.classList.toggle('open', !isOpen);
    trigger.setAttribute('aria-expanded', String(!isOpen));
  });

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      valueEl.textContent = opt.textContent;
      valueEl.classList.remove('cs-placeholder');
      closeSelect();
    });
  });

  cs.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSelect();
  });
});

document.addEventListener('click', e => {
  document.querySelectorAll('.custom-select.open').forEach(cs => {
    if (!cs.contains(e.target)) cs.classList.remove('open');
  });
});
