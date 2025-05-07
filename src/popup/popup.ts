window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data.action) return;
  
  if (event.data.action === 'render_popup_analysis') {
    renderPopupAnalysis(event.data.data);
  }
});

function renderPopupAnalysis(data: any) {
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
    (circles[1] as SVGCircleElement).setAttribute("stroke-dasharray", `${posPct} ${100 - posPct}`);
    (circles[2] as SVGCircleElement).setAttribute("stroke-dasharray", `${neuPct} ${100 - neuPct}`);
    (circles[3] as SVGCircleElement).setAttribute("stroke-dasharray", `${negPct} ${100 - negPct}`);
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
}
