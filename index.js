// =======================
// IndexedDB 初期化
// =======================
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CountdownDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("events")) {
        db.createObjectStore("events", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveEventsToDB(events) {
  const db = await initDB();
  const tx = db.transaction("events", "readwrite");
  const store = tx.objectStore("events");
  events.forEach((ev, idx) => {
    store.put({ id: idx, ...ev });
  });
  return tx.complete;
}

async function loadEventsFromDB() {
  const db = await initDB();
  const tx = db.transaction("events", "readonly");
  const store = tx.objectStore("events");
  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve([]);
  });
}

// =======================
// カウントダウン表示
// =======================
function updateCountdown(events) {
  if (!events || events.length === 0) return;

  const now = new Date();
  const container = document.getElementById("countdown");
  container.innerHTML = "";

  events.forEach((ev) => {
    const eventDate = new Date(ev.date);
    const diff = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

    const div = document.createElement("div");
    div.textContent = `${ev.title} : ${diff >= 0 ? diff : 0} 日`;
    container.appendChild(div);
  });
}

// =======================
// データ取得（ネット or IndexedDB）
// =======================
async function refreshEvents(force = false) {
  try {
    // キャッシュを避けるためにキャッシュバスター付与
    const url = "events.json?t=" + Date.now();
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("ネットワークエラー");
    const events = await response.json();
    updateCountdown(events);
    saveEventsToDB(events);
  } catch (err) {
    console.warn("ネット取得失敗 → IndexedDBから取得", err);
    const events = await loadEventsFromDB();
    updateCountdown(events);
  }
}

// =======================
// 初期ロード
// =======================
(async function () {
  // まず IndexedDB のデータを表示
  const cachedEvents = await loadEventsFromDB();
  if (cachedEvents.length > 0) updateCountdown(cachedEvents);

  // すぐに最新データ取得
  await refreshEvents(true);

  // 30秒ごとに更新
  setInterval(refreshEvents, 30 * 1000);

  // アプリ復帰時に更新
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refreshEvents(true);
    }
  });
})();
