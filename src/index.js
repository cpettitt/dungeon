// Force loading of the babel polyfill.
require("babelify/polyfill");

const AssetLoader = require("./AssetLoader");
const ECS = require("./ECS");
const RenderSystem = require("./RenderSystem");

const renderer = new RenderSystem(800, 600);
document.body.appendChild(renderer.view);

// Configure out entity component system
const ecs = new ECS();
ecs.registerComponent("position", { x: 0, y: 0 });
ecs.registerComponent("texture", { frame: null });

ecs.registerArchetype("player", {
    position: {},
    texture: {}
});

// Create our first entity
ecs.addEntity("player", {
    texture: {
        frame: "boy-down1"
    }
});

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
    renderer.tick(ecs.entities);
    requestAnimationFrame(loop);
}

console.log("Bundle loaded!");
