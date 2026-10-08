/* =====================================================================
   SW SOLAR | ESFERA DE ENERGIA
   Partículas distribuídas numa esfera (espiral de Fibonacci), girando
   devagar, com brilho aditivo. Canvas 2D, sem biblioteca. Só desenha
   enquanto está na tela; no celular usa metade das partículas e 30 fps;
   com "reduzir movimento" desenha um quadro parado.
   ===================================================================== */
export function esfera(cv: HTMLCanvasElement) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const motion = document.documentElement.classList.contains('motion');
  const celular = matchMedia('(max-width: 700px)').matches;
  const N = celular ? 650 : 1400;
  const cor = cv.dataset.cor || '255,255,255';

  // pontos na esfera unitária + um anel equatorial mais denso
  const pts: [number, number, number, number][] = [];
  const ouro = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = ouro * i;
    pts.push([Math.cos(t) * r, y, Math.sin(t) * r, 0.6 + Math.random() * 0.8]);
  }
  const anel = celular ? 120 : 260;
  for (let i = 0; i < anel; i++) {
    const t = (i / anel) * Math.PI * 2, R = 1.35 + Math.random() * 0.08;
    pts.push([Math.cos(t) * R, (Math.random() - 0.5) * 0.04, Math.sin(t) * R, 0.5]);
  }

  // sprite de brilho pré-renderizado
  const S = 32, spr = document.createElement('canvas');
  spr.width = spr.height = S;
  const sc = spr.getContext('2d')!;
  const g = sc.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, `rgba(${cor},1)`); g.addColorStop(0.25, `rgba(${cor},.55)`); g.addColorStop(1, `rgba(${cor},0)`);
  sc.fillStyle = g; sc.fillRect(0, 0, S, S);

  let W = 0, H = 0, dpr = 1;
  const medir = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  let ang = 0, raf = 0, ultimo = 0, visivel = false;
  const inclina = 0.42, ci = Math.cos(inclina), si = Math.sin(inclina);
  const desenha = (t: number) => {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const R = Math.min(W, H) * 0.34 * (1 + Math.sin(t / 2600) * 0.015), cx = W / 2, cy = H / 2, f = 3.2;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0, z0, s0] = pts[i];
      const x1 = x0 * ca + z0 * sa, z1 = -x0 * sa + z0 * ca;       // gira em Y
      const y2 = y0 * ci - z1 * si, z2 = y0 * si + z1 * ci;        // inclina em X
      const k = f / (f - z2), a = 0.12 + 0.88 * ((z2 + 1.4) / 2.8);
      const tam = (celular ? 7 : 6) * s0 * k;
      ctx.globalAlpha = a > 1 ? 1 : a;
      ctx.drawImage(spr, cx + x1 * R * k - tam / 2, cy + y2 * R * k - tam / 2, tam, tam);
    }
    ctx.globalAlpha = 1;
  };
  const laco = (t: number) => {
    raf = requestAnimationFrame(laco);
    if (celular && t - ultimo < 32) return;
    const dt = Math.min(64, t - (ultimo || t)); ultimo = t;
    ang += dt * 0.00018;
    desenha(t);
  };
  const liga = () => { if (!raf) { ultimo = 0; raf = requestAnimationFrame(laco); } };
  const desliga = () => { cancelAnimationFrame(raf); raf = 0; };

  medir();
  addEventListener('resize', () => { medir(); if (!raf) desenha(performance.now()); }, { passive: true });
  if (!motion) { desenha(0); return; }
  new IntersectionObserver((es) => {
    visivel = es[0].isIntersecting;
    if (visivel && !document.hidden) liga(); else desliga();
  }).observe(cv);
  document.addEventListener('visibilitychange', () => { if (document.hidden) desliga(); else if (visivel) liga(); });
}

/* carrega a esfera só quando o canvas chega perto da tela */
document.querySelectorAll<HTMLCanvasElement>('canvas.esfera').forEach((cv) => {
  const io = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    esfera(cv);
  }, { rootMargin: '400px 0px' });
  io.observe(cv);
});
