console.log("✅ Контентный скрипт загружен на страницу:", window.location.href);

let currentUrl = window.location.href;

const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log("🔁 Обновлён URL, очистка storage");
    chrome.storage.local.remove("review_analysis_result");
  }
});

observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'REVIEWS_FROM_REQUEST') {
    console.log('📦 Отзывы из background script:', request.data);

    const reviews = request.data.feedbacks.map((feedback: any) => ({
      text: feedback.text,
      pros: feedback.pros,
      cons: feedback.cons,
      productValuation: feedback.productValuation,
      createdDate: feedback.createdDate,
    }));

    console.log('Подготовленные отзывы:', reviews);

    chrome.runtime.sendMessage({ action: 'PROCESS_REVIEWS', data: reviews });
  }
});
