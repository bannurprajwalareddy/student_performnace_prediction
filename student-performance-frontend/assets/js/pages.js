/* Page renderers. Each Pages.<name>(el,user) builds UI from data helpers (mock-data.js). */
const Pages={};
const avg=a=>a.length?+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):0;
const badge=c=>`<span class="badge ${c==='High'||c==='Active'?'ok':c==='Average'?'warn':'bad'}">${c}</span>`;
const card=(l,v,s='')=>`<div class="card stat"><small>${l}</small><h2>${v}</h2><small>${s}</small></div>`;
const cbox=(id,t)=>`<div class="card"><h3>${t}</h3><div class="chartbox"><canvas id="${id}"></canvas></div></div>`;
const head=(t,s)=>`<div class="ph"><h1>${t}</h1><p>${s||''}</p></div>${API.USE_MOCK?'<div class="note">Sample / demonstration data only — no real records.</div>':''}`;
const DEPT_OPTS=['','CSE-DS','CSE','IT','ECE'];
const histRows=()=>getHistory().map(h=>({...h,summary:`Att ${h.att}% · Int ${h.internal} · Study ${h.study}h`}));
const histCols=[{k:'date',label:'Date & time'},{k:'summary',label:'Details'},{k:'score',label:'Score'},{k:'category',label:'Category',fmt:r=>badge(r.category)}];
const detailsHtml=d=>`<ul class="list">${[['Attendance',d.att+'%'],['Internal marks',d.internal],['Previous exam',d.prev],['Assignments',d.assign+'%'],['GPA',d.gpa],['Study hours/day',d.study]].map(([a,b])=>`<li><b>${a}:</b> ${b}</li>`).join('')}</ul>`;
const studentsTable=(el,size)=>dataTable(el,{rows:DEMO.students,pageSize:size,csv:'students-sample',
 filters:[{k:'dept',label:'Department',opts:DEPTS},{k:'sem',label:'Semester',opts:[3,4,5,6]},{k:'category',label:'Category',opts:['High','Average','At Risk']}],
 cols:[{k:'id',label:'ID'},{k:'name',label:'Name'},{k:'dept',label:'Dept'},{k:'sem',label:'Sem'},{k:'att',label:'Attendance %'},{k:'score',label:'Score'},{k:'category',label:'Category',fmt:r=>badge(r.category)}],
 acts:[['view','View']],onAct:(a,r)=>modal(esc(r.name)+' (sample)',detailsHtml(r)+`<p>Demo category: ${r.category}</p>`)});
