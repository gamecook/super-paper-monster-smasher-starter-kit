ig.module(
    'game.main'
)
    .requires(
        'impact.game',
        'bootstrap.plugins.resize',
        'bootstrap.plugins.hit-area',
        'bootstrap.plugins.texture-atlas',
        'bootstrap.plugins.pause',
        'bootstrap.platforms.win8',
        'bootstrap.plugins.utils',
        'game.entities.death-explosion',
        'plugins.tween-lite',
        'game.packed-textures',
        'game.screens.start-screen'/*,
        'impact.debug.debug'*/
    )
    .defines(function() {

        Menu.inject({
            menuFont: new ig.Font("media/fonts/nokia-36-white-shadow.png"),
            init: function(title) {
                this.title = "PAUSED";
            }
        });


        ig.SoundManager.inject({
            init: function () {
                
                // Probe sound formats and determine the file extension to load
                var probe = new Audio();
                for (var i = 0; i < ig.Sound.use.length; i++) {
                    var format = ig.Sound.use[i];
                    if (probe.canPlayType(format.mime)) {
                        this.format = format;
                        break;
                    }
                }

                // No compatible format found? -> Disable sound
                if (!this.format) {
                    ig.Sound.enabled = false;
                }

            }

        })

        ig.Music.inject({

            add: function (music, name) {
                
                var path = music instanceof ig.Sound ? music.path : music;

                var track = ig.soundManager.load(path, false);
                track.loop = this._loop;
                track.volume = this._volume;
                track.addEventListener('ended', this._endedCallbackBound, false);
                this.tracks.push(track);

                if (name) {
                    this.namedTracks[name] = track;
                }

                if (!this.currentTrack) {
                    this.currentTrack = track;
                }
            },
        })

        ig.startNewGame = function(width, height) {

            //ig.ua.mobile = true;

            if (ig.ua.mobile) {
            // Disable sound for all mobile devices
                ig.Sound.enabled = false;
            }

            ig.main('#canvas', StartScreen, 60, width, height, 1);

            ig.music.add(new ig.Sound('media/sounds/MonsterStomperLOOP.*'), "track1");
            ig.music.loop = true;
            
            if (ig.resizeGame)
                ig.resizeGame();
        };

        if (typeof(WinJS) == 'undefined') {
            ig.startNewGame(800, 480);
        }

    });