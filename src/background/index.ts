let lastProcessedUrl: string | null = null;
let lastFetchedData: any = null;

let injectedTabs = new Set<number>();

chrome.webNavigation.onHistoryStateUpdated.addListener(({ tabId, url }) => {
  if (url && /wildberries\.ru\/catalog\/\d+\/detail\.aspx/.test(url)) {
    if (injectedTabs.has(tabId)) return; 

    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.bundle.js"]
    }).then(() => {
      injectedTabs.add(tabId);
      console.log("content.bundle.js вставлен через history update:", url);
    }).catch((err) => {
      console.warn("Ошибка при вставке скрипта:", err);
    });
  }
}, {
  url: [{ hostContains: "wildberries.ru" }]
});

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
        lastFetchedData = data;

        chrome.tabs.query({ url: "*://www.wildberries.ru/catalog/*/detail.aspx*" }, (tabs) => {
          tabs.forEach((tab) => {
            if (!tab.id) return;

            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (data) => {
                window.dispatchEvent(new CustomEvent("reviews-from-request", { detail: data }));
              },
              args: [data]
            });
          });
        });
      })
      .catch(err => console.error("Ошибка получения отзывов:", err));
  },
  { urls: ["https://*.wb.ru/feedbacks/*"] }
);


chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && !/detail\.aspx/.test(changeInfo.url)) {
    injectedTabs.delete(tabId); 
    lastProcessedUrl = null;
  }
});
chrome.tabs.onActivated.addListener(() => {
  lastProcessedUrl = null;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'PROCESS_REVIEWS') {
    console.log("Отправляем отзывы на сервер:", request.data);

    fetch("http://localhost:8005/analyze/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.data),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Ответ от сервера:", result);

        chrome.storage.local.set({ review_analysis_result: result }, () => {
          console.log("Результаты сохранены в storage");

          chrome.tabs.query({ url: "*://www.wildberries.ru/catalog/*/detail.aspx*" }, (tabs) => {
            tabs.forEach((tab) => {
              if (!tab.id) return;

              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (data) => {
                  window.dispatchEvent(new CustomEvent("render-analysis", { detail: data }));
                },
                args: [result]
              });
            });
          });
        });
      })
      .catch((err) => {
        console.error("Ошибка при отправке на сервер:", err);
      });

    return true;
  }
});
