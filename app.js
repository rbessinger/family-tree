(()=>{
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
let T,D,P,COL,me=LS.get('me'),NAME=[],REL={};
const ICON={home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',tree:'<circle cx="12" cy="4" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><circle cx="12" cy="12" r="2.2"/><path d="M12 6v4M12 14v1M10 13l-4 4M14 13l4 4"/>',people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-4 3-6 6.5-6s6.5 2 6.5 6"/><circle cx="17.5" cy="9" r="2.6"/><path d="M17 14c3 0 4.8 1.6 4.8 5"/>',stories:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v13"/>',scans:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 17l5-4 4 3 3-2 6 4"/>'};
const TABS=[['home','Home'],['tree','Tree'],['people','People'],['stories','Stories'],['scans','Scans']];
$('#tabs').innerHTML=TABS.map(([k,l])=>`<a href="#/${k}" data-t="${k}"><svg viewBox="0 0 24 24">${ICON[k]}</svg>${l}</a>`).join('');
function setFS(n){document.documentElement.dataset.fs=n;LS.set('fs',n)}setFS(LS.get('fs')||'0');
const nz=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const col=id=>(T.cols[P[id].b]||'#6f6458');
const first=id=>P[id].n.split(' ')[0];
const GEN={};
function gone(id){const p=P[id];if(p.dead)return 1;if(p.y&&p.y[0]&&p.y[0]<1930)return 1;
 const g=GEN[id];const kids=(p.ch||[]).map(c=>P[c]).filter(Boolean),sp=(p.sp||[]).map(c=>P[c]).filter(Boolean);
 if(g!=null&&g<=2)return 1;
 if(kids.some(k=>k.y&&k.y[0]&&k.y[0]<1935))return 1;
 if(sp.some(k=>k.dead&&k.y&&k.y[0]&&k.y[0]<1930))return 1;
 return 0}
const fam=p=>p.b==='root'?'Bessinger':p.b==='W'?'Siegel':p.b;
function yrs(id){const p=P[id];if(!p.dead&&gone(id)&&!(p.y&&p.y[0]))return 'Deceased, dates not recorded';if(!p.dead&&!p.y&&GEN[id]===3)return 'Dates not recorded';if(!p.dead||!p.y)return p.dead?'':'Living';const[b,d,a]=p.y;return(b?(a?'c. ':'')+b:'?')+'–'+(d||'?')}
function place(id){return P[id].bp||''}
/* ---------- relationships ---------- */
const anc=id=>{const m={[id]:0};let fr=[id];for(let d=1;fr.length&&d<12;d++){const nx=[];for(const x of fr)for(const p of P[x].par)if(!(p in m)){m[p]=d;nx.push(p)}fr=nx}return m};
const ord=n=>['','first','second','third','fourth','fifth','sixth','seventh','eighth'][n]||n+'th';
const gr=n=>n<=0?'':n<=2?'great-'.repeat(n):ord(n)+' great-';
function blood(a,b){const A=anc(a),B=anc(b);let best=null;for(const x in A)if(x in B){const t=A[x]+B[x];if(!best||t<best.t)best={t,da:A[x],db:B[x],x}}return best}
function lab(da,db,s){const m=s==='M',f=s==='F',g=(x,y)=>m?x:f?y:x+'/'+y;
 if(!da&&!db)return'you';
 if(!db){return da===1?g('father','mother'):da===2?g('grandfather','grandmother'):gr(da-2)+g('grandfather','grandmother')}
 if(!da){return db===1?g('son','daughter'):db===2?g('grandson','granddaughter'):gr(db-2)+g('grandson','granddaughter')}
 if(da===1&&db===1)return g('brother','sister');
 if(da===1)return db===2?g('nephew','niece'):(db===3?'grand':gr(db-3)+'grand')+g('nephew','niece');
 if(db===1)return da===2?g('uncle','aunt'):gr(da-2)+g('uncle','aunt');
 const k=Math.min(da,db)-1,r=Math.abs(da-db);return ord(k)+' cousin'+(r?(r===1?' once removed':r===2?' twice removed':' '+r+' times removed'):'')}
function relRaw(a,b){let out='';
 if(a===b)return'you';const bl=blood(a,b);
 if(bl)out=lab(bl.da,bl.db,P[b].s);
 else if(P[a].sp.includes(b))out=P[b].s==='M'?'husband':'wife';
 else{for(const s of P[b].sp){const x=blood(a,s);if(x){out=lab(x.da,x.db,P[s].s)+"'s "+(P[b].s==='M'?'husband':'wife');break}}
  if(!out)for(const s of P[a].sp){const x=blood(s,b);if(x){out=(P[s].s==='M'?'husband':'wife')+"'s "+lab(x.da,x.db,P[b].s);break}}}
 return out}
function relOf(a,b){const k=a+'>'+b;if(k in REL)return REL[k];const r=relRaw(a,b);return REL[k]=!r?'':r==='you'?'you':'your '+r}
function chain(a,x){const prev={[a]:null};let fr=[a];while(fr.length&&!(x in prev)){const nx=[];for(const i of fr)for(const p of P[i].par)if(!(p in prev)){prev[p]=i;nx.push(p)}fr=nx}const out=[];let c=x;while(c!=null&&c in prev){out.push(c);c=prev[c]}return out.reverse()}
function pathOf(a,b){if(P[a].sp.includes(b))return{ids:[a,b],top:null};const bl=blood(a,b);if(bl){const up=chain(a,bl.x),dn=chain(b,bl.x).reverse().slice(1);return{ids:[...up,...dn],top:bl.x,bl}}
 for(const s of [...P[b].sp]){const x=blood(a,s);if(x){const up=chain(a,x.x),dn=chain(s,x.x).reverse().slice(1);return{ids:[...up,...dn,b],top:x.x,bl:x}}}
 for(const s of [...P[a].sp]){const x=blood(s,b);if(x){const up=chain(s,x.x),dn=chain(b,x.x).reverse().slice(1);return{ids:[a,...up,...dn],top:x.x,bl:x}}}
 return null}
const rel=id=>me&&P[me]&&id!==me?relOf(me,id):'';
/* ---------- search & matching ---------- */
function find(q){q=nz(q);if(!q)return[];const t=q.split(' ');return NAME.filter(x=>t.every(w=>x.n.split(' ').some(v=>v.startsWith(w))||x.n.includes(w))).sort((a,b)=>(b.n.startsWith(q)-a.n.startsWith(q))||a.n.localeCompare(b.n)).slice(0,8).map(x=>x.id)}
const byName=nm=>{const t=nz(nm).split(' ');const f=t[0],l=t[t.length-1];return NAME.find(x=>{const w=x.n.split(' ');return w[0]===f&&w[w.length-1]===l})?.id};
const rx=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const MAT={};
function matchFor(id){if(MAT[id])return MAT[id];const w=P[id].n.split(/\s+/).filter(x=>/^[A-Za-z]/.test(x));const f=w[0],l=w[w.length-1];let st=[],ar=[];
 if(f&&l&&f!==l){const re=new RegExp('\\b'+rx(f)+'\\b[^.\\n]{0,28}\\b'+rx(l)+'\\b','i');
  st=D.order.filter(s=>D.stories[s].person_id===id||re.test(D.stories[s].full+' '+D.stories[s].text));
  ar=D.arts.filter(a=>re.test(a.title+' '+a.cap)||a.stories.some(s=>D.stories[s]&&D.stories[s].person_id===id))}
 else{st=D.order.filter(s=>D.stories[s].person_id===id);ar=D.arts.filter(a=>a.stories.some(s=>D.stories[s]&&D.stories[s].person_id===id))}
 return MAT[id]={st,ar}}
/* ---------- helpers ---------- */
const pbtn=(id,lab)=>`<a class="pbtn" style="--c:${col(id)}" href="#/p/${id}"><span><span class="lab">${lab||''}</span><b>${esc(P[id].n)}</b><span class="yrs">${yrs(id)}</span></span></a>`;
function modal(html,cls){const m=$('#modal');$('#mbox').className=cls||'';$('#mbox').innerHTML=html;m.classList.add('open');$('#mbox').scrollTop=0;const c=m.querySelector('[data-x]');c&&c.focus()}
function closeModal(){$('#modal').classList.remove('open')}
$('#modal').onclick=e=>{if(e.target.id==='modal'||e.target.closest('[data-x]'))closeModal()};
addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeSheet()}});
function lightbox(slug){const a=D.arts.find(x=>x.slug===slug);const lk=a.stories.filter(s=>D.stories[s]).map(s=>`<a class="btn sm" style="color:#fff;border-color:#fff" href="#/s/${s}" data-x>${esc(D.stories[s].title)}</a>`).join(' ');
 modal(`<button class="btn sm" data-x style="float:right;color:#fff;border-color:#fff">Close</button><img src="${slug}.jpg" alt="${esc(a.title)}"><h3>${esc(a.title)}</h3><p>${esc(a.cap)}</p><div class="row">${lk}</div>`,'lb')}
