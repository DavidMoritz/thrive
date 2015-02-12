module.exports = function exportWatch(grunt) {
	grunt.config.set('watch', {
		src: {
			files: [
				'src/**/*.*'
			],
			tasks: [
				'default'
			]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
};
