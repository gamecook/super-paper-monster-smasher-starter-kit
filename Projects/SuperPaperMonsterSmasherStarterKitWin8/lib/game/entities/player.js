ig.module(
    'game.entities.player'
)
    .requires(
        'impact.entity',
        'game.entities.hero'
    )
    .defines(function() {

        EntityPlayer = ig.Entity.extend({
            size: { x: 160, y: 240 },
            offset: { x: 0, y: 0 },
            type: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.ACTIVE,
            speed: 10,
            zIndex: 5,
            gravityFactor: 2,
            friction: { x: 400, y: 200 },
            speed: 400,
            flip: false,
            health: 10,
            maxHealth: 10,
            bounciness: .2,
            hitSFX: new ig.Sound('media/sounds/hurt1.*'),
            rageSFX: new ig.Sound('media/sounds/DramaticFallAndCrash.*'),
            landingSFX: new ig.Sound('media/sounds/LandingSound.*'),
            blastRadius: 350,
            raging: false,
            gotoNextLevel: false,
            nextSafeZone: 0,
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                this.setupAnimation();
            },
            setupAnimation: function() {
                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['player-2.png'], false);
                this.addTextureAtlasAnim(atlas, 'run', .3, ['player-1.png', 'player-0.png', 'player-1.png', 'player-2.png'], false);

                this.currentAnim.flip.x = this.flip;

            },
            update: function() {
                this.parent();
                if (this.vel.x != 0) {
                    this.offset.y = Math.random().map(0, 1, 0, 2);
                    this.currentAnim = this.anims.run;
                    this.currentAnim.flip.x = this.flip;
                } else {
                    this.offset.y = 0;
                    this.currentAnim = this.anims.idle;
                    this.currentAnim.flip.x = this.flip;
                }

                if (this.raging == true && this.vel.y == 0) {
                    this.killWithinRange(this.blastRadius);
                    this.raging = false;
                }

                if (this.gotoNextLevel && this.pos.y > this.nextSafeZone)
                    this.gotoNextLevel = false;
            },
            killWithinRange: function(range) {
                var entity;
                var entities = ig.game.entities;
                for (var i = 0; i < entities.length; i++) {
                    entity = entities[i];
                    if (entity.type == ig.Entity.TYPE.B) {
                        var distance = this.distanceTo(entity);
                        if (distance < range)
                            entity.receiveDamage(2, this);
                    }
                }
            },
            move: function(value) {
                if (this.vel.y != 0)
                    return;
                switch (value) {
                case "right":
                    this.vel.x = this.speed;
                    this.flip = false;
                    break;
                case "left":
                    this.vel.x = -this.speed;
                    this.flip = true;
                    break;
                }


                this.currentAnim.flip.x = this.flip;
            },
            onGotoNextLevel: function() {
                this.health = this.maxHealth;
            },
            handleMovementTrace: function(res) {

                if (this.gotoNextLevel) {
                    this.pos.x += this.vel.x * ig.system.tick;
                    this.pos.y += this.vel.y * ig.system.tick;
                } else {
                    this.parent(res);
                    if (res.collision.y && !this.standing) {
                        ig.game.shake(2, 4);
                        this.landingSFX.play();
                    }
                }
            },
            receiveDamage: function(value, target) {
                this.parent(value, target);
                this.hitSFX.play();
            },
            onRage: function() {
                this.vel.x = this.accel.x = 0;
                this.vel.y = this.accel.y = -200;
                this.raging = true;
                this.rageSFX.play();

            },
            kill: function() {
                this.parent();
                this.killWithinRange(150);
                ig.game.shake(4, 8, false);
                //TODO need a delay and death animation
                ig.game.onGameOver();
                ig.game.spawnEntity(EntityGhost, this.pos.x, this.pos.y - 30, { flip: this.flip, zIndex: this.zIndex, name: "ghost" });
                ig.game.spawnEntity(EntityCorpse, this.pos.x - (this.size.x * .5), this.pos.y + (this.size.y * .3), { flip: this.flip, zIndex: this.zIndex });

            }
        });

        EntityCorpse = ig.Entity.extend({
            flip: false,
            gravityFactor: 0,
            //animSheet:new ig.AnimationSheet('media/monster-corpse.png', 251, 167),
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                //this.addAnim('idle', 1, [0]);

                this.setupAnimation();
            },
            setupAnimation: function() {
                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['player-corpse.png'], false);
                this.currentAnim.flip.x = this.flip;

            }
        });
        EntityGhost = ig.Entity.extend({
            flip: false,
            gravityFactor: 0,
            speed: 200,
            maxVel: { x: 0, y: 300 },
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                ig.game.cameraFollow = this;
                ig.game.cameraYOffset = 190;
                this.setupAnimation();
            },
            setupAnimation: function() {
                var atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(atlas, 'idle', 1, ['player-ghost.png'], false);
                this.currentAnim.flip.x = this.flip;

            },
            update: function() {
                this.parent();

                if (ig.game.gameOverDelayTimer.delta() < ig.game.gameOverDelay) {
                    this.speed = this.speed * .2;
                }

                this.accel.y -= this.speed;

                if (this.pos.y < -300) {
                    ig.game.exitGame();
                }
            },
            handleMovementTrace: function(res) {
                this.pos.x += this.vel.x * ig.system.tick;
                this.pos.y += this.vel.y * ig.system.tick;
            }
        });
    });