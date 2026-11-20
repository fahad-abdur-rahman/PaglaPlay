/* GOATZILLA - an original PaglaPlay game. Three.js r128 (global build). */
(()=>{
'use strict';
if(!window.THREE){document.body.innerHTML='<p style="color:#fff;padding:24px;font:18px sans-serif">Could not load Three.js. Check your connection and reload.</p>';return}
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const touch=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||'ontouchstart' in window;
const LS={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- renderer / scene ---------- */
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:!touch});
R.setPixelRatio(Math.min(window.devicePixelRatio||1,touch?1:1.5));
const SKY=0x8fd8ff,S=new THREE.Scene();S.background=new THREE.Color(SKY);S.fog=new THREE.Fog(SKY,45,125);
const cam=new THREE.PerspectiveCamera(60,1,.1,240);
S.add(new THREE.HemisphereLight(0xffffff,0x7bbf6a,.85));
const sun=new THREE.DirectionalLight(0xfff0c8,.6);sun.position.set(30,60,20);S.add(sun);
const ST=new THREE.Group();S.add(ST); // static world (matrices frozen later)
function resize(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',resize);resize();

/* ---------- helpers ---------- */
let seed=11;
const rnd=()=>(seed=seed*16807%2147483647)/2147483647,rr=(a,b)=>a+rnd()*(b-a),pick=a=>a[rnd()*a.length|0],rb=(a,b)=>a+Math.random()*(b-a);
const mats={},M=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}));
const GE={box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(1,10,8),cyl:new THREE.CylinderGeometry(1,1,1,12),cone:new THREE.ConeGeometry(1,1,8),pyr:new THREE.ConeGeometry(1,1,4)};
// box: scale = size. sph: scale = radius. cyl/cone/pyr: scale = (radius, height, radius)
function mesh(g,c,sx,sy,sz,x,y,z,p){const m=new THREE.Mesh(GE[g],M(c));m.scale.set(sx,sy,sz);m.position.set(x,y,z);(p||ST).add(m);return m}
function label(t,bg,w){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,512,128);x.strokeStyle='#fff';x.lineWidth=8;x.strokeRect(4,4,504,120);x.fillStyle='#fff';x.font='bold 46px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(t,256,68);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));ST.add(m);return m}

/* ---------- colliders ---------- */
const col=[],addCol=(x,z,hw,hd)=>col.push({x,z,hw,hd});
function push(q,r){for(const c of col){const nx=clamp(q.x,c.x-c.hw,c.x+c.hw),nz=clamp(q.z,c.z-c.hd,c.z+c.hd),dx=q.x-nx,dz=q.z-nz,d=Math.hypot(dx,dz);
  if(d<r){if(d>1e-4){q.x+=dx/d*(r-d);q.z+=dz/d*(r-d)}else q.x+=r+c.hw}}}
const onRoad=(x,z,m)=>Math.abs(x)<5+m||Math.abs(z)<5+m;
const free=(x,z,pad)=>!col.some(c=>Math.abs(x-c.x)<c.hw+pad&&Math.abs(z-c.z)<c.hd+pad);
const spot=()=>{for(let i=0;i<80;i++){const x=rr(-62,62),z=rr(-62,62);if(free(x,z,1.6)&&Math.hypot(x,z)>8)return[x,z]}return[30,-8]};

/* ---------- world ---------- */
mesh('box',0x7ed957,400,1,400,0,-.5,0);
mesh('box',0x4a4e5a,150,.1,10,0,.02,0);mesh('box',0x4a4e5a,10,.1,150,0,.03,0);
for(let i=-68;i<=68;i+=8)if(Math.abs(i)>6){mesh('box',0xffeb3b,3,.12,.3,i,.1,0);mesh('box',0xffeb3b,.3,.12,3,0,.11,i)}
for(let i=0;i<14;i++){const a=i/14*6.283;mesh('cone',i%2?0x5cb85c:0x4aa84a,rr(12,18),rr(14,24),rr(12,18),Math.sin(a)*98,5,Math.cos(a)*98)}
for(let i=0;i<7;i++)mesh('sph',0xffffff,rr(5,9),2.5,3,rr(-80,80),rr(30,40),rr(-80,80)).scale.set(rr(6,10),2.6,3.5);

