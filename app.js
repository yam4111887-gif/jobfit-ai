"use strict";

/* ---------- 多語系 ---------- */

const LANG_KEY = "jobfit-lang";

const I18N = {
  zh: {
    "app.name": "求職助手",
    "app.jobTitle": "職缺名稱",
    "app.jobTitlePh": "例如：前端工程師（某科技公司）",
    "app.jd": "職缺描述（JD）",
    "app.jdPh": "從求職網站複製貼上：工作內容、需求技能、加分條件…",
    "app.resume": "你的履歷",
    "app.resumeHint": "貼上文字，或上傳 .txt / .md 檔",
    "app.resumePh": "學經歷、技能、作品、證照…",
    "btn.analyze": "分析匹配度",
    "btn.tailor": "客製履歷",
    "btn.interview": "模擬面試題",
    "btn.ats": "ATS 格式健檢",
    "app.copy": "複製結果",
    "app.copied": "✅ 已複製",
    "app.disclaimer": "履歷只存在你的瀏覽器，僅送至你自行設定的 API。本工具不爬取任何求職網站。AI 建議請自行核實，切勿虛構經歷。",
    "app.footer": "JobFit AI 求職助手 — 履歷匹配分析・客製履歷・模擬面試（資料皆由使用者自行提供）",
    "hero.title": "投履歷前的最後一關",
    "hero.sub": "用職缺的角度，先替面試官審一次你的履歷。貼上職缺與履歷，30 秒得到匹配分數、缺口分析、改寫建議與面試題。",
    "hero.step1": "貼上職缺描述（JD）",
    "hero.step2": "貼上你的履歷",
    "hero.step3": "得到分數與改善清單",
    "hero.badge1": "不捏造經歷",
    "hero.badge2": "資料不出瀏覽器",
    "hero.badge3": "匹配 → 改寫 → 面試一條龍",
    "settings.button": "API 設定",
    "settings.title": "API 設定",
    "settings.hint": "使用 OpenAI 相容格式（OpenAI、Z.ai GLM、DeepSeek、Groq 等皆可）。金鑰只會存在你的瀏覽器 localStorage，不會上傳到任何地方。",
    "settings.endpoint": "API 端點",
    "settings.key": "API Key",
    "settings.model": "模型名稱",
    "settings.test": "測試連線",
    "settings.save": "儲存",
    "history.title": "分析記錄",
    "history.empty": "還沒有記錄",
    "history.clear": "清除全部記錄",
    "history.unnamed": "未命名職缺",
    "ui.fillBoth": "請先填寫「職缺描述」與「你的履歷」兩個欄位。",
    "ui.analyzing": "分析中，通常需要 10-30 秒…",
    "ui.error": "發生錯誤",
    "ui.noKey": "尚未設定 API Key，請點右上角「⚙️ API 設定」填入後再試。",
    "ui.confirmClear": "確定要清除所有分析記錄嗎？（不會影響 API 設定）",
    "ui.copyFail": "複製失敗，請手動選取複製。",
    "task.analyze": "匹配度分析",
    "task.tailor": "履歷客製",
    "task.interview": "模擬面試題",
    "task.ats": "ATS 健檢",
  },
  en: {
    "app.name": "Job Assistant",
    "app.jobTitle": "Job Title",
    "app.jobTitlePh": "e.g. Frontend Engineer (Tech Co.)",
    "app.jd": "Job Description (JD)",
    "app.jdPh": "Copy and paste from any job board: responsibilities, required skills, nice-to-haves…",
    "app.resume": "Your Resume",
    "app.resumeHint": "Paste text, or upload a .txt / .md file",
    "app.resumePh": "Education, experience, skills, projects, certificates…",
    "btn.analyze": "Analyze Match",
    "btn.tailor": "Tailor Resume",
    "btn.interview": "Mock Interview",
    "btn.ats": "ATS Format Check",
    "app.copy": "Copy result",
    "app.copied": "✅ Copied",
    "app.disclaimer": "Your resume stays in your browser and is only sent to the API you configure. This tool never scrapes job boards. Verify AI suggestions yourself — never fabricate experience.",
    "app.footer": "JobFit AI — Resume match analysis, tailoring, and interview prep (all data provided by you).",
    "hero.title": "The last checkpoint before you hit Apply",
    "hero.sub": "Review your resume through the hiring manager's eyes. Paste the job post and your resume — get a match score, gap analysis, a tailored rewrite, and interview prep in 30 seconds.",
    "hero.step1": "Paste the job description",
    "hero.step2": "Paste your resume",
    "hero.step3": "Get a score and action list",
    "hero.badge1": "No fabricated experience",
    "hero.badge2": "Data never leaves your browser",
    "hero.badge3": "Match → Rewrite → Interview, in one flow",
    "settings.button": "API Settings",
    "settings.title": "API Settings",
    "settings.hint": "Any OpenAI-compatible API works (OpenAI, Z.ai GLM, DeepSeek, Groq…). Your key is stored only in this browser's localStorage — never uploaded anywhere.",
    "settings.endpoint": "API Endpoint",
    "settings.key": "API Key",
    "settings.model": "Model Name",
    "settings.test": "Test Connection",
    "settings.save": "Save",
    "history.title": "History",
    "history.empty": "No records yet",
    "history.clear": "Clear all records",
    "history.unnamed": "Untitled job",
    "ui.fillBoth": "Please fill in both the Job Description and Your Resume fields first.",
    "ui.analyzing": "Analyzing… usually takes 10-30 seconds.",
    "ui.error": "Error",
    "ui.noKey": "No API key set yet. Click \"⚙️ API Settings\" in the top-right corner first.",
    "ui.confirmClear": "Clear all analysis records? (API settings are kept)",
    "ui.copyFail": "Copy failed — please select and copy manually.",
    "task.analyze": "Match Analysis",
    "task.tailor": "Resume Tailoring",
    "task.interview": "Mock Interview",
    "task.ats": "ATS Check",
  },
};

function t(key) {
  const lang = loadLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.zh[key] || key;
}

function loadLang() {
  const saved = localStorage.getItem(LANG_KEY);
  return saved === "en" || saved === "zh" ? saved : "zh";
}

function applyLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-ph"));
  });
  const btn = document.getElementById("btn-lang");
  if (btn) {
    const label = btn.querySelector(".lang-label");
    if (label) label.textContent = lang === "en" ? "中" : "EN";
  }
}

/* ---------- 設定 ---------- */

const SETTINGS_KEY = "jobfit-settings";
const HISTORY_KEY = "jobfit-history";

const DEFAULT_SETTINGS = {
  endpoint: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
};

function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

/* ---------- API ---------- */

async function callApi(messages) {
  const s = loadSettings();
  if (!s.apiKey) {
    throw new Error(t("ui.noKey"));
  }
  const url = s.endpoint.replace(/\/+$/, "") + "/chat/completions";
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${s.apiKey}`,
      },
      body: JSON.stringify({ model: s.model, messages, temperature: 0.4 }),
    });
  } catch {
    throw new Error(
      `連不上 API 端點（${url}）。可能原因：網路、端點網址錯誤，或該服務不允許瀏覽器直接呼叫（CORS）。若為 CORS，可改用本地伺服器開啟本頁。`
    );
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401) throw new Error("API Key 無效或過期（401），請檢查設定。");
    if (res.status === 404) throw new Error(`找不到模型或端點（404）。請確認模型名稱「${s.model}」與端點是否正確。`);
    if (res.status === 429) throw new Error("呼叫太頻繁或額度不足（429），請稍後再試。");
    throw new Error(`API 錯誤 ${res.status}：${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("API 回應格式異常，沒有取得內容。");
  return text;
}

/* ---------- 三種分析的 Prompt ---------- */

const SYSTEM_PROMPTS = {
  zh: "你是資深的台灣求職顧問與履歷專家，熟悉台灣與國際科技業、金融業、傳產的招募文化。請一律用繁體中文回答，輸出 markdown 格式，語氣專業但親切。",
  en: "You are a senior career coach and resume expert familiar with tech, finance, and traditional industry hiring across global markets. Always answer in English, output markdown, professional yet friendly tone.",
};

const TASKS = {
  analyze: {
    labelKey: "task.analyze",
    instruction: {
      zh: `請分析求職者履歷與職缺的匹配程度，依以下結構輸出：
## 總匹配分數：X / 100
（一句話總評）
## 主要優勢
（列點，每點附「為什麼這點對這個職缺重要」）
## 明顯缺口
（列點，每點附具體補強建議：能用什麼經歷、作品或證照補）
## 關鍵字建議
（職缺重視但履歷完全沒出現的關鍵字，用表格：關鍵字 | 履歷中對應的證據或補法）
## 下一步建議
（3 點內，可執行的行動）`,
      en: `Analyze how well the resume matches the job description. Output structure:
## Overall Match Score: X / 100
(one-line verdict)
## Key Strengths
(bullets; for each, why it matters for THIS job)
## Gaps
(bullets; for each, a concrete fix: which experience, project, or certificate to leverage)
## Keyword Suggestions
(keywords the JD cares about but the resume never mentions — table: Keyword | Evidence in resume or how to add it)
## Next Steps
(max 3 actionable items)`,
    },
  },
  tailor: {
    labelKey: "task.tailor",
    instruction: {
      zh: `請針對這個職缺改寫求職者的履歷。鐵則：絕不捏造學經歷、職稱、數據或證照，只能重新組織、調整用字與排序。輸出：
## 修改重點摘要
（5 點內，說明你改了什麼、為什麼）
---
## 改寫後履歷
（完整可直接使用的繁體中文履歷，markdown 格式，針對職缺調整段落順序與措辭，量化描述保留原有數字）`,
      en: `Rewrite the resume tailored to this job. Iron rule: NEVER fabricate education, experience, titles, numbers, or certificates — only reorganize, reword, and reorder. Output:
## Change Summary
(max 5 bullets: what you changed and why)
---
## Tailored Resume
(a complete, ready-to-use resume in markdown; reorder sections and adjust wording to fit the JD; keep all original numbers)`,
    },
  },
  interview: {
    labelKey: "task.interview",
    instruction: {
      zh: `請根據職缺與履歷產生模擬面試題。輸出：
## 高機率被問的 10 題
（每題附：答題方向 2-3 句，並盡量引用履歷中的真實經歷）
## 面試官可能挑戰的弱點
（3 點，每點附應對話術）
## 值得反問公司的問題
（3 題，展現專業度）`,
      en: `Generate a mock interview based on the JD and resume. Output:
## 10 Most Likely Questions
(each with a 2-3 sentence answer strategy, citing real experiences from the resume)
## Weaknesses the Interviewer May Probe
(3 items, each with suggested talking points)
## Good Questions to Ask Them
(3 questions that show professionalism)`,
    },
  },
};

function buildMessages(taskKey, jobTitle, jd, resume) {
  const lang = loadLang();
  return [
    { role: "system", content: SYSTEM_PROMPTS[lang] },
    {
      role: "user",
      content: `【職缺名稱 / Job Title】${jobTitle || t("history.unnamed")}

【職缺描述 / Job Description】
${jd}

【求職者履歷 / Resume】
${resume}

---
任務 / Task：${TASKS[taskKey].instruction[lang]}`,
    },
  ];
}

/* ---------- DOM ---------- */

const $ = (id) => document.getElementById(id);

const els = {
  jobTitle: $("job-title"),
  jd: $("jd"),
  resume: $("resume"),
  resumeFile: $("resume-file"),
  btnAnalyze: $("btn-analyze"),
  btnTailor: $("btn-tailor"),
  btnInterview: $("btn-interview"),
  btnAts: $("btn-ats"),
  result: $("result"),
  resultTitle: $("result-title"),
  resultContent: $("result-content"),
  btnCopy: $("btn-copy"),
  historyList: $("history-list"),
  btnClearHistory: $("btn-clear-history"),
  dlgSettings: $("dlg-settings"),
  btnSettings: $("btn-settings"),
  setEndpoint: $("set-endpoint"),
  setKey: $("set-key"),
  setModel: $("set-model"),
  btnTest: $("btn-test"),
  testStatus: $("test-status"),
  btnLang: $("btn-lang"),
};

/* ---------- Markdown 渲染 ---------- */

function renderMarkdown(text) {
  if (window.marked) {
    try {
      return marked.parse(text);
    } catch {
      /* fallback */
    }
  }
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<pre style="white-space:pre-wrap">${esc}</pre>`;
}

/* ---------- 執行分析 ---------- */

async function runTask(taskKey) {
  const jd = els.jd.value.trim();
  const resume = els.resume.value.trim();
  if (!jd || !resume) {
    alert(t("ui.fillBoth"));
    return;
  }

  const buttons = [els.btnAnalyze, els.btnTailor, els.btnInterview];
  buttons.forEach((b) => (b.disabled = true));

  const taskLabel = t(TASKS[taskKey].labelKey);
  const jobTitleValue = els.jobTitle.value.trim() || t("history.unnamed");

  els.result.hidden = false;
  els.resultTitle.textContent = `${taskLabel} — ${jobTitleValue}`;
  els.resultContent.classList.add("loading");
  els.resultContent.innerHTML = `<p>${t("ui.analyzing")}</p>`;
  els.result.scrollIntoView({ behavior: "smooth", block: "start" });

  let output = null;
  try {
    output = await callApi(buildMessages(taskKey, els.jobTitle.value.trim(), jd, resume));
    els.resultContent.innerHTML = renderMarkdown(output);
  } catch (e) {
    els.resultContent.classList.remove("loading");
    els.resultContent.innerHTML = `<div class="error-box"><strong>${t("ui.error")}</strong><br>${String(e.message || e)}</div>`;
    buttons.forEach((b) => (b.disabled = false));
    return;
  }
  els.resultContent.classList.remove("loading");
  buttons.forEach((b) => (b.disabled = false));

  const scoreMatch = output.match(/(\d{1,3})\s*\/\s*100/);
  addHistory({
    id: Date.now(),
    ts: new Date().toISOString(),
    action: taskLabel,
    jobTitle: jobTitleValue,
    score: taskKey === "analyze" && scoreMatch ? Number(scoreMatch[1]) : null,
    jd,
    resume,
    output,
  });
}

/* ---------- 歷史記錄 ---------- */

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function addHistory(entry) {
  const h = loadHistory();
  h.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 50)));
  renderHistory();
}

function renderHistory() {
  const h = loadHistory();
  els.historyList.innerHTML = "";
  if (!h.length) {
    els.historyList.innerHTML = `<li style="cursor:default;color:var(--muted)">${t("history.empty")}</li>`;
    return;
  }
  for (const e of h) {
    const li = document.createElement("li");
    const d = new Date(e.ts);
    const mmdd = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    li.innerHTML = `${e.score != null ? `<span class="score">${e.score}分</span> ` : ""}${e.jobTitle}<span class="meta">${mmdd}・${e.action}</span>`;
    li.addEventListener("click", () => {
      els.jobTitle.value = e.jobTitle === t("history.unnamed") ? "" : e.jobTitle;
      els.jd.value = e.jd;
      els.resume.value = e.resume;
      els.result.hidden = false;
      els.resultTitle.textContent = `${e.action} — ${e.jobTitle}`;
      els.resultContent.innerHTML = renderMarkdown(e.output);
      els.result.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    els.historyList.appendChild(li);
  }
}

/* ---------- ATS 健檢（本機運算，不用 API） ---------- */

function runAtsCheck() {
  const resume = els.resume.value.trim();
  if (!resume) {
    alert(t("ui.fillBoth"));
    return;
  }
  const lang = loadLang();
  const jd = els.jd.value.trim();
  const report = AtsChecker.computeAtsReport(resume, jd, lang);

  const statusOk = lang === "en" ? "OK" : "通過";
  const statusBad = lang === "en" ? "Fix needed" : "需改善";
  const header = lang === "en" ? "Item | Result | Detail & Fix" : "項目 | 結果 | 說明與修法";

  let md = `## ${report.score} / 100\n\n`;
  md += `| ${header} |\n|---|---|---|\n`;
  for (const c of report.checks) {
    const icon = c.ok ? "✅" : c.severity >= 10 ? "❌" : "⚠️";
    const fix = c.fix ? `（${c.fix}）` : "";
    md += `| ${icon} ${c.title} | ${c.ok ? statusOk : statusBad} | ${c.detail || ""}${fix} |\n`;
  }
  md += `\n${lang === "en"
    ? "Note: ATS rejections are mostly about missing qualifications and keywords, not formatting. A perfect format score doesn't guarantee passing — use \"📊 Analyze Match\" for content-level analysis."
    : "說明：ATS 刷掉履歷的主因是資歷不符與關鍵字不足，格式只佔少數。格式滿分不代表一定通過——內容匹配請再用「📊 分析匹配度」深入分析。"}\n`;

  els.result.hidden = false;
  els.resultTitle.textContent = `${t("task.ats")} — ${els.jobTitle.value.trim() || t("history.unnamed")}`;
  els.resultContent.classList.remove("loading");
  els.resultContent.innerHTML = renderMarkdown(md);
  els.result.scrollIntoView({ behavior: "smooth", block: "start" });

  addHistory({
    id: Date.now(),
    ts: new Date().toISOString(),
    action: t("task.ats"),
    jobTitle: els.jobTitle.value.trim() || t("history.unnamed"),
    score: report.score,
    jd,
    resume,
    output: md,
  });
}

/* ---------- 事件繫結 ---------- */

els.btnAnalyze.addEventListener("click", () => runTask("analyze"));
els.btnTailor.addEventListener("click", () => runTask("tailor"));
els.btnInterview.addEventListener("click", () => runTask("interview"));
els.btnAts.addEventListener("click", () => runAtsCheck());

els.btnLang.addEventListener("click", () => {
  applyLang(loadLang() === "zh" ? "en" : "zh");
  renderHistory();
});

els.resumeFile.addEventListener("change", async () => {
  const file = els.resumeFile.files[0];
  if (!file) return;
  const text = await file.text();
  els.resume.value = text;
});

els.btnCopy.addEventListener("click", async () => {
  const last = loadHistory()[0];
  const text = last ? last.output : els.resultContent.innerText;
  try {
    await navigator.clipboard.writeText(text);
    els.btnCopy.textContent = t("app.copied");
    setTimeout(() => (els.btnCopy.textContent = t("app.copy")), 1500);
  } catch {
    alert(t("ui.copyFail"));
  }
});

els.btnClearHistory.addEventListener("click", () => {
  if (confirm(t("ui.confirmClear"))) {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }
});

/* 設定對話框 */
els.btnSettings.addEventListener("click", () => {
  const s = loadSettings();
  els.setEndpoint.value = s.endpoint;
  els.setKey.value = s.apiKey;
  els.setModel.value = s.model;
  els.testStatus.textContent = "";
  els.dlgSettings.showModal();
});

els.btnTest.addEventListener("click", async (ev) => {
  ev.preventDefault();
  const s = {
    endpoint: els.setEndpoint.value.trim() || DEFAULT_SETTINGS.endpoint,
    apiKey: els.setKey.value.trim(),
    model: els.setModel.value.trim() || DEFAULT_SETTINGS.model,
  };
  if (!s.apiKey) {
    els.testStatus.textContent = "請先填 API Key";
    return;
  }
  els.btnTest.disabled = true;
  els.testStatus.textContent = "測試中…";
  try {
    const res = await fetch(s.endpoint.replace(/\/+$/, "") + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.apiKey}` },
      body: JSON.stringify({ model: s.model, messages: [{ role: "user", content: "嗨" }], max_tokens: 5 }),
    });
    if (res.ok) {
      els.testStatus.textContent = "✅ 連線成功";
      saveSettings(s);
    } else if (res.status === 401) {
      throw new Error("Key 無效（401）");
    } else if (res.status === 404) {
      throw new Error(`模型或端點不存在（404），檢查模型名稱「${s.model}」`);
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (e) {
    els.testStatus.textContent = `❌ ${e.message || "連線失敗（可能為 CORS 或網路問題）"}`;
  }
  els.btnTest.disabled = false;
});

els.dlgSettings.querySelector("form").addEventListener("submit", () => {
  saveSettings({
    endpoint: els.setEndpoint.value.trim() || DEFAULT_SETTINGS.endpoint,
    apiKey: els.setKey.value.trim(),
    model: els.setModel.value.trim() || DEFAULT_SETTINGS.model,
  });
});

/* 初始化 */
applyLang(loadLang());
renderHistory();
