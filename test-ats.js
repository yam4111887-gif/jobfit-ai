const { computeAtsReport } = require("./ats.js");

const resumeWeak = "王小明\n我做事認真，學東西很快，希望有機會加入貴公司。";

const resumeGood = [
  "王小明 email: ming@example.com 0912-345-678",
  "學歷：台灣大學資工系",
  "工作經歷：",
  "- 帶領 5 人團隊開發電商後端，年度營收成長 30%",
  "- 導入 CI/CD 將部署時間從 40 分鐘縮短到 8 分鐘",
  "- 重構資料庫查詢，API 回應速度提升 65%",
  "- 建立監控告警系統，故障平均修復時間降低 50%",
  "- 訓練 12 位新人，留存率 90%",
  "技能：Python、Django、PostgreSQL、Docker、AWS、Redis",
].join("\n");

const jd = [
  "【後端工程師】",
  "需求技能：Python、Django、PostgreSQL、Docker、AWS、Kubernetes、Redis、微服務",
  "加分條件：Kubernetes、gRPC、訊息佇列",
].join("\n");

const weak = computeAtsReport(resumeWeak, jd, "zh");
console.log("弱履歷分數:", weak.score, "(預期: 低分)");
console.log("  未通過項目:", weak.checks.filter((c) => !c.ok).map((c) => c.title).join(" / "));
console.log("  缺漏關鍵字(前5):", weak.missingKeywords.slice(0, 5).join("、"));

const good = computeAtsReport(resumeGood, jd, "zh");
console.log("優履歷分數:", good.score, "(預期: 高分)");
console.log("  未通過項目:", good.checks.filter((c) => !c.ok).map((c) => c.title).join(" / ") || "無");
console.log("  JD覆蓋率:", good.jdCoverage + "%", "| 缺漏:", good.missingKeywords.join("、"));

const en = computeAtsReport(
  "John Doe john@mail.com\nEducation: BS CS\nExperience:\n- Led team of 5 engineers\n- Improved latency by 40%\n- Shipped 12 features\n- Reduced costs 25%\n- Mentored 8 interns\nSkills: Python, Docker, PostgreSQL",
  "Backend engineer: Python, Docker, PostgreSQL, Kubernetes, Redis",
  "en"
);
console.log("EN版分數:", en.score, "| 覆蓋率:", en.jdCoverage + "%", "| 缺漏:", en.missingKeywords.join(", "));
