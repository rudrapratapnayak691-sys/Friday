/* =========================================
   FRIDAY MK 2.3 FIX
========================================= */

const $ = id => document.getElementById(id);

let online = false;
let neuralOpen = false;
let handRunning = false;
let neuralPaused = false;

let scene, camera, renderer;
let neuralGroup;
let nodes = [];
let neuralStarted = false;

let lastHandX = null;
let lastHandY = null;
let pinch = false;


/* =========================================
   LOCK / UNLOCK
========================================= */

$("unlockBtn").onclick = () => {

    if (online) {
        lockFriday();
    } else {
        unlockFriday();
    }
};


function unlockFriday() {

    document.body.classList.add("unlocking");

    $("status").textContent =
        "ACTIVATING FRIDAY...";

    speak("Activating.");

    setTimeout(() => {

        document.body.classList.remove(
            "locked",
            "unlocking"
        );

        document.body.classList.add("online");

        online = true;

        $("status").textContent =
            "FRIDAY — ONLINE";

        $("unlockBtn").innerHTML =
            "🔒<small>LOCK</small>";

        $("command").disabled = false;

        $("command").placeholder =
            "Ask FRIDAY...";

        $("reply").textContent =
            "ALL SYSTEMS ONLINE";

    }, 1400);
}


function lockFriday() {

    /* Stop hand tracking */
    handRunning = false;

    $("cameraBox").style.display =
        "none";

    /* Close neural screen */
    neuralOpen = false;

    $("neuralScreen").style.display =
        "none";

    /* Change state */
    online = false;

    document.body.classList.remove(
        "online"
    );

    document.body.classList.add(
        "locked"
    );

    $("status").textContent =
        "FRIDAY — SLEEP MODE";

    $("unlockBtn").innerHTML =
        "🔓<small>UNLOCK</small>";

    $("command").disabled = true;

    $("command").value = "";

    $("command").placeholder =
        "FRIDAY is sleeping...";

    $("reply").textContent =
        "SYSTEM STANDBY";

    speak("Entering sleep mode.");
}


/* =========================================
   VOICE
========================================= */

$("voiceBtn").onclick = voice;

function voice() {

    if (!online) {

        speak(
            "FRIDAY is in sleep mode."
        );

        return;
    }

    if (!("webkitSpeechRecognition" in window)) {

        speak(
            "Voice recognition is not supported."
        );

        return;
    }

    $("status").textContent =
        "LISTENING...";

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

        runCommand(text);
    };

    recognition.onerror = () => {

        $("status").textContent =
            "FRIDAY — ONLINE";
    };
}


/* =========================================
   COMMAND
========================================= */

$("sendBtn").onclick = () => {

    runCommand(
        $("command").value
    );
};


$("command").addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {

            runCommand(
                $("command").value
            );
        }
    }
);


function runCommand(text) {

    if (!online) {

        speak(
            "Please activate FRIDAY first."
        );

        return;
    }

    text = text.trim();

    if (!text) return;

    const lower =
        text.toLowerCase();


    if (
        lower === "hello" ||
        lower.includes("hello friday")
    ) {

        respond(
            "Hello Boss. All systems are operational."
        );

        return;
    }


    if (
        lower.includes("neural system") ||
        lower.includes("show neural") ||
        lower.includes("open neural")
    ) {

        showNeural();

        return;
    }


    if (
        lower.includes("lock friday") ||
        lower.includes("sleep mode")
    ) {

        lockFriday();

        return;
    }


    if (
        lower.startsWith("open ")
    ) {

        openSite(
            text.substring(5).trim()
        );

        return;
    }


    searchGoogle(text);
}


/* =========================================
   GOOGLE SEARCH
========================================= */

function searchGoogle(question) {

    $("status").textContent =
        "SEARCHING GOOGLE...";

    $("reply").textContent =
        "SEARCHING: " + question;

    speak("Searching Google.");

    window.open(
        "https://www.google.com/search?q=" +
        encodeURIComponent(question),
        "_blank"
    );
}


/* =========================================
   OPEN WEBSITE
========================================= */

function openSite(name) {

    let url = name;

    if (!url.startsWith("http")) {

        if (!url.includes(".")) {

            url =
                "https://www.google.com/search?q=" +
                encodeURIComponent(name);

        } else {

            url =
                "https://" + url;
        }
    }

    speak("Opening " + name);

    window.open(url, "_blank");
}


/* =========================================
   SPEECH
========================================= */

function speak(text) {

    speechSynthesis.cancel();

    const u =
        new SpeechSynthesisUtterance(text);

    u.rate = 0.88;
    u.pitch = 0.82;
    u.volume = 1;

    speechSynthesis.speak(u);
}


