const each = require("lodash/collection/each");
const vector = require("./vector");

class PhysicsSystem {
    tick(entities, dt) {
        // Very simple for the moment...
        each(entities, entity => {
            if (!entity.position || !entity.movement) { return ; }

            let movement = vector.multiply(dt, entity.movement);
            entity.position = {
                x: Math.round(entity.position.x + movement.x),
                y: Math.round(entity.position.y + movement.y)
            };
        });
    }
}

module.exports = PhysicsSystem;
