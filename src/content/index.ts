console.log("Контентный скрипт загружен на страницу:", window.location.href);

let currentUrl = window.location.href;

const containerId = "wb-feedback-analyzer";

window.addEventListener("reviews-from-request", (e: any) => {
  const data = e.detail;

  const reviews = data.feedbacks.map((feedback: any) => ({
    text: feedback.text,
    pros: feedback.pros,
    cons: feedback.cons,
    productValuation: feedback.productValuation,
    createdDate: feedback.createdDate,
  }));
  console.log('fot server data')
  const stars = [0, 0, 0, 0, 0];
  for (const review of reviews) {
    const val = Math.round(review.productValuation);
    if (val >= 1 && val <= 5) stars[val - 1]++;
  }

  chrome.storage.local.set({ stars_distribution: stars });
  chrome.runtime.sendMessage({ action: 'PROCESS_REVIEWS', data: reviews });
});

window.addEventListener("render-analysis", (e: any) => {
  const result = e.detail;

  console.log("Результаты анализа через событие:", result);

  chrome.storage.local.set({ review_analysis_result: result }, () => {
    fillDataFromStorage();
  });
});

function getTemplateHtml(): string {
  return `
    <div id="${containerId}">

              <div class="wb-review-block">
                  <style>
                  @keyframes spinner {
                    to { transform: rotate(360deg); }
                  }
                  .loading-spinner {
                    width: 24px;
                    height: 24px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spinner 0.6s linear infinite;
                    margin: 0 auto;
                  }
                  .blur {
                    filter: blur(4px);
                    pointer-events: none;
                  }
                  .wb-review-block {
                      margin: 20px auto;
                      padding: 24px;
                      background: linear-gradient(135deg, #7f00ff 0%, #e100ff 100%);
                      border-radius: 12px;
                      color: #fff;
                      font-family: Arial, sans-serif;
                  }
                  .wb-review-header {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      margin-bottom: 16px;
                  }
                  .wb-review-header h2 {
                      font-size: 1.6em;
                      margin: 0;
                  }
                  .wb-rating-badge {
                      background: #fff;
                      color: #7f00ff;
                      font-size: 1.2em;
                      font-weight: bold;
                      padding: 10px 16px;
                      border-radius: 50%;
                      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                  }
                  .wb-review-content {
                      display: flex;
                      flex-direction: column;
                      gap: 20px;
                  }
                  .wb-top {
                      display: flex;
                      flex-wrap: wrap;
                      gap: 20px;
                  }
                  .wb-chart, .wb-summary {
                      background: rgba(255,255,255,0.15);
                      padding: 16px;
                      border-radius: 8px;
                      flex: 1 1 280px;
                      min-width: 260px;
                  }
                  .wb-chart h3, .wb-summary h3 {
                      margin-top: 0;
                      font-size: 1.1em;
                      margin-bottom: 12px;
                      border-bottom: 1px solid rgba(255,255,255,0.4);
                      padding-bottom: 6px;
                  }
                  .chart-header {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 24px;
                      margin-bottom: 12px;
                  }
                  .donut-chart {
                      text-align: center;
                  }
                  .donut-chart svg {
                      display: block;
                      margin: 0 auto;
                  }
                  .time-lines {
                      display: flex;
                      flex-direction: column;
                      gap: 12px;
                  }
                  .time-lines .period {
                      text-align: center;
                      font-size: 0.9em;
                      color: #fff;
                  }
                  .time-lines .bars {
                      display: flex;
                      flex-direction: column;
                      justify-content: flex-end;
                      align-items: center;
                      height: 60px;
                      gap: 4px;
                  }
                  .time-lines .bar {
                      width: 12px;
                      border-radius: 3px;
                  }
                  .time-lines .bar.pos { background-color: #00e676; height: 60%; }
                  .time-lines .bar.neu { background-color: #ffd600; height: 20%; }
                  .time-lines .bar.neg { background-color: #ff1744; height: 20%; }
                  .distribution-bars {
                      list-style: none;
                      padding: 0;
                      margin: 0;
                      text-align: left;
                  }
                  .distribution-bars li {
                      display: flex;
                      align-items: center;
                      font-size: 0.9em;
                      margin: 6px 0;
                  }
                  .distribution-bars .label { flex: 0 0 80px; }
                  .distribution-bars .bar {
                      flex: 1;
                      height: 8px;
                      border-radius: 4px;
                      margin: 0 8px;
                      background: rgba(255,255,255,0.4);
                      position: relative;
                  }
                  .distribution-bars .bar.pos { background-color: #00e676; }
                  .distribution-bars .bar.neu { background-color: #ffd600; }
                  .distribution-bars .bar.neg { background-color: #ff1744; }
                  .distribution-bars .percent { flex: 0 0 30px; text-align: right; }
                  .wb-summary p {
                      font-style: italic;
                      line-height: 1.4;
                      font-size: 0.95em;
                  }
                  .wb-bottom {
                      display: flex;
                      flex-wrap: wrap;
                      gap: 20px;
                      margin-top: 20px;
                  }
                  .wb-stars, .wb-aspects {
                      background: rgba(255,255,255,0.15);
                      padding: 16px;
                      border-radius: 8px;
                      flex: 1 1 400px;
                      min-width: 280px;
                  }
                  .wb-stars h3, .wb-aspects h3 {
                      margin-top: 0;
                      font-size: 1.05em;
                      margin-bottom: 10px;
                      border-bottom: 1px solid rgba(255,255,255,0.4);
                      padding-bottom: 6px;
                  }
                  .wb-aspects p {
                      font-style: italic;
                      line-height: 1.4;
                      font-size: 0.95em;
                      margin: 6px 0;
                  }
                  .star-row {
                      display: flex;
                      align-items: center;
                      margin: 4px 0;
                      font-size: 0.9em;
                  }
                  .star-row span:first-child { flex: 0 0 20px; }
                  .star-row .bar {
                      flex: 1;
                      height: 4px;
                      margin: 0 6px;
                      background: rgba(255,255,255,0.4);
                      border-radius: 2px;
                      position: relative;
                  }
                  .star-row .bar::after {
                      content: '';
                      position: absolute;
                      width: var(--filled, 0%);
                      top: 0;
                      left: 0;
                      height: 100%;
                      background: #fff;
                      border-radius: 2px;
                  }
                  .star-5 .bar::after,
                  .star-4 .bar::after,
                  .star-3 .bar::after,
                  .star-2 .bar::after,
                  .star-1 .bar::after {
                    width: var(--filled, 0%);
                  }

                  .star-row span:last-child { flex: 0 0 25px; text-align: right; }
                  </style>
              
                  <div class="wb-review-header blur">
                  <h2>Аналитика по данным товара</h2>
                  <div class="wb-rating-badge">4.5</div>
                  </div>
              
                  <div class="wb-review-content">
                  <div class="wb-top">
                      <div class="wb-chart">
                      <h3>Общая статистика</h3>
                      <div class="loading-spinner"></div>
                      <div class="chart-header blur">
                          <div class="donut-chart">
                          <svg width="140" height="140" viewBox="0 0 42 42">
                              <circle cx="21" cy="21" r="15.915" fill="#fff"></circle>
                              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#00e676" stroke-width="5" stroke-dasharray="60 40" stroke-dashoffset="0" transform="rotate(-90 21 21)"></circle>
                              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ffd600" stroke-width="5" stroke-dasharray="20 80" stroke-dashoffset="-60" transform="rotate(-90 21 21)"></circle>
                              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ff1744" stroke-width="5" stroke-dasharray="20 80" stroke-dashoffset="-80" transform="rotate(-90 21 21)"></circle>
                              <text x="21" y="21" dy="0.35em" text-anchor="middle" font-size="3" fill="#7f00ff">За все время</text>
                          </svg>
                          </div>
                          <div class="time-lines">
                          <div class="period">
                              <div class="bars">
                              <div class="bar pos"></div>
                              <div class="bar neu"></div>
                              <div class="bar neg"></div>
                              </div>
                              Неделя
                          </div>
                          <div class="period">
                              <div class="bars">
                              <div class="bar pos"></div>
                              <div class="bar neu"></div>
                              <div class="bar neg"></div>
                              </div>
                              Месяц
                          </div>
                          </div>
                      </div>
                      <ul class="distribution-bars blur">
                          <li><span class="label">Положит.</span><span class="bar pos" style="width:60%"></span><span class="percent">60%</span></li>
                          <li><span class="label">Нейтрал.</span><span class="bar neu" style="width:20%"></span><span class="percent">20%</span></li>
                          <li><span class="label">Отрицат.</span><span class="bar neg" style="width:20%"></span><span class="percent">20%</span></li>
                      </ul>
                      </div>
                      <div class="wb-summary blur">
                      <h3>Итоговый отзыв</h3>
                      <p>Мне в целом понравилось, как быстро доставили заказ — это точно огромный плюс. Удобство использования тоже на высоте, очень просто и понятно. Цены вполне приемлемые, особенно за такую качественную услугу. Но есть и минусы: некоторые товары не совсем соответствуют описанию, что немного расстроило, и цена иногда кажется немного завышенной.</p>
                      </div>
                  </div>
              
                  <div class="wb-bottom">
                      <div class="wb-stars blur">
                      <h3>Звёзды</h3>
                      <div class="star-row star-5"><span>5★</span><div class="bar"></div><span>50%</span></div>
                      <div class="star-row star-4"><span>4★</span><div class="bar"></div><span>25%</span></div>
                      <div class="star-row star-3"><span>3★</span><div class="bar"></div><span>15%</span></div>
                      <div class="star-row star-2"><span>2★</span><div class="bar"></div><span>5%</span></div>
                      <div class="star-row star-1"><span>1★</span><div class="bar"></div><span>5%</span></div>
                      </div>
                      <div class="wb-aspects blur">
                        <h3>Основные аспекты</h3>
                        <div class="loading-spinner"></div>
                        <p>21% покупателей отмечают, что у товара «Хорошая доставка»</p>
                        <p>10% покупателей отмечают, что у товара «Приемлемая цена»</p>
                      </div>
                  </div>
                  </div>
              </div>
    </div>
  `;
}

