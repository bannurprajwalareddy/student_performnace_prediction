/* Core helpers: DOM, storage, session, theme, toast, modal, shell/navigation, tables, charts, CSV. */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const session={get:()=>JSON.parse(sessionStorage.getItem('spps_user')||'null'),set:u=>sessionStorage.setItem('spps_user',JSON.stringify(u)),clear:()=>{sessionStorage.removeItem('spps_user');sessionStorage.removeItem('spps_token')}};
const homeFor=r=>({student:'student-dashboard.html',faculty:'faculty-dashboard.html',admin:'admin-dashboard.html'})[r]||'login.html';
document.documentElement.dataset.theme=store.get('theme','light');
function setTheme(t){store.set('theme',t);document.documentElement.dataset.theme=t;renderPage()}
function toast(m,type=''){let c=$('.toasts');if(!c){c=document.createElement('div');c.className='toasts';document.body.append(c)}
 const t=document.createElement('div');t.className='toast '+type;t.textContent=m;c.append(t);setTimeout(()=>t.remove(),3000)}
function modal(title,body){const m=document.createElement('div');m.className='modal';
 m.innerHTML=`<div class="card mbox" role="dialog" aria-modal="true"><div class="mh"><h3>${title}</h3><button class="x" aria-label="Close">✕</button></div><div>${body}</div></div>`;
 m.onclick=e=>{if(e.target===m||e.target.classList.contains('x'))m.remove()};document.body.append(m);return m}
const NAV={
 student:[['Dashboard','student-dashboard.html','🏠'],['Academic Details','academic-details.html','📝'],['Predict Performance','prediction.html','🎯'],['Prediction History','prediction-history.html','🕘'],['Academic Records','academic-records.html','📚'],['My Profile','profile.html','👤'],['Settings','settings.html','⚙️'],['Logout','#logout','🚪']],
 faculty:[['Dashboard','faculty-dashboard.html','🏠'],['Students','students.html','🎓'],['Performance Analytics','faculty-analytics.html','📊'],['Reports','reports.html','📄'],['Profile','profile.html','👤'],['Logout','#logout','🚪']],
 admin:[['Dashboard','admin-dashboard.html','🏠'],['User Management','user-management.html','👥'],['Student Records','user-management.html?view=student','🎓'],['Faculty Records','user-management.html?view=faculty','🧑‍🏫'],['Prediction Records','prediction-history.html','🎯'],['Analytics and Reports','reports.html','📊'],['Settings','settings.html','⚙️'],['Logout','#logout','🚪']]};
function shell(u){const cur=location.pathname.split('/').pop()+location.search;
 $('#app').innerHTML=`<aside class="sidebar"><div class="logo">🎓 SPPS</div>${NAV[u.role].map(([l,h,i])=>`<a href="${h}" class="${h===cur?'on':''}" ${h==='#logout'?'data-logout':''}>${i} <span>${l}</span></a>`).join('')}</aside>
 <div class="main"><header class="topbar"><button class="btn ghost" id="menu" aria-label="Toggle sidebar">☰</button><span class="demo-badge">${API.USE_MOCK?'Demo mode':'Live API'}</span><div class="sp"></div>
 <button class="btn ghost" id="theme" aria-label="Toggle theme">🌓</button><span>${esc(u.name)} · ${u.role}</span></header><main id="view"></main></div>`;
 $('#menu').onclick=()=>document.body.classList.toggle(innerWidth<=900?'open':'collapsed');
 $('#theme').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
 $$('[data-logout]').forEach(a=>a.onclick=e=>{e.preventDefault();logout()})}
function logout(){session.clear();location.href='login.html'}
/* Form helpers */
const F=(l,id,o={})=>{const a=`id="${id}" name="${id}" ${o.req?'required':''} ${o.min!=null?`min="${o.min}" max="${o.max}" step="${o.step||'any'}"`:''} ${o.ml?`minlength="${o.ml}"`:''} ${o.v!=null?`value="${esc(o.v)}"`:''} ${o.ro?'readonly':''} placeholder="${o.ph||''}"`;
 return `<label class="fld">${l}${o.req?' *':''}${o.opts?`<select class="input" ${a}>${o.opts.map(x=>`<option ${String(x)===String(o.v)?'selected':''}>${x}</option>`).join('')}</select>`:`<input class="input" type="${o.t||'text'}" ${a}>`}<small class="hint">${o.h||''}</small><small class="err"></small></label>`};
function validate(form){let ok=true;$$('input,select',form).forEach(i=>{const v=i.type==='checkbox'?(i.checked?'1':''):i.value.trim(),e=i.closest('.fld')?.querySelector('.err');let m='';
 if(i.required&&!v)m='This field is required.';
 else if(v&&i.type==='email'&&!/^\S+@\S+\.\S+$/.test(v))m='Enter a valid email address.';
 else if(v&&i.type==='number'&&(+v<+i.min||+v>+i.max))m=`Enter a value between ${i.min} and ${i.max}.`;
 else if(v&&i.minLength>0&&v.length<i.minLength)m=`Minimum ${i.minLength} characters.`;
 if(e)e.textContent=m;i.classList.toggle('bad',!!m);if(m)ok=false});return ok}
const formData=f=>Object.fromEntries($$('input,select',f).map(i=>[i.name,i.type==='number'?+i.value:i.type==='checkbox'?i.checked:i.value]));
const busy=(b,on)=>{b.disabled=on;b.classList.toggle('load',on)};
/* Table helper: search, filters, sortable headers, show-more, row actions, CSV */
function dataTable(el,o){let q='',f={},sk=null,sd=1,n=o.pageSize||6;
 el.innerHTML=`<div class="toolbar"><input class="input" id="q" placeholder="Search…" aria-label="Search">${(o.filters||[]).map(x=>`<select class="input" data-f="${x.k}" aria-label="${x.label}"><option value="">${x.label}: All</option>${x.opts.map(v=>`<option>${v}</option>`).join('')}</select>`).join('')}${o.csv?'<button class="btn ghost" id="csv">⬇ Export CSV</button>':''}</div>
 <div class="tw"><table><thead><tr>${o.cols.map(c=>`<th data-k="${c.k}">${c.label} ↕</th>`).join('')}${o.acts?'<th>Actions</th>':''}</tr></thead><tbody></tbody></table></div><div class="row"><button class="btn ghost" id="more">Show more</button></div>`;
 const rows=()=>{let r=o.rows.filter(x=>(!q||Object.values(x).join(' ').toLowerCase().includes(q))&&Object.entries(f).every(([k,v])=>!v||String(x[k])===v));
  if(sk)r.sort((a,b)=>(a[sk]>b[sk]?1:a[sk]<b[sk]?-1:0)*sd);return r};
 const draw=()=>{const r=rows();$('tbody',el).innerHTML=r.length?r.slice(0,n).map(x=>`<tr>${o.cols.map(c=>`<td>${c.fmt?c.fmt(x):esc(x[c.k])}</td>`).join('')}${o.acts?`<td>${o.acts.map(([a,l])=>`<button class="btn ghost" data-act="${a}" data-id="${esc(x.id)}">${l}</button>`).join(' ')}</td>`:''}</tr>`).join(''):`<tr><td class="empty" colspan="9">No records found.</td></tr>`;
  $('#more',el).style.display=r.length>n?'':'none'};
 $('#q',el).oninput=e=>{q=e.target.value.toLowerCase();n=o.pageSize||6;draw()};
 $$('[data-f]',el).forEach(s=>s.onchange=()=>{f[s.dataset.f]=s.value;draw()});
 $$('th[data-k]',el).forEach(h=>h.onclick=()=>{sd=sk===h.dataset.k?-sd:1;sk=h.dataset.k;draw()});
 $('#more',el).onclick=()=>{n+=o.pageSize||6;draw()};
 $('tbody',el).onclick=e=>{const b=e.target.closest('[data-act]');if(b)o.onAct(b.dataset.act,o.rows.find(x=>String(x.id)===b.dataset.id),draw)};
 if(o.csv)$('#csv',el).onclick=()=>exportCSV(o.csv,rows());
 draw();return{draw}}
function exportCSV(name,rows){if(!rows.length)return toast('Nothing to export','error');const k=Object.keys(rows[0]);
 const csv=[k.join(','),...rows.map(r=>k.map(c=>`"${String(r[c]).replace(/"/g,'""')}"`).join(','))].join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=name+'.csv';a.click();toast('Exported '+name+'.csv (sample data)')}
/* Charts (Chart.js) themed from CSS variables */
const charts={};
function chart(id,type,data,opt={}){const c=document.getElementById(id);if(!c||!window.Chart)return;charts[id]?.destroy();
 const css=getComputedStyle(document.documentElement),tx=css.getPropertyValue('--mu').trim(),gr=css.getPropertyValue('--bd').trim(),pal=['#2b3a8c','#6d5bd0','#4a90d9','#1f9d6b','#d98a1f','#d64545'];
 data.datasets.forEach((d,i)=>{if(type==='doughnut'){d.backgroundColor??=pal;d.borderWidth=0}else{d.borderColor??=pal[i];d.backgroundColor??=type==='line'?pal[i]+'33':pal[i]}});
 charts[id]=new Chart(c,{type,data,options:{responsive:true,maintainAspectRatio:false,color:tx,plugins:{legend:{labels:{color:tx}}},
  scales:type==='doughnut'?{}:{x:{ticks:{color:tx},grid:{color:gr},...opt.x},y:{ticks:{color:tx},grid:{color:gr},...opt.y}}}})}
/* Boot: guard role, render page */
let CURRENT=null;
function renderPage(){const b=document.body,page=b.dataset.page,u=session.get();
 if(!b.dataset.role){Pages[page]($('#app'));return}
 shell(u);Pages[page]($('#view'),u)}
document.addEventListener('DOMContentLoaded',()=>{const b=document.body,need=b.dataset.role,u=session.get();
 if(need){if(!u){location.href='login.html';return}
  if(need!=='any'&&!need.split(',').includes(u.role)){location.href=homeFor(u.role);return}}
 loadData().then(renderPage)});
/* Fill the shared data arrays from the backend (in place, so page code keeps working). */
async function loadData(){
 const u=session.get();if(API.USE_MOCK||!u)return;const fill=(a,d)=>a.splice(0,a.length,...d);
 try{if(u.role==='student'||u.role==='admin')fill(DEMO.history,await apiRequest(API.endpoints.history));
  if(u.role!=='student')fill(DEMO.students,await apiRequest(API.endpoints.students));
  if(u.role==='admin')fill(DEMO.appUsers,await apiRequest(API.endpoints.users));}
 catch(e){toast(e.message,'error')}}
