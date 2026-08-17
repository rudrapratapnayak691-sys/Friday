let locked=true;

const $=id=>document.getElementById(id);

function speak(text){
 $("reply").textContent="FRIDAY: "+text;

 speechSynthesis.cancel();

 let voice=new SpeechSynthesisUtterance(text);
 voice.rate=.95;
 voice.pitch=.9;

 speechSynthesis.speak(voice);
}

function toggleLock(){

 locked=!locked;

 $("lockBtn").textContent=locked?"🔒":"🔓";

 $("status").textContent=
 locked?"SYSTEM LOCKED":"SYSTEM ONLINE";

 if(locked)
  speak("Systems locked.");
 else
  speak("Systems online.");
}

function run(){

 let text=$("cmd").value.trim();

 if(!text)return;

 let q=text.toLowerCase();

 if(q.includes("unlock friday")||q==="unlock"){
  locked=false;
  $("lockBtn").textContent="🔓";
  $("status").textContent="SYSTEM ONLINE";
  speak("Systems online.");
  return;
 }

 if(q.includes("lock friday")||q==="lock"){
  locked=true;
  $("lockBtn").textContent="🔒";
  $("status").textContent="SYSTEM LOCKED";
  speak("Systems locked.");
  return;
 }

 if(locked){
  speak("Please unlock me first.");
  return;
 }

 if(q.includes("show neural")||
    q.includes("neural system")){

   showNeural();
   return;
 }

 if(q.includes("exit neural")){
  hideNeural();
  return;
 }

 if(q.startsWith("open ")){

  let name=q.substring(5).trim();

  let sites={
   "youtube":"https://youtube.com",
   "chatgpt":"https://chatgpt.com",
   "google":"https://google.com",
   "github":"https://github.com",
   "instagram":"https://instagram.com",
   "roblox":"https://roblox.com",
   "whatsapp":"https://web.whatsapp.com"
  };

  let url=sites[name];

  if(!url){

   if(name.startsWith("http"))
    url=name;
   else
    url="https://"+name;
  }

  speak("Opening "+name);

  setTimeout(()=>{
   window.open(url,"_blank");
  },600);

  return;
 }

 if(q.startsWith("search ")){

  google(text.substring(7));
  return;
 }

 google(text);
}

function google(text){

 speak("Searching Google.");

 setTimeout(()=>{

  window.open(
   "https://www.google.com/search?q="+
   encodeURIComponent(text),
   "_blank"
  );

 },600);
}

function voice(){

 if(!("webkitSpeechRecognition" in window)){

  speak("Voice recognition is not supported.");
  return;

 }

 let recognition=
 new webkitSpeechRecognition();

 recognition.lang="en-US";
 recognition.continuous=false;

 $("status").textContent="LISTENING...";

 recognition.start();

 recognition.onresult=e=>{

  let text=
   e.results[0][0].transcript;

  $("cmd").value=text;

  $("status").textContent="PROCESSING...";

  run();
 };

 recognition.onerror=()=>{
  $("status").textContent=
   locked?"SYSTEM LOCKED":"SYSTEM ONLINE";
 };
}


/* NEURAL SYSTEM */

let animation;

function showNeural(){

 if(locked){

  speak("Unlock me to access the neural system.");
  return;

 }

 $("ui").style.display="none";
 $("neural").style.display="block";

 createBrain();
}

function hideNeural(){

 $("neural").style.display="none";
 $("ui").style.display="block";

 cancelAnimationFrame(animation);

 speak("Neural system closed.");
}

function createBrain(){

 let canvas=$("brain");
 let ctx=canvas.getContext("2d");

 canvas.width=innerWidth;
 canvas.height=innerHeight*.82;

 let nodes=[];

 for(let i=0;i<120;i++){

  nodes.push({

   x:Math.random()*canvas.width,
   y:Math.random()*canvas.height,

   vx:(Math.random()-.5)*1.2,
   vy:(Math.random()-.5)*1.2,

   pulse:Math.random()*10

  });
 }

 let signals=[];

 function draw(){

  ctx.clearRect(
   0,0,
   canvas.width,
   canvas.height
  );

  /* connections */

  for(let a of nodes){

   for(let b of nodes){

    let dx=a.x-b.x;
    let dy=a.y-b.y;

    let d=Math.sqrt(dx*dx+dy*dy);

    if(d<110){

     ctx.strokeStyle=
      "rgba(255,216,74,"+
      (1-d/110)*.45+")";

     ctx.lineWidth=1;

     ctx.beginPath();

     ctx.moveTo(a.x,a.y);
     ctx.lineTo(b.x,b.y);

     ctx.stroke();
    }
   }
  }

  /* nodes */

  for(let n of nodes){

   n.x+=n.vx;
   n.y+=n.vy;

   n.pulse+=.08;

   if(n.x<0||n.x>canvas.width)
    n.vx*=-1;

   if(n.y<0||n.y>canvas.height)
    n.vy*=-1;

   let glow=
    3+Math.sin(n.pulse)*2;

   ctx.shadowBlur=glow*4;
   ctx.shadowColor="#ffd84a";
   ctx.fillStyle="#ffd84a";

   ctx.beginPath();

   ctx.arc(
    n.x,
    n.y,
    2.5+Math.sin(n.pulse)*.7,
    0,
    Math.PI*2
   );

   ctx.fill();
  }

  /* moving neural signals */

  if(Math.random()<.08){

   let n=
    nodes[Math.floor(Math.random()*nodes.length)];

   signals.push({
    x:n.x,
    y:n.y,
    life:0,
    max:60
   });
  }

  for(let s of signals){

   s.life++;

   s.x+=1.8;
   s.y+=Math.sin(s.life*.15);

   ctx.fillStyle="#ffffff";
   ctx.shadowBlur=20;
   ctx.shadowColor="#ffd84a";

   ctx.beginPath();
   ctx.arc(s.x,s.y,4,0,Math.PI*2);
   ctx.fill();
  }

  signals=
   signals.filter(s=>s.life<s.max);

  animation=
   requestAnimationFrame(draw);
 }

 draw();
}