function respond(text) {

    $("reply").textContent =
        "FRIDAY: " + text;

    speak(text);
}


/* =========================================
   NEURAL SYSTEM
========================================= */

$("neuralBtn").onclick =
    showNeural;

$("exitNeural").onclick =
    hideNeural;


function showNeural() {

    if (!online) {

        speak(
            "Neural system unavailable while sleeping."
        );

        return;
    }

    neuralOpen = true;

    $("neuralScreen").style.display =
        "block";

    /* Automatically start hand tracking */
    startHands();

    startNeural();
}


function hideNeural() {

    neuralOpen = false;

    handRunning = false;

    $("neuralScreen").style.display =
        "none";

    $("cameraBox").style.display =
        "none";

    lastHandX = null;
    lastHandY = null;
}


/* =========================================
   THREE.JS NEURAL SYSTEM
========================================= */

function startNeural() {

    if (neuralStarted) return;

    neuralStarted = true;

    const canvas =
        $("neuralCanvas");

    scene =
        new THREE.Scene();

    camera =
        new THREE.PerspectiveCamera(
            60,
            innerWidth / innerHeight,
            0.1,
            1000
        );

    camera.position.z = 8;

    renderer =
        new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        innerWidth,
        innerHeight
    );


    neuralGroup =
        new THREE.Group();

    scene.add(neuralGroup);


    /* =====================================
       CENTRAL CORE
    ===================================== */

    const coreGeometry =
        new THREE.SphereGeometry(
            0.45,
            32,
            32
        );

    const coreMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xff6500
        });

    const core =
        new THREE.Mesh(
            coreGeometry,
            coreMaterial
        );

    neuralGroup.add(core);


    /* =====================================
       NEURONS
    ===================================== */

    for (let i = 0; i < 180; i++) {

        const geometry =
            new THREE.SphereGeometry(
                0.025 + Math.random() * 0.025,
                8,
                8
            );

        const material =
            new THREE.MeshBasicMaterial({
                color: 0xff6500
            });

        const node =
            new THREE.Mesh(
                geometry,
                material
            );


        /* Neural cloud */

        const radius =
            1.0 +
            Math.random() * 2.7;

        const theta =
            Math.random() * Math.PI * 2;

        const phi =
            Math.acos(
                2 * Math.random() - 1
            );


        node.position.set(

            radius *
            Math.sin(phi) *
            Math.cos(theta),

            radius *
            Math.sin(phi) *
            Math.sin(theta),

            radius *
            Math.cos(phi)

        );


        neuralGroup.add(node);

        nodes.push(node);
    }


    /* =====================================
       NEURAL CONNECTIONS
    ===================================== */

    for (let i = 0; i < 130; i++) {

        const a =
            nodes[
                Math.floor(
                    Math.random() *
                    nodes.length
                )
            ];

        const b =
            nodes[
                Math.floor(
                    Math.random() *
                    nodes.length
                )
            ];


        const points = [
            a.position.clone(),
            b.position.clone()
        ];


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(points);


        const material =
            new THREE.LineBasicMaterial({

                color: 0xff6500,

                transparent: true,

                opacity: 0.22
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


/* =========================================
   NEURAL ANIMATION
========================================= */

function animateNeural() {

    requestAnimationFrame(
        animateNeural
    );


    if (
        neuralGroup &&
        !neuralPaused
    ) {

        /* Slow automatic rotation */

        neuralGroup.rotation.y +=
            0.0015;

        neuralGroup.rotation.x +=
            0.0005;
    }


    if (renderer) {

        renderer.render(
            scene,
            camera
        );
    }
}


/* =========================================
   HAND TRACKING
========================================= */

$("handBtn").onclick =
    startHands;


async function startHands() {

    if (!online) {

        speak(
            "Activate FRIDAY first."
        );

        return;
    }


    if (handRunning) {

        $("cameraBox").style.display =
            "none";

        handRunning = false;

        return;
    }


    $("cameraBox").style.display =
        "block";

    $("handStatus").textContent =
        "STARTING CAMERA...";


    const hands =
        new Hands({

            locateFile: file =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`

        });


    hands.setOptions({

        maxNumHands: 1,

        modelComplexity: 1,

        minDetectionConfidence: 0.65,

        minTrackingConfidence: 0.65

    });


    hands.onResults(
        handleHands
    );


    try {

        const stream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {
                        facingMode:
                            "user"
                    },

                    audio: false
                });


        $("video").srcObject =
            stream;


        handRunning = true;


        $("handStatus").textContent =
            "HAND TRACKING ACTIVE";


        /* Send camera frames */

        async function processFrame() {

            if (!handRunning)
                return;

            await hands.send({
                image: $("video")
            });

            requestAnimationFrame(
                processFrame
            );
        }


        processFrame();


    } catch (error) {

        console.error(error);

        $("handStatus").textContent =
            "CAMERA PERMISSION REQUIRED";

        speak(
            "Camera permission is required."
        );
    }
}


/* =========================================
   HAND → NEURAL ROTATION
========================================= */

function handleHands(results) {

    const canvas =
        $("handCanvas");

    canvas.width =
        innerWidth;

    canvas.height =
        innerHeight;


    const ctx =
        canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (
        !results.multiHandLandmarks ||
        results.multiHandLandmarks.length === 0
    ) {

        $("handStatus").textContent =
            "HAND NOT FOUND";

        lastHandX = null;
        lastHandY = null;

        return;
    }


    const hand =
        results.multiHandLandmarks[0];


    $("handStatus").textContent =
        "HAND TRACKING ACTIVE";


    /* =====================================
       DRAW HAND
    ===================================== */

    for (const point of hand) {

        const x =
            point.x * innerWidth;

        const y =
            point.y * innerHeight;


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ff6500";

        ctx.shadowBlur = 15;

        ctx.shadowColor =
            "#ff6500";

        ctx.fill();
    }


    /* =====================================
       PALM POSITION
    ===================================== */

    const palm =
        hand[9];


    /*
       MediaPipe X:
       0 = left
       1 = right

       We convert it to
       neural rotation.
    */


    if (
        lastHandX !== null &&
        lastHandY !== null &&
        neuralGroup
    ) {

        const dx =
            palm.x - lastHandX;

        const dy =
            palm.y - lastHandY;


        /*
          LEFT / RIGHT HAND MOVEMENT
          = Y ROTATION
        */

        neuralGroup.rotation.y +=
            dx * 8;


        /*
          UP / DOWN HAND MOVEMENT
          = X ROTATION
        */

        neuralGroup.rotation.x +=
            dy * 6;
    }


    lastHandX =
        palm.x;

    lastHandY =
        palm.y;


    /* =====================================
       PINCH
    ===================================== */

    const thumb =
        hand[4];

    const index =
        hand[8];


    const distance =
        Math.hypot(
            thumb.x - index.x,
            thumb.y - index.y
        );


    if (distance < 0.065) {

        if (!pinch) {

            pinch = true;

            $("gesture").textContent =
                "🤏 PINCH — SELECT";

            selectNeural();

        }

    } else {

        pinch = false;

        $("gesture").textContent =
            "✋ HAND — ROTATE";
    }


    /* =====================================
       OPEN PALM
    ===================================== */

    const open =
        isOpen(hand);


    if (open) {

        neuralPaused = true;

        $("gesture").textContent =
            "🖐 OPEN PALM — PAUSED";

    } else {

        neuralPaused = false;
    }
}


/* =========================================
   OPEN PALM DETECTION
========================================= */

function isOpen(hand) {

    return (

        hand[8].y <
        hand[6].y &&

        hand[12].y <
        hand[10].y &&

        hand[16].y <
        hand[14].y &&

        hand[20].y <
        hand[18].y
    );
}


/* =========================================
   PINCH SELECT
========================================= */

function selectNeural() {

    if (!nodes.length)
        return;


    /* Make a random neuron pulse */

    const node =
        nodes[
            Math.floor(
                Math.random() *
                nodes.length
            )
        ];


    const oldScale =
        node.scale.x;


    node.scale.set(
        4,
        4,
        4
    );


    setTimeout(() => {

        node.scale.set(
            oldScale,
            oldScale,
            oldScale
        );

    },500);
}


/* =========================================
   CLOSE HAND TRACKING
========================================= */

$("closeHand").onclick = () => {

    handRunning = false;

    lastHandX = null;
    lastHandY = null;

    const video =
        $("video");

    if (video.srcObject) {

        video.srcObject
            .getTracks()
            .forEach(
                track =>
                track.stop()
            );
    }

    $("cameraBox").style.display =
        "none";
};


/* =========================================
   LOGIN
========================================= */

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


    if (!user || !pass) {

        $("loginStatus").textContent =
            "AUTHORIZATION REQUIRED";

        return;
    }


    $("loginStatus").textContent =
        "AUTHENTICATION ACCEPTED";
};


/* =========================================
   RESIZE
========================================= */

window.addEventListener(
    "resize",
    () => {

        if (!camera || !renderer)
            return;


        camera.aspect =
            innerWidth /
            innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            innerWidth,
            innerHeight
        );
    }
);
