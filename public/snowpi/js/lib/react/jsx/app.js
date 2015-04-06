var React = require('react');
var App = require('./greeter.js');
var $ = require('jquery');

$(function() {
	//console.log('react',React);
	/* start our app after the page is ready */ 	
	React.render(<App  />, document.getElementById('snowpi'));

});
