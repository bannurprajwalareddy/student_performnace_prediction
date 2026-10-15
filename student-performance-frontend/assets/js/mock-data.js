/* SAMPLE DATA ONLY. Replace with API data functions later (see config.js). */
const NAMES=['Aarav Mehta','Diya Nair','Rohan Das','Sneha Iyer','Kabir Shah','Meera Rao','Vikram Singh','Ananya Das','Ishaan Roy','Tara Menon','Arjun Patel','Nisha Verma','Dev Kapoor','Riya Jain','Karan Bose'];
const DEPTS=['CSE-DS','CSE','IT','ECE'];
const mkStudent=(n,i)=>{const d={att:58+(i*7)%40,internal:45+(i*11)%50,prev:48+(i*13)%47,assign:50+(i*9)%50,gpa:+(5.5+(i*3)%35/10).toFixed(1),study:1+(i*2)%6};
 const r=demoPredict(d);return{id:'S-'+(2001+i),name:n,dept:DEPTS[i%4],sem:3+i%4,...d,score:r.score,category:r.category};};
const DEMO={
 users:{student:{name:'Demo Student',email:'student@demo.test',dept:'CSE-DS',sem:5,id:'S-1001',role:'student'},
  faculty:{name:'Demo Faculty',email:'faculty@demo.test',dept:'CSE-DS',id:'F-501',role:'faculty'},
  admin:{name:'Demo Admin',email:'admin@demo.test',id:'A-001',role:'admin'}},
 students:NAMES.map(mkStudent),
 records:[{sem:1,att:82,internal:68,prev:64,assign:80,gpa:7.1},{sem:2,att:85,internal:72,prev:70,assign:84,gpa:7.5},{sem:3,att:79,internal:70,prev:68,assign:78,gpa:7.4},{sem:4,att:88,internal:78,prev:75,assign:88,gpa:8.0},{sem:5,att:91,internal:82,prev:79,assign:90,gpa:8.3}],
 history:[0,1,2,3,4,5].map(i=>{const d={att:70+i*4,internal:60+i*5,prev:62+i*3,assign:65+i*5,gpa:+(7+i*.2).toFixed(1),study:2+i%4};const r=demoPredict(d);
  return{id:'H-'+i,date:`2026-0${4+i}-1${i} 10:3${i}`,...d,score:r.score,category:r.category,sample:true};})};
DEMO.appUsers=[...DEMO.students.slice(0,6).map(s=>({id:s.id,name:s.name,email:s.name.split(' ')[0].toLowerCase()+'@demo.test',role:'student',status:'Active'})),
 ...['Dr. Rao','Prof. Iyer','Dr. Khan'].map((n,i)=>({id:'F-50'+i,name:n,email:'faculty'+i+'@demo.test',role:'faculty',status:i==2?'Inactive':'Active'})),
 {id:'A-001',name:'Demo Admin',email:'admin@demo.test',role:'admin',status:'Active'}];
const getHistory=()=>API.USE_MOCK?[...store.get('spps_new',[]),...DEMO.history]:DEMO.history;
