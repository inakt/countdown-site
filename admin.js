<!-- 管理者ログインカード内に配置 -->
<div class="login-card">
  <h2>管理者ログイン</h2>
  <input type="password" id="password" placeholder="パスワード">
  <button id="loginBtn">ログイン</button>

  <div id="editor" style="display:none;">
    <h3>日付編集</h3>
    <label>埼玉県公立高校入試</label>
    <input type="date" id="kouritsu">
    <label>埼玉県私立高校入試</label>
    <input type="date" id="shiritsu">
    <label>大学入学共通テスト</label>
    <input type="date" id="kyoutsuu">
    <button id="saveBtn">保存</button>
  </div>
</div>

<script>
const PASSWORD_HASH = "4bb4b6cbb0528674d2d0969cdb4660e862043a28d818d00ec16c265cfec2a371";
const WORKER_URL = "https://ghadmintoken.inakt.workers.dev/"; // あなたの Worker URL

// SHA256 ハッシュ関数
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ログイン
document.getElementById('loginBtn').addEventListener('click', async () => {
  const pw = document.getElementById('password').value;
  const hash = await sha256(pw);
  if(hash === PASSWORD_HASH){
    document.getElementById('password').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('editor').style.display = 'block';
    loadData();
  } else {
    alert('パスワードが違います');
  }
});

// 現在の data.json を取得してフォームに反映
async function loadData(){
  const res = await fetch(WORKER_URL, { cache: "no-store" });
  const data = await res.json();
  document.getElementById('kouritsu').value = data.events.kouritsu.date;
  document.getElementById('shiritsu').value = data.events.shiritsu.date;
  document.getElementById('kyoutsuu').value = data.events.kyoutsuu.date;
}

// 保存ボタン
document.getElementById('saveBtn').addEventListener('click', async () => {
  const newData = {
    events: {
      kouritsu: { title:"埼玉県公立高校入試", date: document.getElementById('kouritsu').value },
      shiritsu: { title:"埼玉県私立高校入試", date: document.getElementById('shiritsu').value },
      kyoutsuu: { title:"大学入学共通テスト", date: document.getElementById('kyoutsuu').value }
    }
  };

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    });
    const result = await res.json();
    if(result.ok){
      alert("保存成功");
    } else {
      console.error(result.error);
      alert("保存失敗");
    }
  } catch(e){
    console.error(e);
    alert("保存失敗");
  }
});
</script>