const PAL=[0xffb3ba,0xffdfba,0xfff5ba,0xbaffc9,0xbae1ff,0xe3baff],RC=[0xe53935,0x8e24aa,0x1e88e5,0xfb8c00];
const SIGNS=['CHAI & CHAOS','MEGA SAMOSA','DUCK BANK','BAD IDEAS CAFE','NO GOATS ALLOWED','MOO-BILE REPAIR','BOING PIZZA','SLIPPER STORE'];
function house(x,z,i){
  const w=rr(8,10),h=rr(5,7),d=rr(8,10),fz=z>0?-1:1,fy=z>0?-1:1,c=pick(PAL);
  mesh('box',c,w,h,d,x,h/2,z);
  mesh('pyr',pick(RC),w*.85,3.2,d*.85,x,h+1.6,z).rotation.y=Math.PI/4;
  mesh('box',0x6d4c41,1.7,2.8,.3,x,1.4,z+fz*(d/2));
  mesh('box',0xbfefff,1.8,1.4,.3,x+w*.28,h*.55,z+fz*(d/2));
  if(i%3===0){ // shop with awning + funny sign
    mesh('box',i%2?0xff5252:0x42a5f5,w*.9,.3,2.4,x,3.7,z+fz*(d/2+1.2));
    const s=label(SIGNS[i/3%SIGNS.length|0],i%2?'#d81b60':'#5e35b1',6.4);s.position.set(x,h-.9,z+fz*(d/2+.2));s.rotation.y=fz>0?0:Math.PI}
  addCol(x,z,w/2,d/2)}
function tree(x,z){mesh('cyl',0x8d6e63,.5,2.6,.5,x,1.3,z);mesh('sph',pick([0x43a047,0x66bb6a,0x2e7d32]),2.2,2.2,2.2,x,4,z);addCol(x,z,.6,.6)}
let hi=0;
for(const sx of[-1,1])for(const sz of[-1,1])for(const gx of[20,38,56])for(const gz of[20,38,56]){
  if(sx>0&&sz>0&&gx===20&&gz===20)continue;if(rnd()<.15)continue;house(sx*gx,sz*gz,hi++)}
// plaza: the sacred Duck God statue
mesh('cyl',0x9e9e9e,4,.6,4,20,.3,20);mesh('sph',0xffeb3b,2.6,2.3,2.6,20,3,20);mesh('sph',0xffeb3b,1.5,1.5,1.5,21.4,5.6,20);
mesh('cone',0xff9800,.5,1.4,.5,23,5.5,20).rotation.z=-Math.PI/2;mesh('sph',0x111111,.2,.2,.2,22.4,6.1,21);addCol(20,20,4,4);
label('DUCK GOD','#ef6c00',5).position.set(20,.9,16.2);
// goat crossing sign near spawn
mesh('cyl',0x888888,.1,3.4,.1,7,1.7,6);label('GOAT CROSSING','#e53935',3.4).position.set(7,3.2,6.1);
for(let i=0,n=0;i<400&&n<34;i++){const x=rr(-64,64),z=rr(-64,64);if(!onRoad(x,z,3)&&free(x,z,2)){tree(x,z);n++}}
ST.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false});

/* ---------- goat model (faces +Z) ---------- */
const goat=new THREE.Group(),body=new THREE.Group(),head=new THREE.Group(),legs=[];
S.add(goat);goat.add(body);body.add(head);goat.scale.setScalar(1.25);head.position.set(0,2.05,1.25);
const WH=0xf7f1e3;
mesh('box',WH,1.3,1.1,2.1,0,1.55,0,body);
mesh('box',WH,.9,.9,.9,0,0,0,head);mesh('box',0xf0b8a0,.55,.4,.5,0,-.25,.6,head);
for(const s of[-1,1]){
  mesh('sph',0xffffff,.24,.24,.24,s*.3,.2,.42,head);mesh('sph',0x111111,.1,.1,.1,s*.2,.2,.62,head); // cross-eyed crazy stare
  mesh('cone',0xffc107,.16,.8,.16,s*.28,.7,-.05,head).rotation.x=-.5;
  mesh('box',WH,.5,.14,.3,s*.6,.25,-.1,head).rotation.z=s*.4}
mesh('cone',0xf7f1e3,.14,.5,.14,0,-.6,.35,head).rotation.x=Math.PI;
for(let i=0;i<4;i++){const l=new THREE.Group();l.position.set(i%2?.45:-.45,1,i<2?.75:-.75);mesh('box',WH,.3,1,.3,0,-.5,0,l);mesh('box',0x333333,.34,.2,.34,0,-.9,0,l);goat.add(l);legs.push(l)}
mesh('box',WH,.22,.22,.5,0,1.95,-1.2,body).rotation.x=.5;
for(let i=0;i<4;i++)mesh('cone',0x2ecc71,.22,.6,.22,0,2.3,-.7+i*.45,body); // Goatzilla back spikes

