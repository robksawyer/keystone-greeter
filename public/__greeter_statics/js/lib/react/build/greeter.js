/**
 * @jsx React.DOM
 */

/* not used but thats how you can use touch events
 * */
//React.initializeTouchEvents(true);

/* not used but thats how you can use animation and other transition goodies
 * */
//var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

/**
 * we will use yes for true
 * we will use no for false
 * 
 * React has some built ins that rely on state being true/false like classSet()
 * and these will not work with yes/no but can easily be modified / reproduced
 * 
 * this single app uses the yes/no var so if you want you can switch back to true/false
 * 
 * */
var yes = 'yes', no = 'no';
//var yes = true, no = false;


/* you could create a mixin for the interval 
 * 
 * we use this for the countdown timer before we redirect a logged 
 * in user.  it is for show only and you can disable it 
 * by sending a redirect time of 0
 * */
var SnowpiInterval = {
	  intervals: [],
	  setInterval: function() {
		return this.intervals.push(setInterval.apply(null, arguments));
	  },
	  clearIntervals: function(who) {
		who = who - 1;
		if(SnowpiInterval.intervals.length === 1) {
			//console.log('clear all intervals',this.intervals)
			SnowpiInterval.intervals.map(clearInterval);
			SnowpiInterval.intervals = [];
		} else if(who && SnowpiInterval.intervals[who]) {
			//console.log('clear intervals',who,this.intervals[who])
			clearInterval(SnowpiInterval.intervals[who]);
		} else {
			//console.log('map intervals',this.intervals)
			SnowpiInterval.intervals.map(clearInterval);
			SnowpiInterval.intervals = [];
		}
	  }
};

/* create flash message 
 * */
var Flash = ReactBootstrap.Alert;

var SnowpiFlash = React.createClass({displayName: "SnowpiFlash",
	getInitialState: function() {
		return {
			isVisible: true
		};
	},
	getDefaultProps: function() {
		return ({showclass:'info'});
	},
	render: function() {
		if(!this.state.isVisible)
		    return null;

		var message = this.props.children;
		return (
		    React.createElement(Flash, {bsStyle: this.props.showclass, onDismiss: this.dismissFlash}, 
			React.createElement("p", null, message)
		    )
		);
	},
	/* make sure the user can cancel any redirects by clearing the flash message
	 * */
	dismissFlash: function() {
		this.setState({isVisible: false});
		if(this.props.clearintervals instanceof Array)this.props.clearintervals.map(SnowpiInterval.clearIntervals);
		if(this.props.cleartimeouts instanceof Array)this.props.cleartimeouts.map(clearTimeout);
	}
});

/* man component
 * simple example
 * */
var SnowpiMan = React.createClass({displayName: "SnowpiMan",
	getDefaultProps: function() {
		return ({divstyle:{float:'right',}});
	},
	
	render: function() {
	    return (
		React.createElement("div", {style: this.props.divstyle, dangerouslySetInnerHTML: {__html: Text.logoman || ''}})
	    );
	}
});

/* login
 * simple example
 * */
var SnowpiFormLogin = React.createClass({displayName: "SnowpiFormLogin",

	
	render: function() {
	    return (
		React.createElement("div", {style: this.props.divstyle, dangerouslySetInnerHTML: {__html: Text.logoman || ''}})
	    );
	}
});

/* this is our main component
 * since this is a single function app we will call this directly
 * 
 * to include this in your React setup modify componentWillReceiveProps to recieve any default values 
 * 
 * */

var BootstrapButton = ReactBootstrap.Button;

