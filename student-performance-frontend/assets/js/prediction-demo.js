/* DEMO prediction logic only (deterministic formula, NOT machine learning). Replace requestPrediction() with an ML API call. */
function demoPredict(d){
 const s=Math.min(100,+(.25*d.att+.2*d.internal+.25*d.prev+.1*d.assign+d.gpa+Math.min(d.study,6)*1.5).toFixed(1));
 return{score:s,category:s>=75?'High':s>=60?'Average':'At Risk',
  indicators:[d.att,d.internal,d.prev,d.assign,d.gpa*10,Math.min(d.study,6)/6*100].map(v=>+(+v).toFixed(0))};}
async function requestPrediction(d){
 if(!API.USE_MOCK)return apiRequest(API.endpoints.predict,{method:'POST',body:d});
 await sleep(1300);return demoPredict(d);}
function suggestions(d){const t=[];
 if(d.att<75)t.push('Raise attendance above 75% to avoid missing key lectures.');
 if(d.internal<60)t.push('Review internal assessment topics with your faculty.');
 if(d.study<3)t.push('Add a consistent daily study block (3+ hours).');
 if(d.assign<70)t.push('Complete pending assignments on time.');
 if(d.prev<60)t.push('Revisit weak topics from previous examinations.');
 return t.length?t:['Great work! Keep your current routine and attendance.'];}
