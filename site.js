(()=>{
const $=s=>document.querySelector(s), vp=$('#vp'), cv=$('#cv'), fr=$('#fr'), side=$('#side'), mc=$('#mc'), res=$('#res'), q=$('#q');
let s=.2,x=0,y=0,W=3456,H=4608,idx=[],DATA=null,sel=null,branch='';
const BR={'#9C4A2B':'Bessinger','#A87A1F':'Schatzman','#2D5B63':'Siegel','#6A4A7E':'Baratz'};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rx=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const mobile=()=>innerWidth<=760;
function apply(){cv.style.transform=`translate(${x}px,${y}px) scale(${s})`;drawMM()}
function box(){return vp.getBoundingClientRect()}
function fit(){const r=box();s=Math.min(r.width/W,r.height/H)*.98;x=(r.width-W*s)/2;y=(r.height-H*s)/2;apply()}
function zoomAt(f,cx,cy){const ns=Math.max(.05,Math.min(2.5,s*f));x=cx-(cx-x)*(ns/s);y=cy-(cy-y)*(ns/s);s=ns;apply()}
function centerOn(cx,cy,ns){const r=box();s=ns||s;const off=(side.classList.contains('open')&&!mobile())?side.offsetWidth/2:0;x=r.width/2-off-cx*s;y=(mobile()&&side.classList.contains('open')?r.height*.2:r.height/2)-cy*s;apply()}
/* ---------- minimap ---------- */
function drawMM(){if(!idx.length)return;const c=mc.getContext('2d'),w=mc.width,h=mc.height;c.clearRect(0,0,w,h);c.fillStyle='#fffdf8';c.fillRect(0,0,w,h);
 idx.forEach(i=>{c.globalAlpha=(branch&&i.br!==branch)?.12:1;c.fillStyle=i.col;c.fillRect(i.l/W*w,i.t/H*h,Math.max(2,i.w/W*w),Math.max(1.5,i.h/H*h))});c.globalAlpha=1;
 if(sel){c.strokeStyle='#C9962B';c.lineWidth=2;c.strokeRect(sel.l/W*w-2,sel.t/H*h-2,sel.w/W*w+4,sel.h/H*h+4)}
 const r=box(),vx=-x/s/W*w,vy=-y/s/H*h,vw=r.width/s/W*w,vh=r.height/s/H*h;c.strokeStyle='#2b2622';c.lineWidth=1.5;c.fillStyle='rgba(43,38,34,.07)';c.fillRect(vx,vy,vw,vh);c.strokeRect(vx,vy,vw,vh)}
function mmGo(e){const b=mc.getBoundingClientRect();centerOn((e.clientX-b.left)/b.width*W,(e.clientY-b.top)/b.height*H)}
let mmd=false;mc.addEventListener('pointerdown',e=>{mmd=true;mc.setPointerCapture(e.pointerId);mmGo(e)});mc.addEventListener('pointermove',e=>{if(mmd)mmGo(e)});mc.addEventListener('pointerup',()=>mmd=false);
/* ---------- load ---------- */
const DP=fetch('data.json').then(r=>r.json()).then(d=>{DATA=d}).catch(()=>{});
fr.addEventListener('load',()=>{try{
 const d=fr.contentDocument,pg=d.getElementById('page');W=pg.offsetWidth;H=pg.offsetHeight;fr.style.width=W+'px';fr.style.height=H+'px';
 const st=d.createElement('style');st.textContent='.bx.found{outline:16px solid #C9962B;outline-offset:10px;z-index:9;position:absolute}.bx{transition:opacity .25s}';d.head.appendChild(st);
 idx=[...d.querySelectorAll('.bx:not(.q):not(.echo)')].map(el=>{const nm=el.querySelector('.nm'),yr=el.querySelector('.yr');if(!nm)return null;const col=(el.style.getPropertyValue('--c')||getComputedStyle(el).getPropertyValue('--c')).trim().toUpperCase();
  return{el,name:nm.textContent.replace(/[◇¹]/g,'').trim(),yrs:yr?yr.textContent.trim():'',col:col||'#999',br:BR[col]||'',l:el.offsetLeft,t:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight}}).filter(Boolean);
 $('#load').style.display='none';fit();
 const h=decodeURIComponent(location.hash.slice(1));if(h){DP.then(()=>{const m=find(h);if(m)select(m,true)})}
 setTimeout(()=>{$('#hint').style.opacity=0},7000);
 try{if(!localStorage.getItem('seen')&&!h)$('#wel').classList.add('on')}catch(e){}
}catch(e){console.log(e);$('#load').textContent='Could not load the tree.'}});
function find(n){const t=n.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/).filter(Boolean);if(!t.length)return null;const f=t[0],l=t[t.length-1];
 return idx.find(i=>i.name.toLowerCase()===n.toLowerCase())||idx.find(i=>{const k=i.name.toLowerCase();return k.includes(f)&&k.includes(l)})||null}
/* ---------- pan / zoom / click ---------- */
const pts=new Map();let start=null;
vp.addEventListener('wheel',e=>{e.preventDefault();const r=box();zoomAt(e.deltaY<0?1.15:1/1.15,e.clientX-r.left,e.clientY-r.top)},{passive:false});
vp.addEventListener('pointerdown',e=>{if(e.target.closest('#res,.zc,#mm,#hint'))return;vp.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);vp.classList.add('drag');start={x:e.clientX,y:e.clientY,t:Date.now(),n:pts.size}});
vp.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const o=pts.get(e.pointerId);
 if(pts.size==1){x+=e.clientX-o[0];y+=e.clientY-o[1];pts.set(e.pointerId,[e.clientX,e.clientY]);apply()}
 else if(pts.size==2){const a=[...pts.values()],d0=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);pts.set(e.pointerId,[e.clientX,e.clientY]);const b=[...pts.values()],d1=Math.hypot(b[0][0]-b[1][0],b[0][1]-b[1][1]),r=box();if(d0)zoomAt(d1/d0,(b[0][0]+b[1][0])/2-r.left,(b[0][1]+b[1][1])/2-r.top)}});
