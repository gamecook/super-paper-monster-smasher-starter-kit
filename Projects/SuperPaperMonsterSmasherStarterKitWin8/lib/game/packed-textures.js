/**
 *  @packed-textures.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2013
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.packed-textures'
)
    .requires(
        'bootstrap.plugins.texture-atlas'
    )
    .defines(function() {

        ig.PackedTextures = ig.Class.extend({
            textureAtlas: null,
            entityJSON: null,
            screenJSON: null,
            staticInstantiate: function(ignoredFoo) {
                if (ig.PackedTextures.instance == null) {
                    return null;
                } else {
                    return ig.PackedTextures.instance;
                }
            },

            init: function() {
                ig.PackedTextures.instance = this;

                // Attach these to the ig object
                ig.entitiesTextureAtlas = new ig.TextureAtlas("media/textures/entities.png", this.entityJSON);
                ig.screensTextureAtlas = new ig.TextureAtlas("media/textures/screens.png", this.screenJSON);
            },
        });

        ig.textureData = new ig.PackedTextures();
    })