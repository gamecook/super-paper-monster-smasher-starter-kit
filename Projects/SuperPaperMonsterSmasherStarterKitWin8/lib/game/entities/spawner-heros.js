ig.module(
    'game.entities.spawner-heros'
)
    .requires(
        'bootstrap.entities.spawner',
        'game.entities.hero-knight'
    )
    .defines(function() {

        EntitySpawnerHeros = EntitySpawner.extend({
            entitiesMasterList: [],
            baseLevel: 5,
            init: function(x, y, settings) {
                this.parent(x, y, settings);
                this.entitiesMasterList = ["EntityHeroKnight"];
            },
            activate: function(level) {
                this.parent();
                var percent = ((level) / this.baseLevel);
                if (percent > 1)
                    percent = 1;

                var index = Math.round(percent * this.entitiesMasterList.length) + 1;
                this.entities = this.entitiesMasterList.slice(0, index);
            }
        });
    })