function menu(){modal(`<button class="btn sm x" data-x>Close</button><h2>Menu</h2><h3>Text size</h3><div class="seg" id="fsg">${['Normal','Large','Extra large'].map((l,i)=>`<button data-fs="${i}" aria-pressed="${(document.documentElement.dataset.fs||'0')==i}">${l}</button>`).join('')}</div>
<h3>Who are you?</h3><p class="lead">${me&&P[me]?'You are set as '+esc(P[me].n)+'.':'Pick your name and every page will say how you are related.'}</p><div class="row"><button class="btn" id="chg">${me?'Change my name':'Pick my name'}</button>${me?'<button class="btn" id="clr">Forget me</button>':''}</div>
<h3>More</h3><div class="row"><a class="btn" href="#/related//" id="mrel">How are two people related?</a><button class="btn" id="hlp">Help us solve these</button><a class="btn" href="tree.html">Original poster view</a><a class="btn" href="Our-Family-Tree-poster-36x48.pdf">Poster PDF</a></div>`);
 $('#fsg').onclick=e=>{const b=e.target.closest('[data-fs]');if(b){setFS(b.dataset.fs);$('#fsg').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))}};
 $('#chg').onclick=()=>{closeModal();location.hash='#/home';setTimeout(()=>$('#fi')&&$('#fi').focus(),200)};
 const c=$('#clr');if(c)c.onclick=()=>{me=null;LS.del('me');REL={};closeModal();chip();route()};
 $('#hlp').onclick=help;$('#mrel').onclick=()=>closeModal()}