/* ---------- entities ---------- */
const props=[],npcs=[],cars=[],items=[];
function prop(kind){const[x,z]=spot();let g,h,r,pts=10,duck=0;
  if(kind==='crate'){g=mesh('box',0xc68642,1.5,1.5,1.5,0,0,0,S);h=.75;r=.9}
  else if(kind==='barrel'){g=mesh('cyl',pick([0xe53935,0x1e88e5]),.7,1.4,.7,0,0,0,S);h=.7;r=.75}
  else if(kind==='cone'){g=mesh('cone',0xff7043,.5,1.1,.5,0,0,0,S);h=.55;r=.55;pts=5}
  else{g=new THREE.Group();S.add(g);mesh('sph',0xffeb3b,.6,.5,.6,0,0,0,g);mesh('sph',0xffeb3b,.32,.32,.32,0,.55,.35,g);mesh('cone',0xff9800,.12,.3,.12,0,.5,.7,g).rotation.x=Math.PI/2;h=.5;r=.6;pts=15;duck=1}
  g.position.set(x,h,z);props.push({g,h,r,pts,duck,hx:x,hz:z,vx:0,vy:0,vz:0,spin:0,act:false})}
['crate','crate','crate','crate','crate','crate','crate','crate','crate','crate','barrel','barrel','barrel','barrel','barrel','barrel','cone','cone','cone','cone','cone','cone','duck','duck','duck','duck','duck'].forEach(prop);

function npc(c,farmer){const g=new THREE.Group(),s=farmer?1.3:1;S.add(g);
  mesh('cyl',c,.5*s,1.4*s,.5*s,0,.9*s,0,g);mesh('sph',0xf1c27d,.38*s,.38*s,.38*s,0,1.95*s,0,g);mesh('cyl',farmer?0xffffff:0x333333,.4*s,.3*s,.4*s,0,2.3*s,0,g);
  mesh('sph',0x111111,.06*s,.06*s,.06*s,-.15*s,2*s,.34*s,g);mesh('sph',0x111111,.06*s,.06*s,.06*s,.15*s,2*s,.34*s,g);
  if(farmer){mesh('box',0x222222,.4,.1,.1,0,1.85*s,.38*s,g);mesh('box',0xff9800,.5,.12,.9,.75,1.6,.4,g)} // moustache + the Slipper of Doom
  const[x,z]=farmer?[0,-46]:spot();g.position.set(x,0,z);
  const n={g,farmer,hx:x,hz:z,stun:0,fly:0,vx:0,vy:0,vz:0,tx:x,tz:z,wait:0,ph:rb(0,6)};npcs.push(n);return n}
['#e91e63','#3f51b5','#009688','#ff9800','#795548','#9c27b0','#00bcd4','#8bc34a'].forEach(c=>npc(parseInt(c.slice(1),16),0));
const farmer=npc(0x1565c0,1);

function car(axis,lane,dir,c,sp){const g=new THREE.Group();S.add(g);
  mesh('box',c,1.8,.9,3.6,0,.85,0,g);mesh('box',0xbbdefb,1.6,.8,1.8,0,1.65,-.1,g);
  for(const z of[-1.1,1.1]){const w=mesh('cyl',0x222222,.45,2.1,.45,0,.45,z,g);w.rotation.z=Math.PI/2}
  mesh('box',0xfff59d,1.2,.25,.1,0,.9,1.82,g);
  const o={g,axis,lane,dir,sp,stun:0,fly:0,vx:0,vy:0,vz:0,spin:0,hk:0,head:axis==='x'?dir*Math.PI/2:(dir>0?0:Math.PI),t0:-dir*rb(-60,60)};
  o.hx=axis==='x'?o.t0:lane;o.hz=axis==='x'?lane:o.t0;cars.push(o)}
car('x',-2.5,1,0xe53935,9);car('x',2.5,-1,0x1e88e5,11);car('z',2.5,1,0xffb300,10);car('z',-2.5,-1,0x8e24aa,8);

