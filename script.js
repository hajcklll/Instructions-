(() => {
  "use strict";

  const root = document.documentElement;
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* private mode */ } }
  };

  let motionOn = store.get("aripple-motion")
    ? store.get("aripple-motion") === "on"
    : !reduceQuery.matches;

  // 预览 / 截图模式：?static 强制静态，方便在无头浏览器里看稳定帧。
  if (new URLSearchParams(window.location.search).has("static")) motionOn = false;

  const toggle = document.querySelector(".motion-toggle");

  function syncMotion() {
    root.dataset.motion = motionOn ? "on" : "off";
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", String(!motionOn));
    toggle.setAttribute("aria-label", motionOn ? "暂停动效" : "播放动效");
  }

  /* ── 首屏入场 ───────────────────────────────── */
  const settle = () => root.classList.add("m-enter-done");
  if (!motionOn || reduceQuery.matches) {
    settle();
  } else {
    requestAnimationFrame(() => requestAnimationFrame(settle));
  }

  /* ── 首屏轨道 ───────────────────────────────── */
  const NS = "http://www.w3.org/2000/svg";
  const CX = 800, CY = 500, RX = 720, RY = 330;
  const TAU = Math.PI * 2;
  const orbit = document.querySelector(".orbit");
  const ticksGroup = document.querySelector(".orbit__ticks");
  const trailGroup = document.querySelector(".orbit__trail");
  const signal = document.querySelector(".orbit__signal");
  const glow = document.querySelector(".orbit__glow");

  const trail = [];
  if (trailGroup) {
    for (let i = 0; i < 18; i += 1) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("r", String(Math.max(0.55, 2.3 - i * 0.09)));
      c.setAttribute("opacity", String(Math.max(0.02, 0.3 - i * 0.015)));
      trailGroup.appendChild(c);
      trail.push(c);
    }
  }

  if (ticksGroup) {
    for (let i = 0; i < 96; i += 1) {
      const t = (i / 96) * TAU;
      const x = CX + RX * Math.cos(t);
      const y = CY + RY * Math.sin(t);
      const nx0 = Math.cos(t) / RX;
      const ny0 = Math.sin(t) / RY;
      const n = Math.hypot(nx0, ny0) || 1;
      const nx = nx0 / n;
      const ny = ny0 / n;
      const major = i % 8 === 0;
      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", String(x - nx * 3));
      line.setAttribute("y1", String(y - ny * 3));
      line.setAttribute("x2", String(x + nx * (major ? 13 : 6)));
      line.setAttribute("y2", String(y + ny * (major ? 13 : 6)));
      if (major) line.setAttribute("class", "is-major");
      ticksGroup.appendChild(line);
    }
  }



  const point = (t) => ({
    x: CX + RX * Math.cos(t),
    y: CY + RY * Math.sin(t)
  });

  function updateOrbit(t) {
    const p = point(t * TAU);
    if (signal) {
      signal.setAttribute("cx", p.x.toFixed(2));
      signal.setAttribute("cy", p.y.toFixed(2));
    }
    if (glow) {
      glow.setAttribute("cx", p.x.toFixed(2));
      glow.setAttribute("cy", p.y.toFixed(2));
    }
    for (let i = 0; i < trail.length; i += 1) {
      const q = point(t * TAU - (i + 1) * 0.012);
      trail[i].setAttribute("cx", q.x.toFixed(2));
      trail[i].setAttribute("cy", q.y.toFixed(2));
    }
  }

  let orbitRaf = null;
  let orbitLast = 0;
  // 竖屏视口里 0.16 的信号点会被 slice 裁出画面，改从 0.75 起步。
  let orbitT = window.innerWidth <= 900 ? 0.75 : 0.16;

  function orbitFrame(now) {
    if (!orbitLast) orbitLast = now;
    const dt = Math.min(64, now - orbitLast) / 1000;
    orbitLast = now;
    orbitT = (orbitT + dt / 28) % 1;
    updateOrbit(orbitT);
    orbitRaf = requestAnimationFrame(orbitFrame);
  }

  function startOrbit() {
    if (orbitRaf || !motionOn || !orbit) return;
    orbitLast = 0;
    orbitRaf = requestAnimationFrame(orbitFrame);
  }

  function stopOrbit() {
    if (orbitRaf) cancelAnimationFrame(orbitRaf);
    orbitRaf = null;
  }

  if (orbit) updateOrbit(orbitT);
  startOrbit();

  /* ── 两句话：只在它自己的章节里跟随滚动 ─────── */
  const motto = document.querySelector("#motto");
  let mottoRaf = null;

  function updateMotto() {
    mottoRaf = null;
    if (!motto || !motionOn) return;
    const total = motto.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const p = Math.min(1, Math.max(0, -motto.getBoundingClientRect().top / total));
    motto.style.setProperty("--p", p.toFixed(3));
  }

  function onMottoScroll() {
    if (!mottoRaf) mottoRaf = requestAnimationFrame(updateMotto);
  }

  function startMotto() {
    if (!motto || !motionOn) return;
    window.addEventListener("scroll", onMottoScroll, { passive: true });
    updateMotto();
  }

  function stopMotto() {
    window.removeEventListener("scroll", onMottoScroll);
    if (mottoRaf) cancelAnimationFrame(mottoRaf);
    mottoRaf = null;
    if (motto) motto.style.removeProperty("--p");
  }

  startMotto();

  /* ── 首屏定位语：信号式的打字机 ─────────────── */
  const heroTag = document.querySelector(".hero__tag");
  const heroTagStatic = heroTag ? heroTag.querySelector(".hero__tag-static") : null;
  const heroTagText = heroTag ? heroTag.querySelector(".hero__tag-text") : null;
  let typing = false;
  let typeStartTimer = 0;
  let typeStepTimer = 0;
  let typeEndTimer = 0;

  function clearTypewriter() {
    window.clearTimeout(typeStartTimer);
    window.clearTimeout(typeStepTimer);
    window.clearTimeout(typeEndTimer);
    typing = false;
    if (heroTag) heroTag.classList.remove("is-typing");
    if (heroTagText) heroTagText.textContent = "";
  }

  function startTypewriter() {
    if (!heroTag || !heroTagStatic || !heroTagText || typing) return;
    if (!motionOn || reduceQuery.matches) return;
    const text = (heroTagStatic.textContent || "").trim();
    if (!text) return;
    typing = true;
    heroTag.classList.add("is-typing");
    heroTagText.textContent = "";
    const chars = Array.from(text);
    let i = 0;

    const step = () => {
      if (!typing) return;
      if (i >= chars.length) {
        typeEndTimer = window.setTimeout(clearTypewriter, 1400);
        return;
      }
      const ch = chars[i++];
      heroTagText.textContent += ch;
      typeStepTimer = window.setTimeout(step, ch === "·" ? 120 : 42);
    };
    step();
  }

  function scheduleTypewriter() {
    window.clearTimeout(typeStartTimer);
    if (!motionOn || reduceQuery.matches) return;
    typeStartTimer = window.setTimeout(startTypewriter, 650);
  }

  /* ── 滚动渐入：文字与版块依次落纸 ───────────── */
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));

  function revealAll() {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  if (!motionOn || reduceQuery.matches || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "-10% 0px -10% 0px", threshold: 0 });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ── 章节标题：滚到跟前，一个字一个字写出来 ── */
  const titles = Array.from(document.querySelectorAll(".section-title"));
  const titleJobs = [];
  let titlesSetup = false;

  function typeTitle(job) {
    if (!job || job.typing || job.done) return;
    job.typing = true;
    const chars = Array.from(job.text);
    const caret = document.createElement("span");
    caret.className = "type-caret";
    caret.setAttribute("aria-hidden", "true");
    job.el.appendChild(caret);
    job.caret = caret;
    let i = 0;

    const step = () => {
      if (!job.typing) return;
      if (i >= chars.length) {
        job.typing = false;
        job.done = true;
        job.timer = window.setTimeout(() => {
          if (job.caret) job.caret.remove();
          job.caret = null;
        }, 900);
        return;
      }
      job.span.textContent += chars[i++];
      job.timer = window.setTimeout(step, 78);
    };
    step();
  }

  function finishAllTitles() {
    titleJobs.forEach((job) => {
      window.clearTimeout(job.timer);
      job.typing = false;
      job.done = true;
      if (job.span) job.span.textContent = job.text;
      if (job.caret) { job.caret.remove(); job.caret = null; }
    });
  }

  function setupTitleTyping() {
    if (titlesSetup || !motionOn || reduceQuery.matches || !("IntersectionObserver" in window)) return;
    titlesSetup = true;
    const titleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        titleObserver.unobserve(entry.target);
        const job = titleJobs.find((item) => item.el === entry.target);
        if (job) typeTitle(job);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.35 });

    titles.forEach((el) => {
      const text = (el.textContent || "").trim();
      if (!text) return;
      el.textContent = "";
      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = text;
      const span = document.createElement("span");
      span.className = "section-title__type";
      span.setAttribute("aria-hidden", "true");
      el.append(sr, span);
      const job = { el, text, span, timer: 0, caret: null, typing: false, done: false };
      titleJobs.push(job);
      titleObserver.observe(el);
    });
  }

  /* ── 一些数字：进入章节时 0 数到真实值 ───────── */
  const numbersSection = document.querySelector("#numbers");
  const bigValues = Array.from(document.querySelectorAll(".readout-big__value"));
  const bigFinals = bigValues.map((value) => value.textContent.trim());
  let bigRaf = null;
  let bigCounted = false;

  function stopBigCount() {
    if (bigRaf) cancelAnimationFrame(bigRaf);
    bigRaf = null;
    bigValues.forEach((value, i) => { value.textContent = bigFinals[i]; });
  }

  function runBigCount() {
    if (!motionOn || reduceQuery.matches || bigRaf || !bigValues.length) return;
    bigCounted = true;
    const targets = bigFinals.map((value) => parseInt(value, 10) || 0);
    const start = performance.now();
    const duration = 900;
    bigValues.forEach((value) => { value.textContent = "0"; });
    const step = (now) => {
      if (!motionOn) { stopBigCount(); return; }
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      bigValues.forEach((value, i) => {
        value.textContent = String(Math.round(targets[i] * eased));
      });
      if (p < 1) bigRaf = requestAnimationFrame(step);
      else {
        bigRaf = null;
        bigValues.forEach((value, i) => { value.textContent = String(targets[i]); });
      }
    };
    bigRaf = requestAnimationFrame(step);
  }

  if (numbersSection && bigValues.length && "IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || bigCounted || !motionOn || reduceQuery.matches) return;
        countObserver.unobserve(entry.target);
        runBigCount();
      });
    }, { rootMargin: "-20% 0px -20% 0px", threshold: 0 });
    countObserver.observe(numbersSection);
  }

  /* ── 诗云：静态星图 + 指针点亮 ──────────────── */
  const canvas = document.getElementById("poem-canvas");
  const stage = canvas ? canvas.parentElement : null;
  const ctx = canvas ? canvas.getContext("2d") : null;

  const QUOTES = [
    { text: "面壁十年图破壁，难酬蹈海亦英雄", src: "周恩来" },
    { text: "给岁月以文明，而不是给文明以岁月", src: "刘慈欣《三体》" },
    { text: "弱小和无知不是生存的障碍，傲慢才是", src: "刘慈欣《三体》" },
    { text: "不要回答！不要回答！不要回答！", src: "刘慈欣《三体》" },
    { text: "路漫漫其修远兮，吾将上下而求索", src: "屈原《离骚》" },
    { text: "朝闻道，夕死可矣", src: "《论语·里仁》" },
    { text: "前进！前进！不择手段地前进！", src: "刘慈欣《三体》" },
    { text: "长风破浪会有时，直挂云帆济沧海", src: "李白《行路难》" }
  ];

  const NODES = [
    { x: 0.30, y: 0.22 },
    { x: 0.68, y: 0.30 },
    { x: 0.47, y: 0.50 },
    { x: 0.78, y: 0.61 },
    { x: 0.32, y: 0.70 },
    { x: 0.57, y: 0.83 },
    { x: 0.18, y: 0.46 },
    { x: 0.84, y: 0.84 }
  ];

  const ORDER = [0, 2, 4, 5, 6, 3, 1, 7];

  const buttons = Array.from(document.querySelectorAll(".poem__item"));
  const panel = document.querySelector(".poem__panel");
  const panelFull = document.querySelector(".poem__panel-full");
  const panelChars = document.querySelector(".poem__panel-chars");
  const panelSrc = document.querySelector(".poem__panel-src");

  let active = 0;
  let hover = -1;
  let drawRaf = null;
  let panelTypeTimer = 0;
  let panelTyping = false;

  const STARS = (() => {
    let seed = 20261114;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    return Array.from({ length: 96 }, () => ({
      x: rand(),
      y: rand(),
      r: 0.35 + rand() * 0.95,
      a: 0.12 + rand() * 0.5
    }));
  })();

  function stopPanelTyping() {
    window.clearTimeout(panelTypeTimer);
    panelTyping = false;
    if (panel) panel.classList.remove("is-typing");
    if (panelChars && panelFull) panelChars.textContent = panelFull.textContent;
  }

  function setPanel(index) {
    if (!panel || !panelFull || !panelChars || !panelSrc) return;
    const q = QUOTES[index];
    if (!q) return;
    stopPanelTyping();
    panelFull.textContent = q.text;
    panelSrc.textContent = "—— " + q.src;
    if (motionOn && !reduceQuery.matches) {
      panelTyping = true;
      panel.classList.add("is-typing");
      panelChars.textContent = "";
      const chars = Array.from(q.text);
      let i = 0;
      const step = () => {
        if (!panelTyping) return;
        if (i >= chars.length) {
          panelTyping = false;
          panel.classList.remove("is-typing");
          return;
        }
        panelChars.textContent += chars[i++];
        panelTypeTimer = window.setTimeout(step, 18);
      };
      step();
    } else {
      panelChars.textContent = q.text;
    }
  }

  function setActive(index) {
    if (index < 0 || index >= QUOTES.length) return;
    active = index;
    buttons.forEach((b, i) => {
      b.classList.toggle("is-active", i === index);
      b.setAttribute("aria-pressed", String(i === index));
    });
    setPanel(index);
    draw();
  }

  function draw() {
    drawRaf = null;
    if (!canvas || !ctx || !stage) return;
    const rect = stage.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    for (const s of STARS) {
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, TAU);
      ctx.fillStyle = "rgba(31,27,21," + s.a + ")";
      ctx.fill();
    }

    const pts = NODES.map(n => ({ x: n.x * w, y: n.y * h }));

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(31,27,21,.14)";
    ctx.beginPath();
    ORDER.forEach((idx, i) => {
      const p = pts[idx];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    const lit = hover >= 0 ? hover : active;
    const litPoint = pts[lit];
    if (litPoint) {
      ctx.strokeStyle = "rgba(156,83,38,.48)";
      ctx.beginPath();
      pts.forEach((p, i) => {
        if (i === lit) return;
        const d = Math.hypot(p.x - litPoint.x, p.y - litPoint.y);
        if (d < Math.min(w, h) * 0.56) {
          ctx.moveTo(litPoint.x, litPoint.y);
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();
    }

    pts.forEach((p, i) => {
      const isActive = i === active;
      const isHover = i === hover;
      if (isActive || isHover) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, isActive ? 13 : 10, 0, TAU);
        ctx.strokeStyle = "rgba(156,83,38," + (isActive ? ".62" : ".42") + ")";
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, isActive ? 3.6 : 2.4, 0, TAU);
      ctx.fillStyle = isActive || isHover ? "#9c5326" : "rgba(31,27,21,.66)";
      ctx.fill();
    });
  }

  function requestDraw() {
    if (!drawRaf) drawRaf = requestAnimationFrame(draw);
  }

  function resizeCanvas() {
    if (!canvas || !stage) return;
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const context = canvas.getContext("2d");
    if (context) context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function nearestNode(px, py) {
    if (!stage) return -1;
    const rect = stage.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    let best = -1;
    let bestD = 28;
    NODES.forEach((n, i) => {
      const d = Math.hypot(n.x * w - px, n.y * h - py);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  if (canvas && ctx) {
    buttons.forEach((button, i) => {
      button.addEventListener("click", () => setActive(i));
      button.addEventListener("pointerenter", () => { hover = i; requestDraw(); });
      button.addEventListener("pointerleave", () => { hover = -1; requestDraw(); });
      button.addEventListener("focus", () => { hover = i; requestDraw(); });
      button.addEventListener("blur", () => { hover = -1; requestDraw(); });
    });

    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      const next = nearestNode(event.clientX - rect.left, event.clientY - rect.top);
      canvas.style.cursor = next >= 0 ? "pointer" : "default";
      if (next !== hover) {
        hover = next;
        requestDraw();
      }
    });

    canvas.addEventListener("pointerleave", () => {
      hover = -1;
      canvas.style.cursor = "default";
      requestDraw();
    });

    canvas.addEventListener("click", (event) => {
      const rect = canvas.getBoundingClientRect();
      const index = nearestNode(event.clientX - rect.left, event.clientY - rect.top);
      if (index >= 0) setActive(index);
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(resizeCanvas).observe(stage);
    }
    window.addEventListener("resize", resizeCanvas, { passive: true });
    resizeCanvas();
  }

  /* ── 诗云键盘 / 站点高亮 / 首屏读数 ─────────── */
  const poemList = document.querySelector(".poem__list");
  if (poemList) {
    poemList.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let next = active;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (active + 1) % buttons.length;
      else next = (active - 1 + buttons.length) % buttons.length;
      if (buttons[next]) {
        buttons[next].focus();
        setActive(next);
      }
    });
  }

  const stationLinks = Array.from(document.querySelectorAll(".stations__item"));
  const stationSections = stationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (stationLinks.length && stationSections.length && "IntersectionObserver" in window) {
    const stationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        stationLinks.forEach((link) => {
          link.classList.toggle("is-current", link.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-42% 0px -42% 0px", threshold: 0 });
    stationSections.forEach((section) => stationObserver.observe(section));
  }

  const readoutValues = Array.from(document.querySelectorAll(".readout dd"));
  const readoutFinals = readoutValues.map((dd) => dd.textContent.trim());
  let readoutRaf = null;
  let readoutStartTimer = 0;

  function stopReadout() {
    window.clearTimeout(readoutStartTimer);
    if (readoutRaf) cancelAnimationFrame(readoutRaf);
    readoutRaf = null;
    readoutValues.forEach((dd, i) => { dd.textContent = readoutFinals[i]; });
  }

  function runReadout() {
    if (!motionOn || reduceQuery.matches || !readoutValues.length) return;
    const targets = readoutFinals.map((value) => parseInt(value, 10) || 0);
    const start = performance.now();
    const duration = 700;
    readoutValues.forEach((dd) => { dd.textContent = "0"; });
    const step = (now) => {
      if (!motionOn) { stopReadout(); return; }
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      readoutValues.forEach((dd, i) => { dd.textContent = String(Math.round(targets[i] * eased)); });
      if (p < 1) readoutRaf = requestAnimationFrame(step);
      else {
        readoutRaf = null;
        readoutValues.forEach((dd, i) => { dd.textContent = String(targets[i]); });
      }
    };
    readoutRaf = requestAnimationFrame(step);
  }

  function scheduleReadout() {
    window.clearTimeout(readoutStartTimer);
    if (!motionOn || reduceQuery.matches) return;
    readoutStartTimer = window.setTimeout(runReadout, 1050);
  }

  /* ── 动效开关 ───────────────────────────────── */
  function applyMotion() {
    syncMotion();
    if (motionOn) {
      startOrbit();
      startMotto();
    } else {
      stopOrbit();
      stopMotto();
      clearTypewriter();
      stopPanelTyping();
      stopReadout();
      finishAllTitles();
      revealAll();
      stopBigCount();
    }
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      motionOn = !motionOn;
      store.set("aripple-motion", motionOn ? "on" : "off");
      applyMotion();
    });
  }

  reduceQuery.addEventListener?.("change", (event) => {
    if (store.get("aripple-motion")) return;
    motionOn = !event.matches;
    applyMotion();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopOrbit();
    } else if (motionOn) {
      startOrbit();
    }
  });

  syncMotion();
  setupTitleTyping();
  scheduleTypewriter();
  scheduleReadout();
})();