function help(){modal(`<button class="btn sm x" data-x>Close</button><h2>Help us solve these</h2><p class="lead">Missing pieces on the tree. Even a guess or a half-memory helps. Tell Ross.</p>${D.help}`)}
$('#menuBtn').onclick=menu;
const ASK=window.ASK_URL||'';let AH=[];
if(ASK)$('#askBtn').classList.remove('hide');
const linkify=t=>esc(String(t).replace(/\[\[[^\]]*$/,'')).replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g,'$1<i>$2</i>').replace(/\[\[story:([a-z0-9-]+)\]\]/g,(m,s)=>D.stories[s]?`<a href="#/s/${s}" data-x>${esc(D.stories[s].title)}</a>`:'').replace(/\[\[([^\]]+)\]\]/g,(m,n)=>{const id=byName(n);return id?`<a href="#/p/${id}" data-x>${n}</a>`:n}).replace(/\n/g,'<br>');
function ask(){const eg=me&&P[me]?['How am I related to Marvin Schatzman?','Who in our family came from Poland?','What is the story of my grandparents?']:['Who is the oldest person on the tree?','Who came to America from Europe?','Tell me about the Baratz name change'];
 modal(`<button class="btn sm x" data-x>Close</button><h2>Ask about our family</h2><p class="lead">Answers come only from the stories and records on this site. If it is not here, it will say so.</p><div id="alog"></div><div class="row" id="aeg">${eg.map(e=>`<button class="fc" data-q="${esc(e)}">${esc(e)}</button>`).join('')}</div><div class="find"><input id="ain" class="search" type="text" maxlength="400" placeholder="Type your question" aria-label="Your question"></div><button class="btn pri" id="asend" style="width:100%">Ask</button>`);
 const log=$('#alog'),inp=$('#ain');
 const go=async q=>{q=q.trim();if(!q||inp.disabled)return;const eg0=$('#aeg');if(eg0)eg0.remove();inp.value='';inp.disabled=true;$('#asend').disabled=true;log.insertAdjacentHTML('beforeend',`<p><b>You:</b> ${esc(q)}</p><p id="aw" class="lead">Thinking…</p>`);
  try{const r=await fetch(ASK,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({q,h:AH,meId:me&&P[me]?me:''})});const j=await r.json();$('#aw').remove();log.insertAdjacentHTML('beforeend',`<div class="card" style="--c:#C9962B"><span class="kick">Answer</span><div style="font-size:1.02rem;line-height:1.55;margin-top:6px">${linkify(j.answer||'No answer.')}</div>${j.looked&&j.looked.length?`<div class="looked"><b>Where this came from:</b> ${j.looked.map(esc).join(' · ')}</div>`:''}</div>`);AH.push({role:'user',content:q},{role:'assistant',content:j.answer||''});AH=AH.slice(-8)}catch(e){$('#aw').remove();log.insertAdjacentHTML('beforeend','<p class="lead">Could not reach the helper. Please try again.</p>')}
  inp.disabled=false;$('#asend').disabled=false;inp.placeholder='Ask a follow-up question';inp.focus({preventScroll:true});$('#mbox').scrollTop=$('#mbox').scrollHeight};
 $('#asend').onclick=()=>go(inp.value);inp.onkeydown=e=>{if(e.key==='Enter')go(inp.value)};$('#aeg').onclick=e=>{const b=e.target.closest('[data-q]');if(b)go(b.dataset.q)};setTimeout(()=>inp.focus(),80)}
$('#askBtn').onclick=ask;
function chip(){const c=$('#meChip');if(me&&P[me]){c.textContent=first(me);c.classList.remove('hide')}else c.classList.add('hide')}
$('#meChip').onclick=()=>{location.hash='#/p/'+me};
function setMe(id){me=id;LS.set('me',id);REL={};chip()}
/* ---------- views ---------- */
function findBox(inputId,resId,onPick){const i=$('#'+inputId),r=$('#'+resId);i.oninput=()=>{const ids=find(i.value);r.innerHTML=ids.length?`<div class="res">${ids.map(id=>`<button data-id="${id}"><span>${esc(P[id].n)}</span><small>${yrs(id)}</small></button>`).join('')}</div>`:(i.value.trim()?'<div class="res"><button disabled>No match. Try just a last name.</button></div>':'')};
 r.onclick=e=>{const b=e.target.closest('[data-id]');if(b)onPick(b.dataset.id)}}
function home(v){const q=D.stories?Object.keys(D.stories).length:0;
 v.innerHTML=`<section class="hero"><h1>${me&&P[me]?'Welcome back, '+esc(first(me)):'Welcome to our family tree'}</h1><p class="lead">${P?Object.keys(P).length:0} people, four families, one big story. ${me&&P[me]?'':'Start by finding your name.'}</p></section>
${me&&P[me]?`<div class="row"><a class="btn pri" href="#/p/${me}">My page</a><a class="btn" href="#/tree/${me}">My family tree</a></div><h3 style="margin-top:22px">Look up someone else</h3>`:'<h3>Find your name</h3>'}
<div class="find"><input id="fi" class="search" type="search" placeholder="Type your first or last name" autocomplete="off" aria-label="Find a person"><div id="fr"></div></div>
<div class="tiles"><a class="tile" style="--c:#3D6B4F" href="#/related/${me&&P[me]?me:''}/"><b>How are we related?</b><span>Pick any two people</span></a><a class="tile" style="--c:#2D5B63" href="#/tree"><b>Explore the tree</b><span>Drag, pinch and tap</span></a><a class="tile" style="--c:#9C4A2B" href="#/people"><b>Everyone</b><span>${Object.keys(P).length} people A to Z</span></a><a class="tile" style="--c:#A87A1F" href="#/stories"><b>Stories</b><span>${q} life stories</span></a><a class="tile" style="--c:#6A4A7E" href="#/scans"><b>Scans</b><span>${D.arts.length} photos and clippings</span></a></div>
<button class="btn" id="hh" style="width:100%">Help us solve these missing pieces</button>`;
 findBox('fi','fr',id=>{if(!me||confirm_me(id))location.hash='#/p/'+id});$('#hh').onclick=help}
const confirm_me=()=>true;
function related(v,a,b){a=P[a]?a:(me&&P[me]?me:'');b=P[b]?b:'';
 v.innerHTML=`<h1>How are they related?</h1><p class="lead">Pick two people and see the connection.</p>
 <h3>First person</h3><div id="ra"></div><div class="find"><input id="rfa" class="search" type="search" placeholder="Type a name" autocomplete="off"><div id="rra"></div></div>
 <h3>Second person</h3><div id="rb"></div><div class="find"><input id="rfb" class="search" type="search" placeholder="Type a name" autocomplete="off"><div id="rrb"></div></div><div id="rout"></div>`;
 const chipH=id=>id?`<div class="row"><a class="pbtn" style="--c:${col(id)}" href="#/p/${id}"><span><b>${esc(P[id].n)}</b><span class="yrs">${yrs(id)}</span></span></a></div>`:'';
 $('#ra').innerHTML=chipH(a);$('#rb').innerHTML=chipH(b);
 const go=(x,y)=>{location.hash='#/related/'+(x||'')+'/'+(y||'')};
 findBox('rfa','rra',id=>go(id,b));findBox('rfb','rrb',id=>go(a,id));
 if(a&&b){const nm=id=>id===me?'You':P[id].n,r=relRaw(a,b),pa=pathOf(a,b);let h='';
  if(a===b)h='<div class="rel big">That is the same person.</div>';
  else if(!r)h=`<div class="rel big">No family connection found in this tree between ${esc(P[a].n)} and ${esc(P[b].n)}.</div>`;
  else{const A=a===me?'your':first(a)+"'s";h=`<div class="rel big"><b>${esc(P[b].n)}</b> is ${esc(A)} <b>${esc(r)}</b>.</div>`}
  if(pa&&pa.ids.length>1){const t=pa.top;h+=`<h3>The path</h3><div class="path">${pa.ids.map((id,i)=>`<a class="pbtn" style="--c:${col(id)}" href="#/p/${id}"><span><span class="lab">${i===0?'Start':i===pa.ids.length-1?'End':id===t?'Shared ancestor':''}</span><b>${esc(P[id].n)}</b><span class="yrs">${yrs(id)}</span></span></a>`).join('<div class="arrow">&darr;</div>')}</div>`}
  $('#rout').innerHTML=h}
 else $('#rout').innerHTML=a||b?'<p class="lead" style="margin-top:14px">Now pick the other person.</p>':''}