function item(kind,x,z){const g=new THREE.Group();S.add(g);
  if(kind==='coin'){mesh('cyl',0xffd700,.55,.12,.55,0,0,0,g).rotation.x=Math.PI/2;g.position.set(x,1.4,z)}
  else{mesh('cone',0xd98e04,.55,.8,.55,0,0,0,g);mesh('sph',0x6d4c41,.12,.12,.12,0,.35,.3,g);g.position.set(x,1,z)}
  items.push({g,kind,alive:true,rt:0,y0:g.position.y,ph:rb(0,6),hx:x,hz:z})}
for(let i=0;i<32;i++){const[x,z]=spot();item('coin',x,z)}
for(let i=0;i<10;i++){const[x,z]=spot();item('snack',x,z)}
for(let i=-6;i<=6;i+=3)if(i)item('coin',i*4,0); // coin trail on the main road

/* ---------- state ---------- */
const G={run:false,over:false,score:0,coins:0,hp:3,t:0,mis:0,mc:0,sp:0};
const p=new THREE.Vector3(),v=new THREE.Vector3(),joy={id:null,x:0,y:0,s:0},K={};
let face=Math.PI,yaw=0,pitch=.35,st=100,tired=false,jumps=0,buttT=0,buttCd=0,buttHit=true,invul=0,phase=0,toastT=0,sayT=0,spr=false,menuT=0,best=+LS.get('gz_best')||0;
const MIS=[{t:'Collect coins',k:'coin',n:10},{t:'Bonk crates, barrels & ducks',k:'prop',n:6},{t:'Bonk villagers',k:'npc',n:3},{t:'Eat samosas (press E)',k:'eat',n:5},{t:'Smash cars',k:'car',n:3},{t:'Bonk Chacha the farmer',k:'farmer',n:1}];
const AL={first:'🥇 First Bonk!',coin30:'💰 Coin Goblin (30 coins)',car:'🚗 Car Crusher',duck:'🦆 Duck Launcher',fast:'⚡ Speed Goat (5s sprint)',hero:'👑 Goatzilla Legend'};
let got={};try{got=JSON.parse(LS.get('gz_ach')||'{}')||{}}catch(e){}
const LINES=['Your goat is eating my WiFi!','Is that a goat or a dinosaur?!','Please do not headbutt my rickshaw...','I sold my last crate. Do not ask.','Chacha is looking for you. He brought slippers.','This village has 12 goats and 1 WiFi.','Yes officer, the goat did it.','Samosas are on the ground. Just saying.'];

/* ---------- sound (WebAudio synth, no files) ---------- */
let AC,muted=false;
function tone(f,d,ty,vol,to,delay){if(muted||!AC)return;const go=()=>{try{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d)}catch(e){}};delay?setTimeout(go,delay):go()}
const SFX={coin(){tone(880,.1,'square',.08);tone(1320,.15,'square',.08,0,80)},jump(){tone(280,.22,'sine',.2,720)},bonk(){tone(180,.25,'square',.22,45);tone(90,.2,'sawtooth',.2,40,40)},
  bleat(){tone(520,.28,'sawtooth',.12,380);tone(440,.3,'sawtooth',.1,300,120)},honk(){tone(330,.3,'square',.1);tone(415,.3,'square',.1)},ouch(){tone(420,.35,'sawtooth',.18,70)},
  quack(){tone(900,.09,'square',.1,500);tone(800,.09,'square',.1,450,110)},boing(){tone(200,.3,'sine',.25,900)},munch(){tone(300,.06,'square',.12);tone(260,.06,'square',.12,0,80);tone(330,.08,'square',.12,0,160)},
  win(){[523,659,784,1047].forEach((f,i)=>tone(f,.18,'triangle',.15,0,i*110))},whiff(){tone(500,.12,'sine',.08,250)}};
function initAudio(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.resume)AC.resume()}catch(e){AC=null}}
$('mu').onclick=()=>{muted=!muted;$('mu').textContent=muted?'🔇':'🔊'};

/* ---------- UI helpers ---------- */
const cache={};
function set(id,val){if(cache[id]!==val){cache[id]=val;$(id).textContent=val}}
function toast(s,t){set('toast',s);$('toast').classList.add('on');toastT=t||2.2}
function say(s){set('say',s);$('say').classList.add('on');sayT=3}
function add(n){G.score+=n}
function ach(k){if(got[k])return;got[k]=1;LS.set('gz_ach',JSON.stringify(got));add(50);toast('🏆 '+AL[k],3)}
function progress(k){const m=MIS[G.mis];if(!m||m.k!==k)return;G.mc++;
  if(G.mc>=m.n){add(100*(G.mis+1));toast('✅ Mission done: '+m.t+'!',2.6);SFX.win();G.mis++;G.mc=0;if(G.mis>=MIS.length)ach('hero')}}
