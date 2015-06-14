module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                
            },
            target: {
                files: {
                    'build/iodev.widgets.countdown.min.js': ['src/*.js']
                }
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'build/iodev.widgets.countdown.min.css': ['src/*.css']
                }
            }
        },
        banner: ''
            + '/**\n'
            + ' * Configurable countdown widget\n'
            + ' * Not requires jQuery or other libs\n'
            + ' * @author Sergey Sedyshev\n'
            + ' * @see find more on github https://github.com/io-developer\n'
            + ' * @build <%= grunt.template.today("yyyy-mm-dd") %>\n'
            + ' */\n',
        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>'
                },
                files: {
                    src: [
                        'build/*.js',
                        'build/*.css'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-banner');

    grunt.registerTask('default', ['uglify', 'cssmin', 'usebanner']);
};