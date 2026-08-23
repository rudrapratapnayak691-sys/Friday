/* =========================================
   FRIDAY MK 2.3 + GEMINI AI
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

if ($("unlockBtn")) {

    $("unlockBtn").onclick = () => {

        if (online) {
            lockFriday();
        } else {
            unlockFriday();
        }

    };
}


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

        if ($("command")) {

            $("command").disabled = false;

            $("command").placeholder =
                "Ask FRIDAY...";
        }

        if ($("reply")) {

            $("reply").textContent =
                "ALL SYSTEMS ONLINE";
        }

    }, 1400);
}


function lockFriday() {

    handRunning = false;

    if ($("cameraBox"))
        $("cameraBox").style.display = "none";

    neuralOpen = false;

    if ($("neuralScreen"))
        $("neuralScreen").style.display = "none";

    online = false;

    document.body.classList.remove("online");

    document.body.classList.add("locked");

    $("status").textContent =
        "FRIDAY — SLEEP MODE";

    $("unlockBtn").innerHTML =
        "🔓<small>UNLOCK</small>";

    if ($("command")) {

        $("command").disabled = true;

        $("command").value = "";

        $("command").placeholder =
            "FRIDAY is sleeping...";
    }

    if ($("reply"))
        $("reply").textContent =
            "SYSTEM STANDBY";

    speak("Entering sleep mode.");
}


/* =========================================
   VOICE
========================================= */

if ($("voiceBtn"))
    $("voiceBtn").onclick = voice;


function voice() {

    if (!online) {

        speak(
            "FRIDAY is in sleep mode."
        );

        return;
    }

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        speak(
            "Voice recognition is not supported."
        );

        return;
    }

    $("status").textContent =
        "LISTENING...";

    const recognition =
        new SpeechRecognition();

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
   TEXT COMMAND
========================================= */

if ($("sendBtn")) {

    $("sendBtn").onclick = () => {

        runCommand(
            $("command").value
        );

    };
}


if ($("command")) {

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
}


/* =========================================
   COMMAND SYSTEM
========================================= */

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


    /* HELLO */

    if (
        lower === "hello" ||
        lower.includes("hello friday")
    ) {

        respond(
            "Hello Boss. All systems are operational."
        );

        return;
    }


    /* NEURAL SYSTEM */

    if (
        lower.includes("neural system") ||
        lower.includes("show neural") ||
        lower.includes("open neural")
    ) {

        showNeural();

        return;
    }


    /* EXIT NEURAL */

    if (
        lower.includes("exit neural") ||
        lower.includes("close neural")
    ) {

        hideNeural();

        return;
    }


    /* LOCK */

    if (
        lower.includes("lock friday") ||
        lower.includes("sleep mode")
    ) {

        lockFriday();

        return;
    }


    /* =====================================
       FIXED SONGS
    ===================================== */

    if (
        lower.includes("play golden") ||
        lower.includes("play golden brown")
    ) {

        playDirect(
            "Golden Brown",
            "https://m.youtube.com/watch?v=BTnM71u_v2I"
        );

        return;
    }


    if (
        lower.includes("play cherry cherry lady") ||
        lower.includes("play cherry")
    ) {

        playDirect(
            "Cherry Cherry Lady",
            "https://m.youtube.com/watch?v=Z4sty2B2bCE"
        );

        return;
    }


    if (
        lower.includes("play favourite") ||
        lower.includes("play favorite")
    ) {

        playDirect(
            "Favourite",
            "https://m.youtube.com/watch?v=Fvt9hEAP6oQ"
        );

        return;
    }


    /* =====================================
       LOCATE / GOOGLE MAPS
    ===================================== */

    if (
        lower.startsWith("locate ") ||
        lower.startsWith("find ")
    ) {

        let place = text
            .replace(/^locate\s+/i, "")
            .replace(/^find\s+/i, "")
            .trim();

        if (place) {

            locatePlace(place);

        }

        return;
    }


    /* =====================================
       OPEN WEBSITE / APP
    ===================================== */

    if (
        lower.startsWith("open ")
    ) {

        openSite(
            text.substring(5).trim()
        );

        return;
    }


    /* =====================================
       GEMINI AI
    ===================================== */

    askGemini(text);
}


/* =========================================
   GEMINI AI
========================================= */

async function askGemini(question) {

    if (!online) {

        speak(
            "Please activate FRIDAY first."
        );

        return;
    }


    $("status").textContent =
        "FRIDAY — THINKING...";

    $("reply").textContent =
        "FRIDAY IS THINKING...";


    try {

        const response =
            await fetch(
                "https://friday-ikry.onrender.com/ask",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question: question
                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok ||
            data.error) {

            throw new Error(
                data.error ||
                "Gemini request failed"
            );
        }


        const answer =
            data.answer;


        $("status").textContent =
            "FRIDAY — ONLINE";


        $("reply").textContent =
            "FRIDAY: " + answer;


        speak(answer);


    } catch (error) {

        console.error(
            "Gemini Error:",
            error
        );


        $("status").textContent =
            "FRIDAY — ONLINE";


        $("reply").textContent =
            "FRIDAY: AI connection failed.";


        speak(
            "I couldn't connect to my AI brain."
        );
    }
}


