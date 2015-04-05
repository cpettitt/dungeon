class GameMap {
    constructor(name, width, height, tileWidth, tileHeight) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this._tiles = [];
        for (let x = 0; x < width; ++x) {
            this._tiles[x] = [];
            for (let y = 0; y < height; ++y) {
                this._tiles[x][y] = [];
            }
        }

        this._tileTypes = {};

        this.playerSpawn = null;
    }

    addTileType(id, image, frame) {
        this._tileTypes[id] = {
            id,
            image,
            frame
        };
    }

    addTile(x, y, tileId) {
        this._tiles[x][y].push(this._tileTypes[tileId]);
    }

    getTileTypes() {
        return this._tileTypes;
    }

    getTiles(x, y) {
        return this._tiles[x][y];
    }
}

GameMap.fromTiled = (name, json) => {
    const map = new GameMap(name, json.width, json.height, json.tilewidth, json.tileheight);
    processTilesets(json, map);
    processLayers(json, map);
    return map;
};

function processTilesets(json, map) {
    for (let tileset of json.tilesets) {
        const gid = +tileset.firstgid;
        const width = +tileset.imagewidth;
        const height = +tileset.imageheight;
        const tileWidth = +tileset.tilewidth;
        const tileHeight = +tileset.tileheight;
        // Strip off "../"
        const image = tileset.image.substr(3);

        let id = gid;

        // Assumes no margin or spacing.
        for (let y = 0; y < Math.floor(height / tileHeight); ++y) {
            for (let x = 0; x < Math.floor(width / tileWidth); ++x, ++id) {
                const frame = {
                    x: x * tileWidth,
                    y: y * tileHeight,
                    width: tileWidth,
                    height: tileHeight
                };

                map.addTileType(id, image, frame);
            }
        }
    }
}

function processLayers(json, map) {
    for (let layer of json.layers) {
        if (layer.type === "tilelayer") {
            const width = map.width;
            const height = map.height;
            const data = layer.data;

            for (let y = 0, i = 0; y < height; ++y) {
                for (let x = 0; x < width; ++x, ++i) {
                    const id = data[i];
                    if (id) {
                        map.addTile(x, y, id);
                    }
                }
            }
        } else if (layer.type === "objectgroup") {
            for (let object of layer.objects) {
                switch (object.name) {
                    case "player-spawn":
                        map.playerSpawn = { x: object.x, y: object.y };
                        break;
                }
            }
        }
    }
}

module.exports = GameMap;
