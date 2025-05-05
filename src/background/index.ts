let lastProcessedUrl: string | null = null;

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url === lastProcessedUrl) {
      console.log("Этот запрос уже обработан:", details.url);
      return;
    }

    console.log("Перехвачен новый запрос:", details.url);
    lastProcessedUrl = details.url;

    fetch(details.url)
      .then(response => response.json())
      .then(data => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];

          if (!activeTab?.id || !activeTab.url) {
            console.warn("Активная вкладка не найдена или URL недоступен.");
            return;
          }

          const isProductPage = /wildberries\.ru\/catalog\/\d+\/detail\.aspx/.test(activeTab.url);

          if (!isProductPage) {
            console.warn("Пропущено: не страница товара Wildberries:", activeTab.url);
            return;
          }

          chrome.tabs.sendMessage(
            activeTab.id,
            { action: 'REVIEWS_FROM_REQUEST', data },
            (response) => {
              if (chrome.runtime.lastError) {
                console.warn("Контентный скрипт не доступен:", chrome.runtime.lastError.message);
              } else {
                console.log("Ответ от контентного скрипта:", response);
              }
            }
          );
        });
      })
      .catch(err => console.error("Ошибка получения отзывов:", err));
  },
  { urls: ["https://*.wb.ru/feedbacks/*"] }
);

chrome.tabs.onUpdated.addListener(() => {
  lastProcessedUrl = null;
});

chrome.tabs.onActivated.addListener(() => {
  lastProcessedUrl = null;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'PROCESS_REVIEWS') {
      console.log("Получены отзывы для анализа:", request.data);
  
      // здесь будет отправка на Python-сервер
    }
  });