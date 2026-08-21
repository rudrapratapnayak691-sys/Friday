/* =====================================================
   FRIDAY MARK 6
   ===================================================== */

const $ = id => document.getElementById(id);

let online = false;
let neuralPaused = false;
let neuralOpen = false;
let handRunning = false;

let scene;
let camera;
let renderer;
let neuralGroup;

let nodes = [];
let lines = [];

let neuralStarted = false;

let lastPalmX = null;
let lastPalmY = null;

let pinch = false;
let lastSwipe = 0;

let recognition = null;
let listening = false;


/* =====================================================
   INITIALIZE WAVEFORM
===================================================== */

const waveBars = $("waveBars");

for (let i = 0; i < 95; i++) {

    const bar =
        document.createElement("span");

    bar.style.animationDelay =
        `${Math.random() * .5}s`;

    waveBars.appendChild(bar);
}


/* =====================================================
   STATUS
===================================================== */

function setStatus(text) {

    $("status").textContent = text;
}


/* =====================================================
   HISTORY
===================================================== */

function addHistory(user, reply) {

    const item =
        document.createElement("div");

    item.className =
        "historyItem";

    item.innerHTML =
        `<b>YOU:</b> ${escapeHTML(user)}
         <br>
         <span>FRIDAY: ${escapeHTML(reply)}</span>`;

    $("history").prepend(item);

    while (
        $("history").children.length > 8
    ) {

        $("history").lastChild.remove();

    }
}


function escapeHTML(text) {

    return text
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;");
}


/* =====================================================
   SPEECH
===================================================== */

function speak(text) {

    if (!("speechSynthesis" in window))
        return;

    speechSynthesis.cancel();

    $("voiceWave").style.display =
        "block";

    setStatus(
        "FRIDAY — SPEAKING"
    );

    $("voiceState").textContent =
        "SPEAKING";

    $("modeText").textContent =
        "SPEAKING";

    setNeuralMode(
        "speaking"
    );

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.rate = .88;
    utterance.pitch = .82;
    utterance.volume = 1;

    const voices =
        speechSynthesis.getVoices();

    const female =
        voices.find(v =>
            /female|zira|samantha|google us english/i
                .test(v.name)
        );

    if (female)
        utterance.voice = female;

    utterance.onend = () => {

        $("voiceWave").style.display =
            "none";

        $("voiceState").textContent =
            "READY";

        setStatus(
            "FRIDAY — ONLINE"
        );

        $("modeText").textContent =
            "ONLINE";

        setNeuralMode(
            "idle"
        );
    };

    speechSynthesis.speak(
        utterance
    );
}


/* =====================================================
   RESPONSE
===================================================== */

function respond(text, userCommand = "") {

    $("reply").textContent =
        "FRIDAY: " + text;

    if (userCommand)
        addHistory(
            userCommand,
            text
        );

    speak(text);
}


/* =====================================================
   LOCK / UNLOCK
===================================================== */

$("unlockBtn").onclick =
    toggleLock;


function toggleLock() {

    if (online) {

        lockFriday();

    } else {

        unlockFriday();

    }
}


function unlockFriday() {

    document.body.classList.add(
        "unlocking"
    );

    setStatus(
        "ACTIVATING FRIDAY..."
    );

    setNeuralMode(
        "thinking"
    );

    setTimeout(() => {

        document.body.classList.remove(
            "locked",
            "unlocking"
        );

        document.body.classList.add(
            "online"
        );

        online = true;

        $("command").disabled =
            false;

        $("command").placeholder =
            "Ask FRIDAY...";

        $("unlockBtn").innerHTML =
            "🔒<small>LOCK</small>";

        $("coreState").textContent =
            "ONLINE";

        $("systemMode").textContent =
            "ACTIVE";

        $("modeText").textContent =
            "ONLINE";

        setStatus(
            "FRIDAY — ONLINE"
        );

        startNeural();

        speak(
            "FRIDAY online. All systems operational."
        );

    }, 1200);
}


function lockFriday() {

    online = false;

    handRunning = false;

    $("cameraBox").style.display =
        "none";

    $("neuralScreen").style.display =
        "none";

    $("command").disabled =
        true;

    $("command").value = "";

    $("command").placeholder =
        "FRIDAY is sleeping...";

    document.body.classList.remove(
        "online"
    );

    document.body.classList.add(
        "locked"
    );

    $("unlockBtn").innerHTML =
        "🔓<small>UNLOCK</small>";

    $("systemMode").textContent =
        "SLEEP";

    $("modeText").textContent =
        "SLEEP MODE";

    setStatus(
        "FRIDAY — SLEEP MODE"
    );

    neuralPaused = true;

    speak(
        "Entering sleep mode."
    );
}


/* =====================================================
   VOICE BUTTON
===================================================== */

$("voiceBtn").onclick =
    startListening;


function startListening() {

    if (!online) {

        speak(
            "FRIDAY is sleeping."
        );

        return;
    }

    const SR =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SR) {

        speak(
            "Voice recognition is not supported by this browser."
        );

        return;
    }

    if (listening) {

        recognition.stop();

        return;
    }

    recognition =
        new SR();

    recognition.lang =
        "en-US";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    recognition.onstart = () => {

        listening = true;

        setStatus(
            "FRIDAY — LISTENING"
        );

        $("voiceState").textContent =
            "LISTENING";

        $("modeText").textContent =
            "LISTENING";

        setNeuralMode(
            "listening"
        );
    };


    recognition.onresult =
        event => {

            const text =
                event
                    .results[0][0]
                    .transcript;

            $("command").value =
                text;

            runCommand(text);
        };


    recognition.onerror =
        () => {

            listening = false;

            setStatus(
                "FRIDAY — ONLINE"
            );
        };


    recognition.onend =
        () => {

            listening = false;

            $("voiceState").textContent =
                "READY";

            if (online) {

                setStatus(
                    "FRIDAY — ONLINE"
                );
            }
        };


    recognition.start();
}


/* =====================================================
   COMMAND BUTTON
===================================================== */

$("sendBtn").onclick =
    () => {

        runCommand(
            $("command").value
        );

    };


$("command").addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter")
            runCommand(
                $("command").value
            );

    }
);


/* =====================================================
   COMMAND ENGINE
===================================================== */

function runCommand(text) {

    text =
        text.trim();

    if (!text)
        return;

    if (!online) {

        speak(
            "Please unlock FRIDAY first."
        );

        return;
    }

    const lower =
        text.toLowerCase();


    /* HELLO */

    if (
        lower === "hello" ||
        lower.includes("hello friday")
    ) {

        respond(
            "Hello Boss. I am ready.",
            text
        );

        return;
    }


    /* SYSTEM STATUS */

    if (
        lower.includes("system status") ||
        lower.includes("system diagnostics") ||
        lower.includes("diagnostics")
    ) {

        showDiagnostics();

        respond(
            "All major systems are operational.",
            text
        );

        return;
    }


    /* NEURAL */

    if (
        lower.includes("open neural") ||
        lower.includes("show neural") ||
        lower.includes("neural system")
    ) {

        showNeural();

        respond(
            "Neural control activated.",
            text
        );

        return;
    }


    if (
        lower.includes("close neural") ||
        lower.includes("exit neural")
    ) {

        hideNeural();

        respond(
            "Neural control closed.",
            text
        );

        return;
    }


    /* LOCK */

    if (
        lower.includes("lock friday") ||
        lower.includes("sleep mode")
    ) {

        addHistory(
            text,
            "Entering sleep mode."
        );

        lockFriday();

        return;
    }


    /* =================================================
       FIXED MUSIC
    ================================================= */

    if (
        lower.includes("play golden") ||
        lower.includes("play golden brown")
    ) {

        playSong(
            "Golden Brown",
            "https://m.youtube.com/watch?v=BTnM71u_v2I",
            text
        );

        return;
    }


    if (
        lower.includes("play cherry") ||
        lower.includes("cherry cherry lady")
    ) {

        playSong(
            "Cherry Cherry Lady",
            "https://m.youtube.com/watch?v=Z4sty2B2bCE",
            text
        );

        return;
    }


    if (
        lower.includes("play favourite") ||
        lower.includes("play favorite")
    ) {

        playSong(
            "Favourite",
            "https://m.youtube.com/watch?v=Fvt9hEAP6oQ",
            text
        );

        return;
    }


    /* =================================================
       LOCATE
    ================================================= */

    if (
        lower.startsWith("locate ") ||
        lower.startsWith("find ")
    ) {

        let place =
            text
                .replace(/^locate\s+/i,"")
                .replace(/^find\s+/i,"")
                .trim();

        locate(place,text);

        return;
    }


    /* =================================================
       OPEN YOUTUBE
    ================================================= */

    if (
        lower.includes("open youtube")
    ) {

        addHistory(
            text,
            "Opening YouTube."
        );

        speak(
            "Opening YouTube."
        );

        window.open(
            "https://m.youtube.com",
            "_blank"
        );

        return;
    }


    /* GOOGLE */

    searchGoogle(
        text
    );
}


/* =====================================================
   MUSIC
===================================================== */

function playSong(
    name,
    url,
    command
) {

    setStatus(
        "PLAYING — " + name
    );

    $("reply").textContent =
        "Playing: " + name;

    addHistory(
        command,
        "Playing " + name
    );

    speak(
        "Playing " + name
    );

    window.open(
        url,
        "_blank"
    );
}


/* =====================================================
   GOOGLE SEARCH
===================================================== */

function searchGoogle(
    question
) {

    setStatus(
        "SEARCHING GOOGLE..."
    );

    $("reply").textContent =
        "Searching: " + question;

    addHistory(
        question,
        "Searching Google."
    );

    setNeuralMode(
        "thinking"
    );

    speak(
        "Searching Google."
    );

    const url =
        "https://www.google.com/search?q=" +
        encodeURIComponent(
            question
        );

    window.open(
        url,
        "_blank"
    );
}


/* =====================================================
   GOOGLE MAPS
===================================================== */

function locate(
    place,
    command
) {

    setStatus(
        "LOCATION MODE"
    );

    $("reply").textContent =
        "Locating: " + place;

    addHistory(
        command,
        "Opening Maps for " + place
    );

    setNeuralMode(
        "thinking"
    );

    speak(
        "Locating " + place
    );

    const url =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
            place
        );

    window.open(
        url,
        "_blank"
    );
}


/* =====================================================
   NEURAL THREE.JS
===================================================== */

function startNeural() {

    if (neuralStarted)
        return;

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

    camera.position.z =
        8;


    renderer =
        new THREE.WebGLRenderer({

            canvas: canvas,

            alpha: true,

            antialias: true

        });


    renderer.setPixelRatio(
        Math.min(
            devicePixelRatio,
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

    const core =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                .45,
                32,
                32
            ),

            new THREE.MeshBasicMaterial({
                color: 0xff6500
            })

        );

    neuralGroup.add(core);


    /* NEURONS */

    const COUNT =
        300;

    for (
        let i = 0;
        i < COUNT;
        i++
    ) {

        const node =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    .018 +
                    Math.random() * .035,
                    8,
                    8
                ),

                new THREE.MeshBasicMaterial({
                    color: 0xff6500
                })

            );


        const radius =
            .8 +
            Math.random() * 3.2;

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


        neuralGroup.add(
            node
        );

        nodes.push(
            node
        );
    }


    /* CONNECTIONS */

    for (
        let i = 0;
        i < 250;
        i++
    ) {

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


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints([

                    a.position,
                    b.position

                ]);


        const material =
            new THREE.LineBasicMaterial({

                color: 0xff6500,

                transparent: true,

                opacity: .18

            });


        const line =
            new THREE.Line(
                geometry,
                material
            );


        neuralGroup.add(
            line
        );

        lines.push(
            line
        );
    }


    animateNeural();
}


/* =====================================================
   NEURAL ANIMATION
===================================================== */

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


        const pulse =
            1 +
            Math.sin(
                Date.now() * .004
            ) * .035;

        neuralGroup.scale.set(
            pulse,
            pulse,
            pulse
        );
    }


    if (renderer) {

        renderer.render(
            scene,
            camera
        );
    }
}


/* =====================================================
   NEURAL MODES
===================================================== */

function setNeuralMode(
    mode
) {

    if (!neuralGroup)
        return;

    const colors = {

        idle: 0xff6500,

        listening: 0x00aaff,

        thinking: 0xffa000,

        speaking: 0xff6500,

        diagnostic: 0xffd000

    };


    const color =
        colors[mode] ||
        0xff6500;


    neuralGroup.traverse(
        object => {

            if (
                object.material &&
                object.material.color
            ) {

                object.material.color.set(
                    color
                );
            }

        }
    );
}


/* =====================================================
   NEURAL SCREEN
===================================================== */

$("neuralBtn").onclick =
    showNeural;


$("exitNeural").onclick =
    hideNeural;


function showNeural() {

    if (!online) {

        speak(
            "Unlock FRIDAY first."
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

    $("neuralScreen").style.display =
        "none";

    stopCamera();
}


/* =====================================================
   HAND TRACKING
===================================================== */

$("handBtn").onclick =
    startHands;


async function startHands() {

    if (!online)
        return;


    if (handRunning) {

        stopCamera();

        return;
    }


    $("cameraBox").style.display =
        "block";

    $("cameraState").textContent =
        "STARTING";


    try {

        const stream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {
                        facingMode: "user"
                    },

                    audio: false

                });


        $("video").srcObject =
            stream;


        const hands =
            new Hands({

                locateFile:
                    file =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`

            });


        hands.setOptions({

            maxNumHands: 1,

            modelComplexity: 1,

            minDetectionConfidence: .65,

            minTrackingConfidence: .65

        });


        hands.onResults(
            handResults
        );


        handRunning = true;

        $("cameraState").textContent =
            "READY";


        async function loop() {

            if (!handRunning)
                return;

            if (
                $("video").readyState >= 2
            ) {

                await hands.send({
                    image: $("video")
                });

            }

            requestAnimationFrame(
                loop
            );
        }


        loop();


    } catch (error) {

        console.error(error);

        $("cameraState").textContent =
            "DENIED";

        speak(
            "Camera permission is required."
        );
    }
}


/* =====================================================
   HAND RESULTS
===================================================== */

function handResults(
    results
) {

    const canvas =
        $("handCanvas");

    const ctx =
        canvas.getContext("2d");


    canvas.width =
        $("cameraBox").clientWidth;

    canvas.height =
        $("cameraBox").clientHeight;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (
        !results.multiHandLandmarks ||
        !results.multiHandLandmarks.length
    ) {

        $("handStatus").textContent =
            "HAND NOT FOUND";

        return;
    }


    const hand =
        results.multiHandLandmarks[0];


    $("handStatus").textContent =
        "HAND ACTIVE";


    /* DRAW */

    hand.forEach(
        point => {

            const x =
                point.x *
                canvas.width;

            const y =
                point.y *
                canvas.height;


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                3,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#ff6500";

            ctx.fill();

        }
    );


    /* PALM */

    const palm =
        hand[9];


    if (
        lastPalmX !== null &&
        neuralGroup
    ) {

        const dx =
            palm.x -
            lastPalmX;

        const dy =
            palm.y -
            lastPalmY;


        neuralGroup.rotation.y +=
            dx * 8;

        neuralGroup.rotation.x +=
            dy * 6;


        /* SWIPE */

        if (
            Math.abs(dx) > .12 &&
            Date.now() - lastSwipe > 700
        ) {

            lastSwipe =
                Date.now();

            if (dx > 0) {

                $("gesture").textContent =
                    "➡ SWIPE RIGHT";

            } else {

                $("gesture").textContent =
                    "⬅ SWIPE LEFT";
            }
        }
    }


    lastPalmX =
        palm.x;

    lastPalmY =
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


    if (distance < .06) {

        $("gesture").textContent =
            "🤏 PINCH";

        if (!pinch) {

            pinch = true;

            selectNeuron();
        }

    } else {

        pinch = false;
    }


    /* TWO FINGER ZOOM */

    const indexUp =
        hand[8].y <
        hand[6].y;

    const middleUp =
        hand[12].y <
        hand[10].y;


    if (
        indexUp &&
        middleUp &&
        distance > .08
    ) {

        $("gesture").textContent =
            "✌ ZOOM";

        camera.position.z =
            Math.max(
                4,
                Math.min(
                    12,
                    camera.position.z -
                    (palm.y - .5) * .03
                )
            );
    }


    /* OPEN PALM */

    if (
        isOpenPalm(hand)
    ) {

        neuralPaused = true;

        $("gesture").textContent =
            "🖐 PAUSED";

    } else {

        neuralPaused = false;
    }
}


/* =====================================================
   OPEN PALM
===================================================== */

function isOpenPalm(hand) {

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


/* =====================================================
   SELECT NEURON
===================================================== */

function selectNeuron() {

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
        5,
        5,
        5
    );


    setTimeout(
        () => {

            node.scale.set(
                1,
                1,
                1
            );

        },
        400
    );
}


/* =====================================================
   STOP CAMERA
===================================================== */

$("closeHand").onclick =
    stopCamera;


function stopCamera() {

    handRunning = false;

    lastPalmX = null;
    lastPalmY = null;

    const video =
        $("video");


    if (video.srcObject) {

        video.srcObject
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        video.srcObject =
            null;
    }


    $("cameraBox").style.display =
        "none";

    $("cameraState").textContent =
        "STANDBY";
}


/* =====================================================
   DIAGNOSTICS
===================================================== */

$("diagnosticBtn").onclick =
    showDiagnostics;


$("closeDiagnostic").onclick =
    () => {

        $("diagnosticPanel").style.display =
            "none";
    };


function showDiagnostics() {

    $("diagnosticPanel").style.display =
        "block";

    setNeuralMode(
        "diagnostic"
    );
}


/* =====================================================
   LOGIN
===================================================== */

$("loginBtn").onclick =
    () => {

        $("loginPanel").style.display =
            "grid";
    };


$("closeLogin").onclick =
    () => {

        $("loginPanel").style.display =
            "none";
    };


$("loginSubmit").onclick =
    () => {

        const username =
            $("username").value.trim();

        const password =
            $("password").value.trim();


        if (
            !username ||
            !password
        ) {

            $("loginStatus").textContent =
                "ENTER CREDENTIALS";

            return;
        }


        $("loginStatus").textContent =
            "ACCESS GRANTED";

        speak(
            "Authorization accepted."
        );


        setTimeout(
            () => {

                $("loginPanel")
                    .style.display =
                    "none";

            },
            900
        );
    };


/* =====================================================
   HEY FRIDAY WAKE MODE
===================================================== */

function startWakeWord() {

    const SR =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SR)
        return;


    const wake =
        new SR();

    wake.lang =
        "en-US";

    wake.continuous =
        true;

    wake.interimResults =
        true;


    wake.onresult =
        event => {

            let text = "";

            for (
                let i =
                    event.resultIndex;
                i <
                    event.results.length;
                i++
            ) {

                text +=
                    event.results[i][0]
                        .transcript;
            }


            text =
                text.toLowerCase();


            if (
                text.includes(
                    "hey friday"
                )
            ) {

                if (!online) {

                    unlockFriday();

                } else {

                    speak(
                        "Yes Boss?"
                    );

                }
            }
        };


    wake.onerror =
        () => {

            setTimeout(
                startWakeWord,
                2000
            );

        };


    wake.onend =
        () => {

            setTimeout(
                startWakeWord,
                500
            );

        };


    try {

        wake.start();

    } catch(e) {}
}


setTimeout(
    startWakeWord,
    2000
);


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    () => {

        if (!camera ||
            !renderer)
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


/* =====================================================
   START
===================================================== */

startNeural();

$("coreState").textContent =
    "STANDBY";

$("systemMode").textContent =
    "SLEEP";

setNeuralMode(
    "idle"
);
