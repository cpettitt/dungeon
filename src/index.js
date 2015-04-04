// Force loading of the babel polyfill.
require("babelify/polyfill");

const AssetLoader = require("./AssetLoader");
const ECS = require("./ECS");
const InputSystem = require("./InputSystem");
const PhysicsSystem = require("./PhysicsSystem");
const AnimationSystem = require("./AnimationSystem");
const RenderSystem = require("./RenderSystem");

// Configuration
const PLAYER_MOVE_RATE = 150;

// Configure out entity component system
const ecs = new ECS();
ecs.registerComponent("movement", { x: 0, y: 0 });
ecs.registerComponent("position", { x: 0, y: 0 });
ecs.registerComponent("texture", { frame: null });

ecs.registerArchetype("player", {
    movement: {},
    position: {},
    texture: {}
});

// Create our first entity
let boy = ecs.addEntity("player", {
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

function createAnimationDef(baseName, numFrames, timePerFrame) {
    const frames = [];
    for (var i = 0; i < numFrames; ++i) {
        frames.push(baseName + i);
    }

    return { frames, timePerFrame };
}

// Set up our systems
const inputSystem = new InputSystem(boy, PLAYER_MOVE_RATE);
const physicsSystem = new PhysicsSystem();
const animationSystem = new AnimationSystem();
const renderSystem = new RenderSystem(800, 600);
document.body.appendChild(renderSystem.view);

// Load assets and then run the game loop
const assets = [
    "img/boy.json",
    "img/boy.png"
];
new AssetLoader().loadAssets(assets, () => {
    console.log("Assets loaded!");
    requestAnimationFrame(loop);
});

function loop() {
    // TODO proper tick time tracking
    inputSystem.tick();
    physicsSystem.tick(ecs.entities, 1/60);
    animationSystem.tick(ecs.entities, 1/60);
    renderSystem.tick(ecs.entities);
    requestAnimationFrame(loop);
}

console.log("Bundle loaded!");
