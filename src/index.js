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
ecs.registerComponent("camera", { follow: null });
ecs.registerComponent("movement", { x: 0, y: 0 });
ecs.registerComponent("position", { x: 0, y: 0 });
ecs.registerComponent("size", { x: 0, y: 0 });
ecs.registerComponent("texture", { frame: null });

ecs.registerArchetype("player", {
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
const physicsSystem = new PhysicsSystem();
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
    const gameMap = GameMap.fromTiled(assetMap["map/level1.json"]);

    // Initialize the renderer and attach the canvas to the DOM.
    renderSystem = new RenderSystem(800, 600, gameMap, camera);
    document.body.appendChild(renderSystem.view);

    requestAnimationFrame(loop);
});

function loop() {
    // TODO proper tick time tracking
    fps.tickStart();
    inputSystem.tick();
    physicsSystem.tick(ecs.entities, 1/60);
    cameraSystem.tick(ecs.entities);
    animationSystem.tick(ecs.entities, 1/60);
    renderSystem.tick(ecs.entities);
    requestAnimationFrame(loop);
    fps.tick();
}

console.log("Bundle loaded!");