function personPage(v,id){const p=P[id];if(!p){v.innerHTML='<p>Person not found.</p>';return}const m=matchFor(id),r=rel(id),sib=[...new Set(p.par.flatMap(x=>P[x].ch))].filter(x=>x!==id);
 const sec=(t,items)=>items.length?`<h2>${t}</h2>${items.join('')}`:'';
 v.innerHTML=`<div class="pname" style="--c:${col(id)}"><span class="kick">${esc(p.b==='root'?'Our family':p.b==='W'?'Siegel family':p.b+' branch')}</span><h1>${esc(p.n)}</h1><div class="yrs">${yrs(id)}${place(id)?' · born in '+esc(place(id)):''}</div>${r?`<div class="rel">${esc(r[0].toUpperCase()+r.slice(1))}</div>`:''}</div>
<div class="row"><a class="btn pri" href="#/tree/${id}">See on the tree</a>${me===id?'<span class="btn" style="border-style:dashed">This is you</span>':`<button class="btn" id="im">This is me</button>`}<a class="btn" href="#/related/${id}/">How are they related to...</a></div>
${!me?'<p class="lead" style="margin:10px 0 0">Tap <b>This is me</b> and every page will say how this person is related to you.</p>':''}
${p.fl?`<div class="flag"><b>Note</b> ${esc(p.fl)}</div>`:''}${p.f?`<h2>Facts and sources</h2><dl class="facts">${p.f.map(([a,b,c])=>`<dt>${esc(a)}</dt><dd>${esc(b)}<span class="src">Source: ${esc(c)}</span></dd>`).join('')}</dl>`:''}
${p.q?`<div class="q"><b>Help us solve this</b><br>${esc(p.q)} If you know, tell Ross.</div>`:''}
${sec('Parents',p.par.map(x=>pbtn(x,P[x].s==='M'?'Father':P[x].s==='F'?'Mother':'Parent')))}
${sec(p.sp.length>1?'Spouses':'Spouse',p.sp.map(x=>pbtn(x,P[x].s==='M'?'Husband':'Wife')))}
${sec('Children',p.ch.map(x=>pbtn(x,P[x].s==='M'?'Son':'Daughter')))}
${sec('Siblings',sib.map(x=>pbtn(x,P[x].s==='M'?'Brother':'Sister')))}
${m.st.length?`<h2>Stories</h2>${m.st.map(s=>storyCard(s)).join('')}`:''}
${m.ar.length?`<h2>Scans and photos</h2><div class="grid">${m.ar.map(a=>thumb(a)).join('')}</div>`:''}`;
 const b=$('#im');if(b)b.onclick=()=>{setMe(id);personPage(v,id);scrollTo(0,0)};bindThumbs(v)}
const thumb=a=>`<button class="thumb" data-lb="${a.slug}"><img loading="lazy" src="${a.slug}.jpg" alt="${esc(a.title)}"><span>${esc(a.title)}</span></button>`;
const bindThumbs=v=>v.querySelectorAll('[data-lb]').forEach(b=>b.onclick=()=>lightbox(b.dataset.lb));
const bcol=b=>COL[b]||'#6f6458';
const storyCard=s=>{const x=D.stories[s];return`<a class="card" style="--c:${bcol(x.branch.split(' and ')[0].split(' ')[0])}" href="#/s/${s}"><b>${esc(x.title)}</b><span>${esc(x.branch)} · ${Math.max(1,Math.round(x.words/200))} min read</span></a>`};
function people(v){const ids=Object.keys(P).sort((a,b)=>{const la=P[a].n.split(' ').pop(),lb=P[b].n.split(' ').pop();return la.localeCompare(lb)||P[a].n.localeCompare(P[b].n)});let br='';
 v.innerHTML=`<h1>People</h1><input id="pq" class="search" type="search" placeholder="Search ${ids.length} people" aria-label="Search people"><div class="chips" id="pc">${['All','Bessinger','Schatzman','Siegel','Baratz'].map((x,i)=>`<button class="fc" data-b="${i?x:''}" aria-pressed="${!i}">${x} (${i?ids.filter(k=>fam(P[k])===x).length:ids.length})</button>`).join('')}</div><p class="lead" id="pcount"></p><div id="pl"></div>`;
 const draw=()=>{const q=nz($('#pq').value).split(' ').filter(Boolean);const out=[];let L='',n=0;for(const id of ids){const p=P[id];if(br&&fam(p)!==br)continue;const nm=nz(p.n);if(q.length&&!q.every(w=>nm.includes(w)))continue;const l=p.n.split(' ').pop()[0].toUpperCase();if(l!==L){L=l;out.push(`<div class="letter">${l}</div>`)}n++;const r=rel(id);out.push(`<a class="pbtn" style="--c:${col(id)}" href="#/p/${id}"><span><b>${esc(p.n)}</b><span class="yrs">${yrs(id)}${r?' · '+esc(r):''}</span></span></a>`)}$('#pl').innerHTML=out.join('');$('#pcount').textContent=n+' shown'};
 $('#pq').oninput=draw;$('#pc').onclick=e=>{const b=e.target.closest('[data-b]');if(!b)return;br=b.dataset.b;$('#pc').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw()};draw()}
