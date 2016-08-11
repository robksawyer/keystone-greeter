var React = require('react');
var App = require('./gpack.js');
var $ = require('jquery');

$(function() {
	//console.log('react',React);
	/* start our app after the page is ready */ 	
	React.render(React.createElement(SnowpiLogin, null), document.getElementById('snowpi'));

});
