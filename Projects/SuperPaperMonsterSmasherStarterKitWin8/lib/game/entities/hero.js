ig.module(
    'game.entities.hero'
)
    .requires(
        'impact.entity',
        'impact.game'
    )
    .defines(function() {

        EntityHero = ig.Entity.extend({
            _wmIgnore: true,
            type: ig.Entity.TYPE.B,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,
            gravityFactor: 0,
            attackDelay: 1,
            attackTimer: new ig.Timer(),
            attackValue: 1,
            flip: false,
            speed: 25,
            health: 2,
            bounciness: .3,
            bloodEntity: "EntityDeathExplosionSmallParticle",
            hitSFX: new ig.Sound('media/sounds/hurt2.*'),
            freeze: false,
            init: function(x, y, settings) {
                this.parent(x, y, settings);

                this.atlas = ig.entitiesTextureAtlas;
                this.setupAnimation();
            },
            setupAnimation: function() {

            },
            update: function() {
                this.parent();
                if (this.freeze)
                    return;
                if (!ig.game.gameOver) {
                    var xdir = this.flip ? -1 : 1;
                    this.vel.x += this.speed * xdir;
                } else {
                    this.vel.x = this.accel.x = 0;
                }

                var baseOffset = 3;
                this.offset.y = Math.random().map(0, baseOffset, -baseOffset, baseOffset);

            },
            handleMovementTrace: function(res) {
                this.parent(res);

                if (res.collision.x) {
                    this.kill(false);
                }
            },
            kill: function(noAnimation) {
                this.parent();
                ig.game.totalDeaths++;
            },
            receiveDamage: function(value, target) {
                this.parent(value, target);
                this.hitSFX.play();
                ig.game.spawnEntity(EntityPointDisplay, this.pos.x, this.pos.y - 30, { value: value + 1 });

                if (this.health <= 0) {
                    this.onKilled();
                }
            },
            onKilled: function() {
                ig.game.spawnEntity(EntityBloodPuddle, this.pos.x, this.pos.y + this.size.y - 10, { flip: this.flip });
                ig.game.kills++;
            },
            flipDirection: function() {
                this.flip = !this.flip;
                this.currentAnim.flip.x = this.flip;
            }
        });
        EntityBloodPuddle = ig.Entity.extend({
            flip: false,
            delay: 20,
            fadetime: 20,
            idleTimer: null,
            zIndex: -2,
            splat: new ig.Sound('media/sounds/KilledADude.*'),
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                this.atlas = ig.entitiesTextureAtlas;
                this.addTextureAtlasAnim(this.atlas, 'idle', 1, ['blood-puddle.png'], false);
                this.currentAnim.flip.x = this.flip;
                this.idleTimer = new ig.Timer();
                ig.game.sortEntitiesDeferred();
                this.splat.play();
            },
            update: function() {
                if (this.idleTimer.delta() > this.delay) {
                    this.kill();
                    return;
                }

                this.currentAnim.alpha = this.idleTimer.delta().map(
                    this.delay - this.fadetime, this.delay,
                    1, 0
                );

            }
        });

        EntityPointDisplay = ig.Entity.extend({
            animSheet: new ig.AnimationSheet('media/sprites/small-points.png', 28, 14),
            idleTimer: null,
            delay: .5,
            fadetime: 1,
            zIndex: 7,
            speed: 1,
            gravityFactor: 0,
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                this.addAnim('idle', 1, [settings.value - 1]);
                this.idleTimer = new ig.Timer();
                ig.game.sortEntitiesDeferred();
            },
            update: function() {
                this.parent();

                this.vel.y -= this.speed;

                if (this.idleTimer.delta() > this.delay) {
                    this.kill();
                    return;
                }
                this.currentAnim.alpha = this.idleTimer.delta().map(
                    this.delay - this.fadetime, this.delay,
                    1, 0
                );
            }
        });
    })