function stories(v){const gs={};D.order.forEach(s=>(gs[D.stories[s].branch]=gs[D.stories[s].branch]||[]).push(s));
 v.innerHTML=`<h1>Stories</h1><p class="lead">Life stories from records, scans and family calls. Where relatives disagree or a fact is unproven, the story says so.</p><input id="sq" class="search" type="search" placeholder="Search stories" aria-label="Search stories"><div id="sl"></div><p class="lead" style="margin-top:28px">Stories about people who are still living are not on this site.</p>`;
 const draw=()=>{const q=nz($('#sq').value);$('#sl').innerHTML=Object.entries(gs).map(([b,l])=>{const k=l.filter(s=>!q||nz(D.stories[s].full+' '+D.stories[s].text).includes(q));return k.length?`<h2>${esc(b)}</h2>${k.map(storyCard).join('')}`:''}).join('')||'<p class="lead">No stories match.</p>'};$('#sq').oninput=draw;draw()}
function story(v,s){const x=D.stories[s];if(!x){v.innerHTML='<p>Story not found.</p>';return}const i=D.order.indexOf(s),pr=D.order[i-1],nx=D.order[i+1],pid=x.person_id;const ar=D.arts.filter(a=>a.stories.includes(s));
 v.innerHTML=`<span class="kick" style="--c:${bcol(x.branch.split(' ')[0])}">${esc(x.branch)}</span><h1>${esc(x.full)}</h1><div class="row">${pid?`<a class="btn pri" href="#/tree/${pid}">Find on the tree</a>`:''}<a class="btn" href="#/stories">All stories</a></div><article class="read">${x.html}</article>${ar.length?`<h2>Related scans</h2><div class="grid">${ar.map(thumb).join('')}</div>`:''}<div class="pn">${pr?`<a class="btn" href="#/s/${pr}">&larr; ${esc(D.stories[pr].title)}</a>`:'<span></span>'}${nx?`<a class="btn" href="#/s/${nx}">${esc(D.stories[nx].title)} &rarr;</a>`:''}</div>`;bindThumbs(v)}
function scans(v){let k='';v.innerHTML=`<h1>Scans and photos</h1><p class="lead">${D.arts.length} items. Tap any picture to enlarge.</p><input id="aq" class="search" type="search" placeholder="Search scans" aria-label="Search scans"><div class="chips" id="ac"><button class="fc" data-k="" aria-pressed="true">All</button>${Object.entries(D.cats).map(([c,l])=>`<button class="fc" data-k="${c}" aria-pressed="false">${l}</button>`).join('')}</div><div class="grid" id="ag"></div>
<h2 style="margin-top:34px">Also saved on Ancestry</h2><p class="lead">These record images belong to Ancestry, so they are listed here as citations only. Ask Ross to show them.</p><ul class="cites">${D.cites.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`;
 const draw=()=>{const q=nz($('#aq').value);$('#ag').innerHTML=D.arts.filter(a=>(!k||a.cat===k)&&(!q||nz(a.title+' '+a.cap).includes(q))).map(thumb).join('');bindThumbs($('#ag'))};
 $('#aq').oninput=draw;$('#ac').onclick=e=>{const b=e.target.closest('[data-k]');if(!b)return;k=b.dataset.k;$('#ac').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));draw()};draw()}
/* ---------- sheet ---------- */
let selId=null;
function openSheet(id){selId=id;const p=P[id],m=matchFor(id),r=rel(id);const s=$('#sheet');
 s.innerHTML=`<div class="grab"></div><button class="btn sm x" id="sx">Close</button><span class="kick" style="--c:${col(id)}">${esc(p.b==='root'?'Our family':p.b==='W'?'Siegel family':p.b)}</span><h2>${esc(p.n)}</h2><div class="yrs">${yrs(id)}${place(id)?' · born in '+esc(place(id)):''}</div>${r?`<div class="rel" style="--c:${col(id)}">${esc(r[0].toUpperCase()+r.slice(1))}</div>`:''}
 ${!r&&!me?'<div class="rel" style="--c:#6b6254;font-weight:600">Tap Open full page, then This is me, to see how they are related to you.</div>':''}<div class="row"><a class="btn pri" href="#/p/${id}">Open full page</a><a class="btn" href="#/related/${id}/">Compare with...</a>${id!==focusId?'<button class="btn" id="ctr">Show their family</button>':''}</div>
 ${m.st.length?`<h3>Stories</h3>${m.st.slice(0,4).map(storyCard).join('')}`:''}${m.ar.length?`<h3>Scans</h3><div class="grid">${m.ar.slice(0,4).map(thumb).join('')}</div>`:''}${p.q?`<div class="q">${esc(p.q)}</div>`:''}`;
 s.classList.add('open');$('#sx').onclick=closeSheet;const c=$('#ctr');if(c)c.onclick=()=>{closeSheet();location.hash='#/tree/'+id};bindThumbs(s);document.querySelectorAll('.tc.sel').forEach(x=>x.classList.remove('sel'));const el=document.querySelector(`.tc[data-id="${id}"]`);el&&el.classList.add('sel')}
function closeSheet(){$('#sheet').classList.remove('open');selId=null;document.querySelectorAll('.tc.sel').forEach(x=>x.classList.remove('sel'))}
/* ---------- tree ---------- */
let focusId=null,mode='both',S=1,TX=0,TY=0,NODES=[],BB=null;
const CW=176,CH=78,GX=22,GY=64,SX=CW+GX,SY=CH+GY;
function tidy(n){n.ko=[];if(!n.kids.length){n.c=[[0,0]];return}
 n.kids.forEach(tidy);let acc=[],off=[];
 n.kids.forEach((k,i)=>{let o=0;if(i){o=-1e9;for(let d=0;d<k.c.length&&d<acc.length;d++)o=Math.max(o,acc[d][1]+1-k.c[d][0]);if(o<-1e8)o=acc[0][1]+1-k.c[0][0]}
  off.push(o);k.c.forEach((r,d)=>{const l=r[0]+o,rr=r[1]+o;if(acc[d])acc[d]=[Math.min(acc[d][0],l),Math.max(acc[d][1],rr)];else acc[d]=[l,rr]})});
 const mid=(off[0]+off[off.length-1])/2;n.ko=off.map(o=>o-mid);n.c=[[0,0],...acc.map(r=>[r[0]-mid,r[1]-mid])]}
function placeT(n,x){n.x=x;n.kids.forEach((k,i)=>placeT(k,x+n.ko[i]))}
function layout(fid,md){const maxA=md==='desc'?0:md==='anc'?6:3,maxD=md==='anc'?0:md==='desc'?4:2;const nodes=[],edges=[];
 const sortP=a=>[...a].sort((x,y)=>(P[x].s==='M'?0:1)-(P[y].s==='M'?0:1));
 function up(id,d){const n={id,d,kids:[]};if(d<maxA){const ps=sortP(P[id].par);n.kids=ps.map(x=>up(x,d+1));if(!ps.length&&P[id].q)n.kids=[{ghost:P[id].q,d:d+1,kids:[]}]}return n}
 const yb=id=>P[id].y?P[id].y[0]||9999:9999;
 function down(id,d){const n={id,d,kids:[]};if(d<maxD)n.kids=[...P[id].ch].sort((a,b)=>yb(a)-yb(b)).map(x=>down(x,d+1));return n}
 const A=up(fid,0),Dn=down(fid,0);tidy(A);tidy(Dn);placeT(A,0);placeT(Dn,0);
 const walk=(n,sgn,top)=>{for(const k of n.kids){const x=n.x*SX,y=sgn*n.d*SY,kx=k.x*SX,ky=sgn*k.d*SY;if(top||!k.dup){nodes.push({id:k.id,ghost:k.ghost,x:kx,y:ky});edges.push([x,sgn<0?y-CH/2:y+CH/2,kx,sgn<0?ky+CH/2:ky-CH/2,k.ghost?1:0])}walk(k,sgn,1)}};
 nodes.push({id:fid,x:0,y:0});walk(A,-1,1);walk(Dn,1,1);
 P[fid].sp.forEach((s,i)=>{nodes.push({id:s,x:(i+1)*SX,y:0});edges.push([CW/2,0,(i+1)*SX-CW/2,0,2])});
 return{nodes,edges,fx:0}}
function layoutAll(){const pos={},nodes=[],edges=[],KX=3.5,RY=CH+96;
 T.lay.b.forEach(([id,d,b,k,t])=>{const x=b*KX,y=d*RY;pos[id]={x,y};nodes.push(k==='q'?{ghost:t,x,y,qid:id}:{id,x,y})});
 T.lay.e.forEach(([ps,ks,dash])=>{const pp=ps.map(i=>pos[i]).filter(Boolean),kk=ks.map(i=>pos[i]).filter(Boolean);if(!pp.length||!kk.length)return;
  const py=pp[0].y,px=pp.reduce((a,p)=>a+p.x,0)/pp.length,by=py+CH/2+(RY-CH)/2;
  if(pp.length>1){const xs=pp.map(p=>p.x);edges.push({pts:[[Math.min(...xs),py],[Math.max(...xs),py]],k:dash})}
  edges.push({pts:[[px,pp.length>1?py:py+CH/2],[px,by]],k:dash});const xs=kk.map(p=>p.x).concat([px]);edges.push({pts:[[Math.min(...xs),by],[Math.max(...xs),by]],k:dash});
  kk.forEach(p=>edges.push({pts:[[p.x,by],[p.x,p.y-CH/2]],k:dash}))});
 return{nodes,edges,pos}}
function tree(v,id){id=id||me||T.me;if(!P[id])id=T.me;focusId=id;v.classList.add('tree');
 v.innerHTML=`<div id="tv"><div id="tmodes">${[['all','Whole tree'],['both','Family'],['anc','Ancestors'],['desc','Descendants']].map(([k,l])=>`<button data-m="${k}" aria-pressed="${k===mode}">${l}</button>`).join('')}<button id="tfind">Find…</button></div>${mode==='all'?'<div id="tbr"></div>':''}<div id="world"></div><canvas id="mm" width="300" height="220"></canvas><div id="thint">${mode==='all'?'Jump to a branch above · drag to move · pinch to zoom':'Pinch to zoom in · drag to move · tap a person'}</div><div id="tctl"><button id="zi" aria-label="Zoom in">+</button><button id="zo" aria-label="Zoom out">&minus;</button><button id="zf" aria-label="Show everything">&#x26F6;</button><button id="zc" aria-label="Center on ${esc(first(id))}">&#9678;</button></div></div>`;
 const tv=$('#tv'),w=$('#world');const ALL=mode==='all';const L=ALL?layoutAll():layout(id,mode);const{nodes,edges}=L;NODES=nodes;
 let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;nodes.forEach(n=>{minx=Math.min(minx,n.x-CW/2);maxx=Math.max(maxx,n.x+CW/2);miny=Math.min(miny,n.y-CH/2);maxy=Math.max(maxy,n.y+CH/2)});BB={minx,maxx,miny,maxy};
 const pad=60;w.style.width=(maxx-minx+2*pad)+'px';w.style.height=(maxy-miny+2*pad)+'px';const ox=-minx+pad,oy=-miny+pad;
 const path=e=>{if(e.pts){return`<path d="M${e.pts.map(p=>(p[0]+ox)+' '+(p[1]+oy)).join('L')}" stroke="${e.k?'#b45309':'#8d8272'}" stroke-width="2.5" ${e.k?'stroke-dasharray="6 5"':''} fill="none"/>`}const[x1,y1,x2,y2,k]=e;const X1=x1+ox,Y1=y1+oy,X2=x2+ox,Y2=y2+oy;if(k===2)return`<path d="M${X1} ${Y1}H${X2}" stroke="#8a5f0c" stroke-width="3" fill="none"/>`;const my=(Y1+Y2)/2;return`<path d="M${X1} ${Y1}V${my}H${X2}V${Y2}" stroke="${k?'#b45309':'#8d8272'}" stroke-width="2.5" ${k?'stroke-dasharray="6 5"':''} fill="none"/>`};
 w.innerHTML=`<svg width="${maxx-minx+2*pad}" height="${maxy-miny+2*pad}">${edges.map(path).join('')}</svg>`+nodes.map(n=>{const left=n.x+ox-CW/2,top=n.y+oy-CH/2;if(n.ghost)return`<div class="tc ghost" style="left:${left}px;top:${top}px;--c:#b45309"><b>? ${esc(n.ghost)}</b></div>`;const m=matchFor(n.id),bd=m.ar.length+m.st.length;return`<button class="tc${n.id===id?' focus':''}" data-id="${n.id}" style="left:${left}px;top:${top}px;--c:${col(n.id)}"><b>${esc(P[n.id].n)}</b><small>${yrs(n.id)}</small>${bd?`<span class="bd">&#128247; ${bd}</span>`:''}</button>`}).join('');
 const vw=()=>tv.clientWidth,vh=()=>tv.clientHeight,TOP=ALL?112:60;const fnode=nodes.find(n=>n.id===id)||nodes[0];const fpos={x:fnode.x+ox,y:fnode.y+oy};
 const apply=()=>{w.style.transform=`translate(${TX}px,${TY}px) scale(${S})`;mm()};
 const center=(sc)=>{if(ALL&&!sc){const ww=maxx-minx+2*pad,hh=maxy-miny+2*pad;if(Math.min(vw()/ww,(vh()-TOP)/hh)<.12&&!window._fitAll){center(.4);return}fit();return}if(ALL){S=sc;TX=vw()/2-fpos.x*S;TY=(vh()+TOP)/2-fpos.y*S;apply();return}const near=nodes.filter(n=>Math.abs(n.y)<=SY);let a=1e9,b=-1e9,c=1e9,d=-1e9;near.forEach(n=>{a=Math.min(a,n.x-CW/2);b=Math.max(b,n.x+CW/2);c=Math.min(c,n.y-CH/2);d=Math.max(d,n.y+CH/2)});S=sc||Math.max(.62,Math.min(1,(vw()-20)/(b-a),(vh()-110)/(d-c)));TX=vw()/2-((a+b)/2+ox)*S;TY=(vh()+60)/2-((c+d)/2+oy)*S;apply()};
 const fit=()=>{const ww=maxx-minx+2*pad,hh=maxy-miny+2*pad;S=Math.min(vw()/ww,(vh()-TOP)/hh,1);TX=(vw()-ww*S)/2;TY=TOP+((vh()-TOP)-hh*S)/2;apply()};
 const zoomAt=(f,cx,cy)=>{const ns=Math.max(.015,Math.min(2.2,S*f));TX=cx-(cx-TX)*ns/S;TY=cy-(cy-TY)*ns/S;S=ns;apply()};
 function mm(){const c=$('#mm');if(!c||!c.offsetParent)return;const ww=maxx-minx+2*pad,hh=maxy-miny+2*pad;const nh=Math.max(60,Math.min(220,Math.round((c.width-8)*hh/ww)+8));if(c.height!==nh)c.height=nh;const g=c.getContext('2d'),W=c.width,H=c.height;g.clearRect(0,0,W,H);const k=Math.min((W-8)/ww,(H-8)/hh);g.fillStyle='#8d8272';nodes.forEach(n=>{g.fillStyle=n.id===id?'#C9962B':'#8d8272';g.fillRect(4+(n.x+ox-CW/2)*k,4+(n.y+oy-CH/2)*k,Math.max(3,CW*k),Math.max(2,CH*k))});g.strokeStyle='#1f5fbf';g.lineWidth=3;g.strokeRect(4+(-TX/S)*k,4+(-TY/S)*k,vw()/S*k,vh()/S*k);c._k=k}
 const mmgo=e=>{const c=$('#mm'),r=c.getBoundingClientRect(),k=c._k||1,px=(e.clientX-r.left)*c.width/r.width,py=(e.clientY-r.top)*c.height/r.height;TX=vw()/2-((px-4)/k)*S;TY=vh()/2-((py-4)/k)*S;apply()};$('#mm').onpointerdown=e=>{stopInertia();e.target.setPointerCapture(e.pointerId);e.target._d=1;mmgo(e)};$('#mm').onpointermove=e=>{if(e.target._d)mmgo(e)};$('#mm').onpointerup=e=>{e.target._d=0};
 let raf=0;const stopInertia=()=>{cancelAnimationFrame(raf);raf=0};
 const goBox=(a,b,c,d)=>{S=vw()<900?.55:.7;TX=14-(a+ox)*S;TY=TOP+14-(c+oy)*S;apply()};
 const br=$('#tbr');if(br){const names=[...new Set(nodes.map(n=>n.id&&P[n.id].b).filter(b=>b&&b!=='root'&&b!=='W'))];
  const lab=b=>b+(b==='Siegel'?' side':'');br.innerHTML=`<button data-b="*">Everyone</button><button data-b="@">Me</button>`+names.map(b=>`<button data-b="${esc(b)}" style="--c:${COL[b]||COL[b.split(' ')[0]]||'#8d8272'}">${esc(lab(b))}</button>`).join('');
  br.onclick=e=>{const k=e.target.closest('[data-b]');if(!k)return;stopInertia();const b=k.dataset.b;if(b==='*'){fit();return}if(b==='@'){center(.9);return}
   const ns=nodes.filter(n=>n.id&&(P[n.id].b===b||(b==='Siegel'&&P[n.id].b==='W')));if(!ns.length)return;
   goBox(Math.min(...ns.map(n=>n.x-CW/2)),Math.max(...ns.map(n=>n.x+CW/2)),Math.min(...ns.map(n=>n.y-CH/2)),Math.max(...ns.map(n=>n.y+CH/2)))}}
 const pts=new Map();let st=null,moved=0,lv={x:0,y:0,t:0};
 tv.onpointerdown=e=>{if(e.target.closest('#tctl,#tmodes,#tbr,#mm'))return;stopInertia();lv={x:0,y:0,t:performance.now()};tv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;st={tx:TX,ty:TY,x:e.clientX,y:e.clientY,d:0,s:S};if(pts.size===2){const[a,b]=[...pts.values()];st.d=Math.hypot(a[0]-b[0],a[1]-b[1])}$('#thint').style.opacity=0};
 tv.onpointermove=e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const[a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]),r=tv.getBoundingClientRect();if(st.d){const f=d/st.d;S=st.s;TX=st.tx;TY=st.ty;zoomAt(f,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top)}moved=99}else if(st){const dx=e.clientX-st.x,dy=e.clientY-st.y;moved=Math.max(moved,Math.hypot(dx,dy));if(moved>6){const now=performance.now(),dt=Math.max(1,now-lv.t);lv.x=.8*lv.x+.2*((st.tx+dx-TX)/dt*16);lv.y=.8*lv.y+.2*((st.ty+dy-TY)/dt*16);lv.t=now;TX=st.tx+dx;TY=st.ty+dy;apply()}}};
 const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(!pts.size){if(moved<=6){const el=document.elementFromPoint(e.clientX,e.clientY),c=el&&el.closest('.tc[data-id]');if(c)openSheet(c.dataset.id);else closeSheet()}else if(pts.size===0&&performance.now()-lv.t<90&&(Math.abs(lv.x)>1||Math.abs(lv.y)>1)){let vx=lv.x,vy=lv.y;const step=()=>{vx*=.94;vy*=.94;TX+=vx;TY+=vy;apply();raf=Math.abs(vx)>.4||Math.abs(vy)>.4?requestAnimationFrame(step):0};raf=requestAnimationFrame(step)}st=null}else{st=null}};
 tv.onpointerup=up;tv.onpointercancel=up;
 tv.onwheel=e=>{e.preventDefault();stopInertia();const r=tv.getBoundingClientRect();
  if(e.ctrlKey||e.metaKey){zoomAt(Math.exp(-e.deltaY*(e.deltaMode?0.05:0.01)),e.clientX-r.left,e.clientY-r.top);return}
  const k=e.deltaMode?30:1;let dx=e.deltaX*k,dy=e.deltaY*k;if(e.shiftKey&&!dx){dx=dy;dy=0}else if(ALL&&Math.abs(dx)<1){dx=dy;dy=0}
  TX-=dx;TY-=dy;apply()};
 tv.ondblclick=e=>{if(e.target.closest('.tc,#tctl,#tmodes,#tbr,#mm'))return;const r=tv.getBoundingClientRect();zoomAt(1.8,e.clientX-r.left,e.clientY-r.top)};
 $('#zi').onclick=()=>zoomAt(1.3,vw()/2,vh()/2);$('#zo').onclick=()=>zoomAt(1/1.3,vw()/2,vh()/2);$('#zf').onclick=()=>{window._fitAll=1;fit();setTimeout(()=>{window._fitAll=0},0)};$('#zc').onclick=()=>ALL?center(.9):center();
 $('#tmodes').onclick=e=>{const b=e.target.closest('[data-m]');if(b){mode=b.dataset.m;closeSheet();tree(v,focusId)}if(e.target.id==='tfind')findModal()};
 setTimeout(()=>$('#thint')&&($('#thint').style.opacity=0),6000);
 center();if(selId)openSheet(selId);
 v._onresize=()=>{apply()}}
