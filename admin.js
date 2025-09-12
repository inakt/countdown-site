const PASSWORD_HASH = "4bb4b6cbb0528674d2d0969cdb4660e862043a28d818d00ec16c265cfec2a371";


async function sha256(str){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

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

async function loadData(){
  const res = await fetch('https://YOUR_WORKER_URL', { cache: "no-store" });
  const data = await res.json();
  document.getElementById('kouritsu').value = data.events.kouritsu.date;
  document.getElementById('shiritsu').value = data.events.shiritsu.date;
  document.getElementById('kyoutsuu').value = data.events.kyoutsuu.date;
}

document.getElementById('dateForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const newData = {
    events:{
      kouritsu:{title:"埼玉県公立高校入試", date: document.getElementById('kouritsu').value},
      shiritsu:{title:"埼玉県私立高校入試", date: document.getElementById('shiritsu').value},
      kyoutsuu:{title:"大学入学共通テスト", date: document.getElementById('kyoutsuu').value}
    }
  };

  const res = await fetch('https://ghadmintoken.inakt.workers.dev/', {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ password: document.getElementById('password').value, data: newData })
  });

  if(res.ok) alert("保存成功");
  else alert("保存失敗");
});





