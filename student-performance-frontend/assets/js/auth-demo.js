/* Authentication. USE_MOCK=true: demo only, no real accounts. Otherwise calls the Flask API (token kept in sessionStorage). */
async function authLogin(email,pw){
 if(!API.USE_MOCK){const r=await apiRequest(API.endpoints.login,{method:'POST',body:{email,password:pw}});sessionStorage.setItem('spps_token',r.token);return r.user}
 await sleep(700);if(pw==='wrong')throw new Error('Incorrect credentials (demo).');
 const role=/admin/i.test(email)?'admin':/faculty/i.test(email)?'faculty':'student';return{...DEMO.users[role],email};}
async function authRegister(f){
 if(!API.USE_MOCK){const r=await apiRequest(API.endpoints.register,{method:'POST',body:{...f,password:f.pw}});sessionStorage.setItem('spps_token',r.token);return r.user}
 await sleep(800);if(DEMO.appUsers.some(u=>u.email===f.email))throw new Error('Email already registered (demo).');
 return{name:f.name,email:f.email,dept:f.dept,sem:f.sem,id:f.sid,role:'student'};}
