/* =================================
   FRIDAY MK 2.3
================================= */

const $ = id =>
  document.getElementById(id);


/* STATE */

let online = false;
let neuralOpen = false;
let handRunning = false;
let neuralPaused = false;


/* =================================
   UNLOCK
================================= */

$("unlockBtn").onclick = unlock;

function unlock(){

  if(online) return;

  document.body.classList.add("unlocking");

  $("status").textContent =
    "ACTIVATING FRIDAY...";

  speak("Activating.");

  setTimeout(() => {

    document.body.classList.remove(
      "locked",
      "unlocking"
    );

    document.body.classList.add(
      "online"
    );

    online = true;

    $("status").textContent =
      "FRIDAY — ONLINE";

    $("command").disabled = false;

    $("command").placeholder =
      "Ask FRIDAY...";

    $("reply").textContent =
      "All systems online.";

  },1400);
}


/* =================================
   VOICE
================================= */

$("voiceBtn").onclick = voice;

function voice(){

  if(!online){

    speak("FRIDAY is in sleep mode.");

    return;
  }

  if(!("webkitSpeechRecognition" in window)){

    speak(
      "Voice recognition is not supported."
    );

    return;
  }

  $("status").textContent =
    "LISTENING...";

  document.body.classList.add(
    "talking"
  );

  const recognition =
    new webkitSpeechRecognition();

  recognition.lang = "en-US";

  recognition.continuous = false;

  recognition.interimResults = false;

  recognition.start();

  recognition.onresult = event => {

    const text =
      event.results[0][0].transcript;

    $("command").value = text;

    document.body.classList.remove(
      "talking"
    );

    runCommand(text);
  };

  recognition.onerror = () => {

    document.body.classList.remove(
      "talking"
    );

    $("status").textContent =
      "FRIDAY — ONLINE";
  };
}


/* =================================
   TEXT COMMAND
================================= */

$("sendBtn").onclick = () => {

  runCommand(
    $("command").value
  );

};


$("command").addEventListener(
  "keydown",
  e => {

    if(e.key === "Enter"){

      runCommand(
        $("command").value
      );

    }

  }
);


/* =================================
   COMMAND SYSTEM
================================= */

function runCommand(text){

  if(!online){

    speak(
      "Please activate FRIDAY first."
    );

    return;
  }

  text = text.trim();

  if(!text) return;

  const lower =
    text.toLowerCase();


  /* HELLO */

  if(lower === "hello" ||
     lower.includes("hello friday")){

    respond(
      "Hello Boss. All systems are operational."
    );

    return;
  }


  /* NEURAL */

  if(lower.includes("neural system") ||
     lower.includes("show neural")){

    showNeural();

    return;
  }


  /* SLEEP */

  if(lower.includes("sleep mode") ||
     lower.includes("lock friday")){

    lock();

    return;
  }


  /* OPEN COMMAND */

  if(lower.startsWith("open ")){

    const site =
      text.substring(5).trim();

    openSite(site);

    return;
  }


  /* SEARCH */

  searchGoogle(text);
}


/* =================================
   GOOGLE
================================= */

function searchGoogle(question){

  $("status").textContent =
    "SEARCHING GOOGLE...";

  $("reply").textContent =
    "Searching: " + question;

  speak("Searching Google.");

  window.open(
    "https://www.google.com/search?q=" +
    encodeURIComponent(question),
    "_blank"
  );

}


/* =================================
   OPEN WEBSITE
================================= */

function openSite(name){

  let url = name;

  if(!url.startsWith("http")){

    if(!url.includes(".")){

      url =
        "https://www.google.com/search?q=" +
        encodeURIComponent(name);

    }else{

      url =
        "https://" + url;
    }
  }

  speak("Opening " + name);

  window.open(url,"_blank");
}


/* =================================
   SPEAK
================================= */

