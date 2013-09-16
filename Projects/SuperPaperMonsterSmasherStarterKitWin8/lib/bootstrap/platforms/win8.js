/**
 *  @win8.js
 *  @version: 1.1.0
 *  @author: Jesse Freeman
 *  @date: May 2012
 *  @copyright (c) 2012 Jesse Freeman, under The MIT License (see LICENSE)
 *
 *  v1.1.0 changes
 *      - Added event to block context menu when holding down
 */

ig.module(
    'bootstrap.platforms.win8'
)
    .requires(
    'bootstrap.plugins.resize',
    'impact.input',
    'impact.game'
)

    .defines(function () {

        //Test to see if we are running in Win8 mode
        if (typeof (WinJS) != 'undefined') {

            // setup WinJS Application reference
            var app = WinJS.Application;

            // Get activatino reference
            var activation = Windows.ApplicationModel.Activation;

            var currentApp = null;

            initLicense = function() {

                // use for live app
                currentApp = Windows.ApplicationModel.Store.CurrentApp;

                // use for testing
                //currentApp = Windows.ApplicationModel.Store.CurrentAppSimulator;

                return currentApp.licenseInformation;
            }

            licenseInfo = initLicense();

            win8ResizeGame = function(event) {
                var viewStates = Windows.UI.ViewManagement.ApplicationViewState;
                var newViewState = Windows.UI.ViewManagement.ApplicationView.value;

                if (newViewState === viewStates.snapped) {
                    // is snapped
                    ig.game.togglePause(true);
                }

                ig.resizeGame();
            };
            
            sendToStore = function () {
                var uri = new Windows.Foundation.Uri(currentApp.linkUri.rawUri);
                Windows.System.Launcher.launchUriAsync(uri);
            }

            // Add on activated function to start game
            app.onactivated = function (args) {
                if (args.detail.kind === activation.ActivationKind.launch) {
                    if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                        // TODO: This application has been newly launched. Initialize
                        // your application here.

                        window.addEventListener('resize', win8ResizeGame, false);

                        // Add code to snapView image to expand
                        var snapView = document.getElementById("snap-view");
                        snapView.addEventListener('click', function(e) {
                            var boolean = Windows.UI.ViewManagement.ApplicationView.tryUnsnap();
                        });

                        ig.startNewGame(800, 480);
                        //ig.startNewGame(1076, 600);

                    } else {
                        // TODO: This application has been reactivated from suspension.
                        // Restore application state here.
                    }
                    args.setPromise(WinJS.UI.processAll());
                }

                WinJS.Application.onsettings = function (e) {
                    e.detail.applicationcommands = { "privacyPolicy":{ title:"Privacy Policy", href:"privacy.html" } };
                    WinJS.UI.SettingsFlyout.populateSettings(e);
                };

            };

        }

    });


