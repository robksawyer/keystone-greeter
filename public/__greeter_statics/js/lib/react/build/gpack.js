var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Login = require('./forms/login');
var Register = require('./forms/register');
var ResetPassword = require('./forms/reset');
var GFlash = require('./flash');
var Text = require('text');

/**
 * use yes for true
 * use no for false
 * 
 * this single app uses the yes/no var so if you want you can switch back to true/false
 * 
 * */
var yes = 'yes', no = 'no';
//var yes = true, no = false;

/* this is our main component
 * since this is a single function app we will call this directly
 * 
 * to include this in your React setup modify componentWillReceiveProps to recieve any default values 
 * 
 * */

var BootstrapButton = ReactBootstrap.Button;

var GLogin = React.createClass({displayName: "GLogin",
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		var now = new Date();
		/* initialize the login
		 * register is no, if we want to show the register form set to yes
		 * mounted is set to yes when the app mounts if you need to wait for that
		 * set response to yes to show a flash message
		 * error messages are in data
		 * */
		return {register: no,mounted: no,response:no,data:{}};
	},
	componentWillReceiveProps: function() {
		/* we want to kill the flash anytime the form is rendered
		 * you can add any other props you need here if you include
		 * this in another component 
		 * */
		this.setState({response:no});
		return false;
	},
	render: function() {
		var showflashmessage = false, haserror = false;
		var loginORregister = (this.state.register === yes) ? 'register' : 'login'
		/* if response state is yes we have a flash message to show
		 * the message is in data
		 * */
		if(this.state.response === yes) {
			
			var pickclass = (this.state.data.success === yes ) ? 'success' : 'warning'; 
			
			showflashmessage = React.createElement(GFlash, {showclass: pickclass, cleartimeouts: [GInterval.timeout], clearintervals: [GInterval.redirect]}, React.createElement("div", {dangerouslySetInnerHTML: {__html: this.state.data.message || ''}}));
			
			/* if we have an error shake the form.  this is done with the
			 * has-errors class
			 * */
			if(this.state.data.success === no) haserror = ' has-errors';
			
		}
		
		if(this.state.resetform) {
			var ret = React.createElement(ResetPassword, {changeReset: this.changeReset})
		} else if(this.state.register === no) {
			var ret = React.createElement(Login, {showregister: this.showregister, changeReset: this.changeReset})
		} else {
			var ret = React.createElement(Register, {showregister: this.showregister})
		}
		return ( React.createElement("div", {className: loginORregister + " centerme col-xs-12 shakeme " + haserror}, ret, " "));
	},
	componentDidMount: function() {
		// When the component is added let me know
		this.setState({mounted: yes})
		return false;
	},
	showregister: function () {
		/* toggle the register / login forms
		 * */
		this.setState({register: this.state.register===yes?no:yes,response:no})
		return false;
	},
	changeReset: function (e) {
		/* toggle the password reset
		 * */
		this.setState({resetform: this.state.resetform===yes?no:yes,response:no})
		return e.preventDefault();
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	}
});

module.exports = GLogin;

/* 
 * we use this for the countdown timer before we redirect a logged 
 * in user.  you can disable it 
 * by sending a redirect time of 0
 * */
var GInterval = {
	  intervals: [],
	  setInterval: function() {
		return this.intervals.push(setInterval.apply(null, arguments));
	  },
	  clearIntervals: function(who) {
		who = who - 1;
		if(GInterval.intervals.length === 1) {
			//console.log('clear all intervals',this.intervals)
			GInterval.intervals.map(clearInterval);
			GInterval.intervals = [];
		} else if(who && GInterval.intervals[who]) {
			//console.log('clear intervals',who,this.intervals[who])
			clearInterval(GInterval.intervals[who]);
		} else {
			//console.log('map intervals',this.intervals)
			GInterval.intervals.map(clearInterval);
			GInterval.intervals = [];
		}
	  }
};



/* man component
 * simple example
 * */
var GMan = React.createClass({displayName: "GMan",
	getDefaultProps: function() {
		return ({divstyle:{float:'right',}});
	},
	
	render: function() {
	    return (
		React.createElement("div", {style: this.props.divstyle, dangerouslySetInnerHTML: {__html: Text.logoman || ''}})
	    );
	}
});

module.exports = GMan;
