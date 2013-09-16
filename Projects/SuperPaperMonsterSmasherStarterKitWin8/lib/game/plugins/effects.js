/**
 *  @effects.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2012
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.plugins.effects'
)
    .requires(
        'impact.game',
        'impact.image',
        'bootstrap.plugins.camera'
    )
    .defines(function() {

        ig.Game.inject({
            scanLines: new ig.Image("media/sprites/scan-lines.png"),
            lightMask: new ig.Image("media/sprites/lighting-effect.png"),
            lightOffset: { x: 0, y: 0 },
            meterWidth: 193,
            meterHeight: 29,
            meterPadding: 5,
            meterIconSize: { x: 32, y: 29 },
            padding: 10,
            update: function() {
                this.parent();

                if (this.cameraFollow) {

                    if (this.lightMask) {
                        this.lightOffset.x = (this.screen.x - this.lightMask.width) * .5;
                        this.lightOffset.y = (this.screen.y - this.lightMask.height) * .5;
                    }
                }
            },
            draw: function() {
                this.parent();

                if (this.cameraFollow) {
                    // Draw light mask
                    if (this.lightMask)
                        this.lightMask.draw(0, 0);
                }

                if (this.scanLines)
                    this.scanLines.draw(0, 0);
                /*
                if (this.player && !this.gameOver && !this.paused && this.showHUD) {
                    var percent = (this.player["health"] / this.player["health" + "Max"]);

                    if (percent < 0) percent = 0;
                    if (percent > 1) percent = 1;

                    ig.entitiesTextureAtlas.drawFrame("hud.png", this.padding, this.padding);

                    ig.entitiesTextureAtlas.drawFrame("meter-health.png", this.padding, this.padding, false, percent * this.meterWidth + this.meterIconSize.x, this.meterHeight);

                }*/
            },
            drawMeterBar: function(name, percent, x, y) {
                if (percent > 1) percent = 1;

                ig.entitiesTextureAtlas.drawFrame("meter-" + name + ".png", x, y, false, percent * (this.meterWidth + this.meterIconSize.x), this.meterHeight);
            },
        });
    });