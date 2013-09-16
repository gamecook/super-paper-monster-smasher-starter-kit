/**
 *  @caption.js
 *  @version: 1.1.0
 *  @author: Jesse Freeman
 *  @date: May 2012
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 *  
 *  Part of the Super Resident Raver Starter Kit: 
 */
ig.module(
    'game.plugins.caption'
)
    .requires(
        'impact.game',
        'bootstrap.plugins.pause',
        'impact.font',
        'plugins.tween-lite'
    )
    .defines(function() {

        Caption = ig.Class.extend({
            captionText: "",
            captionFont: new ig.Font("media/fonts/nokia-36-white-shadow.png"),
            captionAreaObj: { x: 0, y: 0, height: 60 },
            animationTween: null,
            draw: function() {

                if (this.captionText == "")
                    return;

                if (this.animationTween && ig.game.paused)
                    this.animationTween.pause();
                else (this.animationTween && !ig.game.paused);
                {
                    if (this.animationTween.paused())
                        this.animationTween.play();

                }

                ig.system.context.fillStyle = 'rgba(0,0,0,0.8)';
                ig.system.context.fillRect(this.captionAreaObj.x, this.captionAreaObj.y, ig.system.width * ig.system.scale, this.captionAreaObj.height);

                var x = ig.system.width / 2,
                    y = this.captionAreaObj.y + 10;

                this.captionFont.draw(this.captionText, x, y, ig.Font.ALIGN.CENTER);
            },
            show: function(value, delay) {
                var that = this;

                if (value != this.captionText) {
                    this.animationTween = TweenLite.fromTo(this.captionAreaObj, .8, { y: ig.system.height }, { y: (ig.system.height - this.captionAreaObj.height), ease: Strong.easeOut });
                    this.animationTween.pause();


                    this.animationTween.play().eventCallback("onStart", function() {
                        that.captionText = value.toUpperCase();
                    });
                }
                this.animationTween.eventCallback("onComplete", function() {
                    that.animationTween.reverse().delay(delay).eventCallback("onReverseComplete", function() {
                        that.captionText = "";
                    });
                });

            },
            hide: function() {
                if (this.animationTween) {
                    var that = this;
                    this.animationTween.reverse().delay(0).eventCallback("onReverseComplete", function() {
                        that.captionText = "";
                        that.animationTween = null;
                    });
                }
            }
        });

        ig.Game.inject({
            captionInstance: new Caption(),
            displayCaption: function(value, delay) {
                this.captionInstance.show(value, delay ? delay : 2);
            },
            hideCaption: function() {
                this.captionInstance.hide();
            },
            clearCaption: function() {
                this.captionInstance.captionText = "";
            },
            draw: function() {
                this.parent();

                this.captionInstance.draw();

            }
        });

    });