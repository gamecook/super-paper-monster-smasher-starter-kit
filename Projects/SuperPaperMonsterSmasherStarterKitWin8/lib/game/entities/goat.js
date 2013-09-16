ig.module(
    'game.entities.goat'
)
    .requires(
        'impact.entity',
        'game.entities.hero-knight'
    )
    .defines(function() {

        EntityGoat = EntityHeroKnight.extend({
            size: { x: 42, y: 47 },
            speed: 5,
            health: 1,
            attackDelay: 8,
            speachChance: 2,
            bonusSFX: new ig.Sound('media/sounds/KilledADude.*'),
            flipDelay: 6,
            flipTimer: null,
            healthBonus: 4,
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                this.flipTimer = new ig.Timer();
                this.flipDelay = Math.round((Math.random() * this.flipDelay)) + 3;
            },
            setupAnimation: function() {
                this.addTextureAtlasAnim(this.atlas, 'idle', 1, ['goat.png'], false);
                this.currentAnim.flip.x = this.flip;
            },
            update: function() {

                this.parent();

                if (this.flipDelay > 0) {
                    if (this.flipTimer.delta() > this.flipDelay) {
                        this.flipDirection();
                        this.flipDelay = -1;
                    }

                }
            },
            check: function(other) {

                if (other instanceof EntityPlayer) {
                    if (other.flip != this.flip) {
                        other.health += this.healthBonus;
                        if (other.health > other.maxHealth) other.health = other.maxHealth;

                        this.receiveDamage(this.health + 1, null);

                        //TODO this needs to be moved into onKilled
                        this.bonusSFX.play();

                    } else {
                        this.flipDelay = -1;
                        this.flipDirection();
                    }
                }
            },
            onKilled: function() {
                this.parent();
                ig.game.displayCaption("YOU JUST ATE A GOAT!", 2);
            }
        });
    });