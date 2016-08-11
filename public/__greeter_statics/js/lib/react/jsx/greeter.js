var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Login = require('./forms/login');
var Reg = require('./forms/reg');
var ResetPassword = require('./forms/reset');
var ResetCode = require('./forms/code');
var GFlash = require('./flash');
var Common = require('./common.js');
var GInterval = Common.GInterval;
//var Text = JSON.parse(require('text'));

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

var GLogin = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		var now = new Date();
		/* initialize the login
		 * register is no, if we want to show the register form set to yes
		 * mounted is set to yes when the app mounts if you need to wait for that
		 * set response to yes to show a flash message
		 * error messages are in data
		 * */
		return {
			register: window.initialPage === 'register' ? yes : no,
			resetcode: window.initialPage === 'reset-code' ? yes : no,
			resetform: window.initialPage === 'reset-password' || window.initialPage === 'reset' ? yes : no,
			mounted: no, 
			response: no, 
			data:{}
		};
	},
	componentWillReceiveProps: function() {
		/* we want to kill the flash anytime the form is rendered
		 * you can add any other props you need here if you include
		 * this in another component 
		 * */
		this.setState({
			response:no
		});
		return false;
	},
	render: function() {
		var showflashmessage = false;
		var haserror = false;
		var loginORregister = (this.state.register === yes || window.initialPage === 'register' ) ? 'register' : 'login';
		/* if response state is yes we have a flash message to show
		 * the message is in data
		 * */
		if(this.state.response === yes) {
			
			var pickclass = (this.state.data.success === yes ) ? 'success' : 'warning'; 
			
			showflashmessage = <GFlash showclass={pickclass} cleartimeouts={[GInterval.timeout]} clearintervals={[GInterval.redirect]}><div dangerouslySetInnerHTML={{__html: this.state.data.message || ''}} /></GFlash >;
			
			/* if we have an error shake the form.  this is done with the
			 * has-errors class
			 * */
			if(this.state.data.success === no) haserror = ' has-errors';
			
		}
		if(this.state.resetcode === yes) {
			var ret = <ResetCode  context={this} changeReset={this.changeCode} flash={showflashmessage} />
		} else if(this.state.resetform === yes) {
			var ret = <ResetPassword  context={this} changeReset={this.changeReset} flash={showflashmessage} />
		} else if(this.state.register === no) {
			var ret = <Login  context={this} showregister={this.showregister} changeReset={this.changeReset} flash={showflashmessage} />
		} else {
			var ret = <Reg showregister={this.showregister} flash={showflashmessage} context={this} />
		}
		return ( <div  className={loginORregister + " centerme col-xs-12 shakeme " + haserror}>{ret} </div>);
	},
	componentDidMount: function() {
		// When the component is added let me know
		this.setState({
			mounted: yes
		});
		return false;
	},
	showregister: function (e) {
		/* toggle the register / login forms
		 * */
		this.setState({
			register: this.state.register === yes ? no : yes,
			response: no,
			resetform: no,
			resetcode: no,
		});
		return e.preventDefault();
	},
	changeReset: function (e) {
		/* toggle the password reset
		 * */
		this.setState({
			resetform: this.state.resetform === yes ? no : yes,
			register: no,
			resetcode: no,
			response: no
		});
		return e.preventDefault();
	},
	changeCode: function (e) {
		/* toggle the password reset
		 * */
		this.setState({ 
			resetcode: this.state.resetcode === yes ?no : yes,
			response:no,
			register: no,
			resetform: no,
		});
		return e.preventDefault();
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	}
});

module.exports = GLogin;
