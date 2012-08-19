// This is the main application configuration file.  It is a Grunt
// configuration file, which you can learn more about here:
// https://github.com/cowboy/grunt/blob/master/docs/configuring.md
//
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-clean');
  grunt.initConfig({

    // The clean task ensures all files are removed from the dist/ directory so
    // that no files linger from previous builds.
    clean: ["dist/"],

    // The lint task will run the build configuration and the application
    // JavaScript through JSHint and report any errors.  You can change the
    // options for this task, by reading this:
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md
    lint: {
      files: [
        "src/**/*.js"
      ]
    },

    qunit: {
        all: []
    },

    // The concatenate task is used here to merge the almond require/define
    // shim and the templates into the application code.  It's named
    // dist/debug/require.js, because we want to only load one script file in
    // index.html.
    concat: {
        dist: {
            src: ['src/Archelon.js', 'src/Math.js', 'src/Patch.js', 'src/Turtle.js', 'src/World.js'],
            dest: 'dist/archelon.js'
        }
    },

    // Takes the built require.js file and minifies it for filesize benefits.
    min: {
        dist: {
            src: ['dist/archelon.js'],
            dest: 'dist/archelon.min.js'
        }
    }
  });


    grunt.registerTask("default", "clean lint qunit concat");

  // The debug task is simply an alias to default to remain consistent with
  // debug/release.
  grunt.registerTask("debug", "default");

  // The release task will run the debug tasks and then minify the
  // dist/debug/require.js file and CSS files.
  grunt.registerTask("release", "default min");

  // The preflight task will lint and test your code, ready to be checked in to source control.
  grunt.registerTask("preflight", "lint qunit");
};
