var PIXI = require("pixi.js");

class AssetLoader {
    loadAssets(assets, callback) {
        const loader = new PIXI.AssetLoader(assets, false);
        const results = {};

        loader.on("onProgress", function(event) {
            if (!(event.data.loader instanceof PIXI.JsonLoader)) {
                return;
            }

            const eventLoader = event.data.loader;
            results[eventLoader.url] = eventLoader.json;
        });
        loader.on("onComplete", function() { callback(results); });
        loader.load();
    }
}

module.exports = AssetLoader;
