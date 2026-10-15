/* Central API config. Set USE_MOCK=true to run the frontend alone with sample data. */
const API={USE_MOCK:false,BASE_URL:'http://'+(location.hostname||'localhost')+':5001/api',
 endpoints:{login:'/auth/login',register:'/auth/register',predict:'/predict',history:'/predictions',students:'/students',users:'/users'}};
/* One request pattern for every backend call: adds the login token, turns failures into readable Errors. */
async function apiRequest(path,{method='GET',body}={}){
 const t=sessionStorage.getItem('spps_token');let r;
 try{r=await fetch(API.BASE_URL+path,{method,headers:{'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:body?JSON.stringify(body):undefined})}
 catch{throw new Error('Cannot reach the server. Is the Flask backend running on '+API.BASE_URL+'?')}
 const j=await r.json().catch(()=>({}));
 if(!r.ok){if(r.status===401&&t){session.clear();location.href='login.html'}throw new Error(j.error||'Request failed ('+r.status+')')}
 return j;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
