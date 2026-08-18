let locked=true;
let camera=null;
let hands=null;

let brainAnimation=null;
let nodes=[];
let zoom=1;
let panX=0;
let panY=0;

const $=id=>document.getElementById(id);


/* =========================
   VOICE
========================= */

function speak(text){

 $("reply").textContent="FRIDAY: "+text;

 speechSynthesis.cancel();

 let voices=speechSynthesis.getVoices();

 let female=
 voices.find(v =>
  /female|samantha|zira|google us english/i
  .test(v.name)
 );

 let v=female || voices[0];

 let u=new SpeechSynthesisUtterance(text);

 u.voice=v;
 u.lang="en-US";

 /* deeper, slower voice */
 u.rate=.84;
 u.pitch=.72;
 u.volume=1;

 speechSynthesis.speak(u);
}


/* =========================
   LOCK / UNLOCK
========================= */

function toggleLock(){

 locked=!locked;

 if(locked){

  document.body.classList.remove("unlocked");

  $("lockBtn").textContent="🔒";

  $("status").textContent=
   "SYSTEM LOCKED";

  $("unlockBtn").innerHTML=
   "🔓<small>UNLOCK</small>";

  speak("Systems locked.");

 }else{

  document.body.classList.add("unlocked");

  $("lockBtn").textContent="🔓";

  $("status").textContent=
   "SYSTEM ONLINE";

  $("unlockBtn").innerHTML=
   "🔒<small>LOCK</small>";

  speak("Systems online.");
 }
}


/* =========================
   COMMANDS
========================= */

function run(){

 let text=$("cmd").value.trim();

 if(!text)return;

 let q=text.toLowerCase();


 /* unlock */

 if(
  q==="unlock" ||
  q.includes("unlock friday") ||
  q.includes("wake up friday")
 ){

  if(locked)
   toggleLock();

  return;
 }


 /* lock */

 if(
  q==="lock" ||
  q.includes("lock friday")
 ){

  if(!locked)
   toggleLock();

  return;
 }


 /* greeting */

 if(
  q==="hello" ||
  q.includes("hello friday") ||
  q.includes("hi friday") ||
  q.includes("hey friday")
 ){

  speak(
   "Hello. I'm FRIDAY. Systems are ready."
  );

  return;
 }


 /* neural question */

 if(
  q.includes("how are neural systems updated") ||
  q.includes("how are neural systems updated")
 ){

  speak(
   "Neural systems are updated by improving their architecture, training data, algorithms, and processing connections."
  );

  return;
 }


 if(
  q.includes("show neural") ||
  q.includes("neural system")
 ){

  showNeural();

  return;
 }


 if(q.includes("exit neural")){

  hideNeural();

  return;
 }


 if(locked){

  speak(
   "Please unlock me first."
  );

  return;
 }


 /* websites */

 if(q.startsWith("open ")){

  let name=
   q.substring(5).trim();

  let sites={

   youtube:"https://youtube.com",

   chatgpt:"https://chatgpt.com",

   google:"https://google.com",

   github:"https://github.com",

   instagram:"https://instagram.com",

   roblox:"https://roblox.com",

   whatsapp:"https://web.whatsapp.com"

  };

  let url=sites[name];

  if(!url){

   url=name.startsWith("http")
    ?name
    :"https://"+name;
  }

  speak("Opening "+name);

  setTimeout(
   ()=>window.open(url,"_blank"),
   500
  );

  return;
 }


 /* google */

 if(q.startsWith("search ")){

  google(text.substring(7));

  return;
 }


 google(text);
}


/* =========================
   GOOGLE
========================= */

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


/* =========================
   VOICE RECOGNITION
========================= */

function voice(){

 if(
  !("webkitSpeechRecognition"
  in window)
 ){

  speak(
   "Voice recognition is not supported."
  );

  return;
 }

 let r=
  new webkitSpeechRecognition();

 r.lang="en-US";
 r.continuous=false;

 $("status").textContent=
  "LISTENING...";

 r.start();

 r.onresult=e=>{

  let text=
   e.results[0][0].transcript;

  $("cmd").value=text;

  run();

 };

 r.onend=()=>{

  if(!locked)
   $("status").textContent=
    "SYSTEM ONLINE";
  else
   $("status").textContent=
    "SYSTEM LOCKED";
 };
}


/* =========================
   NEURAL SYSTEM
========================= */

function showNeural(){

 if(locked){

  speak(
   "Unlock me to access the neural system."
  );

  return;
 }

 $("neural").style.display="block";

 createBrain();
}


function hideNeural(){

 $("neural").style.display="none";

 cancelAnimationFrame(
  brainAnimation
 );
}


