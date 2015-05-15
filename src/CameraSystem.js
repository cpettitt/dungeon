class CameraSystem {
    constructor(camera) {
        this._camera = camera;
    }

    tick(entities) {
        if (this._camera.camera.follow) {
            const entity = entities[this._camera.camera.follow];
            this._camera.position = {
                x: Math.round(entity.position.x),
                y: Math.round(entity.position.y)
            };
        }
    }
}

module.exports = CameraSystem;
