/* DynamicBar — developer page: code samples, reference tables, the add-on playground and the AI prompt. */
(() => {
  const { $, $$, esc, copyText } = DB;

  // ---------- Syntax highlight (JS / JSON) ----------
  const KW = /^(const|let|var|function|return|if|else|for|while|new|true|false|null|undefined|typeof|of|in|=>)$/;
  function hl(code) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([\s\S])/g;
    let out = "", m;
    while ((m = re.exec(code))) {
      if (m[1]) out += `<span class="t-c">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="t-s">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="t-n">${m[3]}</span>`;
      else if (m[4]) out += KW.test(m[4]) ? `<span class="t-k">${m[4]}</span>` : m[4] === "DynamicBarKit" || m[4] === "kit" ? `<span class="t-p">${m[4]}</span>` : `${m[4]}`;
      else out += esc(m[5]);
    }
    return out;
  }

  const manifest = `{
  "id": "dev.local.hello",
  "name": "Hello",
  "version": "1.0.0",
  "author": "You",
  "description": "Says hello from the island.",
  "symbol": "sparkles",
  "main": "main.js",
  "permissions": ["network"],
  "height": 172,
  "kit": 2,
  "settings": [
    { "key": "greeting", "title": "Greeting", "type": "text", "default": "Hello" },
    { "key": "loud", "title": "Loud", "type": "toggle", "default": false },
    { "key": "size", "title": "Size", "type": "number", "default": 28, "min": 16, "max": 44, "step": 2 },
    { "key": "tone", "title": "Tone", "type": "choice", "options": ["Warm", "Cool"], "default": "Warm" }
  ]
}`;
  const mainJs = `const kit = DynamicBarKit;

function render() {
  const size = kit.settings.get("size");
  kit.page({
    type: "vstack", spacing: 8, children: [
      { type: "text", text: kit.settings.get("greeting"), size, weight: "bold" },
      { type: "button", title: "Ping", symbol: "bell.fill", action: "ping" }
    ]
  });
}

kit.onAction((action, value) => kit.flash({ symbol: "bell.fill", text: action }));
kit.onSettings(render);
render();`;
  $("#manifestCode").innerHTML = hl(manifest);
  $("#mainCode").innerHTML = hl(mainJs);

  // ---------- Reference tables ----------
  const api = [
    ["DynamicBarKit.page(tree, { id, height, width })", "Shows a page in the open island; call again to update. Different ids for several pages (6 at most). height 172–320, width 378–600. Trees up to 64 KB / 300 nodes."],
    ["DynamicBarKit.removePage(id)", "Takes a page away."],
    ["DynamicBarKit.flash({ symbol, text, tint, seconds })", "A short event beside the closed island (1–10 s, up to 8 characters)."],
    ["DynamicBarKit.activity({ symbol, text, tint }) · activity(null)", "Stays beside the notch until cleared: a timer, a score, a percentage."],
    ["DynamicBarKit.onAction((action, value) => …)", "A button was tapped (value = its data), a toggle flipped or a slider moved."],
    ["DynamicBarKit.onOpen(fn) · onClose(fn)", "The island opened or closed. Pause work while closed."],
    ["DynamicBarKit.settings.get(key) · onSettings(fn)", "Reads the add-on's settings; the callback fires on change."],
    ["DynamicBarKit.storage.get / set / remove", "JSON values kept between launches (256 KB)."],
    ["setTimeout · setInterval · clear…", "As in the browser. every / after / cancel do the same (32 timers)."],
    ["fetch(url) · DynamicBarKit.http.get(url, cb)", "GET only, 1 MB, public hosts, 4 at once, 60 a minute. Needs “network”."],
    ["DynamicBarKit.system.battery() · cpu() · memory()", "{ level, charging, plugged } · 0…1 · { used, total, fraction }"],
    ["DynamicBarKit.media.nowPlaying() · playPause() · next() · previous() · onChange(fn)", "What is playing and its controls. Needs “media”."],
    ["DynamicBarKit.openURL(url)", "Opens an http(s) link, only while handling a tap. Needs “openURL”."],
    ["DynamicBarKit.clipboard.read() · write(text)", "Only while handling a tap. Needs “clipboard”."],
    ["DynamicBarKit.island.safeArea(h, w) · notch · isOpen · open(id) · close()", "Layout numbers and the island's state. open/close need “island”, once every 5 s."],
    ["DynamicBarKit.haptic()", "A tap on the Force Touch trackpad."],
  ];
  const nodes = [
    ["vstack · hstack · zstack", "children, spacing, align (leading, center, trailing)"],
    ["scroll", "children in a vertical scroll view"],
    ["grid", "children in columns (default 3), spacing"],
    ["text", "text, size (13), weight, color, opacity, mono, lines (2), align"],
    ["symbol", "symbol (SF Symbol name), size, weight, color"],
    ["image", "src (png / jpg / pdf in your folder, 2 MB), width, height, radius"],
    ["progress", "value 0…1, color"],
    ["ring", "value 0…1, size (64), color, text"],
    ["spark", "values [numbers], color, height (28)"],
    ["button", "title and/or symbol, action, data, color"],
    ["toggle", "title, on, action → true / false"],
    ["slider", "value, min (0), max (1), action → number"],
    ["spacer · divider", "space that grows; a thin line"],
    ["any node", "padding, width, height, background, radius, border, opacity"],
  ];
  const perms = [
    ["network", "Fetch web addresses (public hosts only)."],
    ["openURL", "Open web links when you tap one of its buttons."],
    ["media", "See what is playing and control playback."],
    ["clipboard", "Read and write the clipboard when you tap one of its buttons."],
    ["island", "Open and close the island by itself."],
  ];
  const fill = (id, rows) => { $(`#${id} tbody`).innerHTML = rows.map(([a, b]) => `<tr><td><code>${esc(a)}</code></td><td>${esc(b)}</td></tr>`).join(""); };
  fill("apiTable", api); fill("nodeTable", nodes); fill("permTable", perms);

  // ---------- Playground ----------
  const examples = {
    "Hello (starter)": `// The starter that "Create…" writes.
const kit = DynamicBarKit;
let taps = kit.storage.get("taps") || 0;

function render() {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  kit.page({
    type: "vstack", spacing: 8, children: [
      { type: "text", text: time, size: 40, weight: "bold", mono: true },
      { type: "text", text: "Tapped " + taps + (taps === 1 ? " time" : " times"), opacity: 0.55 },
      { type: "button", title: "Tap me", symbol: "hand.tap.fill", action: "tap" }
    ]
  });
}

kit.onAction(function (action) {
  if (action !== "tap") return;
  taps += 1;
  kit.storage.set("taps", taps);
  kit.haptic();
  kit.flash({ symbol: "hand.tap.fill", text: String(taps), tint: "orange" });
  render();
});

setInterval(render, 1000);
render();`,
    "Focus timer": `// A 25-minute focus ring with start / reset.
const kit = DynamicBarKit;
const total = 25 * 60;
let left = total, running = false;

function fmt(s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }

function render() {
  kit.page({
    type: "hstack", spacing: 22, children: [
      { type: "ring", value: 1 - left / total, size: 84, color: "orange", text: fmt(left) },
      { type: "vstack", spacing: 8, align: "leading", children: [
        { type: "text", text: running ? "Focusing" : "Ready", size: 20, weight: "bold" },
        { type: "text", text: "25 min session", opacity: 0.55 },
        { type: "hstack", spacing: 8, children: [
          { type: "button", title: running ? "Pause" : "Start", symbol: running ? "pause.fill" : "play.fill", action: "toggle", color: "orange" },
          { type: "button", symbol: "arrow.counterclockwise", action: "reset" }
        ]}
      ]}
    ]
  });
  kit.activity(running ? { symbol: "timer", text: fmt(left), tint: "orange" } : null);
}

kit.onAction((a) => {
  if (a === "toggle") running = !running;
  if (a === "reset") { running = false; left = total; }
  render();
});

setInterval(() => {
  if (!running) return;
  left = Math.max(0, left - 1);
  if (left === 0) { running = false; kit.flash({ symbol: "checkmark", text: "Done", tint: "green" }); }
  render();
}, 1000);
render();`,
    "System monitor": `// CPU history and memory, refreshed every second.
const kit = DynamicBarKit;
const history = [];

function render() {
  history.push(Math.round(kit.system.cpu() * 100));
  if (history.length > 30) history.shift();
  const mem = kit.system.memory();
  const bat = kit.system.battery();
  kit.page({
    type: "vstack", spacing: 10, children: [
      { type: "hstack", children: [
        { type: "text", text: "CPU " + history[history.length - 1] + "%", weight: "semibold" },
        { type: "spacer" },
        { type: "text", text: "Battery " + Math.round(bat.level * 100) + "%", opacity: 0.55 }
      ]},
      { type: "spark", values: history, color: "teal", height: 34 },
      { type: "text", text: "Memory " + mem.used.toFixed(1) + " / " + mem.total + " GB", size: 12, opacity: 0.55 },
      { type: "progress", value: mem.fraction, color: "purple" }
    ]
  });
}
setInterval(render, 1000);
render();`,
    "Quick toggles": `// A grid of buttons, a toggle and a slider.
const kit = DynamicBarKit;
let dnd = false, level = 0.4;

function render() {
  kit.page({
    type: "vstack", spacing: 10, children: [
      { type: "grid", columns: 4, spacing: 8, children: ["☕️", "🎧", "💡", "🚀"].map((e, i) => (
        { type: "button", title: e, action: "pick", data: String(i) }
      ))},
      { type: "toggle", title: "Do Not Disturb", on: dnd, action: "dnd" },
      { type: "slider", value: level, action: "level" }
    ]
  });
}

kit.onAction((a, v) => {
  if (a === "dnd") dnd = v;
  if (a === "level") level = v;
  if (a === "pick") kit.flash({ symbol: "sparkles", text: "#" + (Number(v) + 1), tint: "pink" });
  render();
});
render();`,
  };
  const ta = $("#playCode"), exSel = $("#examples");
  exSel.innerHTML = Object.keys(examples).map((k) => `<option>${esc(k)}</option>`).join("");
  ta.value = examples["Hello (starter)"];
  exSel.addEventListener("change", () => { ta.value = examples[exSel.value]; runPlay(); });
  $("#resetPlay").addEventListener("click", () => { ta.value = examples[exSel.value]; runPlay(); });
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Tab") { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText("  ", s, ta.selectionEnd, "end"); }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); runPlay(); }
  });
  $("#runPlay").addEventListener("click", () => runPlay());
  $("#guides").addEventListener("change", (e) => $("#simIsland").classList.toggle("guides", e.target.checked));

  const out = $("#console");
  const log = (cls, args) => {
    const line = document.createElement("div"); line.className = cls;
    line.textContent = args.map((a) => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
    out.append(line); out.scrollTop = out.scrollHeight;
  };
  $("#clearConsole").addEventListener("click", () => { out.innerHTML = ""; });

  const COLORS = { white: "#fff", red: "#ff453a", orange: "#ff9f0a", yellow: "#ffd60a", green: "#30d158", teal: "#40c8e0", blue: "#0a84ff", purple: "#bf5af2", pink: "#ff375f", gray: "#98989d" };
  const color = (c) => (c ? COLORS[c] || c : null);
  const WEIGHT = { ultralight: 200, thin: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, heavy: 800, black: 900 };
  const SYM = {
    "play.fill": "▶", "pause.fill": "❚❚", "forward.fill": "⏭", "backward.fill": "⏮", "bell.fill": "🔔", "hand.tap.fill": "☝", "sparkles": "✦",
    "checkmark": "✓", "xmark": "✕", "timer": "◷", "heart.fill": "♥", "star.fill": "★", "arrow.counterclockwise": "↺", "plus": "+", "minus": "−",
    "music.note": "♪", "bolt.fill": "ϟ", "sun.max.fill": "☀", "moon.fill": "☾", "cloud.fill": "☁", "gearshape.fill": "⚙", "trash": "🗑", "link": "🔗",
  };
  const sym = (n) => SYM[n] || "●";

  let handlers, timers, played = false, store = {};
  function render(node) {
    if (!node || typeof node !== "object") return document.createTextNode("");
    let el;
    const kids = (n) => (n.children || []).forEach((c) => el.append(render(c)));
    const align = { leading: "flex-start", center: "center", trailing: "flex-end" };
    switch (node.type) {
      case "vstack": case "hstack": case "zstack":
        el = document.createElement("div");
        el.className = "n " + (node.type === "vstack" ? "n-v" : node.type === "hstack" ? "n-h" : "n-z");
        el.style.gap = (node.spacing ?? 8) + "px";
        if (node.type === "vstack") el.style.alignItems = align[node.align || "center"];
        if (node.type === "zstack") el.style.placeItems = "center";
        kids(node); break;
      case "scroll":
        el = document.createElement("div"); el.className = "n n-scroll"; el.style.gap = (node.spacing ?? 8) + "px"; kids(node); break;
      case "grid":
        el = document.createElement("div"); el.className = "n-grid";
        el.style.gridTemplateColumns = `repeat(${node.columns || 3}, 1fr)`; el.style.gap = (node.spacing ?? 8) + "px"; el.style.alignSelf = "stretch"; kids(node); break;
      case "text":
        el = document.createElement("span"); el.className = "n-text"; el.textContent = node.text ?? "";
        el.style.fontSize = (node.size || 13) + "px"; el.style.fontWeight = WEIGHT[node.weight] || 400;
        el.style.webkitLineClamp = node.lines || 2; el.style.textAlign = { leading: "left", trailing: "right" }[node.align] || "center";
        if (node.mono) el.style.fontFamily = "var(--mono)";
        if (node.color) el.style.color = color(node.color); break;
      case "symbol":
        el = document.createElement("span"); el.className = "n-sym"; el.textContent = sym(node.symbol);
        el.style.fontSize = (node.size || 16) + "px"; el.style.color = color(node.color) || "#fff"; break;
      case "image":
        el = document.createElement("div"); el.style.cssText = `width:${node.width || 40}px;height:${node.height || 40}px;border-radius:${node.radius || 6}px;background:linear-gradient(135deg,#f28c73,#8c4dbf)`; el.title = node.src; break;
      case "progress":
        el = document.createElement("div"); el.className = "n-prog";
        el.innerHTML = `<i style="width:${Math.max(0, Math.min(1, node.value || 0)) * 100}%;background:${color(node.color) || "#fff"}"></i>`; break;
      case "ring": {
        const s = node.size || 64, r = s / 2 - 4, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, node.value || 0));
        el = document.createElement("div"); el.style.cssText = `position:relative;width:${s}px;height:${s}px;display:grid;place-items:center`;
        el.innerHTML = `<svg width="${s}" height="${s}" style="position:absolute;transform:rotate(-90deg)"><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="6"/><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" stroke="${color(node.color) || "#fff"}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}" style="transition:stroke-dashoffset .5s"/></svg><span style="font:600 ${Math.round(s / 5)}px var(--mono);color:#fff">${esc(node.text || "")}</span>`; break;
      }
      case "spark": {
        const vals = node.values || [], h = node.height || 28, w = 300, max = Math.max(...vals, 1), min = Math.min(...vals, 0);
        const pts = vals.map((v, i) => `${(i / Math.max(1, vals.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 2) - 1}`).join(" ");
        el = document.createElement("div"); el.style.alignSelf = "stretch";
        el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:${h}px;overflow:visible"><polyline points="${pts}" fill="none" stroke="${color(node.color) || "#fff"}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`; break;
      }
      case "button":
        el = document.createElement("button"); el.className = "n-btn";
        el.innerHTML = (node.symbol ? `<span>${sym(node.symbol)}</span>` : "") + (node.title ? `<span>${esc(node.title)}</span>` : "");
        if (node.color) el.style.background = color(node.color);
        el.onclick = () => fire(node.action, node.data ?? null); break;
      case "toggle":
        el = document.createElement("label"); el.className = "n n-h"; el.style.cssText = "gap:10px;align-self:stretch;justify-content:space-between;font:500 13px var(--sans);color:#fff";
        el.innerHTML = `<span>${esc(node.title || "")}</span><input type="checkbox" ${node.on ? "checked" : ""} style="accent-color:#30d158;width:18px;height:18px">`;
        el.querySelector("input").onchange = (e) => fire(node.action, e.target.checked); break;
      case "slider":
        el = document.createElement("input"); el.type = "range"; el.min = node.min ?? 0; el.max = node.max ?? 1; el.step = "any"; el.value = node.value ?? 0;
        el.style.cssText = "align-self:stretch;accent-color:#fff"; el.oninput = (e) => fire(node.action, Number(e.target.value)); break;
      case "spacer": el = document.createElement("div"); el.className = "n-spacer"; break;
      case "divider": el = document.createElement("div"); el.className = "n-div"; break;
      default:
        log("warn", [`Unknown node type “${node.type}”`]); el = document.createElement("span");
    }
    const st = el.style;
    if (node.padding != null) st.padding = node.padding + "px";
    if (node.width != null) st.width = node.width + "px";
    if (node.height != null && node.type !== "spark") st.height = node.height + "px";
    if (node.background) st.background = color(node.background);
    if (node.radius != null) st.borderRadius = node.radius + "px";
    if (node.border) st.border = "1px solid " + color(node.border);
    if (node.opacity != null) st.opacity = node.opacity;
    return el;
  }
  function fire(action, value) {
    handlers.action.forEach((fn) => { try { fn(action, value); } catch (e) { log("err", ["⚠︎ " + e.message]); } });
  }
  let flashTimer;
  function showFlash(o, stay) {
    const f = $("#simFlash");
    if (!o) { f.classList.remove("on"); setTimeout(() => (f.style.display = "none"), 400); return; }
    f.style.display = "flex";
    $("#flashText").textContent = String(o.text ?? "").slice(0, 8);
    $("#flashSym").textContent = sym(o.symbol);
    $("#flashSym").style.color = color(o.tint) || "#fff";
    requestAnimationFrame(() => f.classList.add("on"));
    clearTimeout(flashTimer);
    if (!stay) flashTimer = setTimeout(() => showFlash(null), Math.min(10, Math.max(1, o.seconds || 2.5)) * 1000);
  }

  function runPlay() {
    played = true;
    (timers || []).forEach((t) => { clearInterval(t); clearTimeout(t); });
    timers = []; handlers = { action: [], open: [], close: [], settings: [] };
    const safe = $("#simSafe"), simIsland = $("#simIsland");
    safe.innerHTML = ""; simIsland.style.height = "172px"; simIsland.style.width = "378px";
    showFlash(null);
    let lastTree = "";
    const settings = { greeting: "Hello", loud: false, size: 28, tone: "Warm" };
    let cpu = 0.3;
    const kit = {
      kit: 2, addon: { id: "dev.local.playground", version: "1.0.0" },
      page(tree, opt = {}) {
        const json = JSON.stringify(tree) + "|" + opt.height + "|" + opt.width;
        if (json.length > 65536) return log("err", ["Page tree is larger than 64 KB"]);
        // Identical trees cost nothing, as in the app.
        if (json === lastTree) return;
        lastTree = json;
        const h = Math.max(172, Math.min(320, opt.height || 172)), w = Math.max(378, Math.min(600, opt.width || 378));
        simIsland.style.height = h + "px"; simIsland.style.width = w + "px";
        safe.replaceChildren(render(tree));
        requestAnimationFrame(() => {
          if (safe.firstChild && safe.firstChild.scrollHeight > safe.clientHeight + 1) log("warn", ["Layout: the bottom is cut off — the page is taller than its safe area (" + safe.clientHeight + " pt)."]);
        });
      },
      removePage() { safe.innerHTML = ""; },
      flash: (o) => showFlash(o || {}),
      activity: (o) => showFlash(o, true),
      every: (s, fn) => { const t = setInterval(fn, s * 1000); timers.push(t); return t; },
      after: (s, fn) => { const t = setTimeout(fn, s * 1000); timers.push(t); return t; },
      cancel: (t) => { clearInterval(t); clearTimeout(t); },
      onAction: (fn) => handlers.action.push(fn),
      onOpen: (fn) => handlers.open.push(fn),
      onClose: (fn) => handlers.close.push(fn),
      onSettings: (fn) => handlers.settings.push(fn),
      haptic() { simIsland.animate([{ transform: "translateX(-50%) scale(1)" }, { transform: "translateX(-50%) scale(1.012)" }, { transform: "translateX(-50%) scale(1)" }], { duration: 160 }); },
      openURL: (u) => log("", ["openURL → " + u]),
      storage: { get: (k) => store[k], set: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); }, remove: (k) => { delete store[k]; } },
      settings: { get: (k) => settings[k] },
      system: {
        battery: () => ({ level: 0.64, charging: true, plugged: true }),
        cpu: () => (cpu = Math.max(0.03, Math.min(0.97, cpu + (Math.random() - 0.5) * 0.18))),
        memory: () => ({ used: 11.2 + Math.random(), total: 24, fraction: 0.48 + Math.random() * 0.04 }),
      },
      media: { nowPlaying: () => ({ title: "Slow Evening", artist: "Your favourite artist", playing: true, duration: 213, position: 42 }), playPause() {}, next() {}, previous() {}, onChange() {} },
      clipboard: { read: () => "", write: (t) => copyText(t) },
      island: { isOpen: true, notch: { width: 190, height: 32 }, width: 378, safeArea: (h = 172, w = 378) => ({ x: 32, y: 36, width: w - 64, height: h - 62 }), open() {}, close() {} },
      http: { get: (u, cb) => fetch(u).then((r) => r.text().then((t) => cb(null, { status: r.status, text: t, json: () => JSON.parse(t) }))).catch((e) => cb(e.message)) },
    };
    const sTimeout = (fn, ms, ...a) => { const t = setTimeout(() => { try { fn(...a); } catch (e) { log("err", ["⚠︎ " + e.message]); } }, ms); timers.push(t); return t; };
    const sInterval = (fn, ms, ...a) => { const t = setInterval(() => { try { fn(...a); } catch (e) { log("err", ["⚠︎ " + e.message]); clearInterval(t); } }, ms); timers.push(t); return t; };
    const con = { log: (...a) => log("", a), info: (...a) => log("", a), warn: (...a) => log("warn", a), error: (...a) => log("err", a) };
    log("", ["— Started " + new Date().toLocaleTimeString()]);
    try {
      new Function("DynamicBarKit", "setTimeout", "setInterval", "clearTimeout", "clearInterval", "console", "window", "document", ta.value)(
        kit, sTimeout, sInterval, clearTimeout, clearInterval, con, undefined, undefined);
    } catch (e) {
      log("err", ["⚠︎ " + e.name + ": " + e.message]);
    }
  }
  // Scale the 378-pt island down on narrow screens.
  const fit = () => { const w = $("#simScreen").clientWidth; if (w) $("#simIsland").style.setProperty("--s", Math.min(1, (w - 10) / 400)); };
  new ResizeObserver(fit).observe($("#simScreen"));

  // ---------- AI prompt ----------
  const ideaEx = [
    "Pomodoro timer with a ring",
    "Weather for my city from open-meteo.com",
    "Crypto price ticker with a sparkline",
    "Countdown to New Year as an activity beside the notch",
    "Habit checklist with toggles",
    "Stopwatch with laps",
  ];
  $("#ideas").innerHTML = ideaEx.map((i) => `<button>${esc(i)}</button>`).join("");
  $("#ideas").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { $("#idea").value = b.textContent; updatePrompt(); } });
  let reference = null;
  fetch("kit/DynamicBarKit.md").then((r) => (r.ok ? r.text() : Promise.reject())).then((t) => { reference = t; updatePrompt(); }).catch(() => updatePrompt());
  function buildPrompt() {
    const idea = $("#idea").value.trim() || $("#idea").placeholder;
    return `You are an expert DynamicBar add-on developer. DynamicBar is a macOS app that turns the MacBook notch into a Liquid Glass "island". Add-ons are small JavaScript programs (JavaScriptCore, ES2020 — no DOM, no require/import, no npm) that draw pages in the open island and show short events beside the closed one, using the DynamicBarKit API documented below.

## What I want
${idea}

## Rules
- Use ONLY the APIs, node types, properties and permissions in the reference. Do not invent any.
- Respect the layout rules: the content must fit the safe area (314 × 110 pt at the default 172 pt height). If it needs more room, pass { height } (172–320) and/or { width } (378–600) to DynamicBarKit.page or set them in manifest.json. Budget the height of every element.
- Never put anything in the notch, never pad the top yourself.
- White text on dark glass, opacity 0.55 for secondary lines, 11 pt minimum, one accent colour.
- No long loops; use timers. Pause work in onClose, resume in onOpen. Re-render by calling DynamicBarKit.page with the whole tree.
- Ask for the minimum permissions. Keep what must survive restarts in DynamicBarKit.storage.
- Use real SF Symbol names for "symbol".
- Use a reverse-DNS id like "dev.yourname.addon-name".

## Output
1. \`manifest.json\` — complete, valid JSON.
2. \`main.js\` — complete, starting with \`/// <reference path="../DynamicBarKit.d.ts" />\`.
3. Two or three sentences on how to install it: create a folder in ~/Library/Application Support/DynamicBar/AddOns/ with both files, turn on Developer Mode in Settings ▸ Developer.

## DynamicBarKit reference
${reference || "(Open https://kag1o.github.io/DynamicBar/kit/DynamicBarKit.md and paste it here.)"}`;
  }
  function updatePrompt() {
    const p = buildPrompt();
    $("#promptPreview").textContent = p;
    $("#promptSize").textContent = `${p.length.toLocaleString()} characters`;
  }
  $("#idea").addEventListener("input", updatePrompt);
  $("#copyPrompt").addEventListener("click", (e) => copyText(buildPrompt(), e.currentTarget));
  updatePrompt();


  // ---------- Section picker follows the scroll ----------
  const links = $$("#devNav a");
  const spy = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + e.target.id)));
  }), { rootMargin: "-40% 0px -55% 0px" });
  $$(".doc[id]").forEach((s) => spy.observe(s));

  // The playground runs once it scrolls into view, and its timers stop while it is away.
  const playground = $("#playground");
  playground.addEventListener("visible", () => { if (!played) runPlay(); });
  playground.addEventListener("hidden", () => {
    (timers || []).forEach((t) => { clearInterval(t); clearTimeout(t); });
    played = false;
  });
})();
