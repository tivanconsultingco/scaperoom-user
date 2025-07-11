// ---------- helpers ----------
const $ = (id) => document.getElementById(id);
const loadCodes = () => JSON.parse(localStorage.getItem("escape_codes") || "[]");
const stageCount = parseInt(localStorage.getItem("escape_stage_count") || "0");
const pad2 = (n) => (n < 10 ? "0" + n : n);

// ---------- global state ----------
let team = "";
let currentStage = 0;
let triesLeft = 3;
let codes = loadCodes();                  // array of codes
let errors = Array(stageCount).fill(0);   // wrong attempts per stage
let times  = Array(stageCount).fill(null);// timestamp (ms) per stage
let t0 = 0;                               // overall start time

// ---------- DOM refs ----------
const screenStart = $("screenStart");
const screenStage = $("screenStage");
const screenEnd   = $("screenEnd");
const stageTitle  = $("stageTitle");
const triesInfo   = $("triesInfo");
const guessInput  = $("guessInput");
const btnSkip     = $("btnSkip");
const resultBox   = $("resultBox");

// ---------- navigation ----------
function showStart() {
  screenStart.classList.remove("hidden");
  screenStage.classList.add("hidden");
  screenEnd.classList.add("hidden");
}
function showStage() {
  screenStart.classList.add("hidden");
  screenStage.classList.remove("hidden");
  screenEnd.classList.add("hidden");
}
function showEnd() {
  screenStart.classList.add("hidden");
  screenStage.classList.add("hidden");
  screenEnd.classList.remove("hidden");
}

// ---------- game logic ----------
function loadStage() {
  if (currentStage >= stageCount) { finishGame(); return; }
  stageTitle.textContent = `مرحله ${currentStage + 1}`;
  triesLeft = 3;
  updateTriesInfo();
  guessInput.value = "";
  guessInput.focus();
  btnSkip.classList.add("hidden");
}

function updateTriesInfo() {
  triesInfo.textContent = `تعداد تلاش باقی‌مانده: ${triesLeft}`;
  if (triesLeft === 0) btnSkip.classList.remove("hidden");
}

// on guess
$("btnGuess").addEventListener("click", () => {
  const guess = guessInput.value.trim();
  if (!/^\d{5}$/.test(guess)) { alert("رمز باید ۵ رقم باشد"); return; }

  const correct = codes[currentStage];
  if (guess === correct) {
    const t = Date.now();
    times[currentStage] = t;
    currentStage++;
    loadStage();
  } else {
    triesLeft--;
    errors[currentStage]++;
    updateTriesInfo();
    if (triesLeft === 0) {
      // burn stage
      currentStage++;
      loadStage();
    }
  }
});

// manual skip after 3 wrong attempts
btnSkip.addEventListener("click", () => {
  currentStage++;
  loadStage();
});

// ---------- finish ----------
function finishGame() {
  const tEnd = Date.now();
  const totalSecs = Math.floor((tEnd - t0) / 1000);
  let html = `<strong>تیم: ${team}</strong><br/>`;
  html += `<table><tbody>`;
  let totalErr = 0;
  errors.forEach((e, idx) => {
    const t = times[idx] ? new Date(times[idx]) : null;
    totalErr += e;
    html += `<tr><td>مرحله ${idx + 1}</td><td>${e} خطا</td><td>${
      t ? pad2(t.getMinutes()) + ":" + pad2(t.getSeconds()) : "—"
    }</td></tr>`;
  });
  html += `</tbody></table>`;
  html += `<br/>مجموع خطاها: <strong>${totalErr}</strong><br/>`;
  html += `زمان کل بازی: <strong>${totalSecs} ثانیه</strong>`;
  resultBox.innerHTML = html;
  showEnd();
}

// ---------- start ----------
$("btnStart").addEventListener("click", () => {
  team = $("teamName").value.trim();
  if (!team) { alert("نام تیم را وارد کنید"); return; }
  if (stageCount === 0 || codes.length === 0) {
    alert("رمزها هنوز توسط ادمین تنظیم نشده‌اند!");
    return;
  }
  currentStage = 0;
  errors = Array(stageCount).fill(0);
  times  = Array(stageCount).fill(null);
  t0 = Date.now();
  showStage();
  loadStage();
});

// restart (keeps codes)
$("btnRestart").addEventListener("click", () => {
  showStart();
  $("teamName").value = "";
});