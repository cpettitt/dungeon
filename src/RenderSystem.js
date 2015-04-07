const each = require("lodash/collection/each");
const PIXI = require("pixi.js");
const vector = require("./vector");

class RenderSystem {
    constructor(width, height, gameMap, camera) {
        this._renderer = PIXI.autoDetectRenderer(width, height);
        this._stage = new PIXI.Stage(0x16181B);

        this._cameraLayer = new PIXI.DisplayObjectContainer();
        this._mapLayer = new PIXI.DisplayObjectContainer();
        this._entityLayer = new PIXI.DisplayObjectContainer();

        this._stage.addChild(this._cameraLayer);
        this._cameraLayer.addChild(this._mapLayer);
        this._cameraLayer.addChild(this._entityLayer);

        this._initializeMapLayer(gameMap);

        this._camera = camera;

        this._width = width;
        this._height = height;

        this._spriteCache = {};

        window.addEventListener("resize", () => this.resize());
        window.addEventListener("deviceOrientation", () => this.resize());
        this.resize();
    }

    get view() {
        return this._renderer.view;
    }

    tick(entities) {
        this._cameraLayer.position = vector.subtract(
                vector.create(Math.round(this._renderer.view.width / 2),
                              Math.round(this._renderer.view.height / 2)),
                this._camera.position);

        this._markCacheEntriesUnvisited();
        each(entities, entity => this._updateEntity(entity));
        this._deleteUnvisitedCacheEntries();

        this._renderer.render(this._stage);
    }

    resize() {
        const width = Math.min(window.innerWidth, this._width);
        const height = Math.min(window.innerHeight, this._height);
        this._renderer.resize(width, height);
        this._camera.size.width = width;
        this._camera.size.height = height;
    }

    _markCacheEntriesUnvisited() {
        each(this._spriteCache, entry => {
            entry.visited = false;
        });
    }

    _updateEntity(entity) {
        if (!entity.position || !entity.texture) { return; }

        let cacheEntry = this._spriteCache[entity.id];
        if (cacheEntry) {
            cacheEntry.sprite.setTexture(PIXI.Texture.fromFrame(entity.texture.frame));
        } else {
            const sprite = PIXI.Sprite.fromFrame(entity.texture.frame);
            // TODO don't assume anchor point...
            sprite.anchor = { x: 0.5, y: 0.8 };
            cacheEntry = this._spriteCache[entity.id] = {
                sprite: sprite
            };
            this._entityLayer.addChild(sprite);
        }

        cacheEntry.sprite.position = entity.position;
        cacheEntry.visited = true;
    }

    _deleteUnvisitedCacheEntries() {
        each(this._spriteCache, (entry, key) => {
            if (!entry.visited) {
                this._entityLayer.removeChild(entry.sprite);
                delete this._spriteCache[key];
            }
        });
    }

    _initializeMapLayer(gameMap) {
        // First cache all of the textures
        each(gameMap.getTileTypes(), (entry) => {
            const baseTexture = PIXI.TextureCache[entry.image].baseTexture;
            const texture = new PIXI.Texture(baseTexture, entry.frame);
            PIXI.TextureCache[gameMap.name + "-" + entry.id] = texture;
        });

        // Now load up the map layer with sprites
        for (let i = 0; i < gameMap.width; ++i) {
            for (let j = 0; j < gameMap.height; ++j) {
                const tiles = gameMap.getTiles(i, j);
                each(tiles, tile => {
                    const sprite = PIXI.Sprite.fromFrame(gameMap.name + "-" + tile.id);
                    sprite.anchor = { x: 0.5, y: 0.5 };
                    sprite.position = { x: i * gameMap.tileWidth, y: j * gameMap.tileHeight };
                    this._mapLayer.addChild(sprite);
                });                
            }
        }
    }
}

module.exports = RenderSystem;