function speak(text){

  speechSynthesis.cancel();

  const voice =
    new SpeechSynthesisUtterance(text);

  voice.rate = .88;
  voice.pitch = .82;
  voice.volume = 1;

  speechSynthesis.speak(voice);
}


/* =================================
   RESPONSE
================================= */

function respond(text){

  $("reply").textContent =
    "FRIDAY: " + text;

  speak(text);
}


/* =================================
   LOCK
================================= */

function lock(){

  online = false;

  document.body.classList.remove(
    "online"
  );

  document.body.classList.add(
    "locked"
  );

  $("status").textContent =
    "FRIDAY — SLEEP MODE";

  $("command").disabled = true;

  $("command").value = "";

  $("command").placeholder =
    "FRIDAY is sleeping...";

  $("reply").textContent =
    "SYSTEM STANDBY";

  speak("Entering sleep mode.");
}


/* =================================
   NEURAL SYSTEM
================================= */

$("neuralBtn").onclick =
  showNeural;

$("exitNeural").onclick =
  hideNeural;


function showNeural(){

  if(!online){

    speak(
      "Neural system unavailable while sleeping."
    );

    return;
  }

  neuralOpen = true;

  $("neuralScreen").style.display =
    "block";

  startNeural();

}


function hideNeural(){

  neuralOpen = false;

  $("neuralScreen").style.display =
    "none";
}


/* =================================
   THREE.JS NEURAL NETWORK
================================= */

let scene;
let camera;
let renderer;

let neuralGroup;

let nodes = [];

let neuralStarted = false;


function startNeural(){

  if(neuralStarted) return;

  neuralStarted = true;

  const canvas =
    $("neuralCanvas");

  scene =
    new THREE.Scene();

  camera =
    new THREE.PerspectiveCamera(
      60,
      innerWidth / innerHeight,
      .1,
      1000
    );

  camera.position.z = 8;

  renderer =
    new THREE.WebGLRenderer({
      canvas:canvas,
      alpha:true,
      antialias:true
    });

  renderer.setSize(
    innerWidth,
    innerHeight
  );

  neuralGroup =
    new THREE.Group();

  scene.add(neuralGroup);


  /* NODES */

  for(let i=0;i<150;i++){

    const geometry =
      new THREE.SphereGeometry(
        .025,
        8,
        8
      );

    const material =
      new THREE.MeshBasicMaterial({
        color:0xff6500
      });

    const node =
      new THREE.Mesh(
        geometry,
        material
      );

    node.position.set(
      (Math.random()-.5)*6,
      (Math.random()-.5)*4,
      (Math.random()-.5)*4
    );

    neuralGroup.add(node);

    nodes.push(node);
  }


  /* CONNECTIONS */

  for(let i=0;i<80;i++){

    const a =
      nodes[
        Math.floor(
          Math.random()*nodes.length
        )
      ];

    const b =
      nodes[
        Math.floor(
          Math.random()*nodes.length
        )
      ];

    const points=[
      a.position,
      b.position
    ];

    const geometry =
      new THREE.BufferGeometry()
      .setFromPoints(points);

    const material =
      new THREE.LineBasicMaterial({
        color:0xff6500,
        transparent:true,
        opacity:.25
      });

    neuralGroup.add(
      new THREE.Line(
        geometry,
        material
      )
    );
  }


  animateNeural();
}


/* =================================
   NEURAL ANIMATION
================================= */

function animateNeural(){

  requestAnimationFrame(
    animateNeural
  );

  if(!neuralPaused){

    neuralGroup.rotation.y += .002;

    neuralGroup.rotation.x += .0007;

  }

  renderer.render(
    scene,
    camera
  );
}


/* =================================
   HAND TRACKING
================================= */

$("handBtn").onclick =
  startHands;


const video =
  $("video");

const handCanvas =
  $("handCanvas");

const handCtx =
  handCanvas.getContext("2d");


let lastX = null;
let lastY = null;


