const CATS={action:['⚔️','Action'],adventure:['🧭','Adventure'],funny:['🤪','Funny'],racing:['🏁','Racing'],puzzle:['🧩','Puzzle'],arcade:['🕹️','Arcade']};
// Add a new game here: set live:true and put its files in games/<id>/index.html
const GAMES=[
{id:'goatzilla',title:'Goatzilla',tag:'The Craziest Goat in Town!',emoji:'🐐',a:'#ff3d81',b:'#5b2bd9',cats:['funny','action','adventure'],kind:'3D',live:true,play:'games/goatzilla/index.html',
 desc:'Be a giant, crazy goat in a colourful village. Headbutt crates, cars and villagers, eat samosas, finish missions and run from Chacha’s slipper.',
 controls:['WASD / arrows: move','Shift: sprint','Space: jump (twice)','F or click: headbutt','E: eat / interact','Mouse: camera','Phone: stick + JUMP / BONK / E']},
{id:'pagla-rickshaw',title:'Pagla Rickshaw',tag:'Dhaka traffic, but wild',emoji:'🛺',a:'#ffb300',b:'#e53935',cats:['racing','funny'],kind:'Soon',live:false,desc:'A mad rickshaw race through the busiest streets.',controls:[]},
{id:'samosa-stack',title:'Samosa Stack',tag:'Stack it. Do not drop it.',emoji:'🥟',a:'#ff9800',b:'#8e24aa',cats:['puzzle','arcade'],kind:'Soon',live:false,desc:'A stacking puzzle with very hungry customers.',controls:[]},
{id:'duck-dash',title:'Duck Dash',tag:'Quack and run',emoji:'🦆',a:'#00bcd4',b:'#3f51b5',cats:['arcade','funny'],kind:'Soon',live:false,desc:'An endless runner starring the Duck God.',controls:[]}];
const $=s=>document.querySelector(s),qs=new URLSearchParams(location.search),page=document.body.dataset.page;
const card=g=>`<a class="card${g.live?'':' soon'}" href="game.html?id=${g.id}" style="--a:${g.a};--b:${g.b}"><div class="art">${g.emoji}</div><span class="badge">${g.live?g.kind:'Coming soon'}</span><h3>${g.title}</h3><p>${g.tag}</p></a>`;
const catLink=k=>`<a class="cat" href="games.html?cat=${k}"><span>${CATS[k][0]}</span>${CATS[k][1]}</a>`;
function chrome(){
  document.body.insertAdjacentHTML('afterbegin',`<header><div class="wrap"><a class="logo" href="index.html">Pagla<b>Play</b></a><nav><a href="index.html" class="${page==='home'?'on':''}">Home</a><a href="games.html" class="${page==='games'?'on':''}">All games</a><a href="games.html?cat=funny">Funny</a><a href="games.html?cat=action">Action</a></div></nav></header>`.replace('</div></nav>','</nav></div>'));
  document.body.insertAdjacentHTML('beforeend',`<footer><b>PaglaPlay</b> – Play Different. Laugh Unlimited.<br>Free online games that run right in your browser.</footer>`)}
chrome();
if(page==='home'){
  $('#featured').innerHTML=GAMES.filter(g=>g.live).map(card).join('');
  $('#soon').innerHTML=GAMES.filter(g=>!g.live).map(card).join('');
  $('#cats').innerHTML=Object.keys(CATS).map(catLink).join('')}
if(page==='games'){
  let cat=CATS[qs.get('cat')]?qs.get('cat'):'',q='';
  const chips=$('#chips'),list=$('#list');
  const draw=()=>{chips.innerHTML=`<button class="chip${cat?'':' on'}" data-c="">All</button>`+Object.keys(CATS).map(k=>`<button class="chip${cat===k?' on':''}" data-c="${k}">${CATS[k][0]} ${CATS[k][1]}</button>`).join('');
    const r=GAMES.filter(g=>(!cat||g.cats.includes(cat))&&(g.title+' '+g.tag).toLowerCase().includes(q));
    list.innerHTML=r.length?r.map(card).join(''):'<p class="empty">No games match yet. More are on the way!</p>';
    $('#h').textContent=cat?CATS[cat][1]+' games':'All games';document.title=(cat?CATS[cat][1]+' Games':'All Games')+' – Free Online | PaglaPlay'};
  chips.onclick=e=>{const b=e.target.closest('[data-c]');if(b){cat=b.dataset.c;history.replaceState(0,'',cat?'?cat='+cat:'games.html');draw()}};
  $('#q').oninput=e=>{q=e.target.value.trim().toLowerCase();draw()};draw()}
if(page==='game'){
  const g=GAMES.find(x=>x.id===qs.get('id')),box=$('#main');
  if(!g)box.innerHTML='<p class="empty">Game not found. <a href="games.html">Browse all games</a></p>';
  else{
    document.title=g.title+' – Play Free Online | PaglaPlay';
    const m=document.querySelector('meta[name=description]');if(m)m.content=g.title+': '+g.desc;
    box.innerHTML=`<p class="crumb"><a href="index.html">Home</a> › <a href="games.html">Games</a> › ${g.title}</p>
    <div class="player" id="pl" style="--a:${g.a};--b:${g.b}"><div class="cover"><div class="big">${g.emoji}</div><h1>${g.title}</h1><div>${g.tag}</div>${g.live?'<button class="btn" id="go">▶ Play now</button>':'<div class="btn alt">Coming soon</div>'}</div></div>
    ${g.live?'<p><button class="btn alt" id="fs">⛶ Fullscreen</button></p>':''}
    <div class="two"><div class="box"><h2>About ${g.title}</h2><p>${g.desc}</p><div class="tags">${g.cats.map(k=>`<a href="games.html?cat=${k}">${CATS[k][1]}</a>`).join('')}</div></div>
    ${g.controls.length?`<div class="box"><h2>Controls</h2><ul>${g.controls.map(c=>`<li>${c}</li>`).join('')}</ul></div>`:''}</div>
    <section><h2>More games</h2><div class="grid">${GAMES.filter(x=>x!==g).map(card).join('')}</div></section>`;
    if(g.live){$('#go').onclick=()=>{$('#pl').innerHTML=`<iframe src="${g.play}" title="${g.title}" allow="fullscreen;autoplay" allowfullscreen></iframe>`;$('#pl').firstChild.focus()};
      $('#fs').onclick=()=>{const f=$('#pl');(f.requestFullscreen||f.webkitRequestFullscreen||(()=>{})).call(f)}}}}
