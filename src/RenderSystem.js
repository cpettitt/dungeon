const each = require("lodash/collection/each");
const PIXI = require("pixi.js");

class RenderSystem {
    constructor(width, height) {
        this._renderer = PIXI.autoDetectRenderer(width, height);
        this._stage = new PIXI.Stage();

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
        this._markCacheEntriesUnvisited();
        each(entities, entity => this._updateEntity(entity));
        this._deleteUnvisitedCacheEntries();

        this._renderer.render(this._stage);
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
            cacheEntry = this._spriteCache[entity.id] = {
                sprite: sprite
            };
            this._stage.addChild(sprite);
        }

        cacheEntry.sprite.position = entity.position;
        cacheEntry.visited = true;
    }

    _deleteUnvisitedCacheEntries() {
        each(this._spriteCache, (entry, key) => {
            if (!entry.visited) {
                this._stage.removeChild(entry.sprite);
                delete this._spriteCache[key];
            }
        });
    }

    resize() {
        const width = Math.min(window.innerWidth, this._width);
        const height = Math.min(window.innerHeight, this._height);
        this._renderer.resize(width, height);
    }
}

module.exports = RenderSystem;