async function startHands(){

  if(!online){

    speak(
      "Activate FRIDAY first."
    );

    return;
  }

  $("cameraBox").style.display =
    "block";

  handRunning = true;

  const hands =
    new Hands({
      locateFile:file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

  hands.setOptions({

    maxNumHands:1,

    modelComplexity:1,

    minDetectionConfidence:.65,

    minTrackingConfidence:.65

  });


  hands.onResults(
    onHands
  );


  const cameraFeed =
    new Camera(
      video,
      {

        onFrame:async()=>{

          if(handRunning){

            await hands.send({
              image:video
            });

          }

        },

        width:1280,
        height:720

      }
    );

  cameraFeed.start();
}


/* =================================
   HAND RESULTS
================================= */

function onHands(results){

  handCanvas.width =
    innerWidth;

  handCanvas.height =
    innerHeight;

  handCtx.clearRect(
    0,
    0,
    innerWidth,
    innerHeight
  );


  if(!results.multiHandLandmarks ||
     !results.multiHandLandmarks.length){

    $("handStatus").textContent =
      "HAND NOT FOUND";

    return;
  }


  const hand =
    results.multiHandLandmarks[0];


  $("handStatus").textContent =
    "HAND DETECTED";


  /* DRAW HAND */

  hand.forEach(point=>{

    const x =
      point.x *
      innerWidth;

    const y =
      point.y *
      innerHeight;

    handCtx.beginPath();

    handCtx.arc(
      x,
      y,
      4,
      0,
      Math.PI*2
    );

    handCtx.fillStyle =
      "#ff6500";

    handCtx.fill();

  });


  /* PALM */

  const palm =
    hand[9];


  /* =================================
     HAND MOVEMENT = NEURAL ROTATION
  ================================= */

  if(lastX !== null){

    const dx =
      palm.x-lastX;

    const dy =
      palm.y-lastY;

    if(neuralGroup){

      neuralGroup.rotation.y +=
        dx * 5;

      neuralGroup.rotation.x +=
        dy * 3;
    }

  }

  lastX = palm.x;
  lastY = palm.y;


  /* =================================
     PINCH DETECTION
  ================================= */

  const thumb =
    hand[4];

  const index =
    hand[8];

  const distance =
    Math.hypot(
      thumb.x-index.x,
      thumb.y-index.y
    );


  if(distance < .06){

    $("gesture").textContent =
      "PINCH — SELECT";

  }else{

    $("gesture").textContent =
      "HAND — ROTATE";
  }


  /* =================================
     OPEN PALM = PAUSE
  ================================= */

  const fingersOpen =
    isFingerOpen(hand,8) &&
    isFingerOpen(hand,12) &&
    isFingerOpen(hand,16) &&
    isFingerOpen(hand,20);


  if(fingersOpen){

    neuralPaused = true;

    $("gesture").textContent =
      "OPEN PALM — PAUSED";

  }else{

    neuralPaused = false;
  }
}


function isFingerOpen(hand,tip){

  return hand[tip].y <
         hand[tip-2].y;
}


/* =================================
   CLOSE HAND TRACKING
================================= */

$("closeHand").onclick = () => {

  handRunning = false;

  $("cameraBox").style.display =
    "none";

};


/* =================================
   LOGIN
================================= */

$("loginBtn").onclick = () => {

  $("loginPanel").style.display =
    "grid";

};


$("closeLogin").onclick = () => {

  $("loginPanel").style.display =
    "none";

};


$("loginSubmit").onclick = () => {

  const user =
    $("username").value.trim();

  const pass =
    $("password").value.trim();


  if(!user || !pass){

    $("loginStatus").textContent =
      "AUTHORIZATION REQUIRED";

    return;
  }


  $("loginStatus").textContent =
    "AUTHENTICATION ACCEPTED";

};


/* =================================
   RESIZE
================================= */

window.addEventListener(
  "resize",
  ()=>{

    if(camera && renderer){

      camera.aspect =
        innerWidth/innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        innerWidth,
        innerHeight
      );

    }

  }
);
