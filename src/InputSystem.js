const vector = require("./vector");

class InputSystem {
    constructor(player, moveRate) {
        this._touch = new TouchSystem(player, moveRate);
        this._keyboard = new KeyboardSystem(moveRate);
        this._player = player;
    }

    tick() {
        let v = this._touch.vector;
        if (!v) {
            v = this._keyboard.vector;
        }

        this._player.movement = v;
    }
}

class TouchSystem {
    constructor(player, moveRate) {
        this._player = player;
        this._moveRate = moveRate;
        this._currentTouch = null;

        window.addEventListener("touchstart", event => this._handleStart(event), false);
        window.addEventListener("touchmove", event => this._handleMove(event), false);
        window.addEventListener("touchend", event => this._handleEnd(event), false);
        window.addEventListener("touchleave", event => this._handleEnd(event), false);
        window.addEventListener("touchcancel", event => this._handleEnd(event), false);
    }

    get vector() {
        if (!this._currentTouch) { return; }
        return vector.subtract(this._currentTouch.vector, this._player.position);
    }

    _handleStart(event) {
        event.preventDefault();
        if (this._currentTouch) { return; }

        var touch = event.changedTouches[0];
        this._currentTouch = {
            id: touch.identifier,
            vector: this._touchToVector(touch)
        };
    }

    _handleMove(event) {
        event.preventDefault();
        if (!this._currentTouch) { return; }

        for (var i = 0; i < event.changedTouches.length; ++i) {
            var touch = event.changedTouches[i];
            if (touch.identifier === this._currentTouch.id) {
                this._currentTouch.vector = this._touchToVector(touch);
            }
        }
    }

    _handleEnd(event) {
        event.preventDefault();
        if (!this._currentTouch) { return; }

        for (var i = 0; i < event.changedTouches.length; ++i) {
            var touch = event.changedTouches[i];
            if (touch.identifier === this._currentTouch.id) {
                this._currentTouch = null;
                return;
            }
        }
    }

    _touchToVector(touch) {
        return vector.create(touch.clientX, touch.clientY);
    }
}

var LEFT_KEY = 37;
var UP_KEY = 38;
var RIGHT_KEY = 39;
var DOWN_KEY = 40;

class KeyboardSystem {
    constructor(moveRate) {
        this._moveRate = moveRate;
        this._vector = vector.create();
        this._up = false;
        this._down = false;
        this._left = false;
        this._right = false;

        window.addEventListener("keydown", event => this._handleKeyDown(event), false);
        window.addEventListener("keyup", event => this._handleKeyUp(event), false);
    }

    get vector() {
        if (this._vector.x === 0 && this._vector.y === 0) {
            return this._vector;
        }
        return vector.multiply(this._moveRate, vector.normalize(this._vector));
    }

    _handleKeyDown(event) {
        let changed = true;
        switch (event.keyCode) {
            case UP_KEY:
                this._vector.y = -1;
                this._up = true;
                break;
            case DOWN_KEY:
                this._vector.y = 1;
                this._down = true;
                break;
            case LEFT_KEY:
                this._vector.x = -1;
                this._left = true;
                break;
            case RIGHT_KEY:
                this._vector.x = 1;
                this._right = true;
                break;
            default:
                changed = false;
        }

        if (changed) {
            event.preventDefault();
        }
    }

    _handleKeyUp(event) {
        let changed = true;
        switch (event.keyCode) {
            case UP_KEY:
                this._vector.y = this._down ? 1 : 0;
                this._up = false;
                break;
            case DOWN_KEY:
                this._vector.y = this._up ? -1 : 0;
                this._down = false;
                break;
            case LEFT_KEY:
                this._vector.x = this._right ? 1 : 0;
                this._left = false;
                break;
            case RIGHT_KEY:
                this._vector.x = this._left ? -1 : 0;
                this._right = false;
                break;
            default:
                changed = false;
        }

        if (changed) {
            event.preventDefault();
        }
    }
}

module.exports = InputSystem;
