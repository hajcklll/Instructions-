(function () {
  const form = document.querySelector("[data-reader-form]");
  const lock = document.querySelector("[data-reader-lock]");
  const content = document.querySelector("[data-reader-content]");
  const errorEl = document.querySelector("[data-reader-error]");
  const passEl = document.getElementById("reader-pass");
  const SESSION = "sumeng-key";
  const ITERATIONS = 150000;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let busy = false;

  function bytesFromBase64(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function setError(message) {
    if (errorEl) errorEl.textContent = message;
  }

  async function decryptWith(el, password) {
    const raw = bytesFromBase64(el.textContent.trim());
    const salt = raw.slice(0, 16);
    const iv = raw.slice(16, 28);
    const data = raw.slice(28);
    const base = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, data);
    return JSON.parse(decoder.decode(plain));
  }

  async function decrypt(password) {
    if (!window.crypto || !crypto.subtle) throw new Error("no-crypto");
    const payloads = [document.getElementById("su-meng-payload"), document.getElementById("su-meng-payload-b")];
    for (const el of payloads) {
      if (!el) continue;
      try {
        return await decryptWith(el, password);
      } catch (_) {
        /* try the other key */
      }
    }
    throw new Error("bad-password");
  }

  function wireDocx(base64) {
    const link = content.querySelector("[data-docx]");
    if (!link) return;
    const bytes = bytesFromBase64(base64);
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    link.href = URL.createObjectURL(blob);
    link.download = "溯梦-第三版.docx";
  }

  async function unlock(password) {
    if (busy) return;
    busy = true;
    setError("");
    try {
      const data = await decrypt(password);
      content.innerHTML = data.html;
      wireDocx(data.docx);
      lock.hidden = true;
      content.hidden = false;
      document.body.classList.add("reader-unlocked");
      document.title = "溯梦 · 上课搞的小创作";
      try { sessionStorage.setItem(SESSION, password); } catch (_) {}
      const title = content.querySelector(".reader__title");
      if (title) {
        title.setAttribute("tabindex", "-1");
        title.focus({ preventScroll: true });
      }
    } catch (err) {
      try { sessionStorage.removeItem(SESSION); } catch (_) {}
      if (err && err.message === "no-crypto") {
        setError("这个浏览器打不开加密文件。");
      } else {
        setError("密码不对。再想想？");
      }
      if (passEl) {
        passEl.value = "";
        passEl.focus();
      }
    } finally {
      busy = false;
    }
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!passEl) return;
      const password = passEl.value;
      if (!password) {
        setError("还没填密码。");
        passEl.focus();
        return;
      }
      unlock(password);
    });
  }

  let stored = "";
  try { stored = sessionStorage.getItem(SESSION) || ""; } catch (_) {}
  if (stored) {
    unlock(stored);
  } else if (passEl) {
    try { passEl.focus({ preventScroll: true }); } catch (_) {}
  }
})();