function up(e){if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(!pts.size)vp.classList.remove('drag');
 if(start&&start.n==1&&e.type=='pointerup'&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<7&&Date.now()-start.t<700){const r=cv.getBoundingClientRect();const px=(e.clientX-r.left)/s,py=(e.clientY-r.top)/s;
  const hit=idx.find(i=>px>=i.l&&px<=i.l+i.w&&py>=i.t&&py<=i.t+i.h);if(hit)select(hit);else if(side.classList.contains('open')&&!mobile())closeSide()}
 if(!pts.size)start=null}
vp.addEventListener('pointerup',up);vp.addEventListener('pointercancel',up);
/* ---------- selection + panel ---------- */
function relevant(i){const p=i.name.split(/\s+/).filter(w=>/^[A-Za-z]/.test(w));const f=p[0],l=p[p.length-1];if(!f||!l||f===l)return{st:[],ar:[]};const re=new RegExp('\\b'+rx(f)+'\\b[^.\\n]{0,28}\\b'+rx(l)+'\\b','i');
 const st=Object.entries(DATA.stories).filter(([k,v])=>re.test(v.title+' '+v.text)).slice(0,8);
 const ar=DATA.arts.filter(a=>re.test(a.title+' '+a.cap)).slice(0,10);return{st,ar}}
