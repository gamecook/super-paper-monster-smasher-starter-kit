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
    'game.screens.start-screen'
)
    .requires(
        'impact.game',
        'game.screens.game-screen'
    )
    .defines(function() {

        // This is a simple template for the start screen. Replace the draw logic with your own artwork
        StartScreen = ig.Game.extend({
            backgroundObj: { x: 0, y: 0 },
            logoObj: { x: 0, y: 0 },
            logoMaskObj: { x: 0, y: 0 },
            backgroundMaskBObj: { x: 0, y: 0 },
            startBlinkTimer: new ig.Timer(),
            showStartText: false,
            animationDone: false,
            logoTween: null,
            splashScreenTextures: null,
            startSFX: new ig.Sound('media/sounds/start-game.*'),
            init: function() {

                this.splashScreenTextures = ig.screensTextureAtlas;

                // Dissable Context Menu
                ig.input.bind(ig.KEY.MOUSE2);

                // Register click area for entire screen
                ig.input.registerHitArea("click", 0, 0, ig.system.width, ig.system.height);

                this.setupTweens();

                this.animateIntoIn(this.animationIntroInComplete);

                ig.music.play("track1");

                ig.input.bind(ig.KEY.ENTER, 'enter');

            },
            setupTweens: function() {

                var logoData = this.splashScreenTextures.getFrameData("title.png").frame;
                this.activeBGImg = "background-image.png";

                var backgroundTextureData = this.splashScreenTextures.getFrameData(this.activeBGImg).frame;

                // this needs to handle screen resize while animation is going on
                this.backgroundObj.x = (ig.system.width - (backgroundTextureData.w - 53)) * .5;
                this.backgroundObj.y = (ig.system.height - backgroundTextureData.h) * .5;


                if (this.ad && ig.system.height <= 786)
                    this.backgroundObj.y = 10;

                // Setup Logo
                this.logoObj.x = ig.system.width + 300;
                this.logoObj.y = ig.system.height - 300;
                this.logoTween = TweenLite.fromTo(this.logoObj, .5, { x: this.logoObj.x, y: this.logoObj.y }, { x: this.backgroundObj.x + backgroundTextureData.w - logoData.w - 50, y: this.backgroundObj.y + backgroundTextureData.h - logoData.h - 15, delay: 0, ease: Strong.easeOut });
                this.logoTween.pause();

                // Background Mask
                this.backgroundMaskBObj.x = this.backgroundObj.x;
                this.backgroundMaskBObj.y = this.backgroundObj.y - 70;
                this.backgroundMaskBObj.w = 755;
                this.backgroundMaskBObj.h = 600;
                this.backrgoundMaskTween = TweenLite.fromTo(this.backgroundMaskBObj, 1, { y: this.backgroundMaskBObj.y }, { y: ig.system.height, ease: Quart.easeInOut });
                this.backrgoundMaskTween.pause();

            },
            animateIntoIn: function(callback) {
                this.mode = "animateIntroIn";
                this.logoTween.play();
                this.animateMaskDown(.3, this.animationComplete);
            },
            animateIntroOut: function(callback) {
                this.mode = "animateIntroOut";
                this.animationDone = this.showStartText = false;
                this.backrgoundMaskTween.reverse().delay(.1);
                this.logoTween.reverse().delay(.4).eventCallback("onReverseComplete", this.animationComplete);
            },
            animateMaskUp: function(delay, callback) {
                this.backrgoundMaskTween.reverse().delay(delay).eventCallback("onReverseComplete", callback);
            },
            animateMaskDown: function(delay, callback) {
                this.backrgoundMaskTween.play().delay(delay).eventCallback("onComplete", callback);
            },
            animationComplete: function() {
                switch (ig.game.mode) {
                case "animateIntroIn":
                    ig.game.animationDone = true;
                    break;
                case "animateIntroOut":
                    ig.game.gotoNextScreen();
                    break;
                }
            },
            gotoNextScreen: function() {
                ig.system.setGameNow(GameScreen, "0.js");
            },
            update: function() {
                if (ig.input.pressed('click') && this.animationDone) {

                    this.onStart();
                    this.startSFX.play();
                }
                this.parent();

                if (this.animationDone)
                    this.showStartText = Math.round(this.startBlinkTimer.delta()) % 2 ? true : false;

                if (ig.input.pressed('enter')) {
                    this.onStart();
                }
            },
            onStart: function() {
                this.animateIntroOut(this.animationInrtoOutComplete);
            },
            draw: function() {
                this.parent();

                this.splashScreenTextures.drawFrame(this.activeBGImg, this.backgroundObj.x, this.backgroundObj.y);

                //Mask For Background
                ig.system.context.fillStyle = 'rgba(0,0,0,1)';
                ig.system.context.fillRect(this.backgroundMaskBObj.x, this.backgroundMaskBObj.y, this.backgroundMaskBObj.w, this.backgroundMaskBObj.h);

                if (this.showStartText) {
                    this.splashScreenTextures.drawFrame("start-text.png", this.backgroundObj.x, this.backgroundObj.y + 25);
                }

                //Logo Tray
                this.splashScreenTextures.drawFrame("background-mask.png", this.backgroundObj.x, this.logoObj.y - 30);

                //Logo Text
                this.splashScreenTextures.drawFrame("title.png", this.logoObj.x, this.logoObj.y);

                // Mask off right side
                ig.system.context.fillRect(this.backgroundObj.x + this.backgroundObj.width, this.backgroundObj.y - 100, this.backgroundMaskBObj.w, this.backgroundMaskBObj.h);
            }
        });
    })