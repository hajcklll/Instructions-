/* 图书馆 · 语言切换。页面没有别的持续动画。 */
(() => {
  const root = document.documentElement;
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* private mode */ } }
  };

  const I18N = {
    zh: {
      "doc.title": "图书馆 · Aripple_star",
      "doc.desc": "几本书、一份上课写的附件、一个只在中文里出现的彩蛋，还有一本游戏相册。",
      "skip": "跳到正文",
      "library.eyebrow": "LIBRARY · COLLECTION 05",
      "library.title": "图书馆",
      "library.lead": "这里现在放了五本真的：两本网页，一份上课写的小东西，一本不太方便解释的，还有一本游戏相册。别的位置先空着——未收录，不是坏了，是还没到时候。",
      "library.meta": "馆藏 05 · 未收录 05",
      "library.shelfAria": "书架",
      "library.emptyAria": "未收录的书",
      "library.empty": "未收录",
      "library.emptyPlate": "未收录 · 05",
      "library.emptyNote": "未收录 = 还没放进去的东西。不是坏了，先留个位置。",
      "library.source": "网页在 opus 文件夹里；小创作是加密的内部文件；相册是 11 张游戏截图。",
      "library.back": "回到书签页",
      "library.open": "打开",
      "library.web": "网页",
      "library.forest.title": "林间小屋",
      "library.forest.line": "一间林间小屋，能拖着看。慢慢转，别急着走。",
      "library.forest.aria": "打开《林间小屋》",
      "library.redstone.title": "红石总线",
      "library.redstone.line": "吃红石粉，别撞墙。看着简单，手感有点凶。",
      "library.redstone.aria": "打开《红石总线》",
      "library.class.title": "上课搞的小创作",
      "library.class.sub": "溯梦 · 第三版",
      "library.class.line": "上课的时候写的剧本。内部文件，需要密码；Word 原稿在打开后。",
      "library.class.open": "输入密码",
      "library.class.aria": "打开内部文件《上课搞的小创作》",
      "library.class.tag": "内部",
      "library.secret.close": "关闭",
      "library.secret.title": "溯梦",
      "library.secret.lede": "输入密码，打开《上课搞的小创作》。",
      "library.secret.label": "密码",
      "library.secret.submit": "打开",
      "library.secret.wrong": "密码不对。再想想？",
      "library.secret.empty": "还没填密码。",
      "library.secret.noCrypto": "这个浏览器打不开加密文件。",
      "library.secret.hint": "还有一把钥匙",
      
      "library.claude.tag": "彩蛋",
      "library.claude.aria": "打开那本叫 claude 的书",
      "library.morePlate": "小创作 · 02",
      "library.album.title": "游戏相册",
      "library.album.meta": "11 张 · 2026.07.21",
      "library.album.label": "游戏相册",
      "library.album.coverMeta": "Minecraft · 11 张",
      "library.album.open": "翻开",
      "library.album.aria": "翻开游戏相册",
      "library.album.close": "合上相册",
      "library.albumPlate": "相册 · 01",
      "cover.back": "书签",
      "cover.backAria": "回到书签页"
    },
    en: {
      "doc.title": "The Library · Aripple_star",
      "doc.desc": "A few books, a script from class, an easter egg only in Chinese, and a game album.",
      "skip": "Skip to content",
      "library.eyebrow": "LIBRARY · COLLECTION 04",
      "library.title": "The Library",
      "library.lead": "Four real things for now: two web books, a little thing written in class, and a game album. The rest are placeholders — not collected yet, not broken.",
      "library.meta": "COLLECTION 04 · NOT YET 05",
      "library.shelfAria": "Bookshelf",
      "library.emptyAria": "Books not collected yet",
      "library.empty": "Not yet",
      "library.emptyPlate": "NOT YET · 05",
      "library.emptyNote": "Not collected = not in the library yet. Not broken; just waiting.",
      "library.source": "The web pages live in the opus folder; the little creation is an encrypted internal file; the album has 11 game screenshots.",
      "library.back": "Back to the bookmarks",
      "library.open": "Open",
      "library.web": "WEB",
      "library.forest.title": "Forest Cabin",
      "library.forest.line": "A cabin you can turn around. Take your time.",
      "library.forest.aria": "Open Forest Cabin",
      "library.redstone.title": "Redstone Bus",
      "library.redstone.line": "Eat redstone dust, don't hit the wall. Simple, but mean.",
      "library.redstone.aria": "Open Redstone Bus",
      "library.class.title": "A Little Thing from Class",
      "library.class.sub": "Rerawer Dream · Third Edition",
      "library.class.line": "A script written in class. Internal file; password required. The Word original opens after unlocking.",
      "library.class.open": "Enter password",
      "library.class.aria": "Open the internal file A Little Thing from Class",
      "library.class.tag": "Internal",
      "library.secret.close": "Close",
      "library.secret.title": "Rerawer Dream",
      "library.secret.lede": "Enter the password to open A Little Thing from Class.",
      "library.secret.label": "Password",
      "library.secret.submit": "Open",
      "library.secret.wrong": "That password is not right.",
      "library.secret.empty": "The password is empty.",
      "library.secret.noCrypto": "This browser cannot open the encrypted file.",
      "library.secret.hint": "There is another key.",
      
      "library.morePlate": "NOTES · 01",
      "library.album.title": "Game Album",
      "library.album.meta": "11 photos · 2026.07.21",
      "library.album.label": "Game Album",
      "library.album.coverMeta": "Minecraft · 11 photos",
      "library.album.open": "Open",
      "library.album.aria": "Open the game album",
      "library.album.close": "Close album",
      "library.albumPlate": "ALBUM · 01",
      "cover.back": "Bookmarks",
      "cover.backAria": "Back to the bookmark page"
    }
  };

  const langButtons = Array.from(document.querySelectorAll("[data-set-lang]"));
  const langBead = document.querySelector(".lang__bead");
  const metaDesc = document.querySelector('meta[name="description"]');
  let currentLang = "zh";

  function t(key) {
    const dict = I18N[currentLang] || I18N.zh;
    return typeof dict[key] === "string" ? dict[key] : "";
  }

  function syncLangBead() {
    if (!langBead) return;
    const active = langButtons.find((button) => button.classList.contains("is-active"));
    if (!active) return;
    langBead.style.left = (active.offsetLeft + active.offsetWidth / 2).toFixed(1) + "px";
  }

  function applyLanguage(code, { persist = false } = {}) {
    currentLang = code === "en" ? "en" : "zh";
    if (persist) store.set("aripple-lang", currentLang);
    root.lang = currentLang === "en" ? "en" : "zh-CN";
    root.dataset.lang = currentLang;
    root.classList.add("i18n-ready");

    document.title = t("doc.title");
    if (metaDesc) metaDesc.setAttribute("content", t("doc.desc"));
    if (currentLang === "en") closeClaude();

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n"));
      if (value) el.textContent = value;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-aria"));
      if (value) el.setAttribute("aria-label", value);
    });

    document.querySelectorAll("[data-cover-back]").forEach((link) => {
      link.setAttribute("href", "index.html?lang=" + currentLang);
    });

    langButtons.forEach((button) => {
      const active = button.getAttribute("data-set-lang") === currentLang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    syncLangBead();
  }

  /* ── 内部文件：溯梦的密码门 ───────────────────── */
  const SECRET_HASHES = [
    "3e5ccaa3887c9715aea219575df9dcfb00adcbea287922dff3d0b366dd3ddadc",
    "3522997f3e4f58b917bf22907cc0d718eca30c26527b43e847994e9759c9913f"
  ];
  const secretLayer = document.querySelector("[data-secret-layer]");
  const secretBook = document.querySelector("[data-secret-open]");
  const secretForm = document.querySelector("[data-secret-form]");
  const secretInput = document.getElementById("secret-pass");
  const secretError = document.querySelector("[data-secret-error]");
  let secretLastFocus = null;
  let secretBusy = false;

  function toHex(buffer) {
    return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function digestPassword(password) {
    if (!window.crypto || !crypto.subtle) throw new Error("no-crypto");
    const bytes = new TextEncoder().encode(password);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return toHex(hash);
  }

  function setSecretError(message) {
    if (secretError) secretError.textContent = message;
  }

  function openSecret() {
    if (!secretLayer) return;
    secretLastFocus = document.activeElement;
    secretLayer.hidden = false;
    secretLayer.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("secret-open");
    setSecretError("");
    if (secretInput) {
      secretInput.value = "";
      secretInput.focus({ preventScroll: true });
    }
  }

  function closeSecret() {
    if (!secretLayer || secretLayer.hidden) return;
    secretLayer.hidden = true;
    secretLayer.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("secret-open");
    if (secretInput) secretInput.value = "";
    setSecretError("");
    if (secretLastFocus && typeof secretLastFocus.focus === "function") {
      secretLastFocus.focus({ preventScroll: true });
    }
  }

  if (secretBook) {
    secretBook.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openSecret();
    });
  }

  if (secretLayer) {
    secretLayer.querySelectorAll("[data-secret-close]").forEach((el) => {
      el.addEventListener("click", closeSecret);
    });
    secretLayer.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSecret();
      }
    });
  }

  if (secretForm) {
    secretForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (secretBusy || !secretInput) return;
      const password = secretInput.value;
      if (!password) {
        setSecretError(t("library.secret.empty"));
        secretInput.focus();
        return;
      }
      secretBusy = true;
      setSecretError("");
      try {
        const hash = await digestPassword(password);
        if (!SECRET_HASHES.includes(hash)) {
          setSecretError(t("library.secret.wrong"));
          secretInput.value = "";
          secretInput.focus();
          return;
        }
        try { sessionStorage.setItem("sumeng-key", password); } catch (_) {}
        const href = secretBook ? secretBook.getAttribute("href") : "library/works/su-meng.html";
        window.location.href = href;
      } catch (err) {
        setSecretError(t("library.secret.noCrypto"));
      } finally {
        secretBusy = false;
      }
    });
  }

  /* ── 游戏相册 ─────────────────────────────────── */
  const albumLayer = document.querySelector("[data-album-layer]");
  const albumOpen = document.querySelector("[data-album-open]");
  let albumLastFocus = null;

  function openAlbum() {
    if (!albumLayer) return;
    albumLastFocus = document.activeElement;
    albumLayer.hidden = false;
    albumLayer.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("album-open");
    const pages = albumLayer.querySelector(".album__pages");
    if (pages) pages.scrollTop = 0;
    const close = albumLayer.querySelector(".album__close");
    if (close) close.focus({ preventScroll: true });
  }

  function closeAlbum() {
    if (!albumLayer || albumLayer.hidden) return;
    albumLayer.hidden = true;
    albumLayer.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("album-open");
    if (albumLastFocus && typeof albumLastFocus.focus === "function") {
      albumLastFocus.focus({ preventScroll: true });
    }
  }

  if (albumOpen) albumOpen.addEventListener("click", openAlbum);
  if (albumLayer) {
    albumLayer.querySelectorAll("[data-album-close]").forEach((el) => {
      el.addEventListener("click", closeAlbum);
    });
    albumLayer.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAlbum();
      }
    });
  }

  /* ── 两本网页书：页内打开，不再跳出去 ─────────── */
  const workLayer = document.querySelector("[data-work-layer]");
  const workIframe = document.querySelector("[data-work-iframe]");
  const workTitle = document.querySelector(".work-title");
  const workSourceEls = {
    forest: document.getElementById("work-forest-src"),
    redstone: document.getElementById("work-redstone-src")
  };
  let workLastFocus = null;

  function decodeWork(el) {
    if (!el) return "";
    const raw = el.textContent.trim();
    if (!raw) return "";
    const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function openWork(key) {
    if (!workLayer || !workIframe) return;
    const source = workSourceEls[key];
    const html = decodeWork(source);
    if (!html) return;
    const book = document.querySelector('[data-work="' + key + '"]');
    const title = book && book.querySelector(".web-book__title")
      ? book.querySelector(".web-book__title").textContent.trim()
      : key;
    workLastFocus = document.activeElement;
    workLayer.hidden = false;
    workLayer.classList.add("is-open");
    workLayer.setAttribute("aria-hidden", "false");
    workTitle.textContent = title;
    workIframe.title = title;
    workIframe.srcdoc = html;
    document.documentElement.classList.add("work-open");
    const close = workLayer.querySelector(".work-close");
    if (close) close.focus({ preventScroll: true });
  }

  function closeWork() {
    if (!workLayer || workLayer.hidden) return;
    workLayer.classList.remove("is-open");
    workLayer.hidden = true;
    workLayer.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("work-open");
    if (workIframe) workIframe.srcdoc = "";
    if (workLastFocus && typeof workLastFocus.focus === "function") {
      workLastFocus.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll("[data-work]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openWork(link.getAttribute("data-work"));
    });
  });

  if (workLayer) {
    workLayer.querySelectorAll("[data-work-close]").forEach((el) => {
      el.addEventListener("click", closeWork);
    });
    workLayer.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeWork();
      }
    });
  }

  /* ── 那本只在中文里出现的书 ───────────────────── */
  const claudeOpen = document.querySelector("[data-claude-open]");
  const claudeLayer = document.querySelector("[data-claude-letter]");
  let claudeLastFocus = null;

  function openClaude() {
    if (!claudeLayer || currentLang !== "zh") return;
    claudeLastFocus = document.activeElement;
    claudeLayer.hidden = false;
    claudeLayer.classList.add("is-open");
    claudeLayer.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("letter-open");
    const close = claudeLayer.querySelector(".letter__close");
    if (close) close.focus({ preventScroll: true });
  }

  function closeClaude() {
    if (!claudeLayer || claudeLayer.hidden) return;
    claudeLayer.classList.remove("is-open");
    claudeLayer.hidden = true;
    claudeLayer.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("letter-open");
    if (claudeLastFocus && typeof claudeLastFocus.focus === "function") {
      claudeLastFocus.focus({ preventScroll: true });
    }
  }

  if (claudeOpen) claudeOpen.addEventListener("click", openClaude);
  if (claudeLayer) {
    claudeLayer.querySelectorAll("[data-claude-close]").forEach((el) => {
      el.addEventListener("click", closeClaude);
    });
    claudeLayer.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeClaude();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        const close = claudeLayer.querySelector(".letter__close");
        if (close) close.focus({ preventScroll: true });
      }
    });
  }

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyLanguage(button.getAttribute("data-set-lang"), { persist: true });
    });
  });

  const initial = root.dataset.lang === "en" ? "en" : "zh";
  applyLanguage(initial);

  window.addEventListener("resize", syncLangBead);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncLangBead);
})();
