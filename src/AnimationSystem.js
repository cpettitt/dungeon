const each = require("lodash/collection/each");
const vector = require("./vector");

/**
 * Names of the cardinal directions starting from 0 radians and moving to 2 *
 * PI radians.
 */
const DIRECTION = ["right", "down", "left", "up"];

class AnimationSystem {
    tick(entities, dt) {
        each(entities, entity => this._updateEntity(entity, dt));
    }

    _updateEntity(entity, dt) {
        if (!entity.movement || !entity.animationDefs) { return; }

        // If we're not currently moving then clear any active animations.
        if (!vector.magnitude(entity.movement)) {
            if (entity.animation) {
                // Reset to first frame of animation
                entity.texture.frame = entity.animationDefs[entity.animation.name].frames[0];
                delete entity.animation;
            }
            return;
        }

        const name = this._getAnimationName(entity);
        if (!entity.animation || entity.animation.name !== name) {
            entity.animation = {
                name: name,
                timeSinceStart: 0
            };
        } else {
            entity.animation.timeSinceStart += dt;
        }

        const timeSinceStart = entity.animation.timeSinceStart;
        const frame = this._animationToFrame(name, timeSinceStart, entity.animationDefs);
        if (frame) {
            entity.texture.frame = frame;
        }
    }

    _animationToFrame(name, timeSinceStart, animationDefs) {
        const def = animationDefs[name];
        if (!def) { return; }

        return def.frames[Math.round(timeSinceStart / def.timePerFrame) % def.frames.length];
    }

    _getAnimationName(entity) {
        const angle = vector.angle(entity.movement);
        return DIRECTION[Math.floor(((4 * angle) / Math.PI + 1) % 8 / 2)];
    }
}

module.exports = AnimationSystem;
