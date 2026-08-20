/* 求職儀表板：履歷版本管理＋多職缺比較＋投遞追蹤。
   純 localStorage，不出瀏覽器。依賴 app.js（t/loadHistory/els）、ats.js、redflag.js。 */
(function () {
  "use strict";

  const PROFILE_KEY = "jobfit-profiles";
  const TRACK_KEY = "jobfit-tracker";

  const STATUSES = [
    { key: "prep", color: "#6b7280" },
    { key: "sent", color: "#2563eb" },
    { key: "interview", color: "#f59e0b" },
    { key: "offer", color: "#16a34a" },
    { key: "rejected", color: "#dc2626" },
    { key: "noReply", color: "#9ca3af" },
  ];

  function loadJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }
  function saveJson(key, v) {
    localStorage.setItem(key, JSON.stringify(v));
  }

  /* ---------- 履歷版本 ---------- */

  function renderProfiles() {
    const sel = document.getElementById("profile-select");
    if (!sel) return;
    const profiles = loadJson(PROFILE_KEY);
    sel.innerHTML = "";
    if (!profiles.length) {
      sel.innerHTML = `<option value="">—</option>`;
      return;
    }
    for (const p of profiles) {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name}（${p.ts.slice(0, 10)}）`;
      sel.appendChild(opt);
    }
  }

  function saveProfile() {
    const resume = els.resume.value.trim();
    if (!resume) {
      alert(t("ui.fillBoth"));
      return;
    }
    const nameInput = document.getElementById("profile-name");
    const name = (nameInput.value || "").trim() || (loadLang() === "en" ? "Version " : "版本 ") + (loadJson(PROFILE_KEY).length + 1);
    const profiles = loadJson(PROFILE_KEY);
    profiles.unshift({ id: Date.now(), name, resume, ts: new Date().toISOString() });
    saveJson(PROFILE_KEY, profiles.slice(0, 20));
    nameInput.value = "";
    renderProfiles();
  }

  function loadProfile() {
    const sel = document.getElementById("profile-select");
    const id = Number(sel.value);
    const p = loadJson(PROFILE_KEY).find((x) => x.id === id);
    if (p) els.resume.value = p.resume;
  }

  function deleteProfile() {
    const sel = document.getElementById("profile-select");
    const id = Number(sel.value);
    if (!id) return;
    saveJson(PROFILE_KEY, loadJson(PROFILE_KEY).filter((x) => x.id !== id));
    renderProfiles();
  }

  /* ---------- 多職缺比較 ---------- */

  function renderCompareList() {
    const box = document.getElementById("compare-list");
    if (!box) return;
    const seen = new Set();
    const jobs = loadHistory().filter((e) => {
      if (!e.jd || seen.has(e.jd)) return false;
      seen.add(e.jd);
      return true;
    }).slice(0, 10);
    const zh = loadLang() !== "en";
    box.innerHTML = "";
    if (!jobs.length) {
      box.innerHTML = `<p class="hint">${zh ? "還沒有分析記錄。先跑幾次分析或 ATS 健檢，這裡就能比較。" : "No analysis history yet. Run a few checks first, then compare here."}</p>`;
      return;
    }
    for (const j of jobs) {
      const label = document.createElement("label");
      label.className = "compare-item";
      const short = j.jd.replace(/\s+/g, " ").slice(0, 42);
      label.innerHTML = `<input type="checkbox" value="${j.id}"> ${j.jobTitle} <span class="meta">${short}…</span>`;
      box.appendChild(label);
    }
  }

  function runCompare() {
    const box = document.getElementById("compare-list");
    const out = document.getElementById("compare-result");
    const ids = [...box.querySelectorAll("input:checked")].map((i) => Number(i.value));
    const zh = loadLang() !== "en";
    if (ids.length < 2 || ids.length > 4) {
      out.innerHTML = `<div class="error-box">${zh ? "請勾選 2-4 筆職缺再比較。" : "Select 2-4 jobs to compare."}</div>`;
      return;
    }
    const lang = loadLang();
    const resume = els.resume.value.trim();
    const rows = [];
    for (const e of loadHistory()) {
      if (!ids.includes(e.id)) continue;
      const coverage = AtsChecker.computeAtsReport(resume, e.jd, lang);
      const risk = RedFlagChecker.scanRedFlags(e.jd, "auto");
      rows.push({
        title: e.jobTitle,
        score: e.score,
        coverage: coverage.jdCoverage,
        missing: coverage.missingKeywords.slice(0, 3).join("、"),
        risks: risk.signals.length,
      });
    }
    rows.sort((a, b) => (b.coverage ?? 0) - (a.coverage ?? 0));
    let md = zh ? "| 職缺 | 關鍵字覆蓋 | AI匹配 | 風險訊號 | 最缺關鍵字 |\n|---|---|---|---|---|\n"
                : "| Job | Keyword coverage | AI score | Risk signals | Top missing |\n|---|---|---|---|---|\n";
    for (const r of rows) {
      md += `| ${r.title} | ${r.coverage != null ? r.coverage + "%" : "—"} | ${r.score != null ? r.score : "—"} | ${r.risks} | ${r.missing || "—"} |\n`;
    }
    md += "\n" + (zh
      ? "覆蓋率以「目前履歷輸入框」的內容計算——換不同版本再按一次，就能比較哪份履歷對哪個職缺最有效。"
      : "Coverage is computed against the CURRENT resume box — switch versions and re-run to see which resume fits which job best.");
    out.innerHTML = renderMarkdown(md);
  }

  /* ---------- 投遞追蹤 ---------- */

  function renderTracker() {
    const list = document.getElementById("track-list");
    if (!list) return;
    const tracks = loadJson(TRACK_KEY);
    const zh = loadLang() !== "en";
    list.innerHTML = "";
    if (!tracks.length) {
      list.innerHTML = `<p class="hint">${zh ? "還沒有追蹤記錄。" : "Nothing tracked yet."}</p>`;
      return;
    }
    for (const tr of tracks) {
      const row = document.createElement("div");
      row.className = "track-row";
      const options = STATUSES.map((s) =>
        `<option value="${s.key}" ${tr.status === s.key ? "selected" : ""}>${t("st." + s.key)}</option>`
      ).join("");
      row.innerHTML = `
        <div class="track-main">
          <strong>${tr.company}</strong> — ${tr.title}
          <span class="meta">${tr.ts.slice(0, 10)}</span>
        </div>
        <select class="track-status">${options}</select>
        <button class="ghost small track-del">✕</button>`;
      row.querySelector(".track-status").addEventListener("change", (ev) => {
        tr.status = ev.target.value;
        tr.updated = new Date().toISOString();
        saveJson(TRACK_KEY, tracks);
      });
      row.querySelector(".track-del").addEventListener("click", () => {
        saveJson(TRACK_KEY, tracks.filter((x) => x.id !== tr.id));
        renderTracker();
      });
      list.appendChild(row);
    }
  }

  function addTrack() {
    const company = document.getElementById("track-company").value.trim();
    const title = document.getElementById("track-title").value.trim();
    if (!company && !title) return;
    const tracks = loadJson(TRACK_KEY);
    tracks.unshift({
      id: Date.now(),
      company: company || (loadLang() === "en" ? "Unknown" : "未知公司"),
      title: title || (loadLang() === "en" ? "Untitled" : "未命名"),
      status: "prep",
      ts: new Date().toISOString().slice(0, 10),
    });
    saveJson(TRACK_KEY, tracks);
    document.getElementById("track-company").value = "";
    document.getElementById("track-title").value = "";
    renderTracker();
  }

  /* ---------- 初始化（綁定在 app.js 之後執行） ---------- */

  function bind(id, ev, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(ev, fn);
  }

  bind("btn-profile-save", "click", saveProfile);
  bind("btn-profile-load", "click", loadProfile);
  bind("btn-profile-delete", "click", deleteProfile);
  bind("btn-compare", "click", runCompare);
  bind("btn-track-add", "click", addTrack);

  renderProfiles();
  renderCompareList();
  renderTracker();
})();
