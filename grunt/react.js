module.exports = {
	jsx: {
		files: [{
			expand: true,
			cwd: 'public/snowpi/js/lib/react/jsx',
			src: ['**/*.jsx','**/*.js'],
			dest: 'public/snowpi/js/lib/react/build/',
			ext: '.js'
		}]
	}
}
