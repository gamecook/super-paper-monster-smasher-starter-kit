ig.module(
    'game.entities.hero-knight'
)
    .requires(
        'game.entities.hero'
    )
    .defines(function() {

        EntityHeroKnight = EntityHero.extend({
            _wmIgnore: false,
            size: { x: 20, y: 60 },
            offset: { x: 0, y: 0 },
            speed: 25,
            health: 2,

            init: function(x, y, settings) {
                this.parent(x, y, settings);
            },
            setupAnimation: function() {
                this.addTextureAtlasAnim(this.atlas, 'idle', 1, ['knight.png'], false);
                this.currentAnim.flip.x = this.flip;
            },
            check: function(other) {

                if (other instanceof EntityPlayer) {
                    if (other.flip != this.flip) {
                        this.receiveDamage(1, other);
                        this.vel.x += 200 * (this.flip ? -1 : 1);
                    } else {

                        if (this.attackTimer.delta() > this.attackDelay) {
                            this.attackTimer.reset();
                            other.receiveDamage(this.attackValue, this);
                            this.vel.x += 400 * (this.flip ? -1 : 1);
                        }
                    }
                }
            }
        });
    });