// Force loading of the babel polyfill.
require("babelify/polyfill");

const PIXI = require("pixi.js");
const AssetLoader = require("./AssetLoader");

const renderer = new PIXI.autoDetectRenderer(800, 600);
const stage = new PIXI.Stage();

document.body.appendChild(renderer.view);

const assets = [
    "img/boy.json",
    "img/boy.png"
];
new AssetLoader().loadAssets(assets, () => {
    console.log("Assets loaded!");

    const boySprite = PIXI.Sprite.fromFrame("boy-down1");
    stage.addChild(boySprite);

    requestAnimationFrame(loop);
});

function loop() {
    renderer.render(stage);
    requestAnimationFrame(loop);
}

console.log("Bundle loaded!");