function openSide(html){side.innerHTML=html;side.classList.add('open');side.scrollTop=0;side.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeSide)}
function closeSide(){side.classList.remove('open');if(sel){sel.el.classList.remove('found');sel=null;drawMM()}history.replaceState(null,'',location.pathname)}
function select(i,keep){idx.forEach(j=>j.el.classList.remove('found'));sel=i;i.el.classList.add('found');
 const r=DATA?relevant(i):{st:[],ar:[]};
 let h=`<div class="ph" style="--c:${i.col}"><div class="bar"></div><div><h2>${esc(i.name)}</h2><small>${esc(i.yrs||'')}${i.yrs&&i.br?' · ':''}${i.br?esc(i.br)+' branch':''}</small></div><button class="btn x" data-close aria-label="Close">✕</button></div><div class="pb">`;
 h+='<h3>Stories</h3>'+(r.st.length?r.st.map(([k,v])=>`<a class="sl" href="${k}.html"><b>${esc(v.title)}</b><span>${esc(v.branch)} · ${v.words} words</span></a>`).join(''):'<p class="empty">No story written about this person yet. Know something? Tell Ross.</p>');
 if(r.ar.length)h+='<h3>Scans and clippings</h3><div class="th">'+r.ar.map(a=>`<button type="button" data-img="${a.slug}.jpg" data-cap="${esc(a.title)}. ${esc(a.cap)}" aria-label="${esc(a.title)}"><img src="${a.slug}.jpg" alt="${esc(a.title)}" loading="lazy"></button>`).join('')+'</div>';
 h+=`<div class="acts" style="margin-top:22px"><button class="btn" id="cp">Copy link to this person</button></div></div>`;
 openSide(h);history.replaceState(null,'','#'+encodeURIComponent(i.name));
 side.querySelectorAll('[data-img]').forEach(b=>b.onclick=()=>lightbox(b.dataset.img,b.dataset.cap));
 const cp=$('#cp');if(cp)cp.onclick=()=>{try{navigator.clipboard.writeText(location.href);cp.textContent='Link copied'}catch(e){cp.textContent='Copy from the address bar'}};
 if(!keep||true)centerOn(i.l+i.w/2,i.t+i.h/2,Math.max(s,mobile()?.4:.5));drawMM()}
function lightbox(src,cap){$('#lbi').src=src;$('#lbc').textContent=cap;$('#lb').style.display='flex'}
$('#lb').onclick=()=>$('#lb').style.display='none';
/* ---------- search ---------- */
q.addEventListener('input',()=>{const v=q.value.trim().toLowerCase();res.innerHTML='';if(v.length<2){res.style.display='none';return}
 const m=idx.filter(i=>i.name.toLowerCase().includes(v)).slice(0,12);res.style.display='block';
 if(!m.length){res.innerHTML='<button type="button" disabled>No one by that name</button>';return}
 m.forEach(i=>{const b=document.createElement('button');b.type='button';b.innerHTML=esc(i.name)+(i.yrs?`<small>${esc(i.yrs)}</small>`:'');b.onclick=()=>{res.style.display='none';q.value='';select(i)};res.appendChild(b)})});
q.addEventListener('keydown',e=>{if(e.key==='Enter'){const b=res.querySelector('button:not([disabled])');if(b)b.click()}if(e.key==='Escape'){res.style.display='none';q.blur()}});
document.addEventListener('click',e=>{if(!e.target.closest('#res,#q'))res.style.display='none'});
/* ---------- chips ---------- */
document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{branch=c.dataset.b;document.querySelectorAll('.chip').forEach(k=>k.setAttribute('aria-pressed',k===c));idx.forEach(i=>i.el.style.opacity=(!branch||i.br===branch)?'':'.16');drawMM()});
/* ---------- buttons, keys ---------- */
$('#zi').onclick=()=>{const r=box();zoomAt(1.4,r.width/2,r.height/2)};$('#zo').onclick=()=>{const r=box();zoomAt(1/1.4,r.width/2,r.height/2)};$('#zf').onclick=()=>{closeSide();fit()};
$('#zh').onclick=()=>{const m=find('Ross Aaron Bessinger');if(m)select(m)};
$('#bq').onclick=()=>{if(side.classList.contains('open')&&side.querySelector('h2')&&side.querySelector('h2').textContent.startsWith('Help')){closeSide();return}
 if(sel){sel.el.classList.remove('found');sel=null}openSide($('#helpT').innerHTML);history.replaceState(null,'',location.pathname)};
$('#wgo').onclick=()=>{$('#wel').classList.remove('on');try{localStorage.setItem('seen','1')}catch(e){}};
document.addEventListener('keydown',e=>{if(e.target===q)return;if(e.key==='+'||e.key==='=')$('#zi').click();else if(e.key==='-')$('#zo').click();else if(e.key==='0')$('#zf').click();else if(e.key==='/'){e.preventDefault();q.focus()}else if(e.key==='Escape'){$('#lb').style.display='none';closeSide()}
 else if(e.key.startsWith('Arrow')&&document.activeElement===vp){e.preventDefault();const d=80;if(e.key==='ArrowLeft')x+=d;if(e.key==='ArrowRight')x-=d;if(e.key==='ArrowUp')y+=d;if(e.key==='ArrowDown')y-=d;apply()}});
addEventListener('resize',()=>{if(!sel)fit();else drawMM()});
})();