function createBrain(){

 let c=$("brain");
 let ctx=c.getContext("2d");

 c.width=innerWidth;
 c.height=innerHeight;

 nodes=[];

 for(let i=0;i<130;i++){

  nodes.push({

   x:Math.random()*c.width,
   y:Math.random()*c.height,

   vx:(Math.random()-.5)*1.2,
   vy:(Math.random()-.5)*1.2,

   pulse:Math.random()*10
  });
 }


 function draw(){

  ctx.clearRect(
   0,0,c.width,c.height
  );

  ctx.save();

  ctx.translate(
   c.width/2+panX,
   c.height/2+panY
  );

  ctx.scale(zoom,zoom);

  ctx.translate(
   -c.width/2,
   -c.height/2
  );


  /* connections */

  for(let a of nodes){

   for(let b of nodes){

    let d=Math.hypot(
     a.x-b.x,
     a.y-b.y
    );

    if(d<115){

     ctx.strokeStyle=
      "rgba(255,216,74,"+
      ((1-d/115)*.35)+
      ")";

     ctx.beginPath();

     ctx.moveTo(
      a.x,a.y
     );

     ctx.lineTo(
      b.x,b.y
     );

     ctx.stroke();
    }
   }
  }


  /* neurons */

  for(let n of nodes){

   n.x+=n.vx;
   n.y+=n.vy;

   n.pulse+=.08;

   if(
    n.x<0 ||
    n.x>c.width
   )n.vx*=-1;

   if(
    n.y<0 ||
    n.y>c.height
   )n.vy*=-1;

   let s=
    3+Math.sin(n.pulse);

   ctx.shadowBlur=18;
   ctx.shadowColor="#ffd84a";

   ctx.fillStyle="#ffd84a";

   ctx.beginPath();

   ctx.arc(
    n.x,
    n.y,
    s,
    0,
    Math.PI*2
   );

   ctx.fill();
  }


  /* CENTRAL CORE */

  ctx.shadowBlur=45;
  ctx.shadowColor="#ffd84a";
  ctx.fillStyle="#ffd84a";

  ctx.beginPath();

  ctx.arc(
   c.width/2,
   c.height/2,
   28,
   0,
   Math.PI*2
  );

  ctx.fill();

  ctx.restore();

  brainAnimation=
   requestAnimationFrame(draw);
 }

 draw();
}


/* neural zoom */

function zoomNeural(amount){

 zoom*=amount;

 zoom=Math.max(
  .5,
  Math.min(zoom,3)
 );
}


function resetNeural(){

 zoom=1;

 panX=0;
 panY=0;
}


/* =========================
   HAND TRACKING
========================= */

function startHands(){

 if(locked){

  speak(
   "Unlock me before enabling hand tracking."
  );

  return;
 }

 $("handUI").style.display="block";

 let video=$("video");

 hands=new Hands({

  locateFile:file=>
   `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`

 });

 hands.setOptions({

  maxNumHands:2,

  modelComplexity:1,

  minDetectionConfidence:.6,

  minTrackingConfidence:.6

 });

 hands.onResults(
  handResults
 );

 camera=new Camera(
  video,
  {

   onFrame:async()=>{

    await hands.send({
     image:video
    });

   },

   width:640,
   height:480
  }
 );

 camera.start();

 speak(
  "Hand tracking online."
 );
}


function stopHands(){

 $("handUI").style.display="none";

 if(camera)
  camera.stop();
}


/* =========================
   HAND GESTURES
========================= */

function handResults(results){

 let canvas=
  $("handCanvas");

 let ctx=
  canvas.getContext("2d");

 canvas.width=innerWidth;
 canvas.height=innerHeight;

 ctx.clearRect(
  0,0,
  canvas.width,
  canvas.height
 );


 if(
  !results.multiHandLandmarks
 ){
  $("gesture").textContent=
   "SEARCHING FOR HAND...";
  return;
 }


 let handsFound=
  results.multiHandLandmarks;


 /* DRAW HANDS */

 for(let hand of handsFound){

  for(let p of hand){

   let x=
    (1-p.x)*canvas.width;

   let y=
    p.y*canvas.height;

   ctx.fillStyle="#ffd84a";

   ctx.shadowBlur=15;

   ctx.shadowColor="#ffd84a";

   ctx.beginPath();

   ctx.arc(
    x,y,
    5,
    0,
    Math.PI*2
   );

   ctx.fill();
  }
 }


 /* ONE HAND */

 if(handsFound.length===1){

  let h=
   handsFound[0];

  let index=h[8];
  let thumb=h[4];

  let x=
   (1-index.x)*canvas.width;

  let y=
   index.y*canvas.height;

  let tx=
   (1-thumb.x)*canvas.width;

  let ty=
   thumb.y*canvas.height;

  let pinch=
   Math.hypot(
    x-tx,
    y-ty
   );


  /* cursor */

  ctx.strokeStyle="#fff";

  ctx.lineWidth=2;

  ctx.beginPath();

  ctx.arc(
   x,y,
   25,
   0,
   Math.PI*2
  );

  ctx.stroke();


  /* pinch */

  if(pinch<45){

   $("gesture").textContent=
    "PINCH • SELECT";

   ctx.beginPath();

   ctx.arc(
    x,y,
    40,
    0,
    Math.PI*2
   );

   ctx.stroke();

  }else{

   $("gesture").textContent=
    "INDEX • MOVE";
  }
 }


 /* TWO HANDS = ZOOM */

 if(handsFound.length===2){

  let a=
   handsFound[0][8];

  let b=
   handsFound[1][8];

  let ax=
   (1-a.x)*canvas.width;

  let ay=
   a.y*canvas.height;

  let bx=
   (1-b.x)*canvas.width;

  let by=
   b.y*canvas.height;

  let distance=
   Math.hypot(
    ax-bx,
    ay-by
   );

  $("gesture").textContent=
   "TWO HANDS • ZOOM";

  if(distance>300)
   zoomNeural(1.01);

  if(distance<150)
   zoomNeural(.99);
 }
}