var SnowpiLogin = React.createClass({displayName: "SnowpiLogin",
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		var now = new Date();
		/* initialize the login
		 * register is no, if we want to show the register form set to yes
		 * mounted is set to yes when the app mounts if you need to wait for that
		 * set response to yes to show a flash message
		 * error messages are in data
		 * username, password, and confirm are empty.  the LinkedStateMixin will update
		 *   the form when any of the inputs change.  this creates the dynamic validation.
		 * */
		return {register: no,mounted: no,response:no,data:{},username:'',password:'',confirm:''};
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
			
			showflashmessage = React.createElement(SnowpiFlash, {showclass: pickclass, cleartimeouts: [SnowpiInterval.timeout], clearintervals: [SnowpiInterval.redirect]}, React.createElement("div", {dangerouslySetInnerHTML: {__html: this.state.data.message || ''}}));
			
			/* if we have an error shake the form.  this is done with the
			 * has-errors class
			 * */
			if(this.state.data.success === no) haserror = ' has-errors';
			
		}
		/* some redundency here but its easier to modify per form
		 * 
		 * we have the login and register forms as variables.
		 * 
		 * the text is from config.js
		 * 
		 * the validation inputs are controlled with valueLink={this.linkState('password')} 
		 * 
		 * React checks our state whenever a validation input changes so we can use simple if assignments to change error classes
		 * 
		 *  the submit buttons will be disabled until the state of our validation inputs matches the if statement
		 * 
		 * */
		var login =(React.createElement("form", {ref: "signin", className: "signin-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.login, " ", React.createElement(SnowpiMan, null)), 
				showflashmessage, 
					
					React.createElement("div", {className: this.state.username === '' ? 'input-group has-error':'input-group'}, 
						
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.username), 
						React.createElement("input", {type: "text", ref: "username", className: "form-control", valueLink: this.linkState('username'), id: "Snowpi-username"})
				
					), 
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: this.state.password === '' ? 'input-group has-error':'input-group'}, 
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.password), 
						React.createElement("input", {type: "password", ref: "password", className: "form-control", valueLink: this.linkState('password'), id: "Snowpi-givepass"})
						
					), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 "}, React.createElement(BootstrapButton, {role: "button", onClick: this.login, bsStyle: "info", disabled: (this.state.username === '' || this.state.password === '' ) ? true : false}, "  ", Text.home.btns.login, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {onClick: this.showregister, bsStyle: "warning"}, "  ", Text.home.btns.register, " ")), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-offset-6 col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {role: "button", onClick: this.changeReset, bsStyle: "default"}, "  ", Text.home.btns.reset, " ")), 
					
					React.createElement("div", {className: "clearfix"})
			));
		
		var reset =(React.createElement("form", {ref: "signin", className: "signin-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.reset, " ", React.createElement(SnowpiMan, null)), 
				showflashmessage, 
					
					React.createElement("div", {className: this.state.username === '' ? 'input-group has-error':'input-group'}, 
						
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.resetemail), 
						React.createElement("input", {type: "text", ref: "resetemail", className: "form-control", valueLink: this.linkState('resetemail'), id: "Snowpi-resetemail"})
				
					), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 "}, React.createElement(BootstrapButton, {role: "button", onClick: this.resetemail, ref: "resetbutton", bsStyle: "info", disabled: (this.state.email === '' ) ? true : false, "data-loading-text": "Checking..."}, "  ", Text.home.btns.resetpass, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {onClick: this.changeReset, bsStyle: "default"}, "  ", Text.home.btns.logincurrent, " ")), 
					React.createElement("div", {className: "clearfix"})
			));
		
		var securityQuestions = Text.registerSecurityQuestions.map(function(val) {
			var options = val.questions.map(function(op, key) {
				return (
					React.createElement("option", {key: key, value: op}, op)
				);
			});
			return (
				React.createElement("div", {className: "input-group", key: val.name}, 
					React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: val.label || ''}}), 
					React.createElement("select", {ref: val.field + '_select', className: "form-control"}, 
						options
					), 
					React.createElement("input", {type: "text", ref: val.field, placeholder: val.placeholder || Text.home.securityPlaceholder, className: "form-control", valueLink: this.linkState(val.field)})
				)
			);
		}.bind(this));
		if(securityQuestions.length === 0) {
			var questions = '';
		} else {
			var questions = (
				React.createElement("div", null, 
				React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
				React.createElement("div", {className: "form-group"}, 
					   
					React.createElement("div", {className: "col-sm-12"}, 
						React.createElement("p", {className: "form-control-static"}, Text.home.securityHeader)
					)
				), 
				React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
				securityQuestions
				)
			);
		}
		var register =(React.createElement("form", {ref: "signin", className: "signin-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.register, " ", React.createElement(SnowpiMan, null)), 
				showflashmessage, 
					
					React.createElement("div", {className: this.state.username === '' ? "input-group has-error":"input-group"}, 
						
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.username), 
						React.createElement("input", {type: "text", ref: "username", className: "form-control", valueLink: this.linkState('username'), id: "Snowpi-username"})
				
					), 
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: (this.state.confirm === '' || this.state.password === '' || this.state.confirm !== this.state.password ) ? 'input-group has-error':'input-group'}, 
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.password), 
						React.createElement("input", {type: "password", ref: "password", className: "form-control", valueLink: this.linkState('password'), id: "Snowpi-givepass"})
						
					), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: (this.state.confirm === '' || this.state.password === '' || this.state.confirm !== this.state.password ) ? 'input-group has-error':'input-group'}, 
						React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: Text.home.confirm || ''}}), 
						React.createElement("input", {type: "password", ref: "confirm", className: "form-control", valueLink: this.linkState('confirm'), id: "Snowpi-confirm"})
						
					), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: "form-group"}, 
					   
					    React.createElement("div", {className: "col-sm-12"}, 
					      React.createElement("p", {className: "form-control-static"}, Text.home.emailnotice)
					    )
					 ), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: "input-group "}, 
						
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.name), 
						React.createElement("input", {type: "text", ref: "name", className: "form-control", defaultValue: "", id: "Snowpi-name"})
				
					), 
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: "input-group"}, 
						React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: Text.home.email || ''}}), 
						React.createElement("input", {type: "email", ref: "email", className: "form-control", defaultValue: "", id: "Snowpi-email"})
						
					), 
					
					questions, 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'left'}}, React.createElement(BootstrapButton, {onClick: this.register, ref: "registerbutton", "data-loading-text": "Registering...", role: "button", bsStyle: "warning", className: "btn  btn-warning", disabled: (this.state.username === '' || this.state.password === '' || this.state.confirm === '' || this.state.confirm !== this.state.password) ? true : false}, "  ", Text.home.btns.register, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {role: "button", onClick: this.showregister, className: "btn btn-default"}, "  ", Text.home.btns.logincurrent, " ")), 
					React.createElement("div", {className: "clearfix"})
			));
		
		return ( React.createElement("div", {className: loginORregister + " centerme col-xs-12 shakeme " + haserror}, this.state.resetform===yes ? reset : this.state.register===no ? login : register, " "));
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
	},
	resetemail: function() {
		/* validation occurs as input is received 
		 * this method should only be avialable if
		 * all validation is already met so just run
		 * */
		var mydata = {reset:'yes'};
		this.setState({response:no});
		mydata.email = this.refs.resetemail.getDOMNode().value.trim()
		mydata[isKey] = isMe;
		var btn = $(this.refs.resetbutton.getDOMNode())
		btn.button('loading')
		$.ajax({
			url: '/greeter-reset-password',
			dataType: 'json',
			method: 'post',
			data: mydata,
			success: function(data) {
							
				function message() {
					data.message = 'Success';
				}
				/* flash messages are shown with response : yes
				 * */	
				this.setState({response:yes,data:data,resetform:no});
				
			}.bind(this),
			
			error: function(xhr, status, err) {
				console.log(this.props.url, status, err.toString());
				this.setState({response:yes,resetform:no,data: {status:status,err:err.toString()} });
			}.bind(this)
		
		/* always reset our buttons
		* */	
		}).always(function () {
			
			btn.button('reset');
		});
		
	},
	register: function() {
		/* validation occurs as input is received 
		 * this method should only be avialable if
		 * all validation is already met so just run
		 * */
		var mydata = {register:'yes'};
		this.setState({response:no});
		mydata.username = this.refs.username.getDOMNode().value.trim()
		mydata.password = this.refs.password.getDOMNode().value.trim()
		mydata.confirm = this.refs.confirm.getDOMNode().value.trim()
		mydata.email = this.refs.email.getDOMNode().value.trim()
		mydata.name = this.refs.name.getDOMNode().value.trim()
		mydata[isKey] = isMe;
		Text.registerSecurityQuestions.forEach(function(val) {
			mydata[val.field] = this.refs[val.field].getDOMNode().value.trim();
			mydata[val.field + '_select'] = this.refs[val.field + '_select'].getDOMNode().value.trim()
		}.bind(this));
		var btn = $(this.refs.registerbutton.getDOMNode())
		btn.button('loading')
		$.ajax({
			url: '/greeter-keystone-relay',
			dataType: 'json',
			method: 'post',
			data: mydata,
			success: function(data) {
							
				function message() {
					var secs = (data.redirect.when - rrr) / 1000;
					rrr+=1000;
					data.message = data.repeater + '<br />You will be redirected to <a href="' + data.redirect.path + '">' + data.redirect.path.substr(1) + '</a>  ';
					data.message+= secs === 0 ? ' now':' in ' + secs + ' seconds.';
				}
				/* if we get a redirect check the time and run an interval
				 * this is really just to show React work
				 * */	
				if(typeof data.redirect === 'object' && data.redirect.when>1000) {
					
					data.repeater = data.message; //keep our original message for the repeater
					
					var rrr = 1000
						_self = this;
					
					SnowpiInterval.redirect = SnowpiInterval.setInterval(function() {
						/* this is really simple
						 * just recaculate the message and let react do the rest
						 * */
						message();
						_self.setState({response:yes,data:data});
					},1000);
					
					/* kill the interval and redirect on the timeout 
					 * */
					SnowpiInterval.timeout = setTimeout(function(){
						SnowpiInterval.clearIntervals(SnowpiInterval.redirect);
						window.location.href = data.redirect.path;
					},data.redirect.when);
					
					message()
				
				} else if(typeof data.redirect === 'object' && data.redirect.path){
					
					window.location.href = data.redirect.path;
				
				}
				
				/* flash messages are shown with response : yes
				 * */	
				this.setState({response:yes,data:data});
				
			}.bind(this),
			
			error: function(xhr, status, err) {
				console.log(this.props.url, status, err.toString());
				this.setState({response:yes,data: {status:status,err:err.toString()} });
			}.bind(this)
		
		/*  always reset our buttons
		* */	
		}).always(function () {
			
			btn.button('reset');
		});
		
	},
	login: function() {
		/* same as register but less info sent
		 * you could combine them both if you like less code
		 * */
		var mydata = {login:'yes'};
		this.setState({response:no});
		mydata.username = this.refs.username.getDOMNode().value.trim()
		mydata.password = this.refs.password.getDOMNode().value.trim()
		mydata[isKey] = isMe;
		
		$.ajax({
			url: '/greeter-keystone-relay',
			dataType: 'json',
			method: 'post',
			data: mydata,
			success: function(data) {
				function message() {
					var secs = (data.redirect.when - rrr) / 1000;
					rrr+=1000;
					data.message = data.repeater + '<br />You will be redirected to <a href="' + data.redirect.path + '">' + data.redirect.path.substr(1) + '</a>  ';
					data.message+= secs === 0 ? ' now':' in ' + secs + ' seconds.';
				}
				if(typeof data.redirect === 'object' && data.redirect.when>1000) {
					data.repeater = data.message;
					var rrr = 1000
						_self = this;
					SnowpiInterval.redirect = SnowpiInterval.setInterval(function() {
						message();
						_self.setState({response:yes,data:data});
					},1000);
					console.log(SnowpiInterval.intervals)
					SnowpiInterval.timeout = setTimeout(function(){
						SnowpiInterval.clearIntervals(SnowpiInterval.redirect);
						window.location.href = data.redirect.path;
					},data.redirect.when);
					message()
				}
				else if(typeof data.redirect === 'object' && data.redirect.path){
					window.location.href = data.redirect.path;
				}
				
				this.setState({response:yes,data:data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.log(err, status, err.toString());
				this.setState({response:yes,data: {status:status,err:err.toString()} });
			}.bind(this)
		});		
	}
});

$(function() {
	//console.log('react',React);
	/* start our app after the page is ready */ 	
	React.render(React.createElement(SnowpiLogin, null), document.getElementById('snowpi'));

});
