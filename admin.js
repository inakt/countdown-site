const PASSWORD_HASH = "4bb4b6cbb0528674d2d0969cdb4660e862043a28d818d00ec16c265cfec2a371";


async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2,'0')).join('');
}

const WORKER_URL = "https://ghadmintoken.inakt.workers.dev/"; // Cloudflare Worker URL

// ログイン処理
document.getElementById('loginBtn').addEventListener('click', async ()=>{
  const pw = document.getElementById('password').value;
  const hash = await sha256(pw);
  if(hash === PASSWORD_HASH){
    document.getElementById('login').style.display='none';
    document.getElementById('editor').style.display='block';
    loadData();
  } else {
    alert('パスワードが違います');
  }
});

// data.json 読み込み
async function loadData(){
  const res = await fetch('data.json?time='+Date.now(), { cache:"no-store" });
  const data = await res.json();
  document.getElementById('kouritsu').value = data.events.kouritsu.date;
  document.getElementById('shiritsu').value = data.events.shiritsu.date;
  document.getElementById('kyoutsuu').value = data.events.kyoutsuu.date;
}

// フォーム送信 → Cloudflare Worker 経由で GitHub repository_dispatch
document.getElementById('dateForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const newData = {
    events:{
      kouritsu:{title:"埼玉県公立高校入試", date: document.getElementById('kouritsu').value},
      shiritsu:{title:"埼玉県私立高校入試", date: document.getElementById('shiritsu').value},
      kyoutsuu:{title:"大学入学共通テスト", date: document.getElementById('kyoutsuu').value}
    }
  };

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData)
    });
    alert(res.ok ? "保存成功" : "保存失敗");
  } catch(err) {
    console.error(err);
    alert("保存失敗");
  }
});


