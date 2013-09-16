ig.module(
    'game.entities.spawner-bonus'
)
    .requires(
        'bootstrap.entities.spawner'
    )
    .defines(function() {

        EntitySpawnerBonus = EntitySpawner.extend({
            playerEntity: null,
            spawnLimit: 1,
            baseSpawnLimit: 1,
            activate: function() {
                this.parent();
                if (!this.playerEntity)
                    this.playerEntity = ig.game.player;

                this.spawnLimit = this.baseSpawnLimit;
            },
            spawnNewEntity: function() {
                if (this.playerEntity.health < this.playerEntity.maxHealth * .5 && this.spawnLimit > 0) {
                    this.parent();
                    this.spawnLimit--;
                }
            }
        });
    })