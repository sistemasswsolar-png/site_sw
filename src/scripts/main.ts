/* =====================================================================
   SW SOLAR | COMPORTAMENTO E ANIMAÇÕES
   Tudo disparado por IntersectionObserver: nada roda fora da tela.
   ===================================================================== */
const root = document.documentElement;
const motion = root.classList.contains('motion');
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector(s) as T;
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll(s)] as T[];
const fmt = (n: number, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------- cabeçalho: sólido ao rolar, some ao descer e volta ao subir ---------- */
const hdr = $('#hdr');
const nav = $('#nav');
let ultimoY = scrollY;
const onScroll = () => {
  const y = scrollY;
  hdr.classList.toggle('solid', y > 40);
  hdr.classList.toggle('hide', y > 600 && y > ultimoY && !nav.classList.contains('open'));
  ultimoY = y;
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const menu = $('#menu');
menu.addEventListener('click', () => {
  const o = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(o));
});
nav.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).tagName === 'A') { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
});

/* item do menu da seção visível */
const links = new Map($$<HTMLAnchorElement>('a', nav).map((a) => [a.hash.slice(1), a]));
const ioNav = new IntersectionObserver((es) => {
  for (const e of es) if (e.isIntersecting) {
    links.forEach((a) => a.classList.remove('on'));
    links.get(e.target.id)?.classList.add('on');
  }
}, { rootMargin: '-45% 0px -50% 0px' });
links.forEach((_, id) => { const s = document.getElementById(id); if (s) ioNav.observe(s); });

/* ---------- números que contam ---------- */
const contar = (el: HTMLElement) => {
  const alvo = Number(el.dataset.to), dec = Number(el.dataset.dec || 0), dur = Number(el.dataset.dur || 1600);
  const t0 = performance.now();
  const passo = (t: number) => {
    const k = Math.min(1, (t - t0) / dur), e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    el.textContent = fmt(alvo * e, dec);
    if (k < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
};
const cnts = $$('.cnt');
if (motion) {
  cnts.forEach((el) => (el.textContent = fmt(0, Number(el.dataset.dec || 0))));
  const ioC = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { ioC.unobserve(e.target); contar(e.target as HTMLElement); }
  }), { threshold: 0.6 });
  cnts.forEach((el) => ioC.observe(el));
}

/* ---------- entrada dos blocos ---------- */
if (motion) {
  const ioR = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); ioR.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv, .rv-img, .words, .traj li, .hbars').forEach((el) => ioR.observe(el));
} else {
  $$('.rv, .rv-img, .words, .traj li, .hbars').forEach((el) => el.classList.add('in'));
}

/* ---------- mapa: baixa o SVG só perto da seção ---------- */
const holder = $('#mapHolder');
if (holder) {
  const ioM = new IntersectionObserver(async (es) => {
    if (!es[0].isIntersecting) return;
    ioM.disconnect();
    try {
      const svg = await (await fetch(holder.dataset.src!)).text();
      holder.innerHTML = svg;
      const map = $('svg', holder);
      map.setAttribute('aria-hidden', 'true');
      if (!motion) { map.classList.add('on'); return; }
      const ioOn = new IntersectionObserver((x) => { if (x[0].isIntersecting) { map.classList.add('on'); ioOn.disconnect(); } }, { threshold: 0.25 });
      ioOn.observe(map);
    } catch { holder.innerHTML = `<img src="${holder.dataset.src}" alt="" width="1000" height="1136">`; }
  }, { rootMargin: '600px 0px' });
  ioM.observe(holder);
}

/* ---------- filtros do portfólio ---------- */
const filtros = $$<HTMLButtonElement>('.filtros button');
filtros.forEach((b) => b.addEventListener('click', () => {
  filtros.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  const f = b.dataset.f;
  $$('#mos4 .it').forEach((it, i) => {
    const mostra = f === 'todos' || it.dataset.seg === f;
    it.hidden = !mostra;
    if (mostra && motion) it.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: (i % 8) * 40, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
  });
}));

/* ---------- vídeos: carregam só ao tocar, um por vez ---------- */
const videos = $$<HTMLVideoElement>('.vbox video');
const tocar = (v: HTMLVideoElement) => {
  videos.forEach((o) => { if (o !== v && !o.paused) o.pause(); });
  if (!v.src) v.src = v.dataset.src!;
  v.closest('.vbox')!.classList.add('playing');
  v.play().catch(() => v.closest('.vbox')!.classList.remove('playing'));
};
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('.play');
  if (b) tocar($<HTMLVideoElement>('video', b.closest('.vbox')!));
});
const ioV = new IntersectionObserver((es) => es.forEach((x) => {
  const v = x.target as HTMLVideoElement;
  if (!x.isIntersecting && !v.paused) v.pause();
}), { threshold: 0.2 });
videos.forEach((v) => ioV.observe(v));

