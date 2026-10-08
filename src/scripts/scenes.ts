/* =====================================================================
   SW SOLAR | CENAS AUTOMÁTICAS
   - Stories ([data-story]): avança sozinho a cada data-dur ms enquanto a
     seção está na tela e a aba visível; clicar num item salta para ele.
     Um vídeo tocando dentro da seção segura o palco até parar.
   - Conversa do celular (#heroChat): roteiro de mensagens em loop.
   Com "reduzir movimento" nada avança sozinho: fica tudo à vista.
   ===================================================================== */
const motion = document.documentElement.classList.contains('motion');

document.querySelectorAll<HTMLElement>('[data-story]').forEach((sec) => {
  const itens = [...sec.querySelectorAll<HTMLElement>('.story-item')];
  const cenas = [...sec.querySelectorAll<HTMLElement>('.story-cena')];
  const N = itens.length;
  if (!N) return;
  const DUR = Number(sec.dataset.dur || 5200);
  let atual = 0, timer = 0, visivel = false, segurando = false;
  sec.classList.add('is-js');
  sec.style.setProperty('--dur', `${DUR}ms`);

  const ir = (n: number, reinicia = false) => {
    n = ((n % N) + N) % N;
    if (n === atual && reinicia) {
      itens[n].classList.remove('is-ativo');
      void sec.offsetWidth; // a barra recomeça do zero
    }
    atual = n;
    itens.forEach((el, i) => {
      el.classList.toggle('is-ativo', i === n);
      el.classList.toggle('is-passado', i < n);
      el.querySelector('button')?.setAttribute('aria-current', i === n ? 'true' : 'false');
    });
    cenas.forEach((el, i) => el.classList.toggle('is-ativa', i % N === n));
  };
  const limpa = () => { clearTimeout(timer); timer = 0; };
  const agenda = () => {
    limpa();
    if (!motion || !visivel || document.hidden || segurando) return;
    timer = window.setTimeout(() => { ir(atual + 1); agenda(); }, DUR);
  };
  const pausa = (p: boolean) => sec.classList.toggle('is-pausado', p);

  itens.forEach((el, i) => el.querySelector('button')?.addEventListener('click', () => {
    // trocar de depoimento para o vídeo que estava tocando
    sec.querySelectorAll('video').forEach((v) => { if (!v.paused) v.pause(); });
    segurando = false; pausa(false);
    ir(i, true); agenda();
  }));

  // vídeo tocando segura o palco
  sec.addEventListener('play', () => { segurando = true; pausa(true); limpa(); }, true);
  const solta = () => { segurando = false; if (visivel) { pausa(false); ir(atual, true); agenda(); } };
  sec.addEventListener('pause', solta, true);
  sec.addEventListener('ended', solta, true);

  if (motion) {
    new IntersectionObserver((es) => {
      visivel = es[0].isIntersecting;
      if (visivel && !document.hidden) { pausa(segurando); if (!segurando) { ir(atual, true); agenda(); } }
      else { pausa(true); limpa(); }
    }, { threshold: 0.3 }).observe(sec);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { pausa(true); limpa(); }
      else if (visivel && !segurando) { pausa(false); ir(atual, true); agenda(); }
    });
  }
  ir(0);
});

/* ---------- conversa do celular ---------- */
const chat = document.getElementById('heroChat');
if (chat) {
  const msgs = [...chat.querySelectorAll<HTMLElement>('.msg')];
  const LOOP = Number(chat.dataset.loop || 16000);
  let timers: number[] = [], rodando = false, naTela = false;
  const daqui = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
  const para = () => { timers.forEach(clearTimeout); timers = []; rodando = false; };
  const ciclo = () => {
    para(); rodando = true;
    chat.classList.remove('is-saindo');
    msgs.forEach((m) => m.classList.remove('is-vista'));
    msgs.forEach((m) => {
      const em = Number(m.dataset.at || 0), ate = m.dataset.ate ? Number(m.dataset.ate) : 0;
      daqui(em, () => m.classList.add('is-vista'));
      if (ate) daqui(ate, () => m.classList.remove('is-vista'));
    });
    daqui(LOOP - 900, () => chat.classList.add('is-saindo'));
    daqui(LOOP, ciclo);
  };
  if (!motion) {
    msgs.forEach((m) => { if (!m.classList.contains('typing')) m.classList.add('is-vista'); });
  } else {
    new IntersectionObserver((es) => {
      naTela = es[0].isIntersecting;
      if (naTela && !rodando && !document.hidden) ciclo();
      else if (!naTela) para();
    }, { threshold: 0.2 }).observe(chat);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) para(); else if (naTela && !rodando) ciclo();
    });
  }
}
