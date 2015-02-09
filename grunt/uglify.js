/**
 * concat and minify scripts
 */
module.exports = function(grunt) {
	grunt.config.set('uglify', {
		prod: {
			options: {
				banner: '<%= banner %>',
			},
			files: {
				'<%= distPath %>thrive.js': '<%= distPath %>thrive.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
};