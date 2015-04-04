const defaults = require("lodash/object/defaults");

class ECS {
    constructor() {
        this.entities = {};
        this._nextId = 0;
        this._archetypes = {};
        this._components = {};
    }

    registerComponent(name, component) {
        this._components[name] = component;
    }

    registerArchetype(name, archetype) {
        this._archetypes[name] = archetype;
    }

    addEntity(type, config = {}) {
        const entity = {
            id: this._nextId++
        };

        if (type) {
            defaults(entity, config, this._archetypes[type]);
        }

        for (let key in entity) {
            defaults(entity[key], this._components[key]);
        }

        this.entities[entity.id] = entity;
        return entity;
    }
}

module.exports = ECS;
