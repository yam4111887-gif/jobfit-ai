/* ATS 履歷格式健檢 — 純本機運算，不需要 API。
   同時支援瀏覽器（window.AtsChecker）與 Node（module.exports）以便測試。 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AtsChecker = factory();
  }
})(typeof self !== "undefined" ? self : globalThis, function () {
  "use strict";

  const ZH_STOP = new Set([
    "的", "與", "及", "或", "等", "公司", "工作", "內容", "需求", "條件", "能力",
    "經驗", "相關", "科系", "大學", "碩士", "學歷", "專案", "管理", "佳", "熟悉",
    "具備", "負責", "以及", "我們", "歡迎", "加入", "良好", "溝通", "團隊", "精神",
    "意者", "請", "應", "可", "能", "並", "均", "為", "在", "以", "對", "以上",
    "以下", "完成", "執行", "部門", "職缺", "職位", "徵才", "月新", "月薪", "年薪",
    "福利", "制度", "環境", "加班", "休假", "待遇", "面議", "其他", "基本", "加分",
    "需求技能", "加分條件", "工作內容", "其他條件", "福利制度", "上班", "段假",
    "工程師", "後端工程師", "前端工程師", "全端工程師", "軟體工程師", "資深工程師",
    "設計師", "產品經理", "專案經理", "主管", "助理", "秘書", "實習生", "正職",
  ]);

  const EN_STOP = new Set([
    "the", "and", "with", "for", "you", "your", "our", "will", "have", "has",
    "are", "was", "were", "from", "that", "this", "must", "should", "can",
    "able", "work", "working", "years", "year", "experience", "team", "good",
    "strong", "plus", "etc", "job", "role", "who", "new", "using", "use",
    "used", "across", "within", "about", "into", "their", "they", "them",
    "other", "more", "most", "including", "include", "includes", "required",
    "preferred", "responsibilities", "requirements", "qualifications",
    "benefits", "not", "but", "all", "any", "may", "well", "also", "such",
    "per", "via", "out", "one", "two", "able", "like", "every", "need",
    "backend", "frontend", "fullstack", "engineer", "developer", "manager",
    "senior", "junior", "lead", "staff", "principal", "hire", "hiring",
    "apply", "position", "opportunity", "looking", "join", "help", "build",
  ]);

  function zhTokens(text) {
    const raw = text.split(/[\n\r,，、;；.。:：!？?()（）【】\[\]\/\s]+/);
    const freq = new Map();
    for (const t of raw) {
      const tok = t.trim();
      if (tok.length < 2 || tok.length > 12) continue;
      if (/^\d+$/.test(tok)) continue;
      if (ZH_STOP.has(tok)) continue;
      freq.set(tok, (freq.get(tok) || 0) + 1);
    }
    return freq;
  }

  function enTokens(text) {
    const words = text.toLowerCase().match(/[a-z][a-z0-9+#.]{1,}/g) || [];
    const freq = new Map();
    for (const w of words) {
      if (w.length < 3 || EN_STOP.has(w)) continue;
      if (/^\d/.test(w)) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
    return freq;
  }

  const STR = {
    zh: {
      contact: ["聯絡資訊", "找不到 email 或電話——ATS 和人資都需要至少一種聯絡方式", "在履歷開頭加上 email 或電話"],
      sections: ["標準區塊標題", "缺少標準區塊（學歷/經歷/技能），解析器可能誤判內容歸類", "使用「學歷」「工作經歷」「技能」等標準標題，避免創意命名"],
      length: ["履歷長度", null, null],
      shortLen: d => ["履歷長度", `只有 ${d} 個字，內容太精簡，說服力不足`, "每段經歷至少 2-3 個列點，補充量化成果"],
      longLen: d => ["履歷長度", `${d} 個字，超過一般 1-2 頁上限，重點會被淹沒`, "刪除 10 年前的經歷細節，只保留與目標職缺相關的內容"],
      quantified: ["量化成果", "數字化描述不足——「改善效能」不如「改善效能 30%」有說服力", "每段經歷至少 1 處數字：百分比、金額、人數、時間"],
      bullets: ["列點格式", "列點太少，大段文字對 ATS 解析與人資閱讀都不友善", "用列點（-、•）取代長段落，一行一件事"],
      tables: ["表格與特殊格式", "偵測到表格格線（|），部分 ATS 解析器會打亂欄位順序", "把表格改為純文字列點，將表格留給作品集"],
      jd: ["職缺關鍵字覆蓋", null, null],
      jdLow: (cov, miss) => [`職缺關鍵字覆蓋率僅 ${cov}%`, `職缺重視但履歷未出現：${miss}`, "把真實對應的經歷補進履歷（只補你真的有的，不要硬塞）"],
      jdMid: (cov, miss) => [`職缺關鍵字覆蓋率 ${cov}%`, `可再補強的關鍵字：${miss}`, "檢查是否有遺漏的相關經歷可以補上"],
      jdOk: cov => [`職缺關鍵字覆蓋率 ${cov}%`, "關鍵字覆蓋良好", "維持現況"],
      noJd: ["職缺關鍵字覆蓋", "未填職缺描述，跳過關鍵字比對", "貼上 JD 可解鎖關鍵字覆蓋分析"],
      pass: "通過",
      title: "ATS 格式健檢報告",
      scoreLine: s => `## ATS 健檢分數：${s} / 100`,
      note: "說明：ATS（求職者追蹤系統）刷掉履歷的主因通常是**資歷不符合與關鍵字不足**，格式問題只佔少數。格式分數滿分不代表一定通過篩選——內容與職缺的匹配才是決勝點（可用「📊 分析匹配度」深入分析）。",
      missing: "缺漏關鍵字",
    },
    en: {
      contact: ["Contact info", "No email or phone found — ATS and recruiters need at least one contact method", "Add an email or phone number at the top"],
      sections: ["Standard section headings", "Missing standard sections (Education/Experience/Skills) — parsers may misclassify content", "Use standard headings like Education, Experience, Skills; avoid creative names"],
      length: ["Resume length", null, null],
      shortLen: d => ["Resume length", `Only ${d} characters — too thin to be persuasive`, "Add 2-3 bullets per role with quantified results"],
      longLen: d => ["Resume length", `${d} characters — beyond the usual 1-2 pages, key points get buried`, "Trim details from roles older than 10 years; keep only what's relevant to the target job"],
      quantified: ["Quantified achievements", "Not enough numbers — \"improved performance\" is weaker than \"improved performance by 30%\"", "Add at least one number per role: percentages, amounts, headcount, time"],
      bullets: ["Bullet formatting", "Too few bullets — long paragraphs hurt both ATS parsing and human scanning", "Replace paragraphs with bullets (-, •), one achievement per line"],
      tables: ["Tables & special formatting", "Table pipes (|) detected — some ATS parsers scramble column order", "Convert tables to plain bullets; save tables for your portfolio"],
      jd: ["JD keyword coverage", null, null],
      jdLow: (cov, miss) => [`JD keyword coverage only ${cov}%`, `JD keywords missing from your resume: ${miss}`, "Add the experiences you actually have that match — never stuff keywords you can't back up"],
      jdMid: (cov, miss) => [`JD keyword coverage ${cov}%`, `Keywords you could strengthen: ${miss}`, "Check if any relevant experience is missing from your resume"],
      jdOk: cov => [`JD keyword coverage ${cov}%`, "Good coverage", "Keep it up"],
      noJd: ["JD keyword coverage", "No job description provided — keyword comparison skipped", "Paste the JD to unlock keyword coverage analysis"],
      pass: "pass",
      title: "ATS Format Check Report",
      scoreLine: s => `## ATS Check Score: ${s} / 100`,
      note: "Note: ATS systems reject resumes mostly for **missing qualifications and keywords**, not formatting. A perfect format score doesn't guarantee passing — content match is what decides (use \"📊 Analyze Match\" for a deep dive).",
      missing: "Missing keywords",
    },
  };

  function computeAtsReport(resume, jd, lang) {
    const L = STR[lang === "en" ? "en" : "zh"];
    const checks = [];
    const add = (ok, severity, item) => {
      checks.push({ ok, severity, title: item[0], detail: item[1], fix: item[2] });
      if (!ok) deductions += severity;
    };
    let deductions = 0;

    const email = /[\w.+-]+@[\w-]+\.[\w.]+/.test(resume);
    const phone = /(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/.test(resume);
    add(email || phone, 15, L.contact);

    const sectionHits = [
      /學歷|教育|Education|學校/.test(resume),
      /經歷|工作經驗|Experience|Employment|職務/.test(resume),
      /技能|Skills|專長|技術/.test(resume),
    ].filter(Boolean).length;
    add(sectionHits >= 2, 10, L.sections);

    const denseLen = resume.replace(/\s/g, "").length;
    if (denseLen < 300) {
      add(false, 10, L.shortLen(denseLen));
    } else if (denseLen > 4000) {
      add(false, 10, L.longLen(denseLen));
    } else {
      checks.push({ ok: true, severity: 0, title: L.length[0], detail: `${denseLen}`, fix: null });
    }

    const nums = (resume.match(/\d[\d,.]*/g) || []).filter((n) => {
      const v = parseFloat(n.replace(/,/g, ""));
      return v >= 10;
    });
    add(nums.length >= 3, 10, L.quantified);

    const bullets = (resume.match(/(^|\n)\s*[-•●·‧*+]\s+/g) || []).length;
    add(bullets >= 5, 5, L.bullets);

    const pipes = (resume.match(/\|/g) || []).length;
    add(pipes < 5, 10, L.tables);

    let jdCoverage = null;
    let missingKeywords = [];
    if (jd && jd.trim()) {
      const freq = lang === "en" ? enTokens(jd) : zhTokens(jd);
      const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);
      const resumeHay = lang === "en" ? resume.toLowerCase() : resume;
      let matched = 0;
      let total = 0;
      for (const [tok, f] of top) {
        total += f;
        const hit = lang === "en" ? new RegExp(`\\b${tok.replace(/[.+#]/g, "\\$&")}\\b`).test(resumeHay) : resumeHay.includes(tok);
        if (hit) matched += f;
        else missingKeywords.push(tok);
      }
      jdCoverage = total ? Math.round((matched / total) * 100) : 100;
      missingKeywords = missingKeywords.slice(0, 12);
      if (jdCoverage < 20) {
        add(false, 15, L.jdLow(jdCoverage, missingKeywords.join("、")));
      } else if (jdCoverage < 40) {
        add(false, 8, L.jdMid(jdCoverage, missingKeywords.join("、")));
      } else {
        const okItem = L.jdOk(jdCoverage);
        checks.push({ ok: true, severity: 0, title: okItem[0], detail: okItem[1], fix: null });
      }
    } else {
      checks.push({ ok: true, severity: 0, title: L.noJd[0], detail: L.noJd[1], fix: null });
    }

    const score = Math.max(0, Math.min(100, 100 - deductions));
    return { score, checks, jdCoverage, missingKeywords };
  }

  return { computeAtsReport };
});
