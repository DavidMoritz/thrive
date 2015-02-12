module.exports = function exportJade(grunt) {
	grunt.config('jade', {
		compile: {
			options: {
				pretty: true
			},
			files: grunt.file.expandMapping(['**/*.jade'], 'dist/', {
				cwd: 'src',
				rename: function(destBase, destPath) {
					return destBase + destPath.replace(/\.jade$/, '.html');
				}
			})

		}
	});

	grunt.loadNpmTasks('grunt-contrib-jade');
};