/* ---------- Landing ---------- */
Pages.index=el=>{el.innerHTML=`<nav class="lnav"><b>🎓 Student Performance Prediction</b><div class="links"><a href="#home">Home</a><a href="#about">About</a><a href="#features">Features</a><a href="#how">How It Works</a><a href="login.html">Login</a></div><button class="btn ghost" id="th">🌓</button><a class="btn" href="register.html">Get Started</a></nav>
 <section class="sec hero" id="home"><div><h1>Understand Your Performance. Improve Your Future.</h1><p>Enter your attendance, marks and study habits to monitor your academic progress and explore trends over time.</p><div class="row"><a class="btn" href="register.html">Get Started</a><a class="btn ghost" href="#features">Explore Features</a></div></div>
 <div class="card mock"><b>Dashboard preview</b><div class="bars">${[40,55,48,70,64,82,90].map(h=>`<i style="height:${h}%"></i>`).join('')}</div><div class="bar"><i style="width:78%"></i></div><small>Illustration with sample values</small></div></section>
 <section class="sec" id="about"><h1>About</h1><p>The Student Performance Prediction System helps students understand expected performance, lets faculty identify students needing support, and helps administrators monitor academic progress.</p></section>
 <section class="sec" id="features"><h1>Features</h1><div class="grid g3">${[['📈','Student Performance Insights'],['🧭','Academic Progress Tracking'],['📊','Visual Analytics'],['🕘','Prediction History'],['🧑‍🏫','Faculty Monitoring'],['📄','Performance Reports']].map(([i,t])=>`<div class="card"><h2>${i}</h2><h3>${t}</h3></div>`).join('')}</div></section>
 <section class="sec" id="how"><h1>How It Works</h1><div class="grid g4">${['Enter academic details','View the prediction interface','Understand performance trends','Track academic progress'].map((t,i)=>`<div class="card"><h2>${i+1}</h2><h3>${t}</h3></div>`).join('')}</div></section>
 <footer><b>Student Performance Prediction System</b><p><a href="#home">Home</a><a href="#about">About</a><a href="#features">Features</a><a href="login.html">Login</a></p><small>College project demo. Results are demonstrations only and not real machine-learning predictions.</small></footer>`;
 $('#th').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')};
/* ---------- Auth ---------- */
const authNote='<div class="note">Demonstration authentication only. No real account is created or secured; nothing is sent to a server.</div>';
Pages.login=el=>{el.innerHTML=`<div class="authwrap"><form class="card auth" id="f" novalidate><h1>Login</h1>${authNote}${F('Email','email',{t:'email',req:1,ph:'student@demo.test',h:'Use "faculty" or "admin" in the email for those roles.'})}
 <label class="fld">Password *<div class="pw"><input class="input" id="pw" name="pw" type="password" required minlength="6" value="demo123"><button type="button" id="eye" aria-label="Show or hide password">👁</button></div><small class="err"></small></label>
 <label><input type="checkbox"> Remember me</label><a href="#" id="fg">Forgot password?</a><small class="err" id="ferr"></small><button class="btn" id="go">Login</button>
 <div class="row"><button type="button" class="btn ghost" data-q="student@demo.test">Student demo</button><button type="button" class="btn ghost" data-q="faculty@demo.test">Faculty demo</button><button type="button" class="btn ghost" data-q="admin@demo.test">Admin demo</button></div><p>No account? <a href="register.html">Register</a> · <a href="index.html">Home</a></p></form></div>`;
 $('#eye').onclick=()=>$('#pw').type=$('#pw').type==='password'?'text':'password';
 $('#fg').onclick=e=>{e.preventDefault();modal('Forgot password','<p>Demo only: no reset email is sent.</p>')};
 $$('[data-q]').forEach(b=>b.onclick=()=>{$('#email').value=b.dataset.q;$('#f').requestSubmit()});
 $('#f').onsubmit=async e=>{e.preventDefault();$('#ferr').textContent='';if(!validate(e.target))return;busy($('#go'),1);
  try{const u=await authLogin($('#email').value,$('#pw').value);session.set(u);location.href=homeFor(u.role)}catch(x){$('#ferr').textContent=x.message;toast(x.message,'error');busy($('#go'),0)}}};
Pages.register=el=>{el.innerHTML=`<div class="authwrap"><form class="card auth" id="f" novalidate><h1>Student Registration</h1>${authNote}${F('Full name','name',{req:1})}${F('Student ID','sid',{req:1})}${F('Email','email',{t:'email',req:1})}
 ${F('Department','dept',{req:1,opts:DEPT_OPTS})}${F('Semester','sem',{req:1,opts:['',1,2,3,4,5,6,7,8]})}${F('Password','pw',{t:'password',req:1,ml:6})}${F('Confirm password','pw2',{t:'password',req:1,ml:6})}
 <label class="fld"><span><input type="checkbox" id="terms" required> I accept the terms (demo)</span><small class="err"></small></label><small class="err" id="ferr"></small><button class="btn" id="go">Register</button><p>Have an account? <a href="login.html">Login</a></p></form></div>`;
 $('#f').onsubmit=async e=>{e.preventDefault();$('#ferr').textContent='';if(!validate(e.target))return;if($('#pw').value!==$('#pw2').value){$('#ferr').textContent='Passwords do not match.';return}
  busy($('#go'),1);try{const d=formData(e.target);delete d.pw2;const u=await authRegister(d);session.set(u);toast('Registered (demo only)');setTimeout(()=>location.href=homeFor('student'),600)}catch(x){$('#ferr').textContent=x.message;busy($('#go'),0)}}};
/* ---------- Student ---------- */
Pages['student-dashboard']=(el,u)=>{const h=getHistory(),last=h[0]||{score:'–',att:'–'},r=DEMO.records;
 el.innerHTML=head('Welcome, '+esc(u.name),'Your academic overview.')+`<div class="row"><a class="btn" href="academic-details.html">Enter academic details</a><a class="btn ghost" href="prediction.html">Predict performance</a></div><br>
 <div class="grid g4">${card('Latest Predicted Score',last.score,'demo')}${card('Attendance',last.att+'%')}${card('Internal Assessment Avg',avg(r.map(x=>x.internal)))}${card('Previous Predictions',h.length)}</div><br>
 <div class="grid g2">${cbox('c1','Performance trend (GPA×10 by semester)')}${cbox('c2','Attendance vs internal marks')}</div><br>
 <div class="grid g2"><div class="card"><h3>Academic progress</h3>${r.map(x=>`<p>Semester ${x.sem}: GPA ${x.gpa}</p><div class="bar"><i style="width:${x.gpa*10}%"></i></div>`).join('')}</div>
 <div class="card"><h3>Latest activity</h3><ul class="list">${h.slice(0,4).map(x=>`<li>${x.date} — prediction ${x.score} (${x.category})</li>`).join('')}<li>Logged in (demo session)</li></ul></div></div><br><div class="card"><h3>Recent predictions</h3><div id="t"></div></div>`;
 chart('c1','line',{labels:r.map(x=>'Sem '+x.sem),datasets:[{label:'GPA×10',data:r.map(x=>x.gpa*10),fill:true,tension:.3}]},{y:{min:50,max:100}});
 chart('c2','bar',{labels:r.map(x=>'Sem '+x.sem),datasets:[{label:'Attendance %',data:r.map(x=>x.att)},{label:'Internal marks',data:r.map(x=>x.internal)}]});
 dataTable($('#t'),{rows:histRows().slice(0,4),cols:histCols,pageSize:4})};
Pages['academic-details']=el=>{const d=store.get('details',{});const n=(l,id,min,max,o={})=>F(l,id,{t:'number',req:!o.opt,min,max,v:d[id],h:o.h||`${min}–${max}`,step:o.step});
 el.innerHTML=head('Academic Details','Fields can be adjusted later to match the ML model.')+`<form class="card form" id="f" novalidate><h3>Academic information</h3>${F('Student ID','sid',{req:1,v:d.sid||session.get().id})}${F('Department','dept',{req:1,opts:DEPT_OPTS,v:d.dept||session.get().dept})}${F('Semester','sem',{req:1,opts:['',1,2,3,4,5,6,7,8],v:d.sem||session.get().sem})}${n('Previous semester GPA','gpa',0,10,{step:.1})}
 <h3>Attendance</h3><div class="full">${n('Attendance %','att',0,100)}<div class="bar"><i id="ab" style="width:${d.att||0}%"></i></div></div>
 <h3>Academic performance</h3>${n('Internal assessment marks (%)','internal',0,100)}${n('Assignment completion (%)','assign',0,100)}${n('Previous examination marks (%)','prev',0,100)}
 <h3>Study habits</h3>${n('Average study hours/day','study',0,16)}${n('Extracurricular hours/week (optional)','extra',0,40,{opt:1})}
 <div class="full row"><button type="reset" class="btn ghost" id="rs">Reset</button><button type="button" class="btn ghost" id="sv">Save Details</button><button type="button" class="btn" id="pr">Predict Performance</button></div></form>`;
 const save=go=>{if(!validate($('#f')))return toast('Please fix the highlighted fields','error');store.set('details',formData($('#f')));toast('Details saved (this browser only)');if(go)location.href='prediction.html'};
 $('#sv').onclick=()=>save();$('#pr').onclick=()=>save(1);$('#rs').onclick=()=>setTimeout(()=>{$('#ab').style.width='0';$$('.err').forEach(x=>x.textContent='')});
 $('#att').oninput=e=>$('#ab').style.width=Math.min(100,Math.max(0,e.target.value))+'%'};
Pages.prediction=el=>{const d=store.get('details');
 el.innerHTML=head('Predict Performance','Review your details and run the demonstration.')+(d?`<div class="card"><h3>Your academic details</h3>${detailsHtml(d)}<div class="row"><button class="btn" id="go">Predict Performance</button></div></div><div id="res"></div>`:`<div class="card empty">No academic details yet.<br><br><a class="btn" href="academic-details.html">Enter details</a></div>`);
 if(!d)return;$('#go').onclick=async()=>{busy($('#go'),1);$('#res').innerHTML='<div class="card empty">Analysing (demo)…</div>';
  try{const r=await requestPrediction(d);const rec={id:'H-'+Date.now(),date:new Date().toISOString().slice(0,16).replace('T',' '),...d,score:r.score,category:r.category};if(API.USE_MOCK)store.set('spps_new',[rec,...store.get('spps_new',[])]);else await loadData();
   $('#res').innerHTML=`<br><div class="note">${r.note||'<b>Demonstration result only.</b> Actual predictions require a trained machine-learning model connected to the backend.'}</div><div class="grid g2"><div class="card"><h3>Result (demo)</h3><div class="row"><div class="ring" style="--p:${r.score}"><b>${r.score}</b></div><div><h2>${badge(r.category)}</h2><p>${r.category==='High'?'Strong expected performance.':r.category==='Average'?'Moderate performance; room to improve.':'Needs support and focused effort.'}</p></div></div><h3>Suggestions</h3><ul>${suggestions(d).map(s=>`<li>${s}</li>`).join('')}</ul><div class="row"><a class="btn" href="prediction-history.html">View history</a><a class="btn ghost" href="student-dashboard.html">Dashboard</a></div></div>${cbox('c1','Academic indicators')}</div>`;
   chart('c1','bar',{labels:['Attendance','Internal','Prev exam','Assignments','GPA×10','Study'],datasets:[{label:'Indicator (0–100)',data:r.indicators}]},{y:{min:0,max:100}});toast('Demo prediction added to history')}catch{toast('Prediction failed','error')}busy($('#go'),0)}};
Pages['prediction-history']=(el,u)=>{const clr=u.role==='student'?'<button class="btn ghost" id="clr">Clear my session predictions</button>':'';
 el.innerHTML=head(u.role==='admin'?'Prediction Records':'Prediction History','Date, details and category of demonstration predictions.')+`<div class="card"><div id="t"></div>${clr}</div>`;
 dataTable($('#t'),{rows:histRows(),csv:'predictions-sample',filters:[{k:'category',label:'Category',opts:['High','Average','At Risk']}],cols:histCols,acts:[['view','View details']],onAct:(a,r)=>modal('Prediction '+esc(r.date),detailsHtml(r)+`<p>Score ${r.score} — ${r.category} (demo)</p>`)});
 $('#clr')&&($('#clr').onclick=()=>{store.set('spps_new',[]);renderPage();toast('Cleared')})};
Pages['academic-records']=el=>{const r=DEMO.records;
 el.innerHTML=head('Academic Records','Semester-wise sample records.')+`<div class="grid g2">${cbox('c1','Academic trend')}<div class="card"><div id="t"></div></div></div>`;
 chart('c1','line',{labels:r.map(x=>'Sem '+x.sem),datasets:[{label:'Attendance',data:r.map(x=>x.att)},{label:'Internal',data:r.map(x=>x.internal)},{label:'Exam',data:r.map(x=>x.prev)},{label:'Assignments',data:r.map(x=>x.assign)}]});
 dataTable($('#t'),{rows:r.map(x=>({...x,id:x.sem})),filters:[{k:'sem',label:'Semester',opts:[1,2,3,4,5]}],cols:[['sem','Sem'],['att','Attendance %'],['internal','Internal'],['prev','Exam'],['assign','Assignments %'],['gpa','GPA']].map(([k,label])=>({k,label}))})};
/* ---------- Faculty ---------- */
const S=DEMO.students;
Pages['faculty-dashboard']=el=>{const bins=[0,0,0,0];S.forEach(s=>bins[Math.min(3,Math.floor((s.att-50)/12.5))]++);
 el.innerHTML=head('Faculty Dashboard','Class overview.')+`<div class="grid g4">${card('Total Students',S.length)}${card('Average Academic Score',avg(S.map(s=>s.score)))}${card('Average Attendance',avg(S.map(s=>s.att))+'%')}${card('Students Requiring Attention',S.filter(s=>s.category==='At Risk').length)}</div><br>
 <div class="grid g2">${cbox('c1','Class performance')}${cbox('c2','Attendance distribution')}</div><br><div class="card"><h3>Student performance</h3><div id="t"></div></div>`;
 chart('c1','doughnut',{labels:['High','Average','At Risk'],datasets:[{data:['High','Average','At Risk'].map(c=>S.filter(s=>s.category===c).length)}]});
 chart('c2','bar',{labels:['50-62%','63-75%','76-87%','88%+'],datasets:[{label:'Students',data:bins}]});studentsTable($('#t'),5)};
Pages.students=el=>{el.innerHTML=head('Students','Search, filter and sort sample students.')+`<div class="card"><div id="t"></div></div>`;studentsTable($('#t'),8)};
Pages['faculty-analytics']=el=>{el.innerHTML=head('Performance Analytics','Faculty charts.')+`<div class="grid g2">${cbox('c1','Average score by department')}${cbox('c2','Attendance vs score')}${cbox('c3','Score by semester')}</div>`;
 chart('c1','bar',{labels:DEPTS,datasets:[{label:'Avg score',data:DEPTS.map(d=>avg(S.filter(s=>s.dept===d).map(s=>s.score)))}]});
 chart('c2','scatter',{datasets:[{label:'Students',data:S.map(s=>({x:s.att,y:s.score}))}]});
 chart('c3','line',{labels:[3,4,5,6].map(x=>'Sem '+x),datasets:[{label:'Avg score',data:[3,4,5,6].map(m=>avg(S.filter(s=>s.sem===m).map(s=>s.score)))}]})};
Pages.reports=(el,u)=>{el.innerHTML=head('Reports','Export sample data.')+`<div class="grid g2">${cbox('c1','Category summary')}${cbox('c2','Average score by department')}</div><div class="row"><button class="btn" id="e1">Export students CSV</button><button class="btn ghost" id="e2">Export predictions CSV</button>${u.role==='admin'?'<button class="btn ghost" id="e3">Export users CSV</button>':''}</div>`;
 chart('c1','doughnut',{labels:['High','Average','At Risk'],datasets:[{data:['High','Average','At Risk'].map(c=>S.filter(s=>s.category===c).length)}]});
 chart('c2','bar',{labels:DEPTS,datasets:[{label:'Avg score',data:DEPTS.map(d=>avg(S.filter(s=>s.dept===d).map(s=>s.score)))}]});
 $('#e1').onclick=()=>exportCSV('students-sample',S);$('#e2').onclick=()=>exportCSV('predictions-sample',getHistory());$('#e3')&&($('#e3').onclick=()=>exportCSV('users-sample',DEMO.appUsers))};
/* ---------- Admin ---------- */
Pages['admin-dashboard']=el=>{const U=DEMO.appUsers;
 el.innerHTML=head('Admin Dashboard','System overview (sample data).')+`<div class="grid g4">${card('Total Students',U.filter(x=>x.role==='student').length)}${card('Total Faculty',U.filter(x=>x.role==='faculty').length)}${card('Demo Predictions',getHistory().length)}${card('Overall Avg Score',avg(S.map(s=>s.score)))}</div><br><div class="grid g2">${cbox('c1','Users by role')}${cbox('c2','Academic trend (avg GPA×10)')}</div><br><div class="card"><h3>Recent predictions</h3><div id="t"></div></div>`;
 chart('c1','doughnut',{labels:['Student','Faculty','Admin'],datasets:[{data:['student','faculty','admin'].map(r=>U.filter(x=>x.role===r).length)}]});
 chart('c2','line',{labels:DEMO.records.map(x=>'Sem '+x.sem),datasets:[{label:'GPA×10',data:DEMO.records.map(x=>x.gpa*10)}]});
 dataTable($('#t'),{rows:histRows().slice(0,5),cols:histCols,pageSize:5})};
Pages['user-management']=el=>{const v=new URLSearchParams(location.search).get('view');const rows=DEMO.appUsers.filter(x=>!v||x.role===v);
 el.innerHTML=head(v?v[0].toUpperCase()+v.slice(1)+' Records':'User Management','Sample users only — no real accounts are managed.')+`<div class="card"><div id="t"></div></div>`;
 dataTable($('#t'),{rows,csv:'users-sample',filters:[{k:'role',label:'Role',opts:['student','faculty','admin']},{k:'status',label:'Status',opts:['Active','Inactive']}],
  cols:[{k:'id',label:'ID'},{k:'name',label:'Name'},{k:'email',label:'Email'},{k:'role',label:'Role',fmt:r=>`<span class="demo-badge">${r.role}</span>`},{k:'status',label:'Status',fmt:r=>badge(r.status==='Active'?'Active':'Inactive')}],
  acts:[['view','View'],['edit','Edit'],['toggle','Activate/Deactivate']],
  onAct:(a,r,draw)=>{if(a==='toggle'){r.status=r.status==='Active'?'Inactive':'Active';draw();if(!API.USE_MOCK)apiRequest(API.endpoints.users+'/'+r.id,{method:'PATCH',body:{status:r.status}}).catch(x=>toast(x.message,'error'));toast(r.name+' is now '+r.status)}
   else if(a==='view')modal(esc(r.name),`<ul class="list"><li>ID: ${r.id}</li><li>Email: ${esc(r.email)}</li><li>Role: ${r.role}</li><li>Status: ${r.status}</li></ul>`);
   else{const m=modal('Edit '+esc(r.name)+' (demo)',`<form id="ef" class="form" novalidate>${F('Name','name',{req:1,v:r.name})}${F('Email','email',{t:'email',req:1,v:r.email})}<button class="btn">Save</button></form>`);
    $('#ef',m).onsubmit=e=>{e.preventDefault();if(!validate(e.target))return;Object.assign(r,formData(e.target));if(!API.USE_MOCK)apiRequest(API.endpoints.users+'/'+r.id,{method:'PATCH',body:{name:r.name,email:r.email}}).catch(x=>toast(x.message,'error'));m.remove();draw();toast('Updated')}}}})};
/* ---------- Profile / Settings ---------- */
const prefsCard=()=>{const p=store.get('prefs',{email:true,push:false});return`<div class="card"><h3>Preferences</h3>${F('Theme','theme',{opts:['light','dark'],v:document.documentElement.dataset.theme})}<p><label><input type="checkbox" id="pe" ${p.email?'checked':''}> Email notifications</label><br><label><input type="checkbox" id="pp" ${p.push?'checked':''}> Push notifications</label></p><div class="row"><button class="btn" id="sp">Save preferences</button><button class="btn ghost" id="lo">Logout</button></div><small>Demo: only theme and preferences are stored in this browser. Accounts are not securely persisted.</small></div>`};
const prefsBind=()=>{$('#theme').onchange=e=>setTheme(e.target.value);$('#sp').onclick=()=>{store.set('prefs',{email:$('#pe').checked,push:$('#pp').checked});toast('Preferences saved')};$('#lo').onclick=logout};
Pages.profile=(el,u)=>{el.innerHTML=head('My Profile','Demo profile — not a persisted account.')+`<div class="grid g2"><form class="card form" id="f" novalidate>${F('Name','name',{req:1,v:u.name})}${F('Email','email',{t:'email',req:1,v:u.email})}${F('Role','role',{ro:1,v:u.role})}${F('ID','id',{ro:1,v:u.id})}${u.dept?F('Department','dept',{opts:DEPT_OPTS,v:u.dept}):''}${u.sem?F('Semester','sem',{opts:[1,2,3,4,5,6,7,8],v:u.sem}):''}<div class="full row"><button class="btn">Save</button><button type="button" class="btn ghost" id="cn">Cancel</button></div></form>${prefsCard()}</div>`;
 prefsBind();$('#cn').onclick=renderPage;$('#f').onsubmit=e=>{e.preventDefault();if(!validate(e.target))return;session.set({...u,...formData(e.target)});toast('Profile updated (session only)');renderPage()}};
Pages.settings=el=>{el.innerHTML=head('Settings','Theme and notifications.')+prefsCard();prefsBind()};
Pages[404]=el=>{el.innerHTML='<div class="authwrap"><div class="card auth"><h1>404 — Page not found</h1><a class="btn" href="index.html">Go home</a></div></div>'};
