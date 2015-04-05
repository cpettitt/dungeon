const vector = require("./vector");

class CameraSystem {
    constructor(camera) {
        this._camera = camera;
    }

    tick(entities) {
        if (this._camera.camera.follow) {
            const entity = entities[this._camera.camera.follow];
            this._camera.position = vector.copy(entity.position);
        }
    }
}

module.exports = CameraSystem;
