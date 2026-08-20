const { detectLocale, scanRedFlags, scanBias } = require("./redflag.js");

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log("  ✓", name); }
  else { fail++; console.log("  ✗ FAIL:", name); }
}

console.log("【語言偵測】");
check("中文 JD → zh", detectLocale("【行政助理】負責文書處理與客戶聯繫，月領五萬") === "zh");
check("英文 JD → en", detectLocale("We are hiring a backend engineer with Python and Docker experience") === "en");

console.log("【台灣詐騙樣本（綜合）】");
const scamZh = `【高薪行政助理】免經驗可、學歷不拘，日領5000元高報酬！
工作內容：協助處理虛擬貨幣帳務、代收款項。
錄取後需先繳交保證金與身分證正本。
意者請加LINE ID: abc123 私聊`;
const r1 = scanRedFlags(scamZh, "auto");
check("自動判定地區 → tw", r1.region === "tw");
const ids1 = r1.signals.map((s) => s.id);
check("偵測到預付費（保證金）", ids1.includes("pay"));
check("偵測到帳戶代收", ids1.includes("bank"));
check("偵測到證件要求（身分證）", ids1.includes("docs"));
check("偵測到 LINE 導流", ids1.includes("offplatform"));
check("偵測到無經驗日領高薪組合", ids1.includes("toogood"));
check("偵測到行政包裝虛擬貨幣", ids1.includes("crypto"));
check("台灣套件含 165 連結", r1.links.some((l) => l.url.includes("165.npa.gov.tw")));
check("台灣套件含商工登記連結", r1.links.some((l) => l.url.includes("findbiz")));

console.log("【美國詐騙樣本（fake check + reshipping）】");
const scamEn = `Work from home! No experience needed, same-day pay $800/day.
You will receive a check to deposit, then send the remainder to our supplier.
Also reship packages received at your address. Add us on WhatsApp: +1234567`;
const r2 = scanRedFlags(scamEn, "auto");
check("自動判定地區 → us", r2.region === "us");
const ids2 = r2.signals.map((s) => s.id);
check("偵測到 deposit-check 詐騙", ids2.includes("bank"));
check("偵測到 reshipping", ids2.includes("reship"));
check("偵測到 WhatsApp 導流", ids2.includes("offplatform"));
check("偵測到 no-experience high-pay 組合", ids2.includes("toogood"));
check("美國套件含 FTC 連結", r2.links.some((l) => l.url.includes("consumer.ftc.gov")));
check("美國法源提 FTC", /FTC/i.test(r2.legal));

console.log("【乾淨樣本（正常職缺）】");
const cleanZh = `【後端工程師】某科技有限公司
工作內容：設計與開發電商後端服務（Python/Django），與前端團隊協作 API，參與 code review 與系統架構討論。
需求：3 年以上後端經驗、熟悉 PostgreSQL 與 Docker。
我們提供優於勞基法的休假制度與年度教育訓練補助。`;
const r3 = scanRedFlags(cleanZh, "auto");
check("正常職缺：0 個訊號", r3.signals.length === 0);
check("零訊號也有免責文字", /不代表沒有風險/.test(r3.disclaimer.zh));

console.log("【手動選地區與國際套件】");
const r4 = scanRedFlags(cleanZh, "us");
check("手動指定 us 生效", r4.region === "us");
const r5 = scanRedFlags("Hiring assistant, contact us via email.", "intl");
check("intl 套件可用", r5.region === "intl" && /Universal principles|通用原則/.test(r5.legal));

console.log("【偏見掃描】");
const biasResume = `王小明
照片：如附件
出生：民國 84 年 5 月
性別：男
婚姻狀況：未婚
身分證字號：A123456789
學歷：大學資工系`;
const b1 = scanBias(biasResume, "zh");
const keys = b1.found.map((f) => f.key);
check("偵測到照片欄位", keys.includes("photo"));
check("偵測到出生年", keys.includes("birth"));
check("偵測到性別", keys.includes("gender"));
check("偵測到婚姻", keys.includes("marital"));
check("偵測到身分證字號", keys.includes("idnum"));
const b2 = scanBias("John Doe\nEducation: BS CS\nExperience: 5 years software engineering", "en");
check("乾淨履歷：0 個提醒", b2.found.length === 0);

console.log(`\n結果：${pass} 通過，${fail} 失敗`);
process.exit(fail ? 1 : 0);
