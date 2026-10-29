/* DynamicBar — shared by every page: theme, off-screen pausing, copy buttons. */
window.DB = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- Theme: follows the system until the person picks one ----------
  const root = document.documentElement;
  const systemLight = matchMedia("(prefers-color-scheme: light)");
  const current = () => root.dataset.theme || (systemLight.matches ? "light" : "dark");
  $$(".theme-btn").forEach((b) => {
    const label = () => b.setAttribute("aria-label", current() === "dark" ? "Switch to light theme" : "Switch to dark theme");
    label();
    b.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch {}
      label();
    });
    systemLight.addEventListener("change", label);
  });

  // ---------- Videos play only while visible; [data-loop] areas pause their CSS loops ----------
  const watcher = new IntersectionObserver((entries) => entries.forEach((e) => {
    const el = e.target;
    if (el.tagName === "VIDEO") {
      if (e.isIntersecting && !reduce) el.play().catch(() => {}); else el.pause();
    } else {
      el.classList.toggle("paused", !e.isIntersecting);
      el.dispatchEvent(new CustomEvent(e.isIntersecting ? "visible" : "hidden"));
    }
  }), { rootMargin: "120px 0px" });
  $$("video").forEach((v) => { v.muted = true; v.removeAttribute("autoplay"); watcher.observe(v); });
  $$("[data-loop]").forEach((el) => watcher.observe(el));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) $$("video").forEach((v) => v.pause());
  });

  // ---------- Copy ----------
  async function copyText(text, btn) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement("textarea"); t.value = text; document.body.append(t); t.select();
      document.execCommand("copy"); t.remove();
    }
    if (!btn) return;
    const was = btn.textContent;
    btn.textContent = "Copied"; btn.classList.add("done");
    setTimeout(() => { btn.textContent = was; btn.classList.remove("done"); }, 1600);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const from = b.dataset.copy;
    const text = from ? $("#" + from).value : b.closest(".code").querySelector("pre").innerText;
    copyText(text, b);
  });

  return { $, $$, reduce, esc, copyText };
})();