function hud(){set('sc',G.score);set('co',G.coins);set('hp','❤️'.repeat(Math.max(0,G.hp))+'🖤'.repeat(3-Math.max(0,G.hp)));
  const m=MIS[G.mis];set('mt',m?'Mission '+(G.mis+1)+'/'+MIS.length+': '+m.t+' ('+G.mc+'/'+m.n+')':'👑 Legend! Free roam: chase the high score!');
  const w=(m?G.mc/m.n*100:100)+'%';if(cache.mf!==w){cache.mf=w;$('mf').style.width=w}
  const s=st+'%';if(cache.sf!==s){cache.sf=s;$('sf').style.width=st.toFixed(0)+'%';$('sf').style.background=tired?'#ff5252':'#3ddc84'}}

/* ---------- actions ---------- */
function jump(){if(!G.run||jumps>=2)return;v.y=jumps?10:12.5;jumps++;SFX.jump()}
function butt(){if(!G.run||buttCd>0)return;buttT=.35;buttCd=.55;buttHit=false;SFX.bleat()}
function launchNPC(n,fx,fz,stun){n.fly=1;n.stun=stun;n.vx=fx*9+rb(-2,2);n.vz=fz*9+rb(-2,2);n.vy=9;n.g.rotation.x=0}
function hit(){
  const fx=Math.sin(face),fz=Math.cos(face);let any=0;
  const near=(g,r)=>{const dx=g.position.x-p.x,dz=g.position.z-p.z,d=Math.hypot(dx,dz);return d<r&&(d<1.8||(dx*fx+dz*fz)/d>.2)&&Math.abs(g.position.y-p.y)<3.5};
  for(const o of props)if(near(o.g,3.6)){o.vx=fx*13+rb(-2,2);o.vz=fz*13+rb(-2,2);o.vy=8+rb(0,3);o.spin=rb(-9,9);o.act=true;add(o.pts);progress('prop');any++;if(o.duck){SFX.quack();ach('duck')}}
  for(const n of npcs)if(n.stun<=0&&near(n.g,3.6)){launchNPC(n,fx,fz,n.farmer?5:4);any++;add(n.farmer?50:20);progress(n.farmer?'farmer':'npc');toast(n.farmer?'CHACHA IS DOWN! 🩴':'BONK! +20',1.4)}
  for(const c of cars)if(c.stun<=0&&near(c.g,4.6)){c.stun=4;c.fly=1;c.vx=fx*7;c.vz=fz*7;c.vy=10;c.spin=7;any++;add(30);progress('car');ach('car');SFX.honk();toast('CAR GO BRRR 🚗 +30',1.6)}
  if(any){SFX.bonk();ach('first')}else SFX.whiff()}
function interact(){if(!G.run)return;
  let b=null,bd=3.6;for(const o of items)if(o.kind==='snack'&&o.alive){const d=Math.hypot(o.g.position.x-p.x,o.g.position.z-p.z);if(d<bd){bd=d;b=o}}
  if(b){b.alive=false;b.g.visible=false;b.rt=G.t+25;add(15);st=100;tired=false;SFX.munch();progress('eat');toast('NOM NOM 🥟 +15',1.2);return}
  let n=null;bd=4.2;for(const o of npcs)if(!o.farmer&&o.stun<=0){const d=Math.hypot(o.g.position.x-p.x,o.g.position.z-p.z);if(d<bd){bd=d;n=o}}
  if(n){say('🧑 '+LINES[Math.random()*LINES.length|0]);return}
  for(const c of cars)if(Math.hypot(c.g.position.x-p.x,c.g.position.z-p.z)<7){SFX.honk();say('🚗 BEEEEP! Get off the road, goat!');return}
  SFX.bleat();toast('Nothing to eat or chat with. Try a BONK!',1.6)}
