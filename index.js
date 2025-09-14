const DB_NAME = 'countdown-db';
const DB_STORE = 'events';
let db;

async function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      if(!d.objectStoreNames.contains(DB_STORE)) d.createObjectStore(DB_STORE);
    };
    req.onsuccess = e => { db = e.target.result; resolve(); };
    req.onerror = e => reject(e);
  });
}

function saveEvents(events) {
  if(!db) return;
  const tx = db.transaction(DB_STORE, 'readwrite');
  tx.objectStore(DB_STORE).put(events, 'latest');
}

function loadEvents() {
  return new Promise(resolve => {
    if(!db) { resolve(null); return; }
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get('latest');
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => resolve(null);
  });
}

function diffDays(dateStr){
  const now = new Date();
  const jstNow = new Date(now.toLocaleString("en-US",{timeZone:"Asia/Tokyo"}));
  jstNow.setHours(0,0,0,0);
  const eventDate = new Date(dateStr+"T00:00:00+09:00");
  const diff = Math.floor((eventDate - jstNow)/(1000*60*60*24));
  return diff>=0 ? diff : 0;
}

function updateCountdown(events){
  if(!events) return;
  document.getElementById('kouritsu').textContent = diffDays(events.kouritsu);
  document.getElementById('kouritsuDate').textContent = events.kouritsu;
  document.getElementById('shiritsu').textContent = diffDays(events.shiritsu);
  document.getElementById('shiritsuDate').textContent = events.shiritsu;
  document.getElementById('kyoutsuu').textContent = diffDays(events.kyoutsuu);
  document.getElementById('kyoutsuuDate').textContent = events.kyoutsuu;
}

async function refreshEvents(){
  try{
    const url = '/countdown-site/events.json?t=' + Date.now();
    const res = await fetch(url, {cache:'no-store', credentials:'omit'});
    const events = await res.json();
    updateCountdown(events);
    saveEvents(events);
  }catch(e){
    const events = await loadEvents();
    updateCountdown(events);
  }
}

let deferredPrompt;
function initPWA(){
  const installBtn = document.getElementById('installBtn');
  installBtn.style.display = 'none';
  window.addEventListener('beforeinstallprompt', e=>{
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
  });
  installBtn.addEventListener('click', async ()=>{
    if(deferredPrompt){
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = 'none';
    }
  });
  const iosNotice = document.getElementById('iosNotice');
  if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
    iosNotice.style.display = 'block';
  }
}

(async()=>{
  await initDB();
  initPWA();
  await refreshEvents();
  setInterval(refreshEvents, 30*1000);
})();

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js')
    .then(()=>console.log("SW登録成功"))
    .catch(console.error);
}
