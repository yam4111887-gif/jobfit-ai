/* 職缺防詐檢查＋履歷個資偏見掃描 — 純本機運算，不需要 API。
   設計鐵律：只陳述文字中出現的風險「訊號」，絕不輸出「詐騙判定」、
   不引用任何公司名單；查證權留給使用者與官方管道。
   同時支援瀏覽器（window.RedFlagChecker）與 Node（module.exports）。 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.RedFlagChecker = factory();
  }
})(typeof self !== "undefined" ? self : globalThis, function () {
  "use strict";

  function detectLocale(text) {
    const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const letters = (text.match(/[A-Za-z]/g) || []).length;
    if (cjk > letters) return "zh";
    if (letters > cjk) return "en";
    return cjk > 5 ? "zh" : "en";
  }

  /* 通用規則：level 為 red（官方指引明文風險）/ yellow（組合警訊）/ info（提醒）。
     patterns 一律整份 JD 掃描（中英模式同時跑），與地區無關。 */
  const RULES = [
    {
      id: "pay",
      level: "red",
      zh: /治裝費|治装費|保證金|保证金|報名費|报名费|訓練費|训练费|材料費|材料费|服装費|服裝費|先繳|先缴|預繳|预缴|入職費|入职费|匯款至|匯到|繳交保證/,
      en: /pay\s+(for|a|the|your)\s+(training|equipment|kit|certification|fee|laptop|supplies)|application fee|processing fee|startup kit|refund the difference|reimburse .{0,20}(equipment|laptop)|wire (the )?(money|payment) to|send .{0,20}(bitcoin|usdt|crypto)/i,
      title: { zh: "要求預先付費或匯款", en: "Upfront payment or money transfer requested" },
      why: {
        zh: "合法雇主不會以任何名目要求求職者先付費（訓練費、設備費、保證金等）。獲得收入之前被要求支出，是官方防詐指引列為最高風險的訊號。",
        en: "Legitimate employers never ask candidates to pay to work — for training, equipment, deposits, or 'certifications'. Any pre-income expense is a top official warning sign.",
      },
    },
    {
      id: "bank",
      level: "red",
      zh: /存摺|存折|提款卡|金融卡|代收貨款|代收款|代付款|人頭帳戶|辦信用卡|辦卡|驗證金|刷流水/,
      en: /deposit (a|the|your) (check|cheque)|send (the )?(money|difference|remainder) (back|to)|use your (bank )?account (to|for)|(cash|deposit) .{0,15}check(s)? (and|then)|money mule|zelle|venmo .{0,20}(job|pay)/i,
      title: { zh: "要求使用你的金融帳戶或代收款項", en: "Use of your bank account / deposit-and-refund" },
      why: {
        zh: "要求提供存摺、提款卡、代收轉帳或「先收付款再轉出」，可能使你成為洗錢或詐騙的人頭帳戶，除財損外還有刑責風險。",
        en: "Asking you to move money through your account (or deposit a check and refund the difference) can make you part of money laundering — financial loss plus legal liability.",
      },
    },
    {
      id: "reship",
      level: "red",
      zh: /轉寄包裹|收件轉寄|代收包裹|在家理貨|物流代理|收貨員.{0,10}轉/,
      en: /reship|re-?packag(e|ing) .{0,25}(ship|send|forward)|receive .{0,20}(and|then) .{0,20}(re)?ship|forward (the )?packages?|package forwarding (job|work|position)|shipping label(s)? .{0,20}(job|provided)/i,
      title: { zh: "「收包裹再轉寄」型工作", en: "Reshipping / package-forwarding job" },
      why: {
        zh: "「在家收貨、重新包裝、轉寄」的工作幾乎都是讓你處理贓物或洗錢物流，轉寄人可能承擔刑責。",
        en: "Receive-repackage-forward 'jobs' almost always involve stolen goods or laundering logistics — the reshipper can face criminal liability.",
      },
    },
    {
      id: "docs",
      level: "red",
      zh: /身分證|身份证|健保卡|雙證件|双证件|證件正本|证件正本|戶籍謄本|户籍謄本|印章/,
      en: /social security (number|card)|\bssn\b|passport (copy|scan|photo)|driver'?s? licence? (copy|number|photo)|bank account (number|details|routing)|birth certificate/i,
      title: { zh: "錄取前要求繳交證件或銀行個資", en: "IDs / bank details requested pre-hire" },
      why: {
        zh: "正式錄取前不應繳交身分證、健保卡等證件正本或完整銀行帳號；這些是身分盜用與人頭帳戶的原料。",
        en: "Before a formal offer, no employer needs your SSN, passport copy, or bank details. These are raw material for identity theft and account fraud.",
      },
    },
    {
      id: "offplatform",
      level: "yellow",
      zh: /加\s*(line|賴|赖)|line\s*(id|帳號|账号)\s*[:：]?|微信\s*[:：]?\s*[a-z0-9_-]|wechat\s*[:：]|telegram\s*[:：]?\s*[@a-z0-9_]|電報群/i,
      en: /(whats ?app|telegram|signal)\s*[:(@]|text (me|us) (at|on) \+?[\d\s-]{6,}|dm (me|us) (on|at)|add (me|us) on (whats ?app|telegram)/i,
      title: { zh: "引導脫離平台改用私人通訊軟體", en: "Redirected off-platform to private messaging" },
      why: {
        zh: "把聯絡引導到 LINE/WhatsApp 等私人管道會脫離求職平台的留痕與審核機制，是常見的詐騙前置動作。離開平台之後的對話，就沒有任何保護了。",
        en: "Moving the conversation to WhatsApp/Telegram leaves the job platform's audit trail behind — a standard setup step for scams.",
      },
    },
    {
      id: "toogood",
      level: "yellow",
      zh: /((無經驗|免經驗|學歷不拘|無需學歷)[\s\S]{0,80}(日領|日薪|週領|月入\s?\d+\s?萬|高報酬|高薪))|((日領|日薪|月入\s?\d+\s?萬|高報酬)[\s\S]{0,80}(無經驗|免經驗|學歷不拘))/,
      en: /(no experience|entry[- ]level|no degree)[\s\S]{0,100}(daily pay|same[- ]day pay|earn \$?\s?\d[\d,]*\s?(per|\/|a) (day|week)|\$?\s?\d[\d,]*\s?\/\s?(day|week))|((daily pay|same[- ]day pay|earn \$?\s?\d[\d,]*)[\s\S]{0,100}(no experience|entry[- ]level))/i,
      title: { zh: "「無門檻＋日領高薪」組合", en: "'No experience + same-day high pay' combo" },
      why: {
        zh: "免經驗免學歷卻日領或月入異常高的職缺，符合官方警示的典型詐騙誘餌模式。不是必然詐騙，但值得提高警覺。",
        en: "No-barrier jobs with unusually high same-day/short-cycle pay fit the classic bait pattern. Not always a scam — but worth heightened caution.",
      },
    },
    {
      id: "crypto",
      level: "yellow",
      zh: /(虛擬貨幣|加密貨幣|usdt|比特幣|投資理財|炒幣)[\s\S]{0,80}(兼職|打工|行政助理|內勤|小幫手)|((兼職|打工|行政助理|內勤)[\s\S]{0,80}(虛擬貨幣|usdt|投資理財))/i,
      en: /(crypto|bitcoin|usdt|forex|trading)[\s\S]{0,100}(part[- ]time|assistant|data entry|admin|clerk)|((part[- ]time|assistant|data entry)[\s\S]{0,100}(crypto|bitcoin|usdt|forex))/i,
      title: { zh: "行政/兼職職缺內容涉及投資或虛擬貨幣", en: "Admin/part-time role involving crypto or trading" },
      why: {
        zh: "以行政、兼職包裝但實際內容是投資、炒幣的職缺，常是投資詐騙（殺豬仔）的招募入口。",
        en: "Roles dressed as admin or part-time work whose real content is trading/crypto are common entry points for pig-butchering investment scams.",
      },
    },
    {
      id: "vague",
      level: "info",
      zh: null,
      en: null,
      title: { zh: "職缺資訊過少", en: "Job description too thin" },
      why: {
        zh: "職缺描述太短，無法評估工作內容與公司資訊。資訊越少，越需要主動查證。",
        en: "The posting is too thin to assess the work or the company. The less information, the more you should verify.",
      },
    },
  ];

  const PACKS = {
    tw: {
      label: { zh: "台灣", en: "Taiwan" },
      legal: {
        zh: "依《就業服務法》與勞動部求職防詐宣導（三備七不原則）：雇主不得向求職者收取任何名目之費用、不得要求繳交證件正本、不得要求提供金融帳戶或代收轉帳。",
        en: "Under Taiwan's Employment Services Act and MOL anti-fraud guidance: employers may not charge job seekers any fee, demand original IDs, or request bank accounts / money transfers.",
      },
      links: [
        { label: "經濟部商工登記查詢（查公司是否真實登記）", url: "https://findbiz.nat.gov.tw" },
        { label: "165 全民防詐騙網（查可疑帳號與網站）", url: "https://165.npa.gov.tw" },
        { label: "勞動部 1955 勞工諮詢專線", url: "https://1955.mol.gov.tw" },
      ],
    },
    us: {
      label: { zh: "美國", en: "United States" },
      legal: {
        zh: "依美國聯邦貿易委員會（FTC）指引：合法雇主不會要求你付錢工作、不會要求你存入支票再退回差額、不會請你代收轉寄包裹。",
        en: "Per the U.S. Federal Trade Commission (FTC): legitimate employers never ask you to pay to work, deposit checks and refund the difference, or reship packages.",
      },
      links: [
        { label: "FTC — Job Scams official guidance", url: "https://consumer.ftc.gov/articles/job-scams" },
        { label: "ReportFraud.ftc.gov（通報詐騙）", url: "https://reportfraud.ftc.gov" },
        { label: "BBB Scam Tracker（查公司詐騙紀錄）", url: "https://www.bbb.org/scamtracker" },
      ],
    },
    intl: {
      label: { zh: "國際通用", en: "International" },
      legal: {
        zh: "通用原則：合法雇主不會要求你先付錢、不會在錄取前要你的證件或銀行帳號、不會請你代收款項或轉寄包裹。請向你所在國家的消費者保護或反詐機構查證。",
        en: "Universal principles: legitimate employers never charge you to work, ask for IDs or bank details pre-hire, or route money/packages through you. Verify with your country's consumer-protection or anti-fraud authority.",
      },
      links: [
        { label: "FTC Job Scams guidance（英語通用參考）", url: "https://consumer.ftc.gov/articles/job-scams" },
      ],
    },
  };

  function scanRedFlags(jd, region) {
    const lang = detectLocale(jd);
    let pack = region && region !== "auto" ? region : lang === "zh" ? "tw" : "us";
    if (!PACKS[pack]) pack = "intl";

    const signals = [];
    for (const r of RULES) {
      if (r.id === "vague") {
        if (jd.replace(/\s/g, "").length < 120) {
          signals.push({ id: r.id, level: r.level, title: r.title[lang], why: r.why[lang] });
        }
        continue;
      }
      const zhHit = r.zh && r.zh.test(jd);
      const enHit = r.en && r.en.test(jd);
      if (zhHit || enHit) {
        signals.push({ id: r.id, level: r.level, title: r.title[lang], why: r.why[lang] });
      }
    }

    return {
      region: pack,
      regionLabel: PACKS[pack].label[lang],
      legal: PACKS[pack].legal[lang],
      links: PACKS[pack].links,
      lang,
      signals,
      disclaimer: {
        zh: "本檢查僅列出職缺文字中出現的風險訊號，供參考之用，不構成對任何職缺或公司之詐騙認定；未發現訊號也不代表沒有風險（冒名職缺無法從文字辨識）。查證請依上方官方管道。",
        en: "This check lists only risk signals present in the posting text. It is informational, and is NOT a determination that any job or company is fraudulent. No signals does not mean no risk (cloned postings can't be detected from text). Verify via the official channels above.",
      },
    };
  }

  /* 履歷個資偏見掃描：建議性質，引用研究，尊重使用者決定 */
  function scanBias(resume, lang) {
    const L = lang === "en" ? "en" : "zh";
    const items = [
      { re: /照片\s*[:：]?|個人照|大頭照|photo\s*[:：]?\s*(attached|included)?/i, key: "photo" },
      { re: /出生\s*[:：]|生日\s*[:：]|民國\s?\d{2,3}\s?年|西元\s?\d{4}\s?年\s?\d{1,2}\s?月生|born\s*[:：]?\s*\d{4}|date of birth\s*[:：]|\bD\.?O\.?B\.?\b\s*[:：]?/i, key: "birth" },
      { re: /性別\s*[:：]\s*(男|女)|gender\s*[:：]\s*(male|female)/i, key: "gender" },
      { re: /婚姻\s*[:：]|已婚|未婚|marital status\s*[:：]|married|single\b/i, key: "marital" },
      { re: /身分證字號|身份證統一編號|\b[A-Z][12]\d{8}\b|national id number/i, key: "idnum" },
      { re: /宗教\s*[:：]|政黨\s*[:：]|religion\s*[:：]|political/i, key: "other" },
    ];
    const STR = {
      photo: { zh: "履歷含照片欄位", en: "Photo in resume" },
      birth: { zh: "履歷含出生年月日", en: "Full date of birth listed" },
      gender: { zh: "履歷標示性別", en: "Gender explicitly stated" },
      marital: { zh: "履歷標示婚姻狀況", en: "Marital status listed" },
      idnum: { zh: "履歷含身分證字號", en: "National ID number present" },
      other: { zh: "履歷含宗教或政黨資訊", en: "Religion or political info present" },
    };
    const found = [];
    for (const it of items) {
      if (it.re.test(resume)) found.push({ key: it.key, label: STR[it.key][L] });
    }
    return {
      found,
      note: {
        zh: "研究顯示，履歷中與職能無關的個人資訊（照片、年齡、性別、婚姻狀況）可能觸發招聘者或 AI 篩選系統的無意識偏誤（見 Derous 2017 年 610 位人資實驗；Stanford 2025 年 AI 履歷研究）。多數科技業與外商不需要這些欄位，可考慮移除；但部分產業與地區有放置照片的慣例——要不要保留由你決定。身分證字號則強烈建議永遠不要寫在履歷上。",
        en: "Research shows job-irrelevant personal details (photo, age, gender, marital status) can trigger unconscious bias in recruiters and AI screening (Derous 2017, 610-recruiter experiment; Stanford 2025 on AI resume bias). Most tech firms and multinationals don't need these fields — consider removing. Some industries/regions expect photos, though: your call. Never list your national ID number.",
      },
    };
  }

  return { detectLocale, scanRedFlags, scanBias, RULES, PACKS };
});
