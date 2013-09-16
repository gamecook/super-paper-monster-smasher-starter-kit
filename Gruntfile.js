module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-open');


    var config = grunt.file.readJSON("config.json");

    // Add additonal Texture Atlas JSON files here
    var entityJSON = grunt.file.read(config.rootProject+"media/textures/entities.txt");
    var screensJSON = grunt.file.read(config.rootProject+"media/textures/screens.txt");

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        shell: {
            game: {
                command: [
                    'cd '+config.deployDir+'/tmp',
                    'php tools/bake.php lib/impact/impact.js lib/game/main.js js/game.min.js'
                ].join('&&'),
                options: {
                    stdout: true
                }
            }
        },
        copy: {
            tmp: {
                files: [
                  { expand: true, cwd: config.rootProject, src: ['index.html'], dest: config.deployDir+'/tmp/', filter: 'isFile'},
                  { expand: true, cwd: config.rootProject, src: ['css/**', 'js/**', 'lib/**', 'media/**', '!**/*.txt', 'tools/**', '!js/default.js', '!css/snap-view.css'], dest: config.deployDir+'tmp/' }
                ]
            },
            web: {
                files: [
                  { expand: true, cwd: config.deployDir+'tmp', src: ['./**', '!lib/**'], dest: config.deployDir+'web/' },
                  { expand: true, cwd: config.rootProject, src: ['demos.html'], dest: config.deployDir+'/web/', filter: 'isFile'}
                ]
            },
            blog: {
                files: [
                  { expand: true, cwd: config.deployDir+'tmp', src: ['./**'], dest: config.deployDir+'blog/' }
                ]
            },
            wp8: {
                files: [
                  { expand: true, cwd: config.deployDir+'tmp', src: ['./**', '!./media/sounds/*.ogg'], dest: config.wp8Project+'Html/' },
                  { expand: true, cwd: 'Resources/build/', src: ['console-log-wp8.js'], dest: config.wp8Project+'Html/js/', filter: 'isFile'}
                ]
            }
            ,
            win8: {
                files: [
                  { expand: true, cwd: config.deployDir+'tmp', src: ['js/game.min.js'], dest: config.rootProject, filter: 'isFile'}
                ]
            }
        },
        clean: {
            deploy: ["Deploy"],
            tmp: [config.deployDir+"tmp"],
            phone: [config.wp8Project+'Html/'],
            lib: [config.deployDir+"web/lib", config.deployDir+"blog/lib", config.wp8Project+"Html/lib"],
            tools: [config.deployDir+"tmp/tools"]
        },
        replace: {
            gamePath: {
                src: [config.deployDir+'tmp/index.html'],             // source files array (supports minimatch)
                dest: config.deployDir+'tmp/index.html',             // destination directory or file
                replacements: [{ 
                    from: '<script type="text/javascript" src="lib/impact/impact.js"></script>',                   // string replacement
                    to: '' 
                },
                    {
                        from: 'lib/game/main.js',                   // string replacement
                        to: 'js/game.min.js'
                }]
            },
            textureAtlas: {
                src: [config.deployDir+'tmp/lib/game/packed-textures.js'],             // source files array (supports minimatch)
                dest: config.deployDir+'tmp/lib/game/packed-textures.js',             // destination directory or file
                replacements: [{
                    from: 'this.entityJSON',
                    to: entityJSON
                },
                    {
                        from: 'this.screenJSON',
                        to: screensJSON
                    }]
            },
            blog: {
                src: [config.deployDir+'blog/js/game.min.js'],
                dest: config.deployDir+'blog/js/game.min.js', 
                replacements: [{
                    from: '/media/',
                    to: 'media/'
                },
                {
                    from: 'media/',
                    to: config.blogRootPath
                }]
            },
            wp8:{
                src: [config.wp8Project+'Html/js/resize-game.js'],
                dest: config.wp8Project+'Html/js/resize-game.js', 
                replacements: [{
                    from: 'gameCanvas.style.marginTop = ',
                    to: 'gameCanvas.style.top = 0;//'
                },
                {
                    from: 'gameCanvas.style.marginLeft = ',
                    to: 'gameCanvas.style.left = 0;//'
                }]
                
            },
            wp8Media: {
                src: [config.wp8Project+'Html/js/game.min.js'],
                dest: config.wp8Project+'Html/js/game.min.js', 
                replacements: [
                {
                    from: '/media/',
                    to: '/Html/media/'
                }]
            },
        },
        uglify: {
            tmp: {
                options: {
                    beautify: false,
                    mangle: true
                },
                files: {
                    'Deploy/tmp/js/game.min.js': ['Deploy/tmp/js/game.min.js']
                }
            }
        },
        express: {
            options: {
                background: true
            },
            dev: {
                options: {
                    script: 'server.js'
                }
            }
        },
        watch: {
            express: {
                files: [config.rootProject+'lib/**/*.js'],
                tasks: ['express:dev'],
                options: {
                    nospawn: true //Without this option specified express won't be reloaded
                }
            }
        },
        open: {
            dev: {
                path: 'http://localhost:8080/index.html'
            },
            editor: {
                path: 'http://localhost:8080/weltmeister.html'
            },
            web: {
                path: 'http://localhost:8080/Deploy/Web/index.html'
            }
        }
    });

    
    // Default task(s).
    grunt.registerTask('default', ['express:dev', 'open:dev', 'open:editor','watch']);
    grunt.registerTask('build-tmp', ['clean:deploy',
                                    'copy:tmp',
                                    'replace:textureAtlas']);

    grunt.registerTask('build-phone', ['clean:phone',
                                        'copy:wp8', 
                                        'replace:wp8Media']);

    grunt.registerTask('build-blog', ['copy:blog',
                                     'replace:blog']);

    grunt.registerTask('build-web', ['clean:tools',
                                    'copy:web']);

    grunt.registerTask('build-win8', ['copy:win8']);
    
    grunt.registerTask('build-minimize', ['copy:win8']);

    grunt.registerTask('build-platforms', ['build-web',
                                'build-phone',
                                'build-blog',
                                'build-win8'])

    grunt.registerTask('bake', ['build-tmp',
                                'shell:game',
                                'replace:gamePath',
                                'uglify',
                                'build-platforms',
                                'clean:lib',
                                'clean:tmp']);

    grunt.registerTask('debug', ['build-tmp',
                                'build-platforms',
                                'clean:tmp']);
};