function hurt(f){G.hp--;invul=2;const dx=p.x-f.x,dz=p.z-f.z,d=Math.hypot(dx,dz)||1;v.x=dx/d*14;v.z=dz/d*14;v.y=9;SFX.ouch();toast('🩴 SLIPPER ATTACK!',1.6);if(G.hp<=0)over()}
function over(){G.run=false;G.over=true;if(G.score>best){best=G.score;LS.set('gz_best',best)}
  $('gs').textContent='Score '+G.score+'  •  Best '+best;$('over').hidden=false;$('hud').hidden=true;$('touch').hidden=true;
  if(document.exitPointerLock)document.exitPointerLock()}
function reset(){G.score=G.coins=G.mis=G.mc=0;G.hp=3;G.t=0;G.sp=0;G.over=false;p.set(0,0,6);v.set(0,0,0);face=Math.PI;yaw=0;pitch=.35;st=100;tired=false;invul=0;buttT=buttCd=0;jumps=0;
  for(const o of props){o.g.position.set(o.hx,o.h,o.hz);o.g.rotation.set(0,0,0);o.vx=o.vy=o.vz=o.spin=0;o.act=false}
  for(const n of npcs){n.g.position.set(n.hx,0,n.hz);n.g.rotation.set(0,0,0);n.stun=0;n.fly=0;n.wait=0;n.tx=n.hx;n.tz=n.hz}
  for(const c of cars){c.stun=0;c.fly=0;c.g.position.set(c.hx,0,c.hz);c.g.rotation.set(0,c.head,0)}
  for(const o of items){o.alive=true;o.g.visible=true}
  for(const k in cache)delete cache[k];hud()}
function start(){initAudio();reset();G.run=true;$('menu').hidden=true;$('over').hidden=true;$('hud').hidden=false;$('touch').hidden=!touch;
  if(!touch){try{cv.requestPointerLock()}catch(e){}}toast(touch?'Stick to move • BONK to headbutt!':'WASD move • F / click to BONK!',3)}
$('play').onclick=start;$('again').onclick=start;

/* ---------- update ---------- */
function updPlayer(dt){
  let ix=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0)+joy.x,iy=(K.KeyW||K.ArrowUp?1:0)-(K.KeyS||K.ArrowDown?1:0)+joy.y;
  const L=Math.hypot(ix,iy);if(L>1){ix/=L;iy/=L}
  const mv=L>.12;spr=!!((K.ShiftLeft||K.ShiftRight||joy.s)&&mv&&!tired&&st>0);
  if(spr){st-=30*dt;G.sp+=dt;if(st<=0){st=0;tired=true}if(G.sp>=5)ach('fast')}else{st=Math.min(100,st+20*dt);if(st>25)tired=false}
  const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=spr?12:7;
  let tx=(-sy*iy+cy*ix)*sp,tz=(-cy*iy-sy*ix)*sp;
  if(buttT>.15){tx=Math.sin(face)*17;tz=Math.cos(face)*17}
  const k=Math.min(1,(invul>1.6?2:12)*dt);v.x+=(tx-v.x)*k;v.z+=(tz-v.z)*k;
  v.y-=28*dt;p.x+=v.x*dt;p.y+=v.y*dt;p.z+=v.z*dt;
  if(p.y<=0){p.y=0;if(v.y<0)v.y=0;jumps=0}
  push(p,1.1);p.x=clamp(p.x,-67,67);p.z=clamp(p.z,-67,67);
  const hs=Math.hypot(v.x,v.z);
  if(hs>1){let d=Math.atan2(v.x,v.z)-face;d=Math.atan2(Math.sin(d),Math.cos(d));face+=d*Math.min(1,14*dt)}
  phase+=hs*dt*1.6;const sw=Math.min(1,hs/7)*.9*(p.y>0?.3:1);
  for(let i=0;i<4;i++)legs[i].rotation.x=Math.sin(phase+(i===1||i===2?Math.PI:0))*sw;
  body.position.y=Math.abs(Math.sin(phase))*.1*Math.min(1,hs/7);
  head.rotation.x=(buttT>0?Math.sin((1-buttT/.35)*Math.PI)*1.1:0)+Math.sin(G.t*3)*.05;
  goat.position.copy(p);goat.rotation.y=face;goat.visible=invul<=0||((G.t*18|0)%2===0)}
