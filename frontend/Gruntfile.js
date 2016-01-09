module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Grunt task configurations
    concat: {
      js: {
        src: [
          './Climbspotter/www/js/app.js',
          './Climbspotter/www/lib/google-maps-api.js',
          './Climbspotter/www/js/shared/*/*.js',
          './Climbspotter/www/js/controllers/*/*.js'
        ],
        dest: './Climbspotter/www/js/all.concat.js'
      }
    },

    uglify: {
      js: {
        src: ['./Climbspotter/www/js/all.concat.js'],
        dest: './Climbspotter/www/js/all.concat.min.js'
      }
    },

    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          './Climbspotter/www/css/all.concat.min.css': ['./Climbspotter/www/lib/ionic/css/ionic.css', './Climbspotter/www/css/style.css']
        }
      }
    },

    clean: {
      js: {
        src: ['./Climbspotter/www/js/all.concat.js']
      }
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Register default task
  grunt.registerTask('default', ['concat', 'uglify', 'cssmin', 'clean']);
};
