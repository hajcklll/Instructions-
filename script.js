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

  let currentLang = "zh";
  const toggle = document.querySelector(".motion-toggle");

  function syncMotion() {
    root.dataset.motion = motionOn ? "on" : "off";
    if (!toggle) return;
    const en = currentLang === "en";
    toggle.setAttribute("aria-pressed", String(!motionOn));
    toggle.setAttribute("aria-label", motionOn ? (en ? "Pause motion" : "暂停动效") : (en ? "Play motion" : "播放动效"));
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
    {
      zh: { text: "面壁十年图破壁，难酬蹈海亦英雄", src: "周恩来" },
      en: { text: "Ten years facing the wall to break through; failing to cross the sea, still a hero.", src: "Zhou Enlai" }
    },
    {
      zh: { text: "给岁月以文明，而不是给文明以岁月", src: "刘慈欣《三体》" },
      en: { text: "Give civilization to the years, not years to civilization.", src: "Liu Cixin, The Three-Body Problem" }
    },
    {
      zh: { text: "弱小和无知不是生存的障碍，傲慢才是", src: "刘慈欣《三体》" },
      en: { text: "Weakness and ignorance are not obstacles to survival; arrogance is.", src: "Liu Cixin, The Three-Body Problem" }
    },
    {
      zh: { text: "不要回答！不要回答！不要回答！", src: "刘慈欣《三体》" },
      en: { text: "Do not answer! Do not answer! Do not answer!", src: "Liu Cixin, The Three-Body Problem" }
    },
    {
      zh: { text: "路漫漫其修远兮，吾将上下而求索", src: "屈原《离骚》" },
      en: { text: "The road ahead is long and far; I will search high and low.", src: "Qu Yuan, Li Sao" }
    },
    {
      zh: { text: "朝闻道，夕死可矣", src: "《论语·里仁》" },
      en: { text: "If you hear the Way in the morning, you may die content in the evening.", src: "The Analects" }
    },
    {
      zh: { text: "前进！前进！不择手段地前进！", src: "刘慈欣《三体》" },
      en: { text: "Advance! Advance! Advance by any means necessary!", src: "Liu Cixin, The Three-Body Problem" }
    },
    {
      zh: { text: "长风破浪会有时，直挂云帆济沧海", src: "李白《行路难》" },
      en: { text: "A time will come to ride the wind and cleave the waves; I will set my cloud-white sail and cross the sea.", src: "Li Bai, Hard Is the Road" }
    }
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

  function setPanel(index, animate = true) {
    if (!panel || !panelFull || !panelChars || !panelSrc) return;
    const quote = QUOTES[index];
    if (!quote) return;
    const q = quote[currentLang] || quote.zh;
    stopPanelTyping();
    panelFull.textContent = q.text;
    panelSrc.textContent = (currentLang === "en" ? "— " : "—— ") + q.src;
    if (animate && motionOn && !reduceQuery.matches) {
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

  /* ── 中英切换 ───────────────────────────────── */
  const I18N = {
    zh: {
      "doc.title": "Aripple_star — 生电玩家 · 刘慈欣书迷 · 代码折腾者",
      "doc.desc": "Aripple_star 的个人介绍：Minecraft 生电、刘慈欣与科幻、写代码，以及一个走遍世界的长梦。",
      "skip": "跳到正文",
      "nav.about": "关于",
      "nav.numbers": "一些数字",
      "nav.doing": "在折腾什么",
      "nav.reading": "书单",
      "nav.motto": "两句话",
      "nav.poem": "诗云",
      "nav.colophon": "关于这个页面",
      "nav.contact": "找到我",
      "hero.readout.aria": "B 站数据，截至 2026 年 11 月",
      "hero.tag": "生电玩家 · 刘慈欣书迷 · 代码折腾者",
      "hero.videos": "B 站投稿",
      "hero.fans": "粉丝",
      "hero.dream": "个长梦",
      "hero.cue": "沿轨道进入",
      "about.title": "关于",
      "about.lead": "随和，慢性子，偶尔犯懒。",
      "about.p1": `喜欢在 Minecraft 里搭红石机器 —— 生电这块还是个小萌新，但看着机器自己跑起来的那一刻，是真会上瘾。也喜欢在编辑器里跟编译器较劲，敲点<span class="mark">没什么用但很好玩</span>的小玩意儿。`,
      "about.p2": "看刘慈欣的书，听音乐，看风景。“面壁”在《三体》里是面壁计划；签名里那句“面壁十年”，出自周恩来。",
      "about.dream": "梦想是走遍全世界：慢慢来，但一定要去。",
      "about.avatarAlt": "Aripple_star 的头像",
      "numbers.title": "一些数字",
      "numbers.videos": "B 站投稿",
      "numbers.fans": "粉丝",
      "numbers.dream": "个长梦",
      "numbers.note": "B 站数据截至 2026.11",
      "doing.title": "在折腾什么",
      "doing.1.title": "Minecraft 生电",
      "doing.1.text": "红石机器爱好者，自称小萌新。喜欢自动化搭起来之后，那种“它自己会跑”的安静。",
      "doing.2.title": "科幻与刘慈欣",
      "doing.2.text": "看他的书，也看他把人的尺度放到宇宙里去量。《三体》的面壁计划，和签名里那句“面壁十年”，在我这儿是同一个姿势。",
      "doing.3.title": "写代码",
      "doing.3.text": "爱折腾各种小玩意儿，想到什么就动手试试。GitHub 上零零散散放了一些。",
      "doing.4.title": "音乐与风景",
      "doing.4.text": "耳机里放着歌，看窗外往后跑。走遍世界这件事，是早晚要做的。",
      "reading.title": "书单",
      "reading.lead": "如果你也是从《三体》进来的，这几本可以接着读。",
      "reading.1.title": "《三体》三部曲",
      "reading.1.note": "面壁计划、黑暗森林、死神永生。先把这套读完，再读别的。",
      "reading.2.title": "《球状闪电》",
      "reading.2.note": "宏电子、量子玫瑰，还有一场只在被观察时才存在的雨。",
      "reading.3.title": "《超新星纪元》",
      "reading.3.note": "超新星爆发之后，世界被交到孩子手里。",
      "reading.4.title": "《乡村教师》",
      "reading.4.note": "一间山村教室，和一场宇宙尺度的战争。",
      "reading.5.title": "《诗云》",
      "reading.5.note": "一个神级文明拆掉太阳系，只为存下所有可能的诗。",
      "reading.note": "先读《三体》，再往外走；不是必读顺序。",
      "motto.title": "两句话",
      "motto.trans": "要在人生这场长梦里有所成就，而不是在游戏的短梦里。",
      "motto.gloss": "On the wall for ten years, to break through; failing to cross the sea, still a hero.",
      "motto.source": "周恩来",
      "poem.title": "诗云",
      "poem.lead": `刘慈欣写过一篇《诗云》—— 一个神级文明把整个<span class="nowrap">太阳系</span>拆了，用来存下所有可能的诗。我摘了几句自己认的话，散在这片星海里。靠近它们，会亮一点。`,
      "poem.riemann.label": "黎曼猜想 · 证明公布",
      "poem.riemann.date": "1859 — 2026",
      "colophon.title": "关于这个页面",
      "colophon.note": "没有框架，没有构建步骤。想改哪儿，改哪儿。",
      "colophon.structure": "结构",
      "colophon.structure.text": "一个文件夹装下全部 —— HTML、CSS、脚本、字体、头像都在里面。",
      "colophon.type": "字体",
      "colophon.type.text": "Gloock 拉丁字面随站点本地加载；中文走系统衬线字体，不请求外部字体服务。",
      "colophon.zero": "零外部请求",
      "colophon.zero.text": "没有 CDN、统计脚本或第三方请求，断网也能看。",
      "colophon.canvas": "Canvas",
      "colophon.canvas.text": "首屏轨道是 SVG；诗云星图是 Canvas 2D，按需重绘。",
      "colophon.motion": "动效",
      "colophon.motion.text": "版块进视口时轻轻上浮，章节标题逐字写出；以 transform、opacity 和颜色为主，尊重系统的减少动态设置，可以随时关掉。",
      "colophon.hand": "手写",
      "colophon.hand.text": "没有依赖，没有编译。一个 HTML、一个 CSS、一个脚本，读完就能改。",
      "log.title": "轨道日志",
      "log.aria": "页面更新记录",
      "log.3": "为纪念黎曼猜想的一个证明被公布，诗云添了一枚独立诗签：临界线。",
      "log.1": "亮色纸本版：中英切换、书单、8 句诗云、默认英文。",
      "log.2": "长梦轨道初版：夜→日相位、首屏轨道、诗云星图。",
      "contact.title": "找到我",
      "contact.lead": "B 站、GitHub、邮箱，三个地方都能找到我。",
      "contact.stats": "19 投稿 · 76 粉丝",
      "footer.credit": "Gloock by Duarte Pinto, SIL OFL 1.1 · 摄影 Unsplash · 星空 NASA/ESA（Hubble XDF） · 数据截至 2026.11",
      "footer.top": "回到轨道顶部"
    },
    en: {
      "doc.title": "Aripple_star — Redstone player · Liu Cixin reader · Code tinkerer",
      "doc.desc": "Aripple_star's personal page: Minecraft redstone, Liu Cixin and science fiction, code, and a long dream of seeing the world.",
      "skip": "Skip to content",
      "nav.about": "About",
      "nav.numbers": "Numbers",
      "nav.doing": "What I'm Up To",
      "nav.reading": "Reading",
      "nav.motto": "Two Lines",
      "nav.poem": "Poem Cloud",
      "nav.colophon": "About This Page",
      "nav.contact": "Find Me",
      "hero.readout.aria": "Bilibili data, as of November 2026",
      "hero.tag": "Redstone player · Liu Cixin reader · Code tinkerer",
      "hero.videos": "videos",
      "hero.fans": "followers",
      "hero.dream": "dream",
      "hero.cue": "Follow the orbit",
      "about.title": "About",
      "about.lead": "Easygoing, slow, occasionally lazy.",
      "about.p1": `I like building redstone machines in Minecraft — still a beginner at technical Minecraft, but watching a machine run by itself is genuinely addictive. I also like arguing with compilers in the editor, making <span class="mark">small things that are useless but fun</span>.`,
      "about.p2": `I read Liu Cixin, listen to music, and look at scenery. In <em>The Three-Body Problem</em>, “Wallfacer” is the Wallfacer Project; the line “ten years facing the wall” in my bio comes from Zhou Enlai.`,
      "about.dream": "The dream is to see the whole world — slowly, but I will go.",
      "about.avatarAlt": "Aripple_star's avatar",
      "numbers.title": "A Few Numbers",
      "numbers.videos": "Bilibili videos",
      "numbers.fans": "followers",
      "numbers.dream": "long dream",
      "numbers.note": "Bilibili data as of Nov 2026",
      "doing.title": "What I'm Up To",
      "doing.1.title": "Minecraft redstone",
      "doing.1.text": "A redstone machine enthusiast, self-described beginner. I like the quiet after automation is built — the feeling that “it runs by itself.”",
      "doing.2.title": "Science Fiction & Liu Cixin",
      "doing.2.text": "I read his books and watch him measure human scale against the universe. The Wallfacer Project in “The Three-Body Problem” and the line “ten years facing the wall” in my bio feel like the same posture to me.",
      "doing.3.title": "Writing Code",
      "doing.3.text": "I like tinkering with small things; when an idea comes, I try it. A few of them are scattered on GitHub.",
      "doing.4.title": "Music & Scenery",
      "doing.4.text": "Music in my headphones, watching the window run backwards. Seeing the whole world is something I'll do sooner or later.",
      "reading.title": "Reading List",
      "reading.lead": "If you came in through The Three-Body Problem, these are the next stops.",
      "reading.1.title": "The Three-Body Problem trilogy",
      "reading.1.note": "The Wallfacer Project, the dark forest, Death's End. Finish the trilogy before the rest.",
      "reading.2.title": "Ball Lightning",
      "reading.2.note": "Macro-electrons, a quantum rose, and rain that exists only while observed.",
      "reading.3.title": "Supernova Era",
      "reading.3.note": "After a supernova, the world is handed to its children.",
      "reading.4.title": "The Village Teacher",
      "reading.4.note": "One mountain classroom, and a war on a cosmic scale.",
      "reading.5.title": "The Poetry Cloud",
      "reading.5.note": "A godlike civilization dismantles the solar system to store every possible poem.",
      "reading.note": "Start with the trilogy, then wander; not a required order.",
      "motto.title": "Two Lines",
      "motto.trans": "要在人生这场长梦里有所成就，而不是在游戏的短梦里。",
      "motto.gloss": "On the wall for ten years, to break through; failing to cross the sea, still a hero.",
      "motto.source": "Zhou Enlai",
      "poem.title": "Poem Cloud",
      "poem.lead": "Liu Cixin wrote a story called “Poem Cloud” — a godlike civilization dismantles the entire solar system to store every possible poem. I picked a few lines I believe in and scattered them across this sea of stars. Move closer, and they brighten.",
      "poem.riemann.label": "Riemann Hypothesis · Proof Announced",
      "poem.riemann.date": "1859 — 2026",
      "colophon.title": "About This Page",
      "colophon.note": "No framework, no build step. Change whatever you want.",
      "colophon.structure": "Structure",
      "colophon.structure.text": "One folder holds everything — HTML, CSS, script, fonts, avatar.",
      "colophon.type": "Type",
      "colophon.type.text": "Gloock's Latin face loads locally with the site; Chinese uses the system serif. No external font service.",
      "colophon.zero": "Zero external requests",
      "colophon.zero.text": "No CDN, analytics, or third-party requests. It works offline.",
      "colophon.canvas": "Canvas",
      "colophon.canvas.text": "The hero orbit is SVG; the poem star map is Canvas 2D, redrawn on demand.",
      "colophon.motion": "Motion",
      "colophon.motion.text": "Sections rise gently into view; section titles write themselves out character by character. Mostly transform, opacity, and color; respects reduced motion and can be paused.",
      "colophon.hand": "Handwritten",
      "colophon.hand.text": "No dependencies, no compilation. One HTML, one CSS, one script — readable and editable.",
      "log.title": "Orbit Log",
      "log.aria": "Page update log",
      "log.3": "To mark the announcement of a proof of the Riemann Hypothesis, the Poem Cloud gained a separate note: The Critical Line.",
      "log.1": "Light-paper edition: Chinese/English switch, reading list, eight quotations, English by default.",
      "log.2": "Long-Dream Orbit first build: the night-to-day phases, the hero orbit, the poem star map.",
      "contact.title": "Find Me",
      "contact.lead": "Bilibili, GitHub, email — three places to find me.",
      "contact.stats": "19 videos · 76 followers",
      "footer.credit": "Gloock by Duarte Pinto, SIL OFL 1.1 · Photography Unsplash · Star image NASA/ESA (Hubble XDF) · Data as of 2026.11",
      "footer.top": "Back to the top of the orbit"
    }
  };

  const langButtons = Array.from(document.querySelectorAll("[data-set-lang]"));
  const docDesc = document.querySelector('meta[name="description"]');
  const poemGroup = document.querySelector(".poem__list");

  function t(key) {
    const dict = I18N[currentLang] || I18N.zh;
    const value = dict[key];
    return typeof value === "string" ? value : "";
  }

  function setTitleText(el, text) {
    const job = titleJobs.find((item) => item.el === el);
    if (!job) { el.textContent = text; return; }
    window.clearTimeout(job.timer);
    job.typing = false;
    job.done = true;
    job.text = text;
    const sr = el.querySelector(".sr-only");
    if (sr) sr.textContent = text;
    if (job.span) job.span.textContent = text;
    if (job.caret) { job.caret.remove(); job.caret = null; }
  }

  function syncPoemButtons() {
    buttons.forEach((button, i) => {
      const q = QUOTES[i] && QUOTES[i][currentLang];
      if (!q) return;
      const src = button.querySelector(".poem__src");
      if (src) src.textContent = q.src;
      button.setAttribute("aria-label", q.text + " — " + q.src);
    });
    if (poemGroup) {
      poemGroup.setAttribute("aria-label", currentLang === "en" ? "Poem Cloud quotations" : "诗云引文");
    }
  }

  function applyLanguage(code, { persist = false } = {}) {
    currentLang = code === "en" ? "en" : "zh";
    if (persist) store.set("aripple-lang", currentLang);
    root.lang = currentLang === "en" ? "en" : "zh-CN";
    root.dataset.lang = currentLang;
    root.classList.add("i18n-ready");

    document.title = t("doc.title");
    if (docDesc) docDesc.setAttribute("content", t("doc.desc"));

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n"));
      if (!value) return;
      if (el.classList.contains("section-title")) setTitleText(el, value);
      else el.textContent = value;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-html"));
      if (value) el.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-aria"));
      if (value) el.setAttribute("aria-label", value);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-alt"));
      if (value) el.setAttribute("alt", value);
    });

    document.querySelectorAll(".stations__item").forEach((link) => {
      const label = link.querySelector(".stations__label");
      if (label) link.setAttribute("aria-label", label.textContent.trim());
    });

    if (heroTagStatic) heroTagStatic.textContent = t("hero.tag");
    clearTypewriter();

    syncPoemButtons();
    setPanel(active, false);

    langButtons.forEach((button) => {
      const isActive = button.getAttribute("data-set-lang") === currentLang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    syncMotion();
  }

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyLanguage(button.getAttribute("data-set-lang"), { persist: true });
    });
  });

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

  const langParam = new URLSearchParams(window.location.search).get("lang");
  const initialLang = langParam === "zh" ? "zh" : (langParam === "en" ? "en" : (store.get("aripple-lang") === "zh" ? "zh" : "en"));
  applyLanguage(initialLang);
  setupTitleTyping();
  scheduleTypewriter();
  scheduleReadout();
})();
