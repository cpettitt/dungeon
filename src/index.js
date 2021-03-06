// Force loading of the babel polyfill.
require("babelify/polyfill");

// Set up FPS meter
/*global FPSMeter */
const FPS_RE = /[?&]fps=true/;
let fps;
if (window.location.search.match(FPS_RE) && typeof FPSMeter !== "undefined") {
    fps = new FPSMeter({
        theme: "colorful",
        heat: true,
        graph: true,
        history: 20
    });
} else {
    fps = {
        tick: () => {},
        tickStart: () => {}
    };
}

const AssetLoader = require("./AssetLoader");
const ECS = require("./ECS");
const GameMap = require("./GameMap");
const InputSystem = require("./InputSystem");
const PhysicsSystem = require("./PhysicsSystem");
const CameraSystem = require("./CameraSystem");
const AnimationSystem = require("./AnimationSystem");
const RenderSystem = require("./RenderSystem");

// Configuration
const PLAYER_MOVE_RATE = 150;

// Configure out entity component system
const ecs = new ECS();
ecs.registerComponent("bbox", { x: 0, y: 0, width: 0, height: 0 });
ecs.registerComponent("camera", { follow: null });
ecs.registerComponent("movement", { x: 0, y: 0 });
ecs.registerComponent("position", { x: 0, y: 0 });
ecs.registerComponent("size", { x: 0, y: 0 });
ecs.registerComponent("texture", { frame: null });

ecs.registerArchetype("player", {
    bbox: {},
    movement: {},
    position: {},
    texture: {}
});
ecs.registerArchetype("camera", {
    camera: {},
    position: {},
    size: {}
});

// Create our first entity
const boy = ecs.addEntity("player", {
    bbox: {
        x: 0,
        y: 4,
        width: 30,
        height: 16
    },
    texture: {
        frame: "boy-down1"
    },
    animationDefs: {
        up: createAnimationDef("boy-up", 9, 0.08),
        down: createAnimationDef("boy-down", 9, 0.08),
        left: createAnimationDef("boy-left", 9, 0.08),
        right: createAnimationDef("boy-right", 9, 0.08)
    }
});

const camera = ecs.addEntity("camera", {
    camera: {
        follow: boy.id
    }
});

function createAnimationDef(baseName, numFrames, timePerFrame) {
    const frames = [];
    for (var i = 0; i < numFrames; ++i) {
        frames.push(baseName + i);
    }

    return { frames, timePerFrame };
}

// Set up our systems
const inputSystem = new InputSystem(boy, camera, PLAYER_MOVE_RATE);
const cameraSystem = new CameraSystem(camera);
let physicsSystem;
const animationSystem = new AnimationSystem();
let renderSystem;

// Load assets and then run the game loop
const assets = [
    "img/boy.json",
    "img/boy.png",
    "img/lpc-base/interior.png",
    "img/lpc-base/lavarock.png",
    "img/lpc-base/lava.png",  
    "map/level1.json"
];
new AssetLoader().loadAssets(assets, assetMap => {
    console.log("Assets loaded!");

    // Load the game map
    const gameMap = GameMap.fromTiled("map/level1.json", assetMap["map/level1.json"]);

    // Set player spawn
    boy.position = gameMap.playerSpawn;

    physicsSystem = new PhysicsSystem(gameMap, boy);

    // Initialize the renderer and attach the canvas to the DOM.
    renderSystem = new RenderSystem(800, 600, gameMap, camera);
    document.getElementById("game").appendChild(renderSystem.view);

    requestAnimationFrame(loop);
});

const maxDt = 1 / 60;
let currentTime = Date.now();
function loop() {
    const newTime = Date.now();
    const frameTime = (newTime - currentTime) / 1000;
    currentTime = newTime;

    fps.tickStart();

    inputSystem.tick(ecs.entities, frameTime);

    let physicsTime = frameTime;
    while (physicsTime > 0) {
        const dt = Math.min(physicsTime, maxDt);
        physicsSystem.tick(ecs.entities, dt);
        physicsTime -= dt;
    }

    animationSystem.tick(ecs.entities, frameTime);
    cameraSystem.tick(ecs.entities, frameTime);
    renderSystem.tick(ecs.entities, frameTime);

    fps.tick();
    requestAnimationFrame(loop);
}

console.log("Bundle loaded!");