function updProps(dt){for(const o of props){const g=o.g.position,dx=g.x-p.x,dz=g.z-p.z,d=Math.hypot(dx,dz)||1;
  if(d<1.2+o.r&&p.y<1.5){const s=spr?9:3.5;o.vx=dx/d*s;o.vz=dz/d*s;o.act=true}
  if(!o.act)continue;
  o.vy-=25*dt;g.x+=o.vx*dt;g.y+=o.vy*dt;g.z+=o.vz*dt;o.g.rotation.x+=o.spin*dt;o.g.rotation.z+=o.spin*.6*dt;
  if(g.y<=o.h){g.y=o.h;if(o.vy<-4)o.vy*=-.4;else o.vy=0;const f=Math.max(0,1-5*dt);o.vx*=f;o.vz*=f;o.spin*=f;
    if(Math.hypot(o.vx,o.vz)<.3&&o.vy===0){o.act=false;o.vx=o.vz=o.spin=0;o.g.rotation.x=o.g.rotation.z=0}}
  push(g,o.r);g.x=clamp(g.x,-67,67);g.z=clamp(g.z,-67,67)}}
function updNPC(n,dt){const g=n.g,P=g.position;
  if(n.stun>0){n.stun-=dt;
    if(n.fly){n.vy-=25*dt;P.x+=n.vx*dt;P.y+=n.vy*dt;P.z+=n.vz*dt;g.rotation.x+=9*dt;if(P.y<=0){P.y=.45;n.fly=0;g.rotation.x=-1.45;n.vx=n.vz=0}push(P,.5)}
    if(n.stun<=0){P.y=0;g.rotation.x=0}return}
  const gx=p.x-P.x,gz=p.z-P.z,gd=Math.hypot(gx,gz);let dx=0,dz=0,sp=0;
  if(n.farmer){if(G.t>12){dx=gx;dz=gz;sp=4.8+Math.min(G.t/45,3);if(gd<1.9&&invul<=0&&p.y<1.3)hurt(P)}}
  else if(gd<6){dx=-gx;dz=-gz;sp=5.5;n.wait=0}
  else if(n.wait>0)n.wait-=dt;
  else{dx=n.tx-P.x;dz=n.tz-P.z;sp=1.8;if(Math.hypot(dx,dz)<1){n.wait=rb(1,4);n.tx=P.x+rb(-14,14);n.tz=P.z+rb(-14,14);sp=0}}
  const d=Math.hypot(dx,dz);
  if(sp&&d>.01){P.x+=dx/d*sp*dt;P.z+=dz/d*sp*dt;g.rotation.y=Math.atan2(dx,dz);P.y=Math.abs(Math.sin(G.t*9+n.ph))*.12}else P.y=0;
  push(P,.55);P.x=clamp(P.x,-67,67);P.z=clamp(P.z,-67,67)}
function updCar(c,dt){const P=c.g.position;
  if(c.stun>0){c.stun-=dt;
    if(c.fly){c.vy-=25*dt;P.x+=c.vx*dt;P.y+=c.vy*dt;P.z+=c.vz*dt;c.g.rotation.z+=c.spin*dt;if(P.y<=0){P.y=0;c.fly=0;c.g.rotation.z=0}}else c.g.rotation.y+=10*dt;
    if(c.stun<=0){P.y=0;c.g.rotation.set(0,c.head,0);if(c.axis==='x')P.z=c.lane;else P.x=c.lane}return}
  if(c.axis==='x'){P.x+=c.dir*c.sp*dt;if(Math.abs(P.x)>72)P.x=-c.dir*72}else{P.z+=c.dir*c.sp*dt;if(Math.abs(P.z)>72)P.z=-c.dir*72}
  const dx=p.x-P.x,dz=p.z-P.z,d=Math.hypot(dx,dz)||1;
  if(d<2.7){if(p.y>1.6&&v.y<=0){v.y=13;jumps=1;SFX.boing();add(5);toast('BOING! +5',1)}else if(p.y<=1.6){v.x=dx/d*12;v.z=dz/d*12;v.y=7;SFX.boing()}}
  if(d<10&&G.t>c.hk){c.hk=G.t+3;SFX.honk()}}
function updItems(dt){for(const o of items){
  if(!o.alive){if(G.t>=o.rt){o.alive=true;o.g.visible=true}continue}
  o.g.rotation.y+=3*dt;o.g.position.y=o.y0+Math.sin(G.t*3+o.ph)*.2;
  if(o.kind==='coin'&&p.y<3&&Math.hypot(o.g.position.x-p.x,o.g.position.z-p.z)<1.9){
    o.alive=false;o.g.visible=false;o.rt=G.t+40;G.coins++;add(10);SFX.coin();progress('coin');if(G.coins>=30)ach('coin30')}}}
