module.exports = function(grunt) {

	grunt.config( 'react', require('./grunt/react.js') );
	grunt.config( 'pack', require('./grunt/pack.js') );
	grunt.config( 'watch', require('./grunt/watch.js') );
	
	require('load-grunt-tasks')(grunt);
	
	grunt.registerTask('default', ['watch']);	
}
