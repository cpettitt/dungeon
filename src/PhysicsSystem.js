class PhysicsSystem {
    constructor(gameMap, player) {
        this._gameMap = gameMap;
        this._player = player;
        this._maxDt = 1/60;
    }

    tick(entities, dt) {
        // We only allow a max of 4 skipped frames. Large numbers of skipped
        // frames can occur if the browser deprioritized requestAnimationFrame.
        dt = Math.min(dt, this._maxDt * 4);

        while (dt > 0) {
            const nextDt = Math.min(dt, this._maxDt);
            const actualDt = this._step(nextDt);
            dt -= actualDt;
        }
    }

    _step(dt) {
        const entity = this._player;

        // If there is no movement from our player, there is no collision
        if (!entity.movement.x && !entity.movement.y) {
            return dt;
        }

        const velocity = { x: entity.movement.x * dt, y: entity.movement.y * dt };
        const nearest = this._findNearestCollision(entity.position, entity.bbox, velocity);
        if (nearest) {
            dt = nearest.t * dt;
        }

        this._advance(dt);

        if (nearest) {
            if (nearest.normal.x) {
                entity.movement.x = 0;
            }
            if (nearest.normal.y) {
                entity.movement.y = 0;
            }
        }

        return dt;
    }

    _advance(dt) {
        const dx = dt * this._player.movement.x;
        const dy = dt * this._player.movement.y;
        this._player.position.x += dx;
        this._player.position.y += dy;
    }

    _findNearestCollision(position, bbox, vector) {
        let nearest = { t: Number.POSITIVE_INFINITY };

        for (let i = 0; i < this._gameMap.width; ++i) {
            for (let j = 0; j < this._gameMap.height; ++j) {
                if (!this._gameMap.isWalkable(i, j)) {
                    // Tile is the Minkowski sum of the entity bbox and the tile
                    // bbox. This allows us to turn a moving AABB and static AABB
                    // intersection test into a ray and static AABB intersection
                    // test and avoid some repetative math in the process!
                    const tile = {
                        x: i * this._gameMap.tileWidth,
                        y: j * this._gameMap.tileHeight,
                        width: this._gameMap.tileWidth + bbox.width,
                        height: this._gameMap.tileHeight + bbox.height
                    };

                    const origin = {
                        x: position.x + bbox.x,
                        y: position.y + bbox.y
                    };

                    const current = this._intersectRayAabb(origin, vector, tile);
                    if (current < nearest.t) {
                        nearest.t = current;
                        nearest.tile = { x: i, y: j };
                        nearest.tileBbox = tile;

                        const dx = tile.x - origin.x;
                        const dy = tile.y - origin.y;
                        nearest.normal = {
                            x: Math.abs(dx) > tile.width / 2 ? sign(dx) : 0,
                            y: Math.abs(dy) > tile.height / 2 ? sign(dy) : 0
                        };
                    }
                }
            }
        }

        if (nearest.t <= 1) {
            return nearest;
        }
    }

    /**
     * Returns the time at which a ray starting at origin a and moving with
     * velocity v intersects an AABB b. If no intersection occurs this
     * function returns undefined.
     *
     * AABBs have { x, y, width, height }, with x and y at the center of the
     * AABB.
     */
    _intersectRayAabb(a, v, b) {
        let tnear = Number.NEGATIVE_INFINITY;
        let tfar = Number.POSITIVE_INFINITY;

        for (let axis of ["x", "y"]) {
            const p = a[axis];
            const w = v[axis];
            const bmin = b[axis] - (axis === "x" ? b.width : b.height) / 2;
            const bmax = b[axis] + (axis === "x" ? b.width : b.height) / 2;

            if (w === 0) {
                // If p is not the bounds of b then we're done!
                if (p < bmin || bmax < p) {
                    return;
                }
            } else {
                let t1 = (bmin - p) / w;
                let t2 = (bmax - p) / w;

                if (t1 > t2) {
                    [t1, t2] = [t2, t1];
                }

                tnear = Math.max(tnear, t1);
                tfar = Math.min(tfar, t2);
            }
        }

        if (tnear <= tfar && 0 <= tnear) {
            // Try to dampen out float point errors.
            return Math.floor(tnear * 1000) / 1000;
        }
    }

    _gameToGrid(coords) {
        return {
            x: Math.floor(coords.x / this._gameMap.tileWidth + 0.5),
            y: Math.floor(coords.y / this._gameMap.tileHeight + 0.5)
        };
    }
}

function sign(n) {
    return n ? (n < 0 ? -1 : 1) : 0;
}

module.exports = PhysicsSystem;