/* ---------- visualizador de fotos ---------- */
const lb = $('#lb');
if (lb) {
  const track = $('#lbTrack'), cnt = $('#lbCount'), cap = $('#lbCap');
  const bPrev = $<HTMLButtonElement>('#lbPrev'), bNext = $<HTMLButtonElement>('#lbNext'), bClose = $<HTMLButtonElement>('#lbClose');
  const txt = (el: Element | null) => (el ? el.textContent!.replace(/\s+/g, ' ').trim() : '');
  type Item = { box: HTMLElement; img: HTMLImageElement; t1: string; t2: string };
  const legenda = (box: HTMLElement, im: HTMLImageElement): [string, string] => {
    const t = $('.t', box); if (t) return [txt(t), ''];
    const it = box.closest('.it'); if (it) return [txt($('b', it)), [txt($('span:not(.badge)', it)), txt($('.badge', it))].filter(Boolean).join(', ')];
    const gp = box.closest('.gp'); if (gp) return [txt($('.band .nm b', gp)), [txt($('.band .nm span', gp)), txt($('.band .pot', gp))].filter(Boolean).join(', ')];
    const art = box.closest('.medio article'); if (art) return [txt($('b', art)), [txt($('span', art)), txt($('em', art))].filter(Boolean).join(', ')];
    const card = box.closest('.card'); if (card) return [txt($('h3', card)), im.alt];
    const uni = box.closest('.uni'); if (uni) return [txt($('b', uni)), txt($('.pp', uni))];
    return [im.alt, ''];
  };
  const grupos = new Map<string, Item[]>();
  $$('main .ph-img, main .gp .foto').forEach((box) => {
    const im = $<HTMLImageElement>('img', box);
    if (!im || box.closest('.hero, .estr-hero .bg, .vbox, .seg, .emp, .fase')) return;
    const g = box.closest('section')?.id || 'geral';
    if (!grupos.has(g)) grupos.set(g, []);
    const lista = grupos.get(g)!, pos = lista.length, [t1, t2] = legenda(box, im);
    lista.push({ box, img: im, t1, t2 });
    box.classList.add('zoomable'); box.tabIndex = 0; box.setAttribute('role', 'button');
    box.setAttribute('aria-label', 'Ampliar foto' + (t1 ? ': ' + t1 : ''));
    box.addEventListener('click', (e) => { e.preventDefault(); abrir(g, pos); });
    box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(g, pos); } });
  });
  let lista: Item[] = [], idx = 0, aberto = false, grupoAtual = '', raf = 0;
  const montar = (g: string) => {
    if (grupoAtual === g) return;
    grupoAtual = g; lista = grupos.get(g) || []; track.textContent = '';
    lista.forEach((it) => {
      const s = document.createElement('div'); s.className = 'lb-slide';
      const im = document.createElement('img');
      const webp = it.img.parentElement?.querySelector('source[type="image/webp"]') as HTMLSourceElement | null;
      if (webp) { im.srcset = webp.srcset; im.sizes = '100vw'; }
      im.src = it.img.src; im.alt = it.img.alt; im.loading = 'lazy'; im.decoding = 'async';
      s.appendChild(im); track.appendChild(s);
    });
    lb.classList.toggle('unica', lista.length < 2);
  };
  const marcar = (i: number) => {
    idx = i; const it = lista[i];
    cnt.textContent = lista.length > 1 ? `${i + 1} / ${lista.length}` : '';
    cap.textContent = '';
    if (it?.t1) { const b = document.createElement('b'); b.textContent = it.t1; cap.appendChild(b); }
    if (it?.t2) { const s = document.createElement('span'); s.textContent = it.t2; cap.appendChild(s); }
    bPrev.disabled = i === 0; bNext.disabled = i === lista.length - 1;
  };
  const ir = (i: number, suave: boolean) => {
    i = Math.max(0, Math.min(lista.length - 1, i));
    track.scrollTo({ left: i * track.clientWidth, behavior: suave ? 'smooth' : 'auto' }); marcar(i);
  };
  const abrir = (g: string, i: number) => {
    montar(g); lb.hidden = false; aberto = true; root.style.overflow = 'hidden';
    requestAnimationFrame(() => { ir(i, false); bClose.focus({ preventScroll: true }); });
    history.pushState({ lb: 1 }, '');
  };
  const fechar = (viaHist: boolean) => {
    if (!aberto) return; aberto = false; lb.hidden = true; root.style.overflow = '';
    if (!viaHist) history.back();
    lista[idx]?.box.focus({ preventScroll: true });
  };
  bPrev.addEventListener('click', () => ir(idx - 1, true));
  bNext.addEventListener('click', () => ir(idx + 1, true));
  bClose.addEventListener('click', () => fechar(false));
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { const i = Math.round(track.scrollLeft / (track.clientWidth || 1)); if (i !== idx) marcar(i); });
  }, { passive: true });
  track.addEventListener('click', (e) => { if ((e.target as HTMLElement).classList.contains('lb-slide')) fechar(false); });
  addEventListener('popstate', () => { if (aberto) fechar(true); });
  addEventListener('resize', () => { if (aberto) track.scrollLeft = idx * track.clientWidth; });
  document.addEventListener('keydown', (e) => {
    if (!aberto) return;
    if (e.key === 'Escape') { e.preventDefault(); fechar(false); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); ir(idx + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(idx - 1, true); }
    else if (e.key === 'Tab') {
      const f = $$<HTMLButtonElement>('button:not([disabled])', lb).filter((x) => x.offsetParent !== null);
      const a = f.indexOf(document.activeElement as HTMLButtonElement);
      if (e.shiftKey && a <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && a === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
}

root.classList.add('ready');
