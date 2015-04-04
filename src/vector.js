const vector = {};

vector.create = (x = 0, y = 0) => ({ x, y });

vector.add = (v1, v2) => vector.create(v1.x + v2.x, v1.y + v2.y);

vector.subtract = (v1, v2) => vector.create(v1.x - v2.x, v1.y - v2.y);

vector.multiply = (scalar, v) => vector.create(scalar * v.x, scalar * v.y);

vector.divide = (v, scalar) => vector.create(v.x / scalar, v.y / scalar);

vector.magnitudeSquared = v => v.x * v.x + v.y * v.y;

vector.magnitude = v => Math.sqrt(vector.magnitudeSquared(v));

vector.normalize = v => {
    const magnitude = vector.magnitude(v);
    return vector.divide(v, magnitude);
};

module.exports = vector;
