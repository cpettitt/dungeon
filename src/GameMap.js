class GameMap {
  constructor(width, height, tileWidth, tileHeight) {
    this.width = width;
    this.height = height;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;

    this.tiles = [];
    for (let x = 0; x < width; ++x) {
      this.tiles[x] = [];
      for (let y = 0; y < height; ++y) {
        this.tiles[x][y] = { textures: [] };
      }
    }

    this.textureFrames = {};

    this.playerSpawn = null;
    this._winBoxes = [];
  }

  addTextureFrame(id, image, frame) {
      this.textureFrames[id] = { image, frame };
  }

  addTileTexture(x, y, textureId) {
    this.tiles[x][y].textures.push(textureId);
  }
}

GameMap.fromTiled = json => {
  const map = new GameMap(+json.width, +json.height, +json.tilewidth, +json.tileheight);
  processTilesets(json, map);
  processLayers(json, map);
  return map;
};

function processTilesets(json, map) {
  for (let tileset of json.tilesets) {
    const gid = +tileset.firstgid,
          width = +tileset.imagewidth,
          height = +tileset.imageheight,
          tileWidth = +tileset.tilewidth,
          tileHeight = +tileset.tileheight,
          // Strip off "../"
          image = tileset.image.substr(3);

    let id = gid;

    // Assumes no margin or spacing.
    for (let y = 0; y < Math.floor(height / tileHeight); ++y) {
      for (let x = 0; x < Math.floor(width / tileWidth); ++x, ++id) {
        map.addTextureFrame("map-" + id, image, {
            x: x * tileWidth,
            y: y * tileHeight,
            width: tileWidth,
            height: tileHeight
        });
      }
    }
  }
}

function processLayers(json, map) {
  for (let layer of json.layers) {
    if (layer.type === "tilelayer") {
      const width = map.width,
            height = map.height,
            data = layer.data;

      for (let y = 0, i = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x, ++i) {
          const id = data[i];
          if (id) {
            map.addTileTexture(x, y, "map-" + id);
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
