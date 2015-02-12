module.exports = function exportPleeease(grunt) {
	grunt.config('pleeease', {
		dev: {
			options: {
				optimizers: {
					minifier: false
				}
			},
			files: {
				'<%= distPath %>thrive.css': '<%= distPath %>thrive.css'
			}
		},
		prod: {
			options: {
				optimizers: {
					minifier: true
				}
			},
			files: {
				'<%= distPath %>thrive.css': '<%= distPath %>thrive.css'
			}
		}
	});

	grunt.loadNpmTasks('grunt-pleeease');
};