function updCam(dt){const d=9,cp=Math.cos(pitch),tx=p.x,ty=p.y+2.6,tz=p.z,k=1-Math.pow(1e-4,dt);
  cam.position.x+=(tx+Math.sin(yaw)*cp*d-cam.position.x)*k;cam.position.y+=(Math.max(.8,ty+Math.sin(pitch)*d)-cam.position.y)*k;cam.position.z+=(tz+Math.cos(yaw)*cp*d-cam.position.z)*k;cam.lookAt(tx,ty,tz)}
function update(dt){
  G.t+=dt;updPlayer(dt);
  buttCd-=dt;if(buttT>0){buttT-=dt;if(buttT<.26&&!buttHit){buttHit=true;hit()}}
  invul-=dt;updProps(dt);for(const n of npcs)updNPC(n,dt);for(const c of cars)updCar(c,dt);updItems(dt);
  if(G.t>12&&G.t<12.1)toast('⚠️ Chacha is coming with his slipper!',2.5);
  if(toastT>0&&(toastT-=dt)<=0)$('toast').classList.remove('on');
  if(sayT>0&&(sayT-=dt)<=0)$('say').classList.remove('on');
  updCam(dt);hud()}

/* ---------- input ---------- */
addEventListener('keydown',e=>{K[e.code]=1;if(e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault();if(e.repeat)return;
  if(e.code==='Space')jump();else if(e.code==='KeyE')interact();else if(e.code==='KeyF'||e.code==='KeyQ')butt();else if(e.code==='KeyM')$('mu').onclick()});
addEventListener('keyup',e=>{K[e.code]=0});addEventListener('blur',()=>{for(const k in K)K[k]=0});
cv.addEventListener('mousedown',e=>{if(!G.run||touch)return;if(document.pointerLockElement!==cv){try{cv.requestPointerLock()}catch(_){}}else if(e.button===0)butt()});
addEventListener('mousemove',e=>{if(!G.run||touch)return;if(document.pointerLockElement===cv||(e.buttons&1)){yaw-=(e.movementX||0)*.0035;pitch=clamp(pitch+(e.movementY||0)*.0035,.05,1.2)}});
let camT=null,lx=0,ly=0;
function joyMove(t){const r=$('joy').getBoundingClientRect(),m=r.width/2;let dx=t.clientX-(r.left+m),dy=t.clientY-(r.top+m);const l=Math.hypot(dx,dy);if(l>m){dx*=m/l;dy*=m/l}
  joy.x=dx/m;joy.y=-dy/m;joy.s=Math.hypot(joy.x,joy.y)>.92?1:0;$('knob').style.transform='translate('+dx+'px,'+dy+'px)'}
$('joy').addEventListener('touchstart',e=>{const t=e.changedTouches[0];joy.id=t.identifier;joyMove(t);e.preventDefault()},{passive:false});
cv.addEventListener('touchstart',e=>{for(const t of e.changedTouches)if(camT===null){camT=t.identifier;lx=t.clientX;ly=t.clientY}},{passive:true});
addEventListener('touchmove',e=>{for(const t of e.changedTouches){
  if(t.identifier===joy.id)joyMove(t);
  else if(t.identifier===camT){yaw-=(t.clientX-lx)*.006;pitch=clamp(pitch+(t.clientY-ly)*.006,.05,1.2);lx=t.clientX;ly=t.clientY}}
  if(G.run)e.preventDefault()},{passive:false});
const tEnd=e=>{for(const t of e.changedTouches){if(t.identifier===camT)camT=null;if(t.identifier===joy.id){joy.id=null;joy.x=joy.y=joy.s=0;$('knob').style.transform=''}}};
addEventListener('touchend',tEnd);addEventListener('touchcancel',tEnd);
for(const[id,fn]of[['bj',jump],['bh',butt],['be',interact]])$(id).addEventListener('touchstart',e=>{fn();e.preventDefault()},{passive:false});

/* ---------- main loop ---------- */
let last=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;
  if(G.run)update(dt);
  else if(!G.over){menuT+=dt;const a=menuT*.35;goat.position.set(0,Math.abs(Math.sin(menuT*3))*.5,6);goat.rotation.y=a*2;head.rotation.x=Math.sin(menuT*4)*.3;
    cam.position.set(Math.sin(a)*13,5,6+Math.cos(a)*13);cam.lookAt(0,2,6)}
  R.render(S,cam)}
reset();requestAnimationFrame(loop);
})();
