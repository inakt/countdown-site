const PASSWORD_HASH = "4bb4b6cbb0528674d2d0969cdb4660e862043a28d818d00ec16c265cfec2a371";

const WORKER_URL = "https://ghadmintoken.inakt.workers.dev"; // デプロイしたWorkerのURL


// SHA-256 ハッシュ関数
async function sha256(str){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ログインボタン
document.getElementById('loginBtn').addEventListener('click', async ()=>{
  const pw = document.getElementById('password').value;
  const hash = await sha256(pw);

  if(hash !== PASSWORD_HASH){
    alert('パスワードが違います！');
    return;
  }

  // ログイン成功 → フォーム表示
  const editor = document.getElementById('editor');
  editor.innerHTML = `
    <div class="login-card">
      <h2>日付編集</h2>
      <form id="dateForm">
        <label>埼玉県公立高校入試: <input type="date" id="kouritsu"></label><br><br>
        <label>埼玉県私立高校入試: <input type="date" id="shiritsu"></label><br><br>
        <label>大学入学共通テスト: <input type="date" id="kyoutsuu"></label><br><br>
        <button type="submit">保存</button>
      </form>
    </div>
  `;

  // 初期データ読み込み
  loadData();

  // フォーム送信
  document.getElementById('dateForm').addEventListener('submit', async e=>{
    e.preventDefault();

    const newData = {
      events:{
        kouritsu:{date: document.getElementById('kouritsu').value},
        shiritsu:{date: document.getElementById('shiritsu').value},
        kyoutsuu:{date: document.getElementById('kyoutsuu').value}
      }
    };

    try{
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({data: newData})
      });
      const result = await res.json();
      alert(result.ok ? "保存成功" : "保存失敗: " + result.status);
    } catch(err){
      alert("保存失敗: " + err.message);
    }
  });
});

// データ読み込み関数
async function loadData(){
  const res = await fetch('data.json?time=' + Date.now(), {cache:'no-store'});
  const data = await res.json();
  document.getElementById('kouritsu')?.setAttribute('value', data.events.kouritsu.date);
  document.getElementById('shiritsu')?.setAttribute('value', data.events.shiritsu.date);
  document.getElementById('kyoutsuu')?.setAttribute('value', data.events.kyoutsuu.date);
}




