/**
 *  @resize.js
 *  @version: 1.00
 *  @author: Jesse Freeman
 *  @date: June 2013
 *  @copyright (c) 2013 Jesse Freeman, under The MIT License (see LICENSE)
 */
ig.module(
    'bootstrap.plugins.resize'
)
    .requires(
    'impact.system'
)
    .defines(function () {

        // TODO need to move CSS into the plugin
        /*
        #canvas {
            width: 100%;
            height: 100%;
            -ms-touch-action: none;
            position: absolute;
        }
        */
        ig.resizeGame = function() {

            var canvas = ig.system.canvas;

            var canvasRatio = canvas.width / canvas.height;
            var width = window.innerWidth;
            var height = window.innerHeight;
            var windowRatio = width / height;

            if (windowRatio > canvasRatio) {
                width = height * canvasRatio;
                canvas.style.height = height + 'px';
                canvas.style.width = width + 'px';
            } else {
                height = width / canvasRatio;
                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';
            }

            canvas.style.top = (window.innerHeight - height) / 2 + "px";
            canvas.style.left = (window.innerWidth - width) / 2 + "px";

        };
        
        window.addEventListener('resize', ig.resizeGame, false);

        

    })