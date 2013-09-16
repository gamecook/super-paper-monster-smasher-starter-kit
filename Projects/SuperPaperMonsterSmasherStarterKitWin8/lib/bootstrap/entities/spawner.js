/**
 *  @spawner.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2012
 *  @copyright (c) 2012 Jesse Freeman, under The MIT License (see LICENSE)
 *
 *  This entity is useful for spawning entities.
 */
ig.module(
    'bootstrap.entities.spawner',
    'bootstrap.plugins.pause'
)
    .requires(
    'impact.entity'
)
    .defines(function () {

        EntitySpawner = ig.Entity.extend({
            idleTimer: null,
            _wmDrawBox: true,
            _wmBoxColor: 'rgba(0, 0, 255, 0.7)',
            _wmScalable: true,
            size: { x: 80, y: 80 },
            delay: 3,
            delayTime: 0,
            gravityFactor: 0,
            target: null,// needs to be removed
            targets: [],
            entities: [],
            emptyCallback: null,
            level: -1,
            activated: false,
            totalSpawns: 1,
            init: function (x, y, settings) {
                this.parent(x, y, settings);

                // Transform the target object into an ordered array of targets
                this.targets = ig.ksort(this.target);

                if (settings.entities) {
                    // Setup collection of entities to spawn from
                    this.entities = settings.entities.split(",");
                }

            },
            update: function () {
                //if (ig.game.level == this.level && !this.activated)
                //    this.activate();

                if (!this.activated || ig.game.paused)
                    return;

                this.delayTime += this.idleTimer.tick();

                if (this.delayTime > this.delay) {
                    this.idleTimer.reset();
                    this.delayTime = 0;
                    this.spawnNewEntity();
                }
                //this.parent();
            },
            activate: function () {
                this.activated = true;
                this.idleTimer = new ig.Timer();
            },
            spawnNewEntity: function (settings, target) {

                if (this.entities.length <= 0) {
                    return;
                }

                if (!settings) settings = { spawner: this };

                for (var i = 0; i < this.totalSpawns; i++) {
                    if (this.targets.length > 0) {
                        var index = Math.floor(Math.random() * (this.targets.length));

                        var newTarget = ig.game.getEntityByName(typeof target == "undefined" ? this.targets[index] : target);

                        settings.flip = newTarget.flip;

                        var column = Math.round(Math.random() * (newTarget.size.x / 10));
                        var x = column * 10 + newTarget.pos.x;

                        var row = Math.round(Math.random() * (newTarget.size.y / 20));
                        var y = row * 20 + newTarget.pos.y;

                        settings.zIndex = row;

                        this.createEntity(x, y, settings);

                    }

                }


            },
            createEntity: function (x, y, settings) {
                //TODO need to figure out a way to add odds based selection to entities... need game to push in new types based on level
                var index = Math.floor(Math.random() * (this.entities.length));

                var newEntity = ig.game.spawnEntity(this.entities[index], x, y, settings);

                ig.game.sortEntitiesDeferred();

                return newEntity;
            },
            draw: function () {
            },
            removeItem: function () {
                this.pool--;
            },
            pause: function (value) {
                if (!this.idleTimer)
                    return;

                if (value)
                    this.idleTimer.pause();
                else
                    this.idleTimer.unpause();
            }
        });


    });