function fillAnalysisData(data: any): void {
  console.log("Заполняем шаблон данными:", data);
  const { summary, insights, sentiment_distribution } = data;

  const summaryEl = document.querySelector(".wb-summary p");
  if (summaryEl) summaryEl.textContent = summary;

  const aspectsEl = document.querySelector(".wb-aspects");
  if (aspectsEl) {
    aspectsEl.innerHTML = "<h3>Основные аспекты</h3>" + insights.map((i: string) => `<p>${i}</p>`).join("");
  }

  const total = (Object.values(sentiment_distribution.all) as number[]).reduce((a, b) => a + b, 0);
  const p = sentiment_distribution.all;
  const posPct = (p["позитив"] / total) * 100;
  const neuPct = (p["нейтральный"] / total) * 100;
  const negPct = (p["негатив"] / total) * 100;

  const circles = document.querySelectorAll("svg circle");
  if (circles.length >= 4) {
    circles[1].setAttribute("stroke-dasharray", `${posPct} ${100 - posPct}`);
    circles[1].setAttribute("stroke-dashoffset", "0");

    circles[2].setAttribute("stroke-dasharray", `${neuPct} ${100 - neuPct}`);
    circles[2].setAttribute("stroke-dashoffset", `-${posPct}`);

    circles[3].setAttribute("stroke-dasharray", `${negPct} ${100 - negPct}`);
    circles[3].setAttribute("stroke-dashoffset", `-${posPct + neuPct}`);
  }

  function setBars(prefix: "week" | "month", selector: string) {
    const bars = document.querySelectorAll(`${selector} .bar`);
    const sentiments = sentiment_distribution[prefix];
    const sum = (Object.values(sentiments) as number[]).reduce((a, b) => a + b, 0);

    const heights = {
      pos: (sentiments["позитив"] / sum) * 100,
      neu: (sentiments["нейтральный"] / sum) * 100,
      neg: (sentiments["негатив"] / sum) * 100,
    };

    bars.forEach((bar) => {
      if (bar.classList.contains("pos")) bar.setAttribute("style", `height: ${heights.pos}%`);
      if (bar.classList.contains("neu")) bar.setAttribute("style", `height: ${heights.neu}%`);
      if (bar.classList.contains("neg")) bar.setAttribute("style", `height: ${heights.neg}%`);
    });
  }

  setBars("week", ".time-lines .period:nth-child(1)");
  setBars("month", ".time-lines .period:nth-child(2)");


  const distrBars = document.querySelectorAll(".distribution-bars li");
  const keys: ("позитив" | "нейтральный" | "негатив")[] = ["позитив", "нейтральный", "негатив"];

  keys.forEach((k, i) => {
    const count = sentiment_distribution.all[k];
    const percent = Math.round((count / total) * 100);
    distrBars[i].querySelector(".bar")?.setAttribute("style", `width: ${percent}%`);
    const percentEl = distrBars[i].querySelector(".percent");
    if (percentEl) percentEl.textContent = `${percent}%`;
  });

  document.querySelectorAll(".loading-spinner").forEach(spinner => spinner.remove());
  document.querySelectorAll(".blur").forEach(el => el.classList.remove("blur"));

  chrome.storage.local.get("stars_distribution", (result) => {
    const stars = result.stars_distribution as number[] | undefined;

    if (!stars || stars.length !== 5) {
      console.warn("Нет данных по звёздам или некорректная структура.");
      return;
    }

    const totalStars = stars.reduce((a, b) => a + b, 0);
    if (totalStars === 0) return;

    const ratingBadge = document.querySelector(".wb-rating-badge");
    if (ratingBadge) {
      const weightedSum = stars.reduce((sum, count, i) => sum + count * (i + 1), 0);
      const averageRating = (weightedSum / totalStars).toFixed(1);
      ratingBadge.textContent = averageRating;
    }

    stars.forEach((count, index) => {
      const percent = Math.round((count / totalStars) * 100);
      const row = document.querySelector(`.star-${index+1}`); 
      if (!row) return;

      const bar = row.querySelector(".bar") as HTMLElement;
      const label = row.querySelector("span:last-child") as HTMLElement;

      if (bar) bar.style.setProperty("--filled", `${percent}%`);
      if (label) label.textContent = `${percent}%`;
    });
  });
}



function insertLoader() {
  const target = document.querySelector(".product-page__user-activity");
  if (!target) {
    console.warn("Не найден целевой элемент для вставки блока");
    return;
  }

  const existing = document.getElementById(containerId);
  if (existing) existing.remove();

  const loader = document.createElement("div");
  loader.innerHTML = getTemplateHtml();

  target.prepend(loader);
}


function fillDataFromStorage() {
  chrome.storage.local.get("review_analysis_result", (result) => {
    const data = result.review_analysis_result;

    if (!data) {
      console.warn("Данных для отображения нет!");
      return;
    }

    console.log("Данные загружены:", data);

    fillAnalysisData(data);

    chrome.storage.local.remove("review_analysis_result", () => {
      console.log("Хранилище очищено после отрисовки");
    });
  });
}


const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log("URL изменён, блок перезагружен");

    chrome.storage.local.remove("review_analysis_result");

    const existing = document.getElementById(containerId);
    if (existing) existing.remove();

    insertLoader();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'RENDER_ANALYSIS') {
    console.log("Результаты анализа:", request.data);

    chrome.storage.local.set({ review_analysis_result: request.data }, () => {
      fillDataFromStorage();
    });
  }
});


insertLoader();

let waited = 0;
const interval = setInterval(() => {
  const summaryEl = document.querySelector(".wb-summary p");

  if (summaryEl) {
    clearInterval(interval);
    console.log("Блок найден, заполняем данными");
    fillDataFromStorage();
  } else {
    waited += 50;
    if (waited >= 3000) {
      clearInterval(interval);
      console.warn("Блок анализа не появился в DOM в течение 3 секунд");
    }
  }
}, 50);
