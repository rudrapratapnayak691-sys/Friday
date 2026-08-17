let locked=true;
let neuralAnimation;

const $=id=>document.getElementById(id);


/* VOICE */

function speak(text){

$("reply").textContent=
"FRIDAY: "+text;

speechSynthesis.cancel();

let u=
new SpeechSynthesisUtterance(text);

u.lang="en-US";
u.rate=.82;
u.pitch=.55;
u.volume=1;

speechSynthesis.speak(u);
}


/* LOCK */

function toggleLock(){

locked=!locked;

document.querySelector(
"header button"
).textContent=
locked?"🔒":"🔓";

$("status").textContent=
locked?
"SYSTEM LOCKED":
"SYSTEM ONLINE";

speak(
locked?
"Systems locked.":
"Systems online."
);
}


/* COMMAND SYSTEM */

function run(){

let text=
$("cmd").value.trim();

if(!text)return;

let q=text.toLowerCase();


if(q==="unlock" ||
q.includes("unlock friday")){

locked=false;

$("status").textContent=
"SYSTEM ONLINE";

speak("Systems online.");

return;
}


if(q==="lock" ||
q.includes("lock friday")){

locked=true;

$("status").textContent=
"SYSTEM LOCKED";

speak("Systems locked.");

return;
}


if(locked){

speak(
"Please unlock me first."
);

return;
}


/* NEURAL */

if(q.includes("show neural") ||
q.includes("neural system")){

showNeural();

return;
}


if(q.includes("exit neural")){

hideNeural();

return;
}


/* OPEN WEBSITES */

if(q.startsWith("open ")){

let name=
q.substring(5).trim();

let sites={

youtube:
"https://youtube.com",

chatgpt:
"https://chatgpt.com",

google:
"https://google.com",

github:
"https://github.com",

instagram:
"https://instagram.com",

roblox:
"https://roblox.com",

whatsapp:
"https://web.whatsapp.com"

};

let url=sites[name];

if(!url){

url=name.startsWith("http")?
name:
"https://"+name;

}

speak(
"Opening "+name
);

setTimeout(()=>{

window.open(
url,
"_blank"
);

},600);

return;
}


/* SEARCH */

if(q.startsWith("search ")){

google(
text.substring(7)
);

return;
}


/* NORMAL QUESTION */

google(text);

}


/* GOOGLE */

function google(text){

speak(
"Searching Google."
);

setTimeout(()=>{

window.open(

"https://www.google.com/search?q="+
encodeURIComponent(text),

"_blank"

);

},600);

}


/* VOICE */

function voice(){

if(!("webkitSpeechRecognition"
in window)){

speak(
"Voice recognition is not supported."
);

return;

}

let r=
new webkitSpeechRecognition();

r.lang="en-US";

$("status").textContent=
"LISTENING...";

r.start();

r.onresult=e=>{

let text=
e.results[0][0].transcript;

$("cmd").value=text;

run();

};

}


/* NEURAL SYSTEM */

function showNeural(){

if(locked){

speak(
"Unlock me to access the neural system."
);

return;

}

$("ui").style.display="none";

$("neural").style.display="block";

createNeural();

}


function hideNeural(){

$("neural").style.display="none";

$("ui").style.display="block";

cancelAnimationFrame(
neuralAnimation
);

}


/* ANIMATED NEURAL NETWORK */

function createNeural(){

let canvas=
$("brain");

let ctx=
canvas.getContext("2d");

canvas.width=
innerWidth;

canvas.height=
innerHeight*.82;


let nodes=[];

for(let i=0;i<130;i++){

nodes.push({

x:Math.random()*canvas.width,

y:Math.random()*canvas.height,

vx:(Math.random()-.5)*1.4,

vy:(Math.random()-.5)*1.4,

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


/* CONNECTIONS */

for(let a of nodes){

for(let b of nodes){

let d=Math.hypot(
a.x-b.x,
a.y-b.y
);

if(d<115){

ctx.strokeStyle=
"rgba(255,216,61,"+
(1-d/115)*.4+
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


/* NEURONS */

for(let n of nodes){

n.x+=n.vx;
n.y+=n.vy;

n.pulse+=.08;

if(n.x<0 ||
n.x>canvas.width)
n.vx*=-1;

if(n.y<0 ||
n.y>canvas.height)
n.vy*=-1;

let size=
3+Math.sin(n.pulse);

ctx.shadowBlur=18;

ctx.shadowColor="#ffd83d";

ctx.fillStyle="#ffd83d";

ctx.beginPath();

ctx.arc(
n.x,
n.y,
size,
0,
Math.PI*2
);

ctx.fill();

}


/* SIGNALS */

if(Math.random()<.1){

let n=
nodes[
Math.floor(
Math.random()*nodes.length
)
];

signals.push({

x:n.x,
y:n.y,
life:0

});

}


for(let s of signals){

s.x+=2;

s.life++;

ctx.fillStyle="#fff";

ctx.shadowBlur=25;

ctx.shadowColor="#ffd83d";

ctx.beginPath();

ctx.arc(
s.x,
s.y,
4,
0,
Math.PI*2
);

ctx.fill();

}

signals=
signals.filter(
s=>s.life<70
);


neuralAnimation=
requestAnimationFrame(draw);

}

draw();

}


/* HAND TRACKING */

let camera;
let hands;


function startHands(){

if(locked){

speak(
"Unlock me before enabling hand tracking."
);

return;
}

$("handUI").style.display=
"block";

let video=
$("video");

hands=
new Hands({

locateFile:file=>
`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`

});


hands.setOptions({

maxNumHands:1,

modelComplexity:1,

minDetectionConfidence:.6,

minTrackingConfidence:.6

});


hands.onResults(
handResults
);


camera=
new Camera(
video,
{

onFrame:async()=>{

await hands.send({
image:video
});

},

width:640,
height:480

});


camera.start();

speak(
"Hand tracking online."
);

}


function stopHands(){

$("handUI").style.display=
"none";

if(camera){

camera.stop();

}

}


function handResults(results){

let canvas=
$("handCanvas");

let ctx=
canvas.getContext("2d");

canvas.width=
innerWidth;

canvas.height=
innerHeight;

ctx.clearRect(
0,0,
canvas.width,
canvas.height
);


if(!results.multiHandLandmarks)
return;


for(let hand of
results.multiHandLandmarks){

/* DRAW NEURAL-LIKE HAND */

for(let p of hand){

let x=
(1-p.x)*canvas.width;

let y=
p.y*canvas.height;

ctx.fillStyle="#ffd83d";

ctx.shadowBlur=15;

ctx.shadowColor="#ffd83d";

ctx.beginPath();

ctx.arc(
x,y,
5,
0,
Math.PI*2
);

ctx.fill();

}


/* INDEX FINGER */

let index=hand[8];

let x=
(1-index.x)*canvas.width;

let y=
index.y*canvas.height;


/* HOLOGRAPHIC CURSOR */

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


/* PINCH */

let thumb=hand[4];

let tx=
(1-thumb.x)*canvas.width;

let ty=
thumb.y*canvas.height;

let distance=
Math.hypot(
x-tx,
y-ty
);


if(distance<35){

ctx.strokeStyle="#fff";

ctx.beginPath();

ctx.arc(
x,y,
40,
0,
Math.PI*2
);

ctx.stroke();

$("status").textContent=
"HAND SELECT";

}

else{

$("status").textContent=
"HAND TRACKING";

}

}

}
