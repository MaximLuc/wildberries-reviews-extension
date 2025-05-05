// Это сработает сразу при загрузке контентного скрипта
console.log("✅ Контентный скрипт загружен на страницу:", window.location.href);

// Обработчик сообщений от background-скрипта
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

    console.log('📑 Подготовленные отзывы:', reviews);

    chrome.runtime.sendMessage({ action: 'PROCESS_REVIEWS', data: reviews });
  }
});
