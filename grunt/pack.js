var literalify = require('literalify');

module.exports = {
  browserify: {
	  options: {
		debug: true,
		transform: ['reactify',literalify.configure({react: 'window.React', text: 'window.Text', jquery: 'window.$', 'react-bootstrap': 'window.ReactBootstrap'})],
		extensions: ['.js'],
	  },
	  dev: {
		options: {
		  alias: ['react:']  // Make React available externally for dev tools
		},
		src: ['public/snowpi/js/lib/react/jsx/app.js'],
		dest: 'public/snowpi/js/lib/react/build/bundle.js'
	  },
	  production: {
		options: {
		  debug: false
		},
		src: ['public/snowpi/js/lib/react/jsx/app.js'],
		dest: 'public/snowpi/js/lib/react/build/bundle.js'
	  }
	}
}
