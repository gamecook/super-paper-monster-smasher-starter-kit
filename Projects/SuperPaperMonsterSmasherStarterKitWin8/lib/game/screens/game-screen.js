/**
 *  @game-screen.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: May 2013
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.screens.game-screen'
)
    .requires(
        'impact.game',
        'impact.font',
        'bootstrap.plugins.camera',
        'game.plugins.effects',
        'game.levels.dungeon-template',
        'game.plugins.caption',
        'game.entities.goat'
    )
    .defines(function() {

        GameScreen = ig.Game.extend({
            // Load a font
            lifeBar: new ig.Image('media/sprites/life-bar.png'),
            pauseButton: new ig.Image('media/sprites/pause.png'),
            player: null,
            screenBoundary: null,
            gravity: 300,
            score: 0,
            levelTimer: new ig.Timer(),
            levelTime: 0,
            quakeTimer: new ig.Timer(),
            duration: 1,
            strength: 3,
            enterSFX: new ig.Sound("media/sounds/enter-level.*"),
            totalKills: 0,
            kills: 0,
            totalDeaths: 0,
            level: 0,
            maxLevels: 5,
            mainMap: null,
            collisionMap: null,
            spawnerOffset: 0,
            leftSpawner: null,
            rightSpawner: null,
            spawner: null,
            nextLevel: 0,
            rewardsTotal: 0,
            gameOver: false,
            cameraYOffset: 110,
            gameOverDelay: 7,
            gameOverDelayTimer: new ig.Timer(),
            gameOverSFX: new ig.Sound("media/sounds/death-theme.*"),
            showHUD: false,
            quitButton: { name: "quit", label: "QUIT GAME", x: 0, y: 0, width: 0, height: 0 },
            soundButton: { name: "sound", label: "SOUND", x: 0, y: 0, width: 0, height: 0 },
            musicButton: { name: "music", label: "MUSIC", x: 0, y: 0, width: 0, height: 0 },
            ad: null,
            font: new ig.Font("media/fonts/nokia-36-white-shadow.png"),
            init: function() {
                // Initialize your game here; bind keys etc.
                this.loadLevel(LevelDungeonTemplate);

                this.ad = document.getElementById("ad");
                if (this.ad) {
                    this.showPurchaseText = true;
                }

                ig.input.debugHitAreas = true;

                this.alignButtons();
            },
            alignButtons: function() {

                ig.input.clearHitAreas();

                var screenCenter = ig.system.width * .5;

                var yOffset = 100;
                ig.input.registerHitArea("left", 0, yOffset, screenCenter, ig.system.height - yOffset);
                ig.input.registerHitArea("right", screenCenter, yOffset, screenCenter, ig.system.height - yOffset);

                this.pauseX = (ig.system.width - this.pauseButton.width) * .5;

                ig.input.registerHitArea("pause", this.pauseX, 8, this.pauseButton.width, this.pauseButton.height * .5);

                // Register buttons

                // Quit Button
                this.quitButton.width = this.font.widthForString(this.quitButton.label);
                this.quitButton.height = this.font.heightForString(this.quitButton.label);
                this.quitButton.x = ig.system.width - (this.quitButton.width + 5);
                this.quitButton.y = 3;
                ig.input.registerHitArea(this.quitButton.name, this.quitButton.x, this.quitButton.y, this.quitButton.width, this.quitButton.height);

                // Sound Button
                this.soundButton.width = this.font.widthForString(this.soundButton.label + " OFF");
                this.soundButton.height = this.font.heightForString(this.soundButton.label);
                this.soundButton.x = 3; //ig.system.width - (this.soundButton.width + 5);
                this.soundButton.y = 3; //(this.soundButton.height) + 3;
                ig.input.registerHitArea(this.soundButton.name, this.soundButton.x, this.soundButton.y, this.soundButton.width, this.soundButton.height);


            },
            onViewChanged: function(viewState, width, height) {
                this.alignButtons();
            },
            loadLevel: function(data) {
                this.totalKills = 0; // reset kill limit
                this.kills = 0;
                this.parent(data);
                this.player = this.getEntitiesByType(EntityPlayer)[0];
                this.cameraFollow = this.player;
                this.mainMap = ig.game.getMapByName("main");
                this.collisionMap = ig.game.getMapByName("collision");

                this.leftSpawner = ig.game.getEntityByName("leftSide");
                this.rightSpawner = ig.game.getEntityByName("rightSide");

                this.spawner = ig.game.getEntityByName("spawner");
                this.spawner.activate(this.level);

                this.spawnerBonus = this.getEntityByName("spawner-bonus");
                this.spawnerBonus.activate();

                //Both spawners should be at the same y position so we just need one to start with
                this.spawnerOffset = (this.mainMap.height * this.mainMap.tilesize) - this.leftSpawner.pos.y;

                var tileSize = this.mainMap.tilesize;
                this.screenBoundary = {
                    min: { x: tileSize, y: -tileSize * .5 },
                    max: { x: (this.mainMap.width * tileSize) - (tileSize) - ig.system.width, y: (this.mainMap.height * tileSize) - (tileSize) - ig.system.height }
                };

                this.levelUp();
                //this.displayCaption("MONSTER: YOU CAN'T STOP ME!!!", 4);


            },
            update: function() {

                // Update all entities and backgroundMaps
                this.parent();

                if (!this.gameOver) {

                    // TO Hittest
                    if (ig.input.pressed("pause")) {
                        this.togglePause();

                    } else {

                        if (this.paused) {

                            // test for hitareas when paused
                            if (ig.input.pressed("quit")) {
                                ig.system.setGame(StartScreen);
                            }

                            // Handle sound/music buttons
                                if (ig.input.pressed("sound")) {
                                    ig.soundManager.volume = (ig.soundManager.volume > 0) ? 0 : 1;
                                    ig.music.volume = (ig.music.volume > 0) ? 0 : 1;
                                }
                        } else {
                            if (ig.input.pressed('left')) {
                                this.player.move("left");

                            } else if (ig.input.pressed('right')) {
                                this.player.move("right");
                            }
                        }
                    }

                } else {
                    if (this.gameOverDelayTimer.delta() > this.gameOverDelay)
                        this.exitGame();
                }

                if (this.kills > this.totalKills - 1) {
                    this.moveToNextLevel();
                }

                if (this.screen.y > 700) {
                    this.showHUD = true;
                } else {
                    this.showHUD = false;
                }


            },
            moveToNextLevel: function() {
                if (!this.gameOver) {

                    this.player.onRage();

                    this.levelUp();

                    this.spawner.totalSpawns += (this.level % 5 == 0) ? 1 : 0;
                    this.spawnerBonus.baseSpawnLimit += (this.level % 6 == 0) ? 1 : 0;

                    this.spawner.delay /= 1.05;
                    if (this.spawner.delay < .8)
                        this.spawner.delay = .8;

                    this.spawnerBonus.delay /= 1.06;
                    if (this.spawnerBonus.delay < 1)
                        this.spawnerBonus.delay = 1;

                    // Reset Spawner
                    this.spawner.activate(this.level);
                    this.spawnerBonus.activate();
                }

            },
            levelUp: function() {
                //console.log("level up", this.level);
                this.level++;
                var nextLevel = this.level + 1;

                this.totalKills = (nextLevel * (nextLevel)) * 2;

                this.displayCaption("NEED " + (this.totalKills - this.kills) + " XP TO ADVANCE.", this.level == 1 ? 8 : 4);

                this.enterSFX.play();

            },
            onGameOver: function() {
                this.gameOver = true;
                this.gameOverDelayTimer.reset();
                this.displayCaption("YOU WERE KILLED!", this.level * 3 + this.gameOverDelay);
                ig.music.fadeOut(1);
                this.gameOverSFX.play();

            },
            exitGame: function() {
                this.hideCaption();
                ig.system.setGame(StartScreen);

            },
            onPause: function() {
                this.parent();
                this.levelTimer.pause();
                ig.music.pause();

            },
            onResume: function() {
                this.parent();
                this.levelTimer.unpause();
                ig.music.play();
            },
            draw: function() {
                // Draw all entities and backgroundMaps
                this.parent();


                if (!this.gameOver) {
                    if (this.showHUD) {
                        if (!this.paused) {
                            this.font.draw("LV: " + this.level.toString().pad(2, "0"), 10, 3);
                            this.font.draw("XP: " + this.kills.toString().pad(2, "0") + (this.totalKills > 0 ? "/" + this.totalKills.toString().pad(2, "0") : ""), 10, 44);

                            var health = this.player ? 10 - Math.floor((this.player.health / this.player.maxHealth) * 10) : 10;
                            this.lifeBar.drawTile(ig.system.width - this.lifeBar.width - 10, 10, health, this.lifeBar.width, 32);

                            if (ig.input.touchType == "touch") {
                                ig.entitiesTextureAtlas.drawFrame("touch-arrow-right.png", ig.system.width - 110, ((ig.system.height - 316) * .5) + 25);
                                ig.entitiesTextureAtlas.drawFrame("touch-arrow-left.png", 40, ((ig.system.height - 316) * .5) + 25);

                            }
                        }
                    }

                    this.pauseButton.drawTile(this.pauseX, 8, (this.paused ? 1 : 0), 60, 34);

                }

                

                if (this.paused) {
                    //Quit Button
                    this.font.draw(this.quitButton.label, this.quitButton.x, this.quitButton.y);

                    //Sound Button
                    this.font.draw(this.soundButton.label + (ig.soundManager.volume > 0 ? " ON" : " OFF"), this.soundButton.x, this.soundButton.y);

                }

                if (this.scanLines)
                    this.scanLines.draw(0, 0);

            },
        });
    })