// Force loading of the babel polyfill.
require("babelify/polyfill");

const AssetLoader = require("./AssetLoader");
const ECS = require("./ECS");
const InputSystem = require("./InputSystem");
const PhysicsSystem = require("./PhysicsSystem");
const RenderSystem = require("./RenderSystem");

// Configuration
const PLAYER_MOVE_RATE = 200;

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
    }
});

// Set up our systems
const inputSystem = new InputSystem(boy, PLAYER_MOVE_RATE);
const physicsSystem = new PhysicsSystem();
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
    inputSystem.tick();
    physicsSystem.tick(ecs.entities, 1/60);
    renderSystem.tick(ecs.entities);
    requestAnimationFrame(loop);
}

console.log("Bundle loaded!");
