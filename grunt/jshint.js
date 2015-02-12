module.exports = function exportJshint(grunt) {
	grunt.config('jshint', {
		options: {
			reporter: require('jshint-stylish'),
			jshintrc: '.jshintrc'
		},
		all: [
			'src/**/*.js',
			'grunt/**/*.js',
			'*.js'
		]
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
};