/* DynamicBar — home page: the live island and the settings tour. */
(() => {
  const { $, $$, reduce } = DB;

  // ---------- Clock in the fake menu bar ----------
  const clock = $("#clock");
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };
  tick();
  setInterval(tick, 30000);

  // ---------- The screen tilts upright as it scrolls in (only while visible) ----------
  const screen = $("#screen"), stage = $("#stage");
  let stageVisible = true, ticking = false;
  stage.addEventListener("visible", () => { stageVisible = true; });
  stage.addEventListener("hidden", () => { stageVisible = false; });
  function tilt() {
    ticking = false;
    const r = screen.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight * 0.6)));
    screen.style.setProperty("--tilt", `${(12 * (1 - t)).toFixed(2)}deg`);
  }
  if (!reduce) {
    addEventListener("scroll", () => { if (stageVisible && !ticking) { ticking = true; requestAnimationFrame(tilt); } }, { passive: true });
    tilt();
  }

  // ---------- The island ----------
  const svg = (d, big) => `<svg${big ? ' class="big"' : ""} viewBox="0 0 24 24"><path d="${d}"/></svg>`;
  const states = {
    notch: { label: "Idle", w: 190, h: 32, r: 11, ear: 0, html: "" },
    music: {
      label: "Playing", w: 268, h: 32, r: 11, ear: 7,
      html: '<div class="row"><span class="art"></span><span class="bars"><i></i><i></i><i></i><i></i></span></div>',
    },
    player: {
      label: "Now Playing", w: 378, h: 172, r: 34, ear: 14, glass: true,
      html: `<div class="player"><div class="top"><span class="art"></span><div><div class="t">Slow Evening</div><div class="a">Your favourite artist</div></div></div>
        <div class="prog"><span>0:42</span><div><i></i></div><span>-2:51</span></div>
        <div class="ctl">${svg("M12 21s-7.5-4.6-9.5-9.2C1 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 6 3.5 4.5 7.3C19.5 16.4 12 21 12 21z")}${svg("M11 6v12L2 12zm11 0v12l-9-6z")}${svg("M6 4h4v16H6zm8 0h4v16h-4z", true)}${svg("M13 6v12l9-6zM2 6v12l9-6z")}${svg("M12 13l5 8H7z")}</div></div>
        <div class="dots"><i class="on"></i><i></i></div>`,
    },
    tray: {
      label: "Tray", w: 378, h: 172, r: 34, ear: 14, glass: true,
      html: `<div class="tray">
        <div class="tile"><div style="background:linear-gradient(#f7f7f7,#d9d9d9);color:#e33;font:700 11px var(--sans)">PDF</div>Brief.pdf</div>
        <div class="tile"><div style="background:linear-gradient(#fa9a59,#8c4099)"></div>Sunset.heic</div>
        <div class="tile"><div style="background:#f2f2f2;color:#333;font:600 18px var(--sans)">≡</div>Notes</div>
        <div class="tile"><div style="background:linear-gradient(#5a5a5a,#333);color:#fff;font:600 16px var(--sans)">↗</div>Site</div>
        </div><div class="dots"><i></i><i class="on"></i></div>`,
    },
    volume: {
      label: "Volume", w: 330, h: 32, r: 11, ear: 7,
      html: '<div class="row"><svg style="width:16px;height:16px"><use href="#i-speaker"/></svg><span class="lvl"><i></i></span></div>',
    },
    power: {
      label: "Charger", w: 300, h: 32, r: 11, ear: 7,
      html: '<div class="row"><span>64%</span><span class="batt"><i></i></span></div>',
    },
    side: { label: "Side levels", w: 190, h: 32, r: 11, ear: 0, html: "" },
  };
  const order = ["music", "player", "tray", "volume", "power", "side"];
  const island = $("#island"), pill = $("#sidePill"), picker = $("#states");
  island.innerHTML = ["notch", ...order].map((k) => `<span class="face" data-face="${k}">${states[k].html}</span>`).join("");
  picker.innerHTML = order.map((k) => `<button type="button" data-state="${k}" aria-pressed="false">${states[k].label}</button>`).join("");

  let current = "notch", levelTimer;
  function show(key) {
    const s = states[key];
    current = key;
    for (const p of ["w", "h", "r", "ear"]) island.style.setProperty("--" + p, s[p] + "px");
    island.classList.toggle("glass", !!s.glass);
    island.classList.toggle("open", s.h > 40);
    $$(".face", island).forEach((f) => f.classList.toggle("show", f.dataset.face === key));
    $$("button", picker).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.state === key)));
    pill.classList.toggle("show", key === "side");
    clearInterval(levelTimer);
    if (key === "volume" || key === "side") {
      const levels = [0.65, 0.35, 0.9, 0.55];
      let n = 0;
      const step = () => {
        const v = levels[n++ % levels.length];
        const bar = $(".lvl i", island); if (bar) bar.style.width = v * 100 + "%";
        pill.firstElementChild.style.height = v * 100 + "%";
      };
      step();
      if (!reduce) levelTimer = setInterval(step, 900);
    }
  }

  // Plays through the island's shapes, but only while it is on screen and nobody is choosing.
  const cycle = ["music", "player", "tray", "music", "volume", "power", "side", "notch"];
  let ci = -1, autoTimer, held = false, resumeTimer;
  const advance = () => { if (!held) show(cycle[(ci = (ci + 1) % cycle.length)]); };
  const startAuto = () => { if (!reduce && !autoTimer) autoTimer = setInterval(advance, 2600); };
  const stopAuto = () => { clearInterval(autoTimer); autoTimer = null; clearInterval(levelTimer); };
  stage.addEventListener("visible", startAuto);
  stage.addEventListener("hidden", stopAuto);
  document.addEventListener("visibilitychange", () => (document.hidden ? stopAuto() : stageVisible && startAuto()));
  function hold(key) {
    held = true; show(key);
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { held = false; }, 9000);
  }
  picker.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) hold(b.dataset.state); });
  island.addEventListener("click", () => hold(current === "player" ? "tray" : "player"));

  show("notch");
  setTimeout(() => show(reduce ? "player" : "music"), 700);
  startAuto();

  // ---------- Settings tour ----------
  const tour = [
    ["general", "General", "How the island opens and how it feels under your fingers."],
    ["island", "Island", "The glass the island is made of, from clear to nearly black."],
    ["nowPlaying", "Now Playing", "What the island shows while something plays."],
    ["tray", "Tray", "A shelf in the notch for files, images, links and text."],
    ["levels", "Volume & Brightness", "Where levels show when you press the keys."],
    ["developer", "Developer", "Add-ons for the island, built with DynamicBarKit."],
  ];
  const tabs = $("#tourTabs"), shot = $("#tourShot"), caption = $("#tourCaption");
  tabs.innerHTML = tour.map(([k, t]) => `<button type="button" data-k="${k}" aria-pressed="false">${t}</button>`).join("");
  shot.innerHTML = tour.map(([k, t], i) => `<img data-k="${k}" src="assets/img/settings-${k}.png" alt="DynamicBar Settings, ${t} section" ${i ? 'loading="lazy"' : ""}>`).join("");
  function showTour(k) {
    const item = tour.find((t) => t[0] === k);
    $$("button", tabs).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.k === k)));
    $$("img", shot).forEach((im) => im.classList.toggle("on", im.dataset.k === k));
    caption.textContent = item[2];
  }
  tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) showTour(b.dataset.k); });
  showTour("general");
})();