/* =========================================
   PLAY DIRECT YOUTUBE LINK
========================================= */

function playDirect(song, url) {

    $("status").textContent =
        "PLAYING...";

    $("reply").textContent =
        "Playing: " + song;

    speak(
        "Playing " + song
    );

    window.open(
        url,
        "_blank"
    );
}


/* =========================================
   GOOGLE MAPS
========================================= */

function locatePlace(place) {

    $("status").textContent =
        "LOCATING...";

    $("reply").textContent =
        "LOCATING: " + place;

    speak(
        "Locating " + place
    );

    const url =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(place);

    window.open(
        url,
        "_blank"
    );
}


/* =========================================
   GOOGLE SEARCH
========================================= */

function searchGoogle(question) {

    $("status").textContent =
        "SEARCHING GOOGLE...";

    $("reply").textContent =
        "SEARCHING: " + question;

    speak(
        "Searching Google."
    );

    const url =
        "https://www.google.com/search?q=" +
        encodeURIComponent(question);

    window.open(
        url,
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
                "https://" + name;
        }
    }

    speak(
        "Opening " + name
    );

    window.open(
        url,
        "_blank"
    );
}


/* =========================================
   FRIDAY VOICE
========================================= */

function speak(text) {

    if (!("speechSynthesis" in window))
        return;

    speechSynthesis.cancel();

    const u =
        new SpeechSynthesisUtterance(text);

    u.rate = 0.88;
    u.pitch = 0.82;
    u.volume = 1;

    speechSynthesis.speak(u);
}


function respond(text) {

    if ($("reply"))
        $("reply").textContent =
            "FRIDAY: " + text;

    speak(text);
}


/* =========================================
   NEURAL SYSTEM
========================================= */

if ($("neuralBtn"))
    $("neuralBtn").onclick =
        showNeural;


if ($("exitNeural"))
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

    startNeural();

    startHands();
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
        Math.min(
            window.devicePixelRatio,
            2
        )
    );


    renderer.setSize(
        innerWidth,
        innerHeight
    );


    neuralGroup =
        new THREE.Group();

    scene.add(
        neuralGroup
    );


    /* CORE */

    const coreGeometry =
        new THREE.SphereGeometry(
            .45,
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


    /* NEURONS */

    for (let i = 0; i < 180; i++) {

        const geometry =
            new THREE.SphereGeometry(
                .025 +
                Math.random() * .025,
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


        const radius =
            1 +
            Math.random() * 2.7;


        const theta =
            Math.random() *
            Math.PI * 2;


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


    /* CONNECTIONS */

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

                opacity: .22

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

        neuralGroup.rotation.y +=
            .0015;

        neuralGroup.rotation.x +=
            .0005;
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

if ($("handBtn"))
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

        minDetectionConfidence: .65,

        minTrackingConfidence: .65

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


    /* DRAW HAND */

    for (const point of hand) {

        const x =
            point.x *
            innerWidth;

        const y =
            point.y *
            innerHeight;


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

        ctx.shadowBlur =
            15;

        ctx.shadowColor =
            "#ff6500";

        ctx.fill();
    }


    /* PALM */

    const palm =
        hand[9];


    if (
        lastHandX !== null &&
        lastHandY !== null &&
        neuralGroup
    ) {

        const dx =
            palm.x -
            lastHandX;


        const dy =
            palm.y -
            lastHandY;


        neuralGroup.rotation.y +=
            dx * 8;


        neuralGroup.rotation.x +=
            dy * 6;
    }


    lastHandX =
        palm.x;

    lastHandY =
        palm.y;


    /* PINCH */

    const thumb =
        hand[4];

    const index =
        hand[8];


    const distance =
        Math.hypot(

            thumb.x -
            index.x,

            thumb.y -
            index.y

        );


    if (distance < .065) {

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


    /* OPEN PALM */

    if (isOpen(hand)) {

        neuralPaused = true;

        $("gesture").textContent =
            "🖐 OPEN PALM — PAUSED";

    } else {

        neuralPaused = false;
    }
}


/* =========================================
   OPEN PALM
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


    const node =
        nodes[
            Math.floor(
                Math.random() *
                nodes.length
            )
        ];


    node.scale.set(
        4,
        4,
        4
    );


    setTimeout(() => {

        node.scale.set(
            1,
            1,
            1
        );

    }, 500);
}


/* =========================================
   CLOSE CAMERA
========================================= */

if ($("closeHand")) {

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
}


/* =========================================
   LOGIN
========================================= */

if ($("loginBtn")) {

    $("loginBtn").onclick = () => {

        $("loginPanel").style.display =
            "grid";

    };
}


if ($("closeLogin")) {

    $("closeLogin").onclick = () => {

        $("loginPanel").style.display =
            "none";

    };
}


if ($("loginSubmit")) {

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
}


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
