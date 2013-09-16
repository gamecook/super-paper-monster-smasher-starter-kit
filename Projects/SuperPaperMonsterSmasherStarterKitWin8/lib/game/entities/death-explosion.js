ig.module(
    'game.entities.death-explosion'
)
    .requires(
        'impact.entity'
    )
    .defines(function() {

        EntityDeathExplosion = ig.Entity.extend({
            _wmIgnore: true,
            delay: 1,
            callBack: null,
            particles: 25,
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                for (var i = 0; i < this.particles; i++)
                    ig.game.spawnEntity(EntityDeathExplosionParticle, x, y, { colorOffset: settings.colorOffset ? settings.colorOffset : 0 });
                this.idleTimer = new ig.Timer();
            },
            update: function() {
                if (this.idleTimer.delta() > this.delay) {
                    this.kill();
                    if (this.callBack)
                        this.callBack();
                    return;
                }
            }
        });

        EntityDeathExplosionParticle = ig.Entity.extend({
            _wmIgnore: true,
            size: { x: 20, y: 20 },
            bounceFX: new ig.Sound('media/sounds/bounce.*'),
            delay: 2,
            fadetime: 1,
            bounciness: 0,
            maxVel: { x: 50, y: 150 },
            vel: { x: 40, y: 0 },
            friction: { x: 100, y: 10 },
            collides: ig.Entity.COLLIDES.NONE,
            colorOffset: 0,
            totalColors: 7,
            baseVelocity: { x: 4, y: 20 },
            zindex: 10,
            bounciness: .3,
            maxBouncesSounds: 1,
            animSheet: animSheet = new ig.AnimationSheet('media/sprites/blood-particle.png', 20, 20),
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                var dir = settings.flip ? 1 : -1;
                this.configureAnimation();
                this.vel.x = dir * (Math.random() * this.baseVelocity.x - 1) * this.vel.x;
                this.vel.y = -(Math.random() * this.baseVelocity.y - 1) * this.vel.y;
                this.idleTimer = new ig.Timer();
            },
            configureAnimation: function() {
                var frameID = Math.round(Math.random() * this.totalColors) + (this.colorOffset * (this.totalColors + 1));
                this.addAnim('idle', 1, [frameID]);
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
                this.parent();
            },
            handleMovementTrace: function(res) {
                this.parent(res);
                if (res.collision.x || res.collision.y) {
                    this.bounce();
                }
            },
            bounce: function() {

                this.maxBouncesSounds--;
                if (this.maxBouncesSounds > 0) {
                    this.bounceFX.play();
                }
            }
        });


        EntityDeathExplosionSmallParticle = EntityDeathExplosionParticle.extend({
            size: { x: 5, y: 5 },
            animSheet: new ig.AnimationSheet('media/sprites/particles.png', 5, 5),
        });

        ig.Entity.inject({
            bloodColorOffset: 0,
            bloodEntity: "EntityDeathExplosionParticle",
            spawnParticles: function(total) {
                for (var i = 0; i < total; i++)
                    ig.game.spawnEntity(this.bloodEntity, this.pos.x + (this.flip ? this.size.x : 0), this.pos.y + (this.size.y * .2), { flip: this.flip });
            },
            receiveDamage: function(amount, from) {
                this.parent(amount, from);

                if (this.health > 0) {
                    this.spawnParticles(2);
                }
            }
        });
        

    });