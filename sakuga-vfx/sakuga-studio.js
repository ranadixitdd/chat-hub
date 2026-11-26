/* ============================================================================
   SAKUGA STUDIO ENGINE — Powered by finktheartist/sakuga-vfx (MIT)
   Brings authentic spring squash/overshoot, cel-shaded bursts, dust puffs,
   crystal shards, crescent slashes, speed lines, and traced manga SFX
   (ドン!, カチッ, シュッ, ポン, ズザッ, ゴゴゴゴ) to every control in CHAT HUB.
   ============================================================================ */
(() => {
  'use strict';

  const fx = window.SakugaFX;
  if (!fx) {
    console.warn('SakugaStudio: window.SakugaFX core not found.');
    return;
  }

  const STORAGE_KEY = 'chathub_sakuga_vfx';

  function readSavedPref() {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      return val !== 'false';
    } catch (_) {
      return true;
    }
  }

  function writeSavedPref(val) {
    try {
      localStorage.setItem(STORAGE_KEY, val ? 'true' : 'false');
    } catch (_) {}
  }

  let enabled = readSavedPref();

  /* ------------------------------------------------------------------------
     1. OPTIONAL OFFICIAL SAKUGA WEB COMPONENTS (<sakuga-button>, etc.)
        Reuses window.SakugaFX with zero duplicate core payload.
     ------------------------------------------------------------------------ */
  function registerWebComponents() {
    const { rnd, later, at, esc, squashy, Spring, ticks, wob, lines, burst, shards, puff, sfx, donut, kira, slash, dotted, hollow, clamp } = fx;

    class SakugaButton extends fx.Base {
      static delegates = true;
      static observedAttributes = ['disabled'];
      static css = `
        .btn { position: relative; padding: 11px 22px; border: var(--sk-bw) solid var(--sk-btn-line); border-radius: var(--sk-r); background: var(--sk-card); color: var(--sk-ink); font: italic 800 15px/1.1 "Avenir Next", "Nunito", -apple-system, "Segoe UI", system-ui, sans-serif; letter-spacing: -.01em; box-shadow: var(--sk-btn-sh); cursor: pointer; user-select: none; -webkit-user-select: none; touch-action: manipulation; will-change: transform; }
        .btn.alt { border-color: var(--sk-alt-line); box-shadow: var(--sk-alt-sh); }
        .btn.inv { background: var(--sk-ink); color: var(--sk-card); box-shadow: none; }
        .btn:disabled { opacity: .45; cursor: not-allowed; }
        .ok { display: inline-block; width: calc(var(--ok, 0) * 20px); height: 16px; margin-left: calc(var(--ok, 0) * 6px); vertical-align: -2px; overflow: visible; fill: none; stroke: var(--sk-acc); stroke-width: 4.4; stroke-linecap: round; stroke-linejoin: round; transform: scale(var(--ok, 0)); }`;
      get primary() { return this.getAttribute('variant') !== 'secondary'; }
      get disabled() { return this.hasAttribute('disabled'); }
      set disabled(v) { this.toggleAttribute('disabled', !!v); }
      attributeChangedCallback() { if (this.b) this.b.disabled = this.disabled; }
      render() {
        return `<button class="btn${this.primary ? '' : ' alt'}" type="button" part="button"${this.disabled ? ' disabled' : ''}><slot>${this.primary ? 'Confirm' : 'Cancel'}</slot>`
          + (this.primary ? '<svg class="ok" viewBox="0 0 24 18" aria-hidden="true"><path d="M3 9.5l6 6L21 2.5"/></svg>' : '') + '</button>';
      }
      setup() {
        const b = this.b = this.$('.btn');
        this.ok = new Spring(0, 420, 14);
        this.seq = 0;
        if (!this.primary) {
          this.sq = squashy(b, { low: 0.72, wide: 0.3 });
          b.addEventListener('click', () => {
            this.sq.s.x = Math.min(this.sq.s.x, 0.8);
            this.sq.s.v += 4;
            const c = at(b, 1, 0);
            ticks(c.x - 8, c.y - 4, { dir: -1.05, n: 3, r: 5, len: 17, fan: 0.36, life: 0.5 });
          });
        } else {
          this.sq = squashy(b, { low: 0.5, wide: 0.24 });
          this.back = this.backLayer();
          b.addEventListener('pointerdown', () => {
            if (b.disabled) return;
            const c = at(b);
            ticks(c.x, c.y - c.h / 2 - 6, { dir: -Math.PI / 2, n: 3, r: 4, len: 14, fan: 0.5 });
            wob(c.x - c.w / 2 - 6, c.y, { dir: -1, r: 10, life: 0.3 });
            wob(c.x + c.w / 2 + 6, c.y, { dir: 1, r: 10, life: 0.3 });
            lines(c.x, c.y + c.h / 2 + 10, { n: 3, dir: 0, len: 16, spread: 0.1, life: 0.25 });
          });
          b.addEventListener('click', () => this.impact());
        }
        b.addEventListener('click', () => {
          if (this.getAttribute('type') === 'submit') this.closest('form')?.requestSubmit();
        });
      }
      impact() {
        const b = this.b, sq = this.sq, c = at(b), n = ++this.seq;
        this.ok.to = 0; this.ok.x = 0;
        sq.s.x = Math.min(sq.s.x, 0.6); sq.pop.x = 1.24; sq.tilt.x = -5;
        b.classList.add('inv');
        later(190, () => b.classList.remove('inv'));
        burst(c.x, c.y, { r: 86, spikes: 17, life: 0.48, layer: this.back });
        shards(c.x, c.y, { n: 10, speed: 240, size: 8, life: 0.9, arc: 6.28, grav: 300 });
        for (const [dx, dy] of [[-1, -0.5], [1, -1], [-1, 0.9], [1, 1]]) {
          puff(c.x + dx * (c.w / 2 + 6), c.y + dy * 22, { size: rnd(10, 14), n: 4, vx: dx * 42, vy: dy * 26 - 6, life: rnd(0.7, 1.0) });
        }
        const pos = clampSfxPos(c.x + 8, c.y, c.h, 140);
        sfx('don', pos.x, pos.y, { size: pos.size, rot: -0.12, life: 0.95 });
        ticks(c.x - 80, c.y - 54, { dir: -2.4, n: 2, r: 4, len: 20, life: 0.45 });
        ticks(c.x + 92, c.y - 46, { dir: -0.7, n: 2, r: 4, len: 20, life: 0.45 });
        later(200, () => {
          if (n !== this.seq || !b.isConnected) return;
          const c2 = at(b);
          sq.s.x = 1.22;
          wob(c2.x - c2.w / 2 - 8, c2.y, { dir: -1 });
          wob(c2.x + c2.w / 2 + 8, c2.y, { dir: 1 });
          donut(c2.x + 6, c2.y - 38, { r: 26, vx: 20, vy: -48, life: 1.15 });
          later(90, () => donut(c2.x + 48, c2.y - 44, { r: 16, vx: 30, vy: -36, life: 1.0 }));
        });
      }
      done(hold = 1.8) {
        if (!this.primary || !this.b) return;
        const n = this.seq;
        this.ok.to = 1;
        const q = at(this.b, 1, 0);
        kira(q.x - 16, q.y + 2, { r: 15, life: 1 });
        ticks(q.x - 2, q.y - 12, { dir: -0.8, n: 2, r: 6, len: 12 });
        if (hold > 0) later(hold * 1000, () => { if (n === this.seq) this.ok.to = 0; });
      }
      frame(dt) {
        this.sq.step(dt);
        if (this.primary) this.b.style.setProperty('--ok', Math.max(0, this.ok.step(dt)).toFixed(3));
      }
    }
    fx.define('sakuga-button', SakugaButton);

    class SakugaCheckbox extends fx.Base {
      static delegates = true;
      static formAssociated = true;
      static observedAttributes = ['checked', 'disabled'];
      static css = `
        label { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; -webkit-user-select: none; }
        input { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; }
        .box { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border: var(--sk-bw) solid var(--sk-ink); border-radius: 9px; background: var(--sk-card); box-shadow: 4px 4px 0 var(--sk-soft); will-change: transform; }
        svg { width: 22px; height: 22px; fill: none; stroke: var(--sk-tick); stroke-width: 4.6; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 30; stroke-dashoffset: 30; transition: stroke-dashoffset .24s cubic-bezier(.2, .9, .3, 1) .08s; }
        input:checked + .box svg { stroke-dashoffset: 0; }
        input:focus-visible + .box { outline: 2.5px solid var(--sk-acc); outline-offset: 3px; }
        :host([disabled]) label { opacity: .5; cursor: not-allowed; }`;
      get checked() { return this.inp ? this.inp.checked : this.hasAttribute('checked'); }
      set checked(v) { if (this.inp) { this.inp.checked = !!v; this.form(); } else this.toggleAttribute('checked', !!v); }
      get disabled() { return this.hasAttribute('disabled'); }
      set disabled(v) { this.toggleAttribute('disabled', !!v); }
      get value() { return this.getAttribute('value') || 'on'; }
      attributeChangedCallback(name) { if (!this.inp) return; if (name === 'checked') this.checked = this.hasAttribute('checked'); else this.inp.disabled = this.disabled; }
      form() { this.internals.setFormValue(this.checked ? this.value : null); }
      render() { return `<label part="label"><input type="checkbox"${this.hasAttribute('checked') ? ' checked' : ''}${this.disabled ? ' disabled' : ''}><span class="box" part="box"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10.5l4.5 4.5 8.5-10"/></svg></span><slot></slot></label>`; }
      setup() {
        const inp = this.inp = this.$('input'), box = this.box = this.$('.box');
        this.s = new Spring(1, 600, 13);
        this.form();
        inp.addEventListener('change', () => {
          this.form();
          this.s.x = 0.68;
          const c = at(box);
          if (!inp.checked) puff(c.x, c.y, { size: 7, n: 3, life: 0.4 });
          else {
            slash(c.x + 8, c.y + 2, { len: 130, ang: -0.42, thick: 11, life: 0.5 });
            slash(c.x - 6, c.y + 12, { len: 96, ang: 2.72, thick: 6, life: 0.55 });
            lines(c.x - 28, c.y + 22, { n: 5, dir: 2.75, len: 52, spread: 12 });
            shards(c.x, c.y, { n: 6, speed: 180, size: 5.5, arc: 6.28, grav: 260 });
            later(340, () => kira(c.x + 20, c.y - 18, { r: 9 }));
            const pos = clampSfxPos(c.x + 24, c.y, c.h, 96);
            sfx('zuza', pos.x, pos.y, { size: pos.size, rot: -0.12, ...dotted() });
          }
          this.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      frame(dt) { const y = this.s.step(dt); this.box.style.transform = Math.abs(y - 1) < 0.001 ? '' : `scale(${y}) rotate(${(1 - y) * 20}deg)`; }
    }
    fx.define('sakuga-checkbox', SakugaCheckbox);

    class SakugaTooltip extends fx.Base {
      static delegates = true;
      static observedAttributes = ['text', 'label'];
      static css = `
        .help { display: grid; place-items: center; width: 28px; height: 28px; padding: 0; border: 2.4px solid var(--sk-ink); border-radius: 50%; background: var(--sk-card); box-shadow: 3px 3px 0 var(--sk-soft); font: 800 14px/1 -apple-system, "Segoe UI", system-ui, sans-serif; cursor: pointer; will-change: transform; }
        .tip { position: absolute; left: 50%; bottom: calc(100% + 12px); width: max-content; max-width: 210px; padding: 9px 13px; border: 2.6px solid var(--sk-ink); border-radius: 13px; background: var(--sk-card); box-shadow: 4px 5px 0 var(--sk-soft); font: 700 12.5px/1.35 -apple-system, "Segoe UI", system-ui, sans-serif; color: var(--sk-ink); pointer-events: none; translate: -50% 0; transform-origin: 50% 100%; transform: scale(0); will-change: transform; z-index: 50; }
        .tip::before, .tip::after { content: ""; position: absolute; left: 50%; top: 100%; translate: -50% 0; border: 8px solid transparent; border-top-color: var(--sk-ink); }
        .tip::after { margin-top: -3.5px; border-width: 6px; border-top-color: var(--sk-card); }`;
      get open() { return !!this.isOpen; }
      attributeChangedCallback(name, _, v) { if (!this.b) return; if (name === 'text') this.tip.textContent = v || ''; else this.b.setAttribute('aria-label', v || 'Help'); }
      render() {
        const id = 'sk-tip-' + Math.random().toString(36).slice(2, 7);
        return `<div class="tip" role="tooltip" id="${id}" part="tip">${esc(this.getAttribute('text') || 'Sakuga Hint')}</div><button class="help" type="button" part="button" aria-describedby="${id}" aria-label="${esc(this.getAttribute('label') || 'Help')}"><slot>?</slot></button>`;
      }
      setup() {
        const b = this.b = this.$('.help'); this.tip = this.$('.tip');
        this.s = new Spring(0, 460, 15); this.bs = squashy(b, { low: 0.78, wide: 0.3 }); this.isOpen = false;
        b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') this.show(true); });
        b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') this.show(false); });
        b.addEventListener('focus', () => this.show(true));
        b.addEventListener('blur', () => this.show(false));
        b.addEventListener('click', () => this.show(!this.isOpen));
        b.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.show(false); });
      }
      show(on = true) {
        if (on === this.isOpen) return;
        this.isOpen = on; this.s.to = on ? 1 : 0; this.s.d = on ? 15 : 34;
        if (!on) return;
        this.bs.s.v += 2;
        later(120, () => {
          if (!this.isOpen || !this.tip.isConnected) return;
          const c = at(this.tip), q = at(this.b);
          puff(c.x - c.w / 2 - 6, c.y - 10, { size: 7, n: 3, vx: -12, vy: -8, life: 0.7 });
          puff(c.x + c.w / 2 + 8, c.y + 10, { size: 7, n: 3, vx: 12, vy: -5, life: 0.7 });
          ticks(c.x + c.w / 2 - 2, c.y - c.h / 2 - 6, { dir: -1.0, n: 3, r: 5, len: 14, fan: 0.36, life: 0.45 });
          ring(q.x, q.y - q.h / 2 - 3, { rx: 18, ry: 4, life: 0.45, w: 2.5 });
          const pos = clampSfxPos(c.x + 6, c.y, c.h, 86);
          sfx('kachi', pos.x, pos.y, { size: pos.size, rot: -0.08, life: 0.75, ...hollow() });
        });
      }
      frame(dt) { this.bs.step(dt); const y = Math.max(0, this.s.step(dt)); this.tip.style.transform = `scale(${y}) rotate(${(1 - y) * -10}deg)`; }
    }
    fx.define('sakuga-tooltip', SakugaTooltip);
  }

  /* ------------------------------------------------------------------------
     2. VIEWPORT-SAFE MANGA SFX PLACEMENT & THROTTLING
     ------------------------------------------------------------------------ */
  let lastWordAt = -1;

  function clampSfxPos(cx, cy, h, desiredSize) {
    const mobile = innerWidth <= 520;
    const size = Math.round(mobile ? Math.min(desiredSize, 96) : Math.min(desiredSize, 136));
    const padX = Math.max(54, size * 0.48);
    const x = fx.clamp(cx, padX, Math.max(padX, innerWidth - padX));
    const aboveY = cy - Math.max(18, h * 0.5) - Math.max(24, size * 0.28);
    const y = aboveY < 42
      ? Math.min(innerHeight - 38, cy + Math.max(18, h * 0.5) + Math.max(26, size * 0.28))
      : Math.max(38, aboveY);
    return { x, y, size };
  }

  function fireWordOnce(name, cx, cy, h, size, opts = {}) {
    const t = fx.now;
    if (lastWordAt >= 0 && t - lastWordAt < 0.22) return;
    lastWordAt = t;
    const pos = clampSfxPos(cx, cy, h, size);
    fx.sfx(name, pos.x, pos.y, { size: pos.size, rot: fx.rnd(-0.14, 0.08), life: opts.life || 0.82, ...opts });
  }

  /* ------------------------------------------------------------------------
     3. SHARED SPRING ANIMATOR FOR EXISTING DOM CONTROLS (SCALE + ROTATE)
        Uses CSS `scale` and `rotate` so existing `transform` never breaks.
     ------------------------------------------------------------------------ */
  const controlMap = new WeakMap();
  const activeSprings = new Set();
  let springDriverStop = null;

  function ensureSpringLoop() {
    if (springDriverStop || !activeSprings.size) return;
    springDriverStop = fx.onFrame((dt) => {
      for (const st of activeSprings) {
        if (!st.el.isConnected) {
          activeSprings.delete(st);
          continue;
        }
        const y = st.s.step(dt);
        const p = st.pop.step(dt);
        const r = st.tilt.step(dt);
        const still =
          Math.abs(y - 1) < 0.0012 &&
          Math.abs(st.s.v) < 0.015 &&
          Math.abs(p - 1) < 0.0012 &&
          Math.abs(st.pop.v) < 0.015 &&
          Math.abs(r) < 0.03 &&
          Math.abs(st.tilt.v) < 0.05 &&
          st.s.to === 1;

        if (still) {
          st.el.style.scale = '';
          st.el.style.rotate = '';
          st.el.classList.remove('sakuga-sprung');
          activeSprings.delete(st);
        } else {
          const sx = (1 + (1 - y) * st.wide) * p;
          const sy = y * p;
          st.el.classList.add('sakuga-sprung');
          st.el.style.scale = `${sx.toFixed(4)} ${sy.toFixed(4)}`;
          st.el.style.rotate = Math.abs(r) > 0.02 ? `${r.toFixed(2)}deg` : '';
        }
      }
      if (!activeSprings.size && springDriverStop) {
        springDriverStop();
        springDriverStop = null;
      }
    });
  }

  function getSpringState(el, opts = {}) {
    let st = controlMap.get(el);
    if (!st) {
      st = {
        el,
        s: new fx.Spring(1, opts.k || 520, opts.d || 15),
        pop: new fx.Spring(1, 300, 12),
        tilt: new fx.Spring(0, 260, 10),
        wide: opts.wide ?? 0.30,
        downAt: 0
      };
      controlMap.set(el, st);
    }
    return st;
  }

  function activateSpring(st) {
    activeSprings.add(st);
    ensureSpringLoop();
  }

  /* ------------------------------------------------------------------------
     4. CONTROL CLASSIFICATION & INTERACTIVE SELECTOR
     ------------------------------------------------------------------------ */
  const INTERACTIVE_SELECTOR = [
    'button',
    '[role="button"]',
    '[role="tab"]',
    '.icon-btn',
    '.header-icon-btn',
    '.gpt-header-btn',
    '.gemini-header-btn',
    '.btn-primary-comic',
    '.btn-secondary-comic',
    '.wa-send-btn',
    '.cinema-btn',
    '.cinema-ghost-trigger',
    '.speed-pill-btn',
    '.btn-app-quick-chip',
    '.preset-char-chip',
    '.gemini-chip',
    '.deck-toggle-mode-btn',
    '.deck-nav-btn',
    '.side-switch-btn',
    '.active-speaker-pill',
    '.cast-picker-manage-btn',
    '.cast-picker-close-btn',
    '.cast-picker-item',
    '.input-action-btn',
    '.dropdown-item',
    '.modal-back-btn',
    '.modal-close-btn',
    '.global-app-card',
    '.gpt-tool-item',
    '.gpt-new-chat-btn',
    '.gpt-close-sidebar-btn',
    '.gpt-mini-btn',
    '.gpt-model-pill',
    '.gemini-gem-item',
    '.gemini-new-chat-btn',
    '.gemini-model-pill',
    '.drawer-tab',
    '.hub-tab-btn',
    '.asset-tab-btn',
    '.about-tab-btn',
    '.subbar-pill',
    '.sticker-option-item',
    '.sticker-card',
    '.sfx-card',
    '.sound-btn',
    '.choice-option-btn',
    '.char-pill',
    '.cast-reorder-btn',
    '.cast-dp-btn',
    '.cast-delete-btn',
    '.wa-header-left',
    '[data-sakuga]'
  ].join(',');

  function isControlDisabled(el) {
    return el.disabled || el.getAttribute('aria-disabled') === 'true';
  }

  function classifyControl(el) {
    if (!el) return 'none';
    if (el.closest('sakuga-button, sakuga-checkbox, sakuga-tooltip')) return 'webcomp';

    const explicit = el.getAttribute('data-sakuga');
    if (explicit) return explicit;

    if (
      el.classList.contains('danger') ||
      el.classList.contains('cast-delete-btn') ||
      el.id === 'clearChatBtn' ||
      el.id === 'deleteConfirmExecuteBtn' ||
      /delete|clearChat|handleInlineClearChat|remove/i.test(el.getAttribute('onclick') || '')
    ) {
      return 'danger';
    }

    if (
      el.classList.contains('drawer-tab') ||
      el.classList.contains('hub-tab-btn') ||
      el.classList.contains('asset-tab-btn') ||
      el.classList.contains('about-tab-btn') ||
      el.getAttribute('role') === 'tab' ||
      /^tabBtn/i.test(el.id || '')
    ) {
      return 'tab';
    }

    if (
      el.id === 'soundToggleBtn' ||
      el.id === 'themeToggleBtn' ||
      el.id === 'cinemaCamToggleBtn' ||
      el.id === 'modalCamToggleBtn' ||
      el.id === 'menuGroupMsgItem' ||
      el.id === 'menuSakugaToggleItem' ||
      el.id === 'globalSakugaToggleBtn' ||
      el.id === 'sideSwitchBtn' ||
      el.id === 'sideSwitchBtnStrip' ||
      el.id === 'cinemaCleanBtn' ||
      el.id === 'cinemaPauseBtn' ||
      /toggle/i.test(el.getAttribute('onclick') || '') && (el.classList.contains('header-icon-btn') || el.classList.contains('dropdown-item'))
    ) {
      return 'toggle';
    }

    if (
      el.classList.contains('btn-primary-comic') ||
      el.classList.contains('wa-send-btn') ||
      el.classList.contains('global-app-card') ||
      el.id === 'cinemaPlayBtn' ||
      el.id === 'cinemaRecBtn' ||
      el.id === 'customPromptConfirmBtn' ||
      el.id === 'aboutCheckUpdateBtn'
    ) {
      return 'primary';
    }

    if (el.classList.contains('sticker-card')) return 'sticker-msg';

    return 'secondary';
  }

  /* ------------------------------------------------------------------------
     5. BEAT-ACCURATE SAKUGA IMPACTS FOR BUTTONS, TABS, TOGGLES & CARDS
     ------------------------------------------------------------------------ */
  function onControlPress(el, clientX, clientY) {
    if (!enabled || isControlDisabled(el)) return;
    const kind = classifyControl(el);
    if (kind === 'none' || kind === 'webcomp') return;

    const st = getSpringState(el, kind === 'primary' ? { k: 540, d: 15, wide: 0.28 } : { k: 560, d: 16, wide: 0.24 });
    st.s.to = kind === 'primary' ? 0.56 : 0.76;
    st.downAt = performance.now();
    activateSpring(st);

    if (fx.calm) return;

    const c = fx.at(el);
    if (c.w <= 0 || c.h <= 0) return;

    if (kind === 'primary') {
      fx.ticks(c.x, c.y - c.h / 2 - 4, { dir: -Math.PI / 2, n: 3, r: 4, len: 12, fan: 0.5, life: 0.34 });
      if (c.w >= 56) {
        fx.wob(c.x - c.w / 2 - 4, c.y, { dir: -1, r: 8, life: 0.24 });
        fx.wob(c.x + c.w / 2 + 4, c.y, { dir: 1, r: 8, life: 0.24 });
      }
    } else if (kind === 'secondary' && c.w >= 48) {
      fx.ticks(c.x + c.w / 2 - 4, c.y - c.h / 2 - 2, { dir: -0.95, n: 2, r: 3, len: 10, fan: 0.4, life: 0.28 });
    }
  }

  function releaseSpring(el) {
    const st = controlMap.get(el);
    if (st && st.s.to !== 1) {
      st.s.to = 1;
      activateSpring(st);
    }
  }

  let lastStickerCardFxAt = -1;

  function onControlClick(el, e) {
    if (!enabled || isControlDisabled(el)) return;
    const kind = classifyControl(el);
    if (kind === 'none' || kind === 'webcomp') return;

    const c = fx.at(el);
    if (c.w <= 0 || c.h <= 0) return;

    const st = getSpringState(el);
    const wasPressed = st.downAt && (performance.now() - st.downAt < 900);
    st.downAt = 0;

    // Ensure keyboard activation (Enter/Space) also squashes before springing back
    st.s.to = 1;
    st.s.x = wasPressed ? Math.min(st.s.x, 0.72) : 0.68;
    st.pop.x = kind === 'primary' ? 1.22 : 1.13;
    if (kind === 'primary' || kind === 'danger') {
      st.tilt.x = -3.8;
    }
    activateSpring(st);

    if (fx.calm) return;

    // Prevent double canvas-particle storms when rapidly spamming drawer SFX / sticker items
    if (el.classList.contains('sticker-option-item')) {
      const nowMs = performance.now();
      if (lastStickerCardFxAt >= 0 && nowMs - lastStickerCardFxAt < 140) return;
      lastStickerCardFxAt = nowMs;
    }

    const clickX = (e && e.clientX) ? e.clientX + window.scrollX : c.x;
    const clickY = (e && e.clientY) ? e.clientY + window.scrollY : c.y;

    if (kind === 'primary') {
      // Beat 2: 1-frame ink/card inversion + behind-button spiky burst + shards + corner puffs + ドン!
      el.classList.add('sakuga-impact-invert');
      fx.later(165, () => el.classList.remove('sakuga-impact-invert'));

      const isWide = c.w > 165;
      const bx = isWide ? fx.clamp(clickX, c.x - c.w * 0.35, c.x + c.w * 0.35) : c.x;
      const rx = isWide ? Math.min(c.w * 0.56, 155) : Math.max(54, Math.max(c.w, c.h) * 0.92);
      const ry = isWide ? Math.max(56, c.h * 1.45) : Math.max(54, Math.max(c.w, c.h) * 0.92);

      fx.burst(bx, c.y, { rx, ry, spikes: 17, life: 0.44, clipOutEl: el });
      fx.shards(bx, c.y, { n: 9, speed: 220, size: 7, life: 0.85, arc: 6.28, grav: 280 });

      const hw = Math.min(c.w / 2 + 4, 88);
      const hh = Math.min(c.h / 2 + 4, 24);
      for (const [dx, dy] of [[-1, -0.7], [1, -0.8], [-1, 0.8], [1, 0.9]]) {
        fx.puff(bx + dx * hw * 0.65, c.y + dy * hh, {
          size: fx.rnd(8, 12), n: 4, vx: dx * 34, vy: dy * 22 - 6, life: fx.rnd(0.65, 0.9)
        });
      }

      const word = (el.classList.contains('wa-send-btn') || el.classList.contains('global-app-card')) ? 'pon' : 'don';
      fireWordOnce(word, bx + 6, c.y, c.h, word === 'don' ? 132 : 108, word === 'pon' ? fx.hollow() : {});
      fx.ticks(bx - hw * 0.8, c.y - hh - 10, { dir: -2.35, n: 2, r: 4, len: 18, life: 0.42 });
      fx.ticks(bx + hw * 0.8, c.y - hh - 10, { dir: -0.75, n: 2, r: 4, len: 18, life: 0.42 });

      // Beat 3: Follow-through smoke ring & side wobbles
      fx.later(170, () => {
        if (!enabled || fx.calm) return;
        const c2 = el.isConnected ? fx.at(el) : c;
        const rx2 = c2.w > 0 ? c2 : c;
        fx.wob(rx2.x - rx2.w / 2 - 6, rx2.y, { dir: -1, r: 10, life: 0.35 });
        fx.wob(rx2.x + rx2.w / 2 + 6, rx2.y, { dir: 1, r: 10, life: 0.35 });
        fx.donut(bx + 8, c.y - Math.max(24, c.h * 0.6), { r: 22, vx: 18, vy: -42, life: 0.95 });
      });
      return;
    }

    if (kind === 'danger') {
      el.classList.add('sakuga-impact-invert');
      fx.later(150, () => el.classList.remove('sakuga-impact-invert'));
      fx.slash(c.x, c.y, { len: Math.max(95, Math.min(180, c.w * 0.95)), ang: -0.35, thick: 12, life: 0.42 });
      fx.shards(c.x, c.y, { n: 8, speed: 210, size: 6.5, arc: 6.28, grav: 320 });
      fx.lines(c.x - 16, c.y + 8, { n: 5, dir: -0.35, len: 48, spread: 14, life: 0.3 });
      fireWordOnce('zuza', c.x + 10, c.y, c.h, 108, fx.dotted());
      return;
    }

    if (kind === 'toggle') {
      // Inspect visual state after inline onclick runs
      const beforeTxt = (el.textContent || '') + (el.className || '');
      fx.later(25, () => {
        if (!enabled || fx.calm) return;
        const afterTxt = (el.textContent || '') + (el.className || '');
        const turnedOff = /🔇|OFF|MUTED|💤|Realistic/i.test(afterTxt) && afterTxt !== beforeTxt;
        if (turnedOff) {
          fx.puff(c.x, c.y, { size: 8, n: 4, vy: -14, life: 0.5 });
          fx.wob(c.x + c.w / 2 + 4, c.y, { dir: 1, r: 9, life: 0.3 });
        } else {
          fx.splash(c.x, c.y + 4, { w: Math.max(26, Math.min(44, c.w * 0.85)), h: 20, life: 0.55 });
          fx.kira(c.x + c.w * 0.35, c.y - c.h * 0.35, { r: 10, life: 0.55 });
          fx.ticks(c.x, c.y - c.h * 0.45, { dir: -Math.PI / 2, n: 4, r: 6, len: 13, fan: 0.5, life: 0.4 });
          fireWordOnce('kachi', c.x + 6, c.y, c.h, 96, fx.hollow());
        }
      });
      return;
    }

    if (kind === 'tab') {
      const parent = el.parentElement;
      let prevIdx = -1, nextIdx = 0;
      if (parent) {
        const siblings = [...parent.children].filter((ch) => ch.matches('.drawer-tab, .hub-tab-btn, .asset-tab-btn, .about-tab-btn, [role="tab"]'));
        prevIdx = siblings.findIndex((s) => s.classList.contains('active') || s.getAttribute('aria-selected') === 'true');
        nextIdx = siblings.indexOf(el);
      }
      const dir = (prevIdx >= 0 && nextIdx >= 0 && prevIdx !== nextIdx) ? Math.sign(nextIdx - prevIdx) : 1;
      fx.ticks(c.x, c.y - c.h / 2 - 4, { dir: -Math.PI / 2, n: 3, r: 4, len: 14, fan: 0.48, life: 0.42 });
      fx.puff(c.x - dir * (c.w / 2 + 6), c.y, { size: 8, n: 4, vx: -dir * 22, vy: -10, life: 0.6 });
      fx.lines(c.x - dir * (c.w / 2), c.y, { n: 4, dir: dir > 0 ? Math.PI : 0, len: 32, spread: 10, life: 0.3 });
      return;
    }

    if (kind === 'sfx-drawer') {
      // Lightweight tactile pop on drawer card so main Manga SFX VFX spotlights cleanly in #chatStream
      fx.ticks(c.x + c.w * 0.35, c.y - c.h * 0.35, { dir: -0.95, n: 2, r: 4, len: 10, fan: 0.4, life: 0.28 });
      return;
    }

    if (kind === 'sticker-msg') {
      fx.kira(c.x + c.w * 0.35, c.y - c.h * 0.35, { r: 10, life: 0.55 });
      fx.ticks(c.x, c.y - c.h * 0.4, { dir: -Math.PI / 2, n: 3, r: 6, len: 12, fan: 0.55, life: 0.38 });
      return;
    }

    // Secondary / Chips / Toolbar / Modal / Dropdown / Cards
    const cornerX = c.x + Math.min(c.w * 0.4, 42);
    const cornerY = c.y - Math.min(c.h * 0.4, 16);
    fx.ticks(cornerX, cornerY, { dir: -0.95, n: 3, r: 4, len: 13, fan: 0.42, life: 0.38 });
    fx.puff(c.x, c.y + Math.min(c.h * 0.35, 14), { size: 6.5, n: 3, vy: -14, life: 0.45 });

    if (
      el.classList.contains('gemini-chip') ||
      el.classList.contains('preset-char-chip') ||
      el.classList.contains('choice-option-btn') ||
      el.classList.contains('btn-app-quick-chip') ||
      el.classList.contains('sticker-option-item')
    ) {
      fx.kira(cornerX - 8, cornerY + 2, { r: 9, life: 0.52 });
      fireWordOnce('pon', c.x + 8, c.y, c.h, 88, fx.hollow());
    } else if (el.classList.contains('dropdown-item') || el.classList.contains('btn-secondary-comic')) {
      fx.shards(c.x, c.y, { n: 4, speed: 140, size: 4.5, arc: 4.5, grav: 260, life: 0.55 });
    }
  }

  /* ------------------------------------------------------------------------
     6. SAKUGA SLIDERS (Cumulus puffs, speed lines, シュッ, release slash)
     ------------------------------------------------------------------------ */
  const sliderStateMap = new WeakMap();

  function getSliderFrac(input) {
    const lo = parseFloat(input.min || '0');
    const hi = parseFloat(input.max === '' ? '100' : input.max);
    return hi > lo ? (parseFloat(input.value) - lo) / (hi - lo) : 0;
  }

  function handleRangeInput(input) {
    if (!enabled || fx.calm) return;
    let st = sliderStateMap.get(input);
    const frac = getSliderFrac(input);
    const nowT = performance.now();
    if (!st) {
      st = { lastFrac: frac, lastT: nowT, peakV: 0, lastWordT: 0 };
      sliderStateMap.set(input, st);
      return;
    }
    const dt = Math.max(0.012, (nowT - st.lastT) / 1000);
    const vel = (frac - st.lastFrac) / dt;
    st.lastFrac = frac;
    st.lastT = nowT;
    if (Math.abs(vel) > Math.abs(st.peakV)) st.peakV = vel;
    else st.peakV *= 0.88;

    const c = fx.at(input, 0, 0.5);
    if (c.w <= 0) return;
    const tx = c.x + 10 + Math.max(0, c.w - 20) * fx.clamp(frac);
    const dir = Math.sign(vel) || 1;
    const speed = Math.abs(vel);

    if (speed > 0.65) {
      const big = Math.min(1, speed / 3.2);
      fx.puff(tx - dir * fx.rnd(10, 22), c.y - fx.rnd(0, 8), {
        size: fx.rnd(5, 8) + big * 6, n: 4, vx: -dir * fx.rnd(24, 58), vy: -fx.rnd(16, 44), life: fx.rnd(0.55, 0.9)
      });
      fx.lines(tx - dir * 12, c.y + fx.rnd(-4, 8), {
        n: 2, dir: dir > 0 ? Math.PI : 0, len: 38 + big * 40, spread: 4, life: 0.22
      });
      if (Math.random() < 0.35) {
        fx.shards(tx - dir * 14, c.y + 4, { n: 2, size: 3.5, speed: 110, dir: dir > 0 ? Math.PI + 0.5 : -0.5, arc: 1 });
      }
      if (speed > 2.0 && nowT - st.lastWordT > 950) {
        st.lastWordT = nowT;
        const pos = clampSfxPos(tx - dir * 6, c.y, c.h, 94);
        fx.sfx('shu', pos.x, pos.y, { size: pos.size, life: 0.72, rot: -0.15, col: fx.P.line, edge: fx.P.fill });
      }
    }
  }

  function handleRangeChange(input) {
    if (!enabled || fx.calm) return;
    const st = sliderStateMap.get(input);
    const frac = getSliderFrac(input);
    const c = fx.at(input, 0, 0.5);
    if (c.w <= 0) return;
    const tx = c.x + 10 + Math.max(0, c.w - 20) * fx.clamp(frac);
    const peak = st ? st.peakV : 0;
    const dir = Math.sign(peak) || 1;

    if (Math.abs(peak) > 1.4) {
      fx.slash(tx + dir * 24, c.y, { len: 115, ang: dir > 0 ? 0 : Math.PI, thick: 10, life: 0.45, col: fx.P.shade });
      fx.shards(tx + dir * 8, c.y, { n: 4, size: 4, dir: dir > 0 ? 0 : Math.PI, arc: 2.2 });
      fx.ticks(tx + dir * 32, c.y - 20, { dir: dir > 0 ? -0.6 : -2.5, n: 3, r: 4, len: 10 });
      fx.later(160, () => {
        if (!enabled || fx.calm) return;
        fx.puff(tx - dir * 24, c.y - 12, { size: 8, n: 3, vy: -10, life: 0.65 });
        fx.wob(tx - dir * 34, c.y - 12, { dir: -dir, r: 8 });
      });
    }
    if (frac >= 1 || frac <= 0) {
      fx.shards(tx, c.y, { n: 5, size: 4.5, dir: frac >= 1 ? Math.PI : 0, arc: 2 });
    }
    if (st) st.peakV = 0;
  }

  /* ------------------------------------------------------------------------
     7. SAKUGA INPUTS & TEXTAREAS (Focus ticks + Caret dust puffs & chips)
     ------------------------------------------------------------------------ */
  const measureCtx = document.createElement('canvas').getContext('2d');

  function getCaretCoordinates(el) {
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    measureCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const pos = el.selectionStart ?? el.value.length;
    const textBefore = el.type === 'password' ? '•'.repeat(pos) : (el.value || '').slice(0, pos);
    const linesArr = textBefore.split('\n');
    const lastLine = linesArr[linesArr.length - 1] || '';
    const padLeft = parseFloat(cs.paddingLeft) || 12;
    const padTop = parseFloat(cs.paddingTop) || 8;
    const lineHeight = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) || 14) * 1.35;
    const textW = measureCtx.measureText(lastLine).width;

    const x = b.left + window.scrollX + padLeft + Math.min(Math.max(12, b.width - padLeft - 18), textW - el.scrollLeft);
    const yOffset = el.tagName === 'TEXTAREA'
      ? Math.min(b.height - 10, padTop + (linesArr.length - 0.35) * lineHeight - el.scrollTop)
      : b.height * 0.65;
    const y = b.top + window.scrollY + Math.max(12, yOffset);
    return { x, y };
  }

  function handleTextFocus(el) {
    if (!enabled) return;
    const st = getSpringState(el, { k: 680, d: 18, wide: 0.08 });
    st.s.x = 1.03;
    activateSpring(st);
    if (fx.calm) return;
    const c = fx.at(el, 1, 0);
    if (c.w <= 0) return;
    fx.ticks(c.x - 8, c.y - 2, { dir: -1.05, n: 3, r: 4, len: 13, fan: 0.38, life: 0.42 });
  }

  function handleTextInput(el) {
    if (!enabled) return;
    const st = getSpringState(el, { k: 720, d: 18, wide: 0.06 });
    st.s.x = 0.985;
    activateSpring(st);
    if (fx.calm) return;
    const pt = getCaretCoordinates(el);
    fx.puff(pt.x, pt.y, { size: fx.rnd(4, 6), n: 2, vy: -20, vx: fx.rnd(-10, 10), life: 0.38 });
    if (Math.random() < 0.32) {
      fx.shards(pt.x, pt.y - 4, { n: 2, speed: 105, size: 3, life: 0.45 });
    }
  }

  /* ------------------------------------------------------------------------
     8. SAKUGA TOAST (Smear slide-in, dust landing, dotted ズザッ, shrink out)
     ------------------------------------------------------------------------ */
  let toastSession = 0;
  let toastStopFrame = null;

  function animateToast(el, text) {
    if (!el) return false;
    if (!enabled) {
      el.classList.remove('sakuga-toast-mode');
      el.style.translate = '';
      el.style.scale = '';
      return false;
    }

    const seq = ++toastSession;
    if (toastStopFrame) {
      toastStopFrame();
      toastStopFrame = null;
    }

    el.textContent = text;
    el.classList.add('sakuga-toast-mode');
    el.style.display = 'flex';
    el.style.translate = '';
    el.style.scale = '';

    const sx = new fx.Spring(fx.calm ? 0 : -220, 290, 18);
    if (!fx.calm) sx.v = 960;
    sx.to = 0;
    const ss = new fx.Spring(1, 440, 25);
    let state = fx.calm ? 2 : 1;
    let landedAt = fx.calm ? 0 : -1;
    let elapsed = 0;

    toastStopFrame = fx.onFrame((dt) => {
      if (seq !== toastSession || !el.isConnected) {
        if (toastStopFrame) { toastStopFrame(); toastStopFrame = null; }
        return;
      }
      elapsed += dt;
      const x = sx.step(dt);
      const sc = ss.step(dt);
      const stretch = 1 + Math.min(0.65, Math.abs(sx.v) * 0.0012);

      el.style.translate = `${x.toFixed(1)}px 0`;
      el.style.scale = `${(stretch * sc).toFixed(4)} ${(sc / Math.sqrt(stretch)).toFixed(4)}`;

      if (state === 1) {
        const c = fx.at(el);
        if (!fx.calm && c.w > 0 && Math.random() < 0.75) {
          fx.lines(c.x - c.w / 2 - 4, c.y + fx.rnd(-10, 10), { n: 1, dir: Math.PI, len: 56, spread: 2, life: 0.2 });
        }
        if (x > -10) {
          state = 2;
          landedAt = elapsed;
          if (!fx.calm && c.w > 0) {
            fx.lines(c.x - c.w / 2 - 4, c.y, { n: 7, dir: Math.PI, len: 56, spread: 14, life: 0.36 });
            for (const u of [-0.42, -0.25]) {
              fx.puff(c.x + c.w * u, c.y + c.h / 2 + 2, { size: fx.rnd(7, 10), n: 3, vx: -fx.rnd(10, 24), vy: -6, life: fx.rnd(0.6, 0.85) });
            }
            fx.puff(c.x + c.w / 2 + 6, c.y + 6, { size: 6, n: 3, vx: 16, life: 0.5 });
            fx.shards(c.x - c.w / 2, c.y + 8, { n: 4, size: 3.5, dir: Math.PI + 0.5, arc: 1.5 });
            fx.ticks(c.x + 20, c.y + c.h / 2 + 8, { dir: 0.5, n: 2, r: 4, len: 13 });
            const pos = clampSfxPos(c.x - 20, c.y, c.h, 96);
            fx.sfx('zuza', pos.x, pos.y, { size: pos.size, rot: -0.08, life: 0.78, ...fx.dotted() });
            fx.wob(c.x + c.w / 2 + 6, c.y, { dir: 1, r: 10 });
          }
        }
      } else if (state === 2 && elapsed - landedAt > 2.2) {
        state = 3;
        ss.to = 0;
        ss.k = 500;
        if (!fx.calm) {
          const c = fx.at(el);
          if (c.w > 0) fx.puff(c.x, c.y, { size: 8, n: 4, life: 0.45 });
        }
      } else if (state === 3 && (sc < 0.04 || fx.calm)) {
        el.style.display = 'none';
        el.style.translate = '';
        el.style.scale = '';
        el.classList.remove('sakuga-toast-mode');
        if (toastStopFrame) { toastStopFrame(); toastStopFrame = null; }
      }
    });

    return true;
  }

  /* ------------------------------------------------------------------------
     9. GLOBAL DELEGATED LISTENERS (Covers Static & Dynamic Controls)
     ------------------------------------------------------------------------ */
  const TEXT_INPUT_TYPES = new Set(['', 'text', 'search', 'url', 'email', 'tel', 'password']);

  function isTextControl(el) {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') {
      const t = (el.type || 'text').toLowerCase();
      return TEXT_INPUT_TYPES.has(t);
    }
    return false;
  }

  document.addEventListener('pointerdown', (e) => {
    if (!enabled) return;
    const target = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
    if (target) onControlPress(target, e.clientX, e.clientY);
  }, { capture: true, passive: true });

  for (const evt of ['pointerup', 'pointercancel']) {
    document.addEventListener(evt, (e) => {
      const target = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
      if (target) releaseSpring(target);
    }, { capture: true, passive: true });
  }

  for (const evt of ['pointerleave', 'blur']) {
    document.addEventListener(evt, (e) => {
      const target = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
      if (target && (e.target === target || !target.contains(e.relatedTarget))) {
        releaseSpring(target);
      }
    }, { capture: true, passive: true });
  }

  document.addEventListener('click', (e) => {
    if (!enabled) return;
    const target = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
    if (target) onControlClick(target, e);
  }, { capture: true });

  document.addEventListener('focusin', (e) => {
    if (!enabled) return;
    if (isTextControl(e.target)) handleTextFocus(e.target);
  }, { capture: true });

  document.addEventListener('input', (e) => {
    if (!enabled) return;
    const el = e.target;
    if (!el) return;
    if (el.tagName === 'INPUT' && el.type === 'range') {
      handleRangeInput(el);
    } else if (isTextControl(el)) {
      handleTextInput(el);
    }
  }, { capture: true });

  document.addEventListener('change', (e) => {
    if (!enabled) return;
    const el = e.target;
    if (el && el.tagName === 'INPUT' && el.type === 'range') {
      handleRangeChange(el);
    }
  }, { capture: true });

  /* ------------------------------------------------------------------------
     10. PUBLIC STUDIO API & TOGGLE SYNC
     ------------------------------------------------------------------------ */
  function updateSakugaVfxUiState() {
    document.body.classList.toggle('sakuga-vfx-active', enabled);

    const menuItem = document.getElementById('menuSakugaToggleItem');
    if (menuItem) {
      menuItem.innerHTML = `⚡ Sakuga VFX: <b style="color:${enabled ? '#ff5fa8' : '#94a3b8'};">${enabled ? 'ON' : 'OFF'}</b>`;
    }

    const globalIcon = document.getElementById('globalSakugaIcon');
    const globalLabel = document.getElementById('globalSakugaLabel');
    const globalBtn = document.getElementById('globalSakugaToggleBtn');
    if (globalIcon) globalIcon.textContent = enabled ? '⚡' : '💤';
    if (globalLabel) globalLabel.textContent = `Sakuga VFX: ${enabled ? 'ON' : 'OFF'}`;
    if (globalBtn) {
      globalBtn.style.borderColor = enabled ? '#ff5fa8' : '#334155';
    }
  }

  function setSakugaVfxEnabled(val) {
    enabled = !!val;
    writeSavedPref(enabled);
    updateSakugaVfxUiState();
  }

  function toggleSakugaVfx() {
    const next = !enabled;
    setSakugaVfxEnabled(next);
    if (typeof window.showToast === 'function') {
      window.showToast(next ? '⚡ Sakuga Manga VFX: ON' : '💤 Sakuga Manga VFX: OFF');
    }
    return enabled;
  }

  registerWebComponents();
  updateSakugaVfxUiState();

  window.SakugaStudio = {
    isEnabled: () => enabled,
    setEnabled: setSakugaVfxEnabled,
    toggle: toggleSakugaVfx,
    updateUiState: updateSakugaVfxUiState,
    animateToast,
    fireWordOnce,
    clampSfxPos,
    onComposerCaretType: (el) => handleTextInput(el),
    onControlSpringPop: (el, pop = 1.15) => {
      if (!enabled || !el) return;
      const st = getSpringState(el);
      st.s.x = 0.76;
      st.pop.x = pop;
      activateSpring(st);
    }
  };
  window.toggleSakugaVfx = toggleSakugaVfx;
  window.setSakugaVfxEnabled = setSakugaVfxEnabled;
  window.updateSakugaVfxUiState = updateSakugaVfxUiState;
})();