function findModal(){modal(`<button class="btn sm x" data-x>Close</button><h2>Jump to a person</h2><div class="find"><input id="fi2" class="search" type="search" placeholder="Type a name" autocomplete="off"><div id="fr2"></div></div>`);findBox('fi2','fr2',id=>{closeModal();location.hash='#/tree/'+id});setTimeout(()=>$('#fi2').focus(),50)}
/* ---------- router ---------- */
function route(){const v=$('#view');v.classList.remove('tree');v._onresize=null;if(!T)return;let h=decodeURIComponent(location.hash.replace(/^#\/?/,''));if(!h)h='home';const[a,b,c2]=h.split('/');
 if(!['tree'].includes(a))closeSheet();
 if(!/^(home|tree|people|p|stories|s|scans|related)$/.test(a)){const id=byName(h);if(id){location.hash='#/p/'+id;return}location.hash='#/home';return}
 document.querySelectorAll('#tabs a').forEach(x=>x.classList.toggle('on',x.dataset.t===({p:'people',s:'stories'}[a]||a)));
 ({home:()=>home(v),tree:()=>{if(!b)mode='all';else if(mode==='all')mode='both';tree(v,b)},people:()=>people(v),p:()=>personPage(v,b),stories:()=>stories(v),s:()=>story(v,b),scans:()=>scans(v),related:()=>related(v,b,c2)})[a]();
 if(a!=='tree')scrollTo(0,0);v.focus({preventScroll:true})}
addEventListener('hashchange',route);addEventListener('resize',()=>{const v=$('#view');v._onresize&&v._onresize()});
Promise.all([fetch('tree-data.json').then(r=>r.json()),fetch('data.json').then(r=>r.json())]).then(([t,d])=>{T=t;D=d;P=t.p;t.lay.b.forEach(r=>{GEN[r[0]]=r[1]});COL=t.cols;NAME=Object.entries(P).map(([id,p])=>({id,n:nz(p.n)}));
 for(const s in D.stories){D.stories[s].person_id=byName(D.stories[s].person)}
 if(me&&!P[me])me=null;chip();route()}).catch(e=>{$('#view').innerHTML='<h1>Could not load</h1><p class="lead">Please refresh the page.</p>'});
})();
