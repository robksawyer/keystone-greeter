(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var React = window.React;
var Text = JSON.parse(window.Text);
var _ = window._;

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

module.exports.GMan = GMan;

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

module.exports.GInterval = GInterval;

module.exports.showButton = function(inputs) {
	var valid = _.includes(inputs, false);
	//console.log('button', inputs, valid);
	return valid;
}

module.exports.setFormState = function(inputs, valid) {
	var ret = {};
	ret.valid = _.isObject(valid) ? valid : {};
	ret.form = {};
	_.each(inputs, function(v) {
		if(v.type !== 'header') ret.form[v.field] = v._name;
		if(v.required) {
			ret.valid[v.field] = false;
		}
		if(v.attach) {
			ret.form[v.attach.field] = v._name + '_attach';
			if(v.required) {
				ret.valid[v.attach.field] = false;
			}
		}
	});
	return ret;
}

module.exports.Form = React.createClass({displayName: "Form",
	render: function() {
		var _this = this;
		var form = [];
		// sort out object of form elements and add them to an array
		var sorted_list = _(this.props.inputs).keys().sort().map(function (key) {
			var value = _this.props.inputs[key];
			form.push(input(key,value,_this.props.context));
		}).value();
		
		return form.length === 0 ? (React.createElement("span", null)) : (React.createElement("div", null, form));
	}
});

module.exports.FormInputOnChange = function(event, form) {
    // get the current value
    var change = {
		valid: _.clone(this.state.valid),
		//form: _.clone(this.state.form)
	};
	
	var valid = false;
	var parent = false;
	
	// is this attached
	if(event.target.dataset.dependson !== 'false') {
		parent =  form[event.target.dataset.dependson];
		var input = parent.attach;
		input.required = parent.required;
		parent.DOM = document.getElementById(parent._name);
		//console.log(event.target.dataset.dependson);
	} else {
		var input = form[event.target.id];
	}
	
	//console.log('onChange',  event.target.id, input, form , event.target.dataset);
	// set the state value
	//change.form[input.field] = event.target.value;
	
	// if required run tests
	if(input.required) {	
		if(_.isArray(input.regex)) {
			var rx = new RegExp(input.regex[0],input.regex[1]);
			valid = rx.test(event.target.value);
		} else {
			valid = event.target.value !== '';
		}
		if(valid && parent && parent.type === 'password') {
			if(event.target.value === '' || event.target.value !== parent.DOM.value) {
				valid = false;
			} else {
				valid = true;
			}
		}
		if(valid && parent && parent.type === 'select') {
			if(event.target.value === '' || parent.DOM.value === '') {
				valid = false;
			} else {
				valid = true;
			}
		}
		if(valid) {
			change.valid[input.field] = true;
		} else {
			change.valid[input.field] = false;
		}
	}
	
	//console.log('change', valid, change);
    this.setState(change);
}


function validate_class(input, context) {
	var valid = context.state.valid;
	if(!input.required) {
		return 'input-group';
	} else {
		if(valid[input.field]) {
			return 'input-group';
		} else {
			return 'input-group has-error';
		}
	}
}

function input(name, options, context) {
	
	if(!_.isObject(options)) {
		return false;
	}
	
	var type = options.type;
	var dependsOn = options.dependsOn ? options.dependsOn : false;
	
	if(type === 'text') {
		var clas = validate_class(options, context);
		var div = (
			React.createElement("div", {key: name}, 
			React.createElement("div", {className: clas}, 		
				React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: options.label || ''}}), 
				React.createElement("input", {type: "text", id: options._name, refs: options._name, className: "form-control", "data-dependson": dependsOn, onChange: context.onChange})
			), 
			React.createElement("div", {className: "clearfix"}, React.createElement("br", null))
			)
		);
		
		return div;
		
	} else if(type === 'password') {
		/* confirm password if requested */
		var cfm;
		if(_.isObject(options.attach) && options.attach.label && options.attach.field) {
			options.attach.required = options.required;
			var class2 = validate_class(options.attach, context);
			var dependsOn = options.attach.dependsOn ? options.attach.dependsOn : false;
			var cfm = (
				React.createElement("div", {key: name}, 
				React.createElement("div", {className: class2}, 		
					React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: options.attach.label || ''}}), 
					React.createElement("input", {type: "password", id: options._name + '_attach', className: "form-control", "data-dependson": dependsOn, "data-parent": options._name, onChange: context.onChange})
				), 
				React.createElement("div", {className: "clearfix"}, React.createElement("br", null))
				)
			);
		}
		// add password field
		var clas = validate_class(options, context);
		var dependsOn = options.dependsOn ? options.dependsOn : false;
		var div = (
			React.createElement("div", {key: name}, 
			React.createElement("div", {className: clas}, 
				React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: options.label || ''}}), 
				React.createElement("input", {type: "password", id: options._name, className: "form-control", "data-dependson": dependsOn, onChange: context.onChange})
				
			), 
			React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
			cfm
			)
		);
		
		return (div);
		
	} else if(type === 'select') {
		
		var other, opts;
		// check any validation
		var clas = validate_class(options, context);
		
		// show a text box in the same div for alternate values or question/answer format 
		if(_.isObject(options.attach)) {
			options.attach.required = options.required;
			clas = validate_class(options.attach, context);
			var dependsOn2 = options.attach.dependsOn ? options.attach.dependsOn : false;
			other = (React.createElement("input", {type: "text", id: options._name + '_attach', placeholder: options.attach.placeholder, className: "form-control", "data-parent": options._name, "data-dependson": dependsOn2, onChange: context.onChange}));
		}
		// build the options list
		if(_.isArray(options.options)) {
			opts = options.options.map(function(op) {
				if(_.isString(op)) {
					op = {
						label:op,
						value:op
					}
				}
				return (
					React.createElement("option", {key: op.label, value: op.value || op.label}, op.label)
				);
			});
		}
		var dependsOn = options.dependsOn ? options.dependsOn : false;
		var div = (
			React.createElement("div", {key: name}, 
				React.createElement("div", {className: clas}, 
					React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: options.label || ''}}), 
					React.createElement("select", {id: options._name, className: "form-control", "data-dependson": dependsOn, onChange: context.onChange}, 
						opts
					), 
					other
				)
			)
		);
		
		return div;
		
	} else if(type === 'header') {
		return (
			React.createElement("div", {key: name}, 
				React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
				React.createElement("div", {className: "form-group"}, 
					React.createElement("div", {className: "col-sm-12"}, 
						React.createElement("p", {className: "form-control-static", dangerouslySetInnerHTML: {__html: options.label || ''}})
					)
				), 
				React.createElement("div", {className: "clearfix"}, React.createElement("br", null))
			)
		);		
	}
	
}


},{}],2:[function(require,module,exports){
var React = window.React;
var App = require('./greeter.js');
var $ = window.$;

$(function() {
	//console.log('react',React);
	/* start our app after the page is ready */ 	
	React.render(React.createElement(App, null), document.getElementById('snowpi'));

});


},{"./greeter.js":7}],3:[function(require,module,exports){
var React = window.React;
var ReactBootstrap = window.ReactBootstrap;

/* create flash message 
 * */
var Flash = ReactBootstrap.Alert;

var GFlash = React.createClass({displayName: "GFlash",
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
		if(this.props.clearintervals instanceof Array)this.props.clearintervals.map(GInterval.clearIntervals);
		if(this.props.cleartimeouts instanceof Array)this.props.cleartimeouts.map(clearTimeout);
	}
});

module.exports = GFlash;


},{}],4:[function(require,module,exports){
var React = window.React;
var Text = JSON.parse(window.Text);
var Common = require('../common.js');
var GInterval = Common.GInterval;
var _ = window._;
var ReactBootstrap = window.ReactBootstrap;
var BootstrapButton = ReactBootstrap.Button;
var yes = 'yes', no = 'no';
//var yes = true, no = false;

var Login = React.createClass({displayName: "Login",
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return this.setFormState();
	},
	componentWillReceiveProps: function() {
		this.setState(this.setFormState(this.state.valid));
	},
	setFormState: function(valid) {
		var ret = Common.setFormState(Text.login, valid);
		ret.name = 'login';
		return ret; 
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	},
	onChange: function(e) {
		Common.FormInputOnChange.call(this, e, Text.login);
	},
	render: function() {
						
			return (React.createElement("form", {ref: "signin", className: "signin-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.login, " ", React.createElement(Common.GMan, null)), 
				this.props.flash, 
					
					React.createElement(Common.Form, {inputs: Text.login, context: this}), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 "}, React.createElement(BootstrapButton, {role: "button", onClick: this.login, bsStyle: "info", disabled: Common.showButton(this.state.valid)}, "  ", Text.btns.login, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {onClick: this.props.showregister, bsStyle: "warning"}, "  ", Text.btns.register, " ")), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-offset-6 col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {role: "button", onClick: this.props.changeReset, bsStyle: "default"}, "  ", Text.btns.reset, " ")), 
					
					React.createElement("div", {className: "clearfix"})
			));
			
	},
	login: function() {
		/* same as register but less info sent
		 * you could combine them both if you like less code
		 * */
		var mydata = {login:'yes'};
		//console.log('form', this.state.form, Text.login );
		_.each(this.state.form, function(v,k) {
			if(v.type !== 'header') {
				var el = document.getElementById(v);
				mydata[k] = el.value;
			}
		},this); 
		mydata[isKey] = isMe;
		//console.log('mydata', mydata, 'Text', Text.login );
		$.ajax({
			url: Text.relay,
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
						_self = this.props.context;
					GInterval.redirect = GInterval.setInterval(function() {
						message();
						_self.setState({response:yes,data:data});
					},1000);
					console.log(GInterval.intervals)
					GInterval.timeout = setTimeout(function(){
						GInterval.clearIntervals(GInterval.redirect);
						window.location.href = data.redirect.path;
					},data.redirect.when);
					message()
				}
				else if(typeof data.redirect === 'object' && data.redirect.path){
					window.location.href = data.redirect.path;
				}
				
				this.props.context.setState({response:yes,data:data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.log(err, status, err.toString());
				this.props.context.setState({response:yes,data: {status:status,err:err.toString()} });
			}.bind(this)
		});		
	}
}); 

module.exports = Login;


},{"../common.js":1}],5:[function(require,module,exports){
var React = window.React;
var Text = JSON.parse(window.Text);
var Common = require('../common.js');
var GInterval = Common.GInterval;
var _ = window._;
var ReactBootstrap = window.ReactBootstrap;
var BootstrapButton = ReactBootstrap.Button;
var yes = 'yes', no = 'no';
//var yes = true, no = false;

var RR = React.createClass({displayName: "RR",
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return this.setFormState();
	},
	componentWillReceiveProps: function() {
		this.setState(this.setFormState(this.state.valid));
	},
	setFormState: function(valid) {
		var ret = Common.setFormState(Text.register, valid);
		ret.name = 'register';
		return ret;
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	},
	onChange: function(e) {
		Common.FormInputOnChange.call(this, e, Text.register);
	},
	render: function() {
			return (React.createElement("form", {ref: "signin", className: "signin-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.register, " ", React.createElement(Common.GMan, null)), 
				this.props.flash, 
					
					React.createElement(Common.Form, {inputs: Text.register, context: this}), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'left'}}, React.createElement(BootstrapButton, {onClick: this.register, ref: "registerbutton", "data-loading-text": "Registering...", role: "button", bsStyle: "warning", className: "btn  btn-warning", disabled: Common.showButton(this.state.valid)}, "  ", Text.btns.register, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {role: "button", onClick: this.props.showregister, className: "btn btn-default"}, "  ", Text.btns.logincurrent, " ")), 
					React.createElement("div", {className: "clearfix"})
			));
	},
	register: function() {
		/* validation occurs as input is received 
		 * this method should only be avialable if
		 * all validation is already met so just run
		 * */
		console.log('form', this.state.form, 'Text', Text.register ); 
		var mydata = {register:'yes'};
		_.each(this.state.form, function(v,k) {
			if(v.type !== 'header') {
				var el = document.getElementById(v);
				mydata[k] = el.value;
			}
		},this); 
		mydata[isKey] = isMe;
		console.log('mydata', mydata, 'Text', Text.register );
		var btn = $(this.refs.registerbutton.getDOMNode())
		btn.button('loading')
		$.ajax({
			url: Text.relay,
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
						_self = this.props.context;
					
					SnowpiInterval.redirect = SnowpiInterval.setInterval(function() {
						/* this is really simple
						 * just recaculate the message and let react do the rest
						 * */
						message();
						_self.setState({response:yes,data:data});
					},1000);
					
					/* kill the interval and redirect on the timeout 
					 * */
					GInterval.timeout = setTimeout(function(){
						GInterval.clearIntervals(GInterval.redirect);
						window.location.href = data.redirect.path;
					},data.redirect.when);
					
					message()
				
				} else if(typeof data.redirect === 'object' && data.redirect.path){
					
					window.location.href = data.redirect.path;
				
				}
				
				/* flash messages are shown with response : yes
				 * */	
				this.props.context.setState({response:yes,data:data});
				
			}.bind(this),
			
			error: function(xhr, status, err) {
				console.log(this.props.url, status, err.toString());
				this.props.context.setState({response:yes,data: {status:status,err:err.toString()} });
			}.bind(this)
		
		/* neat little trick to always reset our buttons
		* */	
		}).always(function () {
			
			btn.button('reset');
		});
		
	},
}); 

module.exports = RR;


},{"../common.js":1}],6:[function(require,module,exports){
var React = window.React;
var Text = JSON.parse(window.Text);
var Common = require('../common.js');
var ReactBootstrap = window.ReactBootstrap;
var BootstrapButton = ReactBootstrap.Button;
var yes = 'yes', no = 'no';
//var yes = true, no = false;

var ResetPassword = React.createClass({displayName: "ResetPassword",
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return this.setFormState();
	},
	componentWillReceiveProps: function() {
		this.setState(this.setFormState(this.state.valid));
	},
	setFormState: function(valid) {
		var ret = Common.setFormState(Text.reset, valid);
		ret.name = 'reset';
		return ret;
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	},
	onChange: function(e) {
		Common.FormInputOnChange.call(this, e, Text.reset);
	},
	render: function() {
			return (React.createElement("form", {ref: "signin", className: "signin-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.reset, " ", React.createElement(Common.GMan, null)), 
				this.props.flash, 
					
					React.createElement(Common.Form, {inputs: Text.reset, context: this}), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 "}, React.createElement(BootstrapButton, {role: "button", onClick: this.resetemail, ref: "resetbutton", bsStyle: "info", disabled: Common.showButton(this.state.valid), "data-loading-text": "Checking..."}, "  ", Text.btns.resetpass, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {onClick: this.props.changeReset, bsStyle: "default"}, "  ", Text.btns.logincurrent, " ")), 
					React.createElement("div", {className: "clearfix"})
			));
			
	},
	resetemail: function() {
		/* validation occurs as input is received 
		 * this method should only be avialable if
		 * all validation is already met so just run
		 * */
		var mydata = {reset:'yes'};
		_.each(this.state.form, function(v,k) {
			if(v.type !== 'header') {
				var el = document.getElementById(v);
				mydata[k] = el.value;
			}
			if(v.attach) {
				var elA = document.getElementById(v + '_attach');
				mydata[v.attach.field] = elA.value;	
			}
		},this);
		mydata[isKey] = isMe;
		var btn = $(this.refs.resetbutton.getDOMNode())
		btn.button('loading')
		$.ajax({
			url: Text.resetemail,
			dataType: 'json',
			method: 'post',
			data: mydata,
			success: function(data) {	
				function message() {
					data.message = 'Success';
				}
				/* flash messages are shown with response : yes
				 * */	
				this.props.context.setState({response:yes,data:data,resetform:no});
				
			}.bind(this),
			
			error: function(xhr, status, err) {
				console.log(this.props.url, status, err.toString());
				this.props.context.setState({response:yes,resetform:no,data: {status:status,err:err.toString()} });
			}.bind(this)
		
		/* always reset our buttons
		* */	
		}).always(function () {
			
			btn.button('reset');
		});
		
	}
});

module.exports = ResetPassword;


},{"../common.js":1}],7:[function(require,module,exports){
var React = window.React;
var ReactBootstrap = window.ReactBootstrap;
var Login = require('./forms/login');
var Reg = require('./forms/reg');
var ResetPassword = require('./forms/reset');
var GFlash = require('./flash');
var Common = require('./common.js');
var GInterval = Common.GInterval;
var Text = JSON.parse(window.Text);

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
		var showflashmessage = false;
		var haserror = false;
		var loginORregister = (this.state.register === yes) ? 'register' : 'login';
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
		
		if(this.state.resetform === yes) {
			var ret = React.createElement(ResetPassword, {context: this, changeReset: this.changeReset, flash: showflashmessage})
		} else if(this.state.register === no) {
			var ret = React.createElement(Login, {context: this, showregister: this.showregister, changeReset: this.changeReset, flash: showflashmessage})
		} else {
			var ret = React.createElement(Reg, {showregister: this.showregister, flash: showflashmessage, context: this})
		}
		return ( React.createElement("div", {className: loginORregister + " centerme col-xs-12 shakeme " + haserror}, ret, " "));
	},
	componentDidMount: function() {
		// When the component is added let me know
		this.setState({mounted: yes})
		return false;
	},
	showregister: function (e) {
		/* toggle the register / login forms
		 * */
		this.setState({register: this.state.register===yes?no:yes,response:no})
		return e.preventDefault();
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


},{"./common.js":1,"./flash":3,"./forms/login":4,"./forms/reg":5,"./forms/reset":6}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvY29tbW9uLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZmFrZV9mMjNkOTJhOS5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL3Nub3dwaS9qcy9saWIvcmVhY3QvanN4L2ZsYXNoLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvbG9naW4uanMiLCIvaG9tZS9zbm93L3Byb2plY3RzL2dpdGh1Yi9rZXlzdG9uZS1ncmVldGVyL3B1YmxpYy9zbm93cGkvanMvbGliL3JlYWN0L2pzeC9mb3Jtcy9yZWcuanMiLCIvaG9tZS9zbm93L3Byb2plY3RzL2dpdGh1Yi9rZXlzdG9uZS1ncmVldGVyL3B1YmxpYy9zbm93cGkvanMvbGliL3JlYWN0L2pzeC9mb3Jtcy9yZXNldC5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL3Nub3dwaS9qcy9saWIvcmVhY3QvanN4L2dyZWV0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0IsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUss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QUM3QixPQUFPLEtBQUssQ0FBQztFQUNiO0FBQ0YsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDNUI7O0VBRUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDdkUsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDMUI7QUFDRixDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRTtBQUMzQjs7RUFFRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUN6RSxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMxQjtDQUNELFlBQVksRUFBRSxTQUFTLENBQUMsRUFBRTtFQUN6QixPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMxQjtBQUNGLENBQUMsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbi8qIG1hbiBjb21wb25lbnRcbiAqIHNpbXBsZSBleGFtcGxlXG4gKiAqL1xudmFyIEdNYW4gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICh7ZGl2c3R5bGU6e2Zsb2F0OidyaWdodCcsfX0pO1xuXHR9LFxuXHRcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0ICAgIHJldHVybiAoXG5cdFx0PGRpdiBzdHlsZT17dGhpcy5wcm9wcy5kaXZzdHlsZX0gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IFRleHQubG9nb21hbiB8fCAnJ319IC8+XG5cdCAgICApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMuR01hbiA9IEdNYW47XG5cbi8qIFxuICogd2UgdXNlIHRoaXMgZm9yIHRoZSBjb3VudGRvd24gdGltZXIgYmVmb3JlIHdlIHJlZGlyZWN0IGEgbG9nZ2VkIFxuICogaW4gdXNlci4gIHlvdSBjYW4gZGlzYWJsZSBpdCBcbiAqIGJ5IHNlbmRpbmcgYSByZWRpcmVjdCB0aW1lIG9mIDBcbiAqICovXG52YXIgR0ludGVydmFsID0ge1xuXHQgIGludGVydmFsczogW10sXG5cdCAgc2V0SW50ZXJ2YWw6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmludGVydmFscy5wdXNoKHNldEludGVydmFsLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuXHQgIH0sXG5cdCAgY2xlYXJJbnRlcnZhbHM6IGZ1bmN0aW9uKHdobykge1xuXHRcdHdobyA9IHdobyAtIDE7XG5cdFx0aWYoR0ludGVydmFsLmludGVydmFscy5sZW5ndGggPT09IDEpIHtcblx0XHRcdC8vY29uc29sZS5sb2coJ2NsZWFyIGFsbCBpbnRlcnZhbHMnLHRoaXMuaW50ZXJ2YWxzKVxuXHRcdFx0R0ludGVydmFsLmludGVydmFscy5tYXAoY2xlYXJJbnRlcnZhbCk7XG5cdFx0XHRHSW50ZXJ2YWwuaW50ZXJ2YWxzID0gW107XG5cdFx0fSBlbHNlIGlmKHdobyAmJiBHSW50ZXJ2YWwuaW50ZXJ2YWxzW3dob10pIHtcblx0XHRcdC8vY29uc29sZS5sb2coJ2NsZWFyIGludGVydmFscycsd2hvLHRoaXMuaW50ZXJ2YWxzW3dob10pXG5cdFx0XHRjbGVhckludGVydmFsKEdJbnRlcnZhbC5pbnRlcnZhbHNbd2hvXSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vY29uc29sZS5sb2coJ21hcCBpbnRlcnZhbHMnLHRoaXMuaW50ZXJ2YWxzKVxuXHRcdFx0R0ludGVydmFsLmludGVydmFscy5tYXAoY2xlYXJJbnRlcnZhbCk7XG5cdFx0XHRHSW50ZXJ2YWwuaW50ZXJ2YWxzID0gW107XG5cdFx0fVxuXHQgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLkdJbnRlcnZhbCA9IEdJbnRlcnZhbDtcblxubW9kdWxlLmV4cG9ydHMuc2hvd0J1dHRvbiA9IGZ1bmN0aW9uKGlucHV0cykge1xuXHR2YXIgdmFsaWQgPSBfLmluY2x1ZGVzKGlucHV0cywgZmFsc2UpO1xuXHQvL2NvbnNvbGUubG9nKCdidXR0b24nLCBpbnB1dHMsIHZhbGlkKTtcblx0cmV0dXJuIHZhbGlkO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5zZXRGb3JtU3RhdGUgPSBmdW5jdGlvbihpbnB1dHMsIHZhbGlkKSB7XG5cdHZhciByZXQgPSB7fTtcblx0cmV0LnZhbGlkID0gXy5pc09iamVjdCh2YWxpZCkgPyB2YWxpZCA6IHt9O1xuXHRyZXQuZm9ybSA9IHt9O1xuXHRfLmVhY2goaW5wdXRzLCBmdW5jdGlvbih2KSB7XG5cdFx0aWYodi50eXBlICE9PSAnaGVhZGVyJykgcmV0LmZvcm1bdi5maWVsZF0gPSB2Ll9uYW1lO1xuXHRcdGlmKHYucmVxdWlyZWQpIHtcblx0XHRcdHJldC52YWxpZFt2LmZpZWxkXSA9IGZhbHNlO1xuXHRcdH1cblx0XHRpZih2LmF0dGFjaCkge1xuXHRcdFx0cmV0LmZvcm1bdi5hdHRhY2guZmllbGRdID0gdi5fbmFtZSArICdfYXR0YWNoJztcblx0XHRcdGlmKHYucmVxdWlyZWQpIHtcblx0XHRcdFx0cmV0LnZhbGlkW3YuYXR0YWNoLmZpZWxkXSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiByZXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzLkZvcm0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblx0XHR2YXIgZm9ybSA9IFtdO1xuXHRcdC8vIHNvcnQgb3V0IG9iamVjdCBvZiBmb3JtIGVsZW1lbnRzIGFuZCBhZGQgdGhlbSB0byBhbiBhcnJheVxuXHRcdHZhciBzb3J0ZWRfbGlzdCA9IF8odGhpcy5wcm9wcy5pbnB1dHMpLmtleXMoKS5zb3J0KCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHZhciB2YWx1ZSA9IF90aGlzLnByb3BzLmlucHV0c1trZXldO1xuXHRcdFx0Zm9ybS5wdXNoKGlucHV0KGtleSx2YWx1ZSxfdGhpcy5wcm9wcy5jb250ZXh0KSk7XG5cdFx0fSkudmFsdWUoKTtcblx0XHRcblx0XHRyZXR1cm4gZm9ybS5sZW5ndGggPT09IDAgPyAoPHNwYW4gLz4pIDogKDxkaXY+e2Zvcm19PC9kaXY+KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzLkZvcm1JbnB1dE9uQ2hhbmdlID0gZnVuY3Rpb24oZXZlbnQsIGZvcm0pIHtcbiAgICAvLyBnZXQgdGhlIGN1cnJlbnQgdmFsdWVcbiAgICB2YXIgY2hhbmdlID0ge1xuXHRcdHZhbGlkOiBfLmNsb25lKHRoaXMuc3RhdGUudmFsaWQpLFxuXHRcdC8vZm9ybTogXy5jbG9uZSh0aGlzLnN0YXRlLmZvcm0pXG5cdH07XG5cdFxuXHR2YXIgdmFsaWQgPSBmYWxzZTtcblx0dmFyIHBhcmVudCA9IGZhbHNlO1xuXHRcblx0Ly8gaXMgdGhpcyBhdHRhY2hlZFxuXHRpZihldmVudC50YXJnZXQuZGF0YXNldC5kZXBlbmRzb24gIT09ICdmYWxzZScpIHtcblx0XHRwYXJlbnQgPSAgZm9ybVtldmVudC50YXJnZXQuZGF0YXNldC5kZXBlbmRzb25dO1xuXHRcdHZhciBpbnB1dCA9IHBhcmVudC5hdHRhY2g7XG5cdFx0aW5wdXQucmVxdWlyZWQgPSBwYXJlbnQucmVxdWlyZWQ7XG5cdFx0cGFyZW50LkRPTSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcmVudC5fbmFtZSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhldmVudC50YXJnZXQuZGF0YXNldC5kZXBlbmRzb24pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBpbnB1dCA9IGZvcm1bZXZlbnQudGFyZ2V0LmlkXTtcblx0fVxuXHRcblx0Ly9jb25zb2xlLmxvZygnb25DaGFuZ2UnLCAgZXZlbnQudGFyZ2V0LmlkLCBpbnB1dCwgZm9ybSAsIGV2ZW50LnRhcmdldC5kYXRhc2V0KTtcblx0Ly8gc2V0IHRoZSBzdGF0ZSB2YWx1ZVxuXHQvL2NoYW5nZS5mb3JtW2lucHV0LmZpZWxkXSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblx0XG5cdC8vIGlmIHJlcXVpcmVkIHJ1biB0ZXN0c1xuXHRpZihpbnB1dC5yZXF1aXJlZCkge1x0XG5cdFx0aWYoXy5pc0FycmF5KGlucHV0LnJlZ2V4KSkge1xuXHRcdFx0dmFyIHJ4ID0gbmV3IFJlZ0V4cChpbnB1dC5yZWdleFswXSxpbnB1dC5yZWdleFsxXSk7XG5cdFx0XHR2YWxpZCA9IHJ4LnRlc3QoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFsaWQgPSBldmVudC50YXJnZXQudmFsdWUgIT09ICcnO1xuXHRcdH1cblx0XHRpZih2YWxpZCAmJiBwYXJlbnQgJiYgcGFyZW50LnR5cGUgPT09ICdwYXNzd29yZCcpIHtcblx0XHRcdGlmKGV2ZW50LnRhcmdldC52YWx1ZSA9PT0gJycgfHwgZXZlbnQudGFyZ2V0LnZhbHVlICE9PSBwYXJlbnQuRE9NLnZhbHVlKSB7XG5cdFx0XHRcdHZhbGlkID0gZmFsc2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWxpZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHZhbGlkICYmIHBhcmVudCAmJiBwYXJlbnQudHlwZSA9PT0gJ3NlbGVjdCcpIHtcblx0XHRcdGlmKGV2ZW50LnRhcmdldC52YWx1ZSA9PT0gJycgfHwgcGFyZW50LkRPTS52YWx1ZSA9PT0gJycpIHtcblx0XHRcdFx0dmFsaWQgPSBmYWxzZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbGlkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYodmFsaWQpIHtcblx0XHRcdGNoYW5nZS52YWxpZFtpbnB1dC5maWVsZF0gPSB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjaGFuZ2UudmFsaWRbaW5wdXQuZmllbGRdID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdFxuXHQvL2NvbnNvbGUubG9nKCdjaGFuZ2UnLCB2YWxpZCwgY2hhbmdlKTtcbiAgICB0aGlzLnNldFN0YXRlKGNoYW5nZSk7XG59XG5cblxuZnVuY3Rpb24gdmFsaWRhdGVfY2xhc3MoaW5wdXQsIGNvbnRleHQpIHtcblx0dmFyIHZhbGlkID0gY29udGV4dC5zdGF0ZS52YWxpZDtcblx0aWYoIWlucHV0LnJlcXVpcmVkKSB7XG5cdFx0cmV0dXJuICdpbnB1dC1ncm91cCc7XG5cdH0gZWxzZSB7XG5cdFx0aWYodmFsaWRbaW5wdXQuZmllbGRdKSB7XG5cdFx0XHRyZXR1cm4gJ2lucHV0LWdyb3VwJztcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuICdpbnB1dC1ncm91cCBoYXMtZXJyb3InO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBpbnB1dChuYW1lLCBvcHRpb25zLCBjb250ZXh0KSB7XG5cdFxuXHRpZighXy5pc09iamVjdChvcHRpb25zKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRcblx0dmFyIHR5cGUgPSBvcHRpb25zLnR5cGU7XG5cdHZhciBkZXBlbmRzT24gPSBvcHRpb25zLmRlcGVuZHNPbiA/IG9wdGlvbnMuZGVwZW5kc09uIDogZmFsc2U7XG5cdFxuXHRpZih0eXBlID09PSAndGV4dCcpIHtcblx0XHR2YXIgY2xhcyA9IHZhbGlkYXRlX2NsYXNzKG9wdGlvbnMsIGNvbnRleHQpO1xuXHRcdHZhciBkaXYgPSAoXG5cdFx0XHQ8ZGl2IGtleT17bmFtZX0+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc30+XHRcdFxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJpbnB1dC1ncm91cC1hZGRvblwiICBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogb3B0aW9ucy5sYWJlbCB8fCAnJ319IC8+IFxuXHRcdFx0XHQ8aW5wdXQgdHlwZT1cInRleHRcIiBpZD17b3B0aW9ucy5fbmFtZX0gIHJlZnM9e29wdGlvbnMuX25hbWV9IGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIGRhdGEtZGVwZW5kc29uPXtkZXBlbmRzT259ICBvbkNoYW5nZT17Y29udGV4dC5vbkNoYW5nZX0gICAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0XHRcblx0XHRyZXR1cm4gZGl2O1xuXHRcdFxuXHR9IGVsc2UgaWYodHlwZSA9PT0gJ3Bhc3N3b3JkJykge1xuXHRcdC8qIGNvbmZpcm0gcGFzc3dvcmQgaWYgcmVxdWVzdGVkICovXG5cdFx0dmFyIGNmbTtcblx0XHRpZihfLmlzT2JqZWN0KG9wdGlvbnMuYXR0YWNoKSAmJiBvcHRpb25zLmF0dGFjaC5sYWJlbCAmJiBvcHRpb25zLmF0dGFjaC5maWVsZCkge1xuXHRcdFx0b3B0aW9ucy5hdHRhY2gucmVxdWlyZWQgPSBvcHRpb25zLnJlcXVpcmVkO1xuXHRcdFx0dmFyIGNsYXNzMiA9IHZhbGlkYXRlX2NsYXNzKG9wdGlvbnMuYXR0YWNoLCBjb250ZXh0KTtcblx0XHRcdHZhciBkZXBlbmRzT24gPSBvcHRpb25zLmF0dGFjaC5kZXBlbmRzT24gPyBvcHRpb25zLmF0dGFjaC5kZXBlbmRzT24gOiBmYWxzZTtcblx0XHRcdHZhciBjZm0gPSAoXG5cdFx0XHRcdDxkaXYga2V5PXtuYW1lfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXNzMn0+XHRcdFxuXHRcdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cImlucHV0LWdyb3VwLWFkZG9uXCIgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBvcHRpb25zLmF0dGFjaC5sYWJlbCB8fCAnJ319IC8+IFxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBpZD17b3B0aW9ucy5fbmFtZSArICdfYXR0YWNoJ30gY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgZGF0YS1kZXBlbmRzb249e2RlcGVuZHNPbn0gIGRhdGEtcGFyZW50PXtvcHRpb25zLl9uYW1lfSAgb25DaGFuZ2U9e2NvbnRleHQub25DaGFuZ2V9ICAgIC8+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdCk7XG5cdFx0fVxuXHRcdC8vIGFkZCBwYXNzd29yZCBmaWVsZFxuXHRcdHZhciBjbGFzID0gdmFsaWRhdGVfY2xhc3Mob3B0aW9ucywgY29udGV4dCk7XG5cdFx0dmFyIGRlcGVuZHNPbiA9IG9wdGlvbnMuZGVwZW5kc09uID8gb3B0aW9ucy5kZXBlbmRzT24gOiBmYWxzZTtcblx0XHR2YXIgZGl2ID0gKFxuXHRcdFx0PGRpdiBrZXk9e25hbWV9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXN9PlxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJpbnB1dC1ncm91cC1hZGRvblwiICBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogb3B0aW9ucy5sYWJlbCB8fCAnJ319IC8+IFxuXHRcdFx0XHQ8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgaWQ9e29wdGlvbnMuX25hbWV9IGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIGRhdGEtZGVwZW5kc29uPXtkZXBlbmRzT259ICBvbkNoYW5nZT17Y29udGV4dC5vbkNoYW5nZX0gIC8+XG5cdFx0XHRcdFxuXHRcdFx0PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0e2NmbX1cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdFx0XG5cdFx0cmV0dXJuIChkaXYpO1xuXHRcdFxuXHR9IGVsc2UgaWYodHlwZSA9PT0gJ3NlbGVjdCcpIHtcblx0XHRcblx0XHR2YXIgb3RoZXIsIG9wdHM7XG5cdFx0Ly8gY2hlY2sgYW55IHZhbGlkYXRpb25cblx0XHR2YXIgY2xhcyA9IHZhbGlkYXRlX2NsYXNzKG9wdGlvbnMsIGNvbnRleHQpO1xuXHRcdFxuXHRcdC8vIHNob3cgYSB0ZXh0IGJveCBpbiB0aGUgc2FtZSBkaXYgZm9yIGFsdGVybmF0ZSB2YWx1ZXMgb3IgcXVlc3Rpb24vYW5zd2VyIGZvcm1hdCBcblx0XHRpZihfLmlzT2JqZWN0KG9wdGlvbnMuYXR0YWNoKSkge1xuXHRcdFx0b3B0aW9ucy5hdHRhY2gucmVxdWlyZWQgPSBvcHRpb25zLnJlcXVpcmVkO1xuXHRcdFx0Y2xhcyA9IHZhbGlkYXRlX2NsYXNzKG9wdGlvbnMuYXR0YWNoLCBjb250ZXh0KTtcblx0XHRcdHZhciBkZXBlbmRzT24yID0gb3B0aW9ucy5hdHRhY2guZGVwZW5kc09uID8gb3B0aW9ucy5hdHRhY2guZGVwZW5kc09uIDogZmFsc2U7XG5cdFx0XHRvdGhlciA9ICg8aW5wdXQgdHlwZT1cInRleHRcIiBpZD17b3B0aW9ucy5fbmFtZSArICdfYXR0YWNoJ30gcGxhY2Vob2xkZXI9e29wdGlvbnMuYXR0YWNoLnBsYWNlaG9sZGVyfSBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiAgIGRhdGEtcGFyZW50PXtvcHRpb25zLl9uYW1lfSBkYXRhLWRlcGVuZHNvbj17ZGVwZW5kc09uMn0gIG9uQ2hhbmdlPXtjb250ZXh0Lm9uQ2hhbmdlfSAgLz4pO1xuXHRcdH1cblx0XHQvLyBidWlsZCB0aGUgb3B0aW9ucyBsaXN0XG5cdFx0aWYoXy5pc0FycmF5KG9wdGlvbnMub3B0aW9ucykpIHtcblx0XHRcdG9wdHMgPSBvcHRpb25zLm9wdGlvbnMubWFwKGZ1bmN0aW9uKG9wKSB7XG5cdFx0XHRcdGlmKF8uaXNTdHJpbmcob3ApKSB7XG5cdFx0XHRcdFx0b3AgPSB7XG5cdFx0XHRcdFx0XHRsYWJlbDpvcCxcblx0XHRcdFx0XHRcdHZhbHVlOm9wXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0PG9wdGlvbiBrZXk9e29wLmxhYmVsfSB2YWx1ZT17b3AudmFsdWUgfHwgb3AubGFiZWx9PntvcC5sYWJlbH08L29wdGlvbj5cblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR2YXIgZGVwZW5kc09uID0gb3B0aW9ucy5kZXBlbmRzT24gPyBvcHRpb25zLmRlcGVuZHNPbiA6IGZhbHNlO1xuXHRcdHZhciBkaXYgPSAoXG5cdFx0XHQ8ZGl2ICBrZXk9e25hbWV9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc30+XG5cdFx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiaW5wdXQtZ3JvdXAtYWRkb25cIiAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IG9wdGlvbnMubGFiZWwgfHwgJyd9fSAvPiBcblx0XHRcdFx0XHQ8c2VsZWN0IGlkPXtvcHRpb25zLl9uYW1lfSBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWRlcGVuZHNvbj17ZGVwZW5kc09ufSAgb25DaGFuZ2U9e2NvbnRleHQub25DaGFuZ2V9ICA+XG5cdFx0XHRcdFx0XHR7b3B0c31cblx0XHRcdFx0XHQ8L3NlbGVjdD5cblx0XHRcdFx0XHR7b3RoZXJ9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0XHRcblx0XHRyZXR1cm4gZGl2O1xuXHRcdFxuXHR9IGVsc2UgaWYodHlwZSA9PT0gJ2hlYWRlcicpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBrZXk9e25hbWV9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC1zbS0xMlwiPlxuXHRcdFx0XHRcdFx0PHAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sLXN0YXRpY1wiIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBvcHRpb25zLmxhYmVsIHx8ICcnfX0gLz5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1x0XHRcblx0fVxuXHRcbn1cbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgQXBwID0gcmVxdWlyZSgnLi9ncmVldGVyLmpzJyk7XG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQvL2NvbnNvbGUubG9nKCdyZWFjdCcsUmVhY3QpO1xuXHQvKiBzdGFydCBvdXIgYXBwIGFmdGVyIHRoZSBwYWdlIGlzIHJlYWR5ICovIFx0XG5cdFJlYWN0LnJlbmRlcig8QXBwICAvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nub3dwaScpKTtcblxufSk7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFJlYWN0Qm9vdHN0cmFwID0gcmVxdWlyZSgncmVhY3QtYm9vdHN0cmFwJyk7XG5cbi8qIGNyZWF0ZSBmbGFzaCBtZXNzYWdlIFxuICogKi9cbnZhciBGbGFzaCA9IFJlYWN0Qm9vdHN0cmFwLkFsZXJ0O1xuXG52YXIgR0ZsYXNoID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpc1Zpc2libGU6IHRydWVcblx0XHR9O1xuXHR9LFxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoe3Nob3djbGFzczonaW5mbyd9KTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRpZighdGhpcy5zdGF0ZS5pc1Zpc2libGUpXG5cdFx0ICAgIHJldHVybiBudWxsO1xuXG5cdFx0dmFyIG1lc3NhZ2UgPSB0aGlzLnByb3BzLmNoaWxkcmVuO1xuXHRcdHJldHVybiAoXG5cdFx0ICAgIDxGbGFzaCBic1N0eWxlPXt0aGlzLnByb3BzLnNob3djbGFzc30gb25EaXNtaXNzPXt0aGlzLmRpc21pc3NGbGFzaH0+XG5cdFx0XHQ8cD57bWVzc2FnZX08L3A+XG5cdFx0ICAgIDwvRmxhc2g+XG5cdFx0KTtcblx0fSxcblx0LyogbWFrZSBzdXJlIHRoZSB1c2VyIGNhbiBjYW5jZWwgYW55IHJlZGlyZWN0cyBieSBjbGVhcmluZyB0aGUgZmxhc2ggbWVzc2FnZVxuXHQgKiAqL1xuXHRkaXNtaXNzRmxhc2g6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe2lzVmlzaWJsZTogZmFsc2V9KTtcblx0XHRpZih0aGlzLnByb3BzLmNsZWFyaW50ZXJ2YWxzIGluc3RhbmNlb2YgQXJyYXkpdGhpcy5wcm9wcy5jbGVhcmludGVydmFscy5tYXAoR0ludGVydmFsLmNsZWFySW50ZXJ2YWxzKTtcblx0XHRpZih0aGlzLnByb3BzLmNsZWFydGltZW91dHMgaW5zdGFuY2VvZiBBcnJheSl0aGlzLnByb3BzLmNsZWFydGltZW91dHMubWFwKGNsZWFyVGltZW91dCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdGbGFzaDtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24uanMnKTtcbnZhciBHSW50ZXJ2YWwgPSBDb21tb24uR0ludGVydmFsO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIEJvb3RzdHJhcEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkJ1dHRvbjtcbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxudmFyIExvZ2luID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5sb2dpbiwgdmFsaWQpO1xuXHRcdHJldC5uYW1lID0gJ2xvZ2luJztcblx0XHRyZXR1cm4gcmV0OyBcblx0fSxcblx0aGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fSxcblx0b25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcblx0XHRDb21tb24uRm9ybUlucHV0T25DaGFuZ2UuY2FsbCh0aGlzLCBlLCBUZXh0LmxvZ2luKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFxuXHRcdFx0cmV0dXJuICg8Zm9ybSAgcmVmPSdzaWduaW4nICBjbGFzc05hbWU9XCJzaWduaW4tZm9ybVwiICBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9ID5cblx0XHRcdFx0PGgyPntUZXh0LmhvbWUubG9naW59IDxDb21tb24uR01hbiAvPjwvaDI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmZsYXNofVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQubG9naW59IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiICA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5sb2dpbn0gIGJzU3R5bGU9J2luZm8nIGRpc2FibGVkPXtDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0+ICB7VGV4dC5idG5zLmxvZ2lufSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiBzdHlsZT17e3RleHRBbGlnbjoncmlnaHQnfX0gPjxCb290c3RyYXBCdXR0b24gb25DbGljaz17dGhpcy5wcm9wcy5zaG93cmVnaXN0ZXJ9ICBic1N0eWxlPSd3YXJuaW5nJz4gIHtUZXh0LmJ0bnMucmVnaXN0ZXJ9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLW9mZnNldC02IGNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5wcm9wcy5jaGFuZ2VSZXNldH0gIGJzU3R5bGU9J2RlZmF1bHQnID4gIHtUZXh0LmJ0bnMucmVzZXR9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjwvZGl2PlxuXHRcdFx0PC9mb3JtPik7XG5cdFx0XHRcblx0fSxcblx0bG9naW46IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHNhbWUgYXMgcmVnaXN0ZXIgYnV0IGxlc3MgaW5mbyBzZW50XG5cdFx0ICogeW91IGNvdWxkIGNvbWJpbmUgdGhlbSBib3RoIGlmIHlvdSBsaWtlIGxlc3MgY29kZVxuXHRcdCAqICovXG5cdFx0dmFyIG15ZGF0YSA9IHtsb2dpbjoneWVzJ307XG5cdFx0Ly9jb25zb2xlLmxvZygnZm9ybScsIHRoaXMuc3RhdGUuZm9ybSwgVGV4dC5sb2dpbiApO1xuXHRcdF8uZWFjaCh0aGlzLnN0YXRlLmZvcm0sIGZ1bmN0aW9uKHYsaykge1xuXHRcdFx0aWYodi50eXBlICE9PSAnaGVhZGVyJykge1xuXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2KTtcblx0XHRcdFx0bXlkYXRhW2tdID0gZWwudmFsdWU7XG5cdFx0XHR9XG5cdFx0fSx0aGlzKTsgXG5cdFx0bXlkYXRhW2lzS2V5XSA9IGlzTWU7XG5cdFx0Ly9jb25zb2xlLmxvZygnbXlkYXRhJywgbXlkYXRhLCAnVGV4dCcsIFRleHQubG9naW4gKTtcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBUZXh0LnJlbGF5LFxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0ZGF0YTogbXlkYXRhLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRmdW5jdGlvbiBtZXNzYWdlKCkge1xuXHRcdFx0XHRcdHZhciBzZWNzID0gKGRhdGEucmVkaXJlY3Qud2hlbiAtIHJycikgLyAxMDAwO1xuXHRcdFx0XHRcdHJycis9MTAwMDtcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UgPSBkYXRhLnJlcGVhdGVyICsgJzxiciAvPllvdSB3aWxsIGJlIHJlZGlyZWN0ZWQgdG8gPGEgaHJlZj1cIicgKyBkYXRhLnJlZGlyZWN0LnBhdGggKyAnXCI+JyArIGRhdGEucmVkaXJlY3QucGF0aC5zdWJzdHIoMSkgKyAnPC9hPiAgJztcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UrPSBzZWNzID09PSAwID8gJyBub3cnOicgaW4gJyArIHNlY3MgKyAnIHNlY29uZHMuJztcblx0XHRcdFx0fVxuXHRcdFx0XHRpZih0eXBlb2YgZGF0YS5yZWRpcmVjdCA9PT0gJ29iamVjdCcgJiYgZGF0YS5yZWRpcmVjdC53aGVuPjEwMDApIHtcblx0XHRcdFx0XHRkYXRhLnJlcGVhdGVyID0gZGF0YS5tZXNzYWdlO1xuXHRcdFx0XHRcdHZhciBycnIgPSAxMDAwXG5cdFx0XHRcdFx0XHRfc2VsZiA9IHRoaXMucHJvcHMuY29udGV4dDtcblx0XHRcdFx0XHRHSW50ZXJ2YWwucmVkaXJlY3QgPSBHSW50ZXJ2YWwuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRtZXNzYWdlKCk7XG5cdFx0XHRcdFx0XHRfc2VsZi5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLGRhdGE6ZGF0YX0pO1xuXHRcdFx0XHRcdH0sMTAwMCk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coR0ludGVydmFsLmludGVydmFscylcblx0XHRcdFx0XHRHSW50ZXJ2YWwudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdEdJbnRlcnZhbC5jbGVhckludGVydmFscyhHSW50ZXJ2YWwucmVkaXJlY3QpO1xuXHRcdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdFx0fSxkYXRhLnJlZGlyZWN0LndoZW4pO1xuXHRcdFx0XHRcdG1lc3NhZ2UoKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRhdGEucmVkaXJlY3QgPT09ICdvYmplY3QnICYmIGRhdGEucmVkaXJlY3QucGF0aCl7XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLGRhdGE6ZGF0YX0pO1xuXHRcdFx0fS5iaW5kKHRoaXMpLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMsZGF0YToge3N0YXR1czpzdGF0dXMsZXJyOmVyci50b1N0cmluZygpfSB9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdH0pO1x0XHRcblx0fVxufSk7IFxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2luO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUZXh0ID0gSlNPTi5wYXJzZShyZXF1aXJlKCd0ZXh0JykpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi5qcycpO1xudmFyIEdJbnRlcnZhbCA9IENvbW1vbi5HSW50ZXJ2YWw7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIFJlYWN0Qm9vdHN0cmFwID0gcmVxdWlyZSgncmVhY3QtYm9vdHN0cmFwJyk7XG52YXIgQm9vdHN0cmFwQnV0dG9uID0gUmVhY3RCb290c3RyYXAuQnV0dG9uO1xudmFyIHllcyA9ICd5ZXMnLCBubyA9ICdubyc7XG4vL3ZhciB5ZXMgPSB0cnVlLCBubyA9IGZhbHNlO1xuXG52YXIgUlIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG1peGluczogW1JlYWN0LmFkZG9ucy5MaW5rZWRTdGF0ZU1peGluXSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRGb3JtU3RhdGUoKTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLnNldEZvcm1TdGF0ZSh0aGlzLnN0YXRlLnZhbGlkKSk7XG5cdH0sXG5cdHNldEZvcm1TdGF0ZTogZnVuY3Rpb24odmFsaWQpIHtcblx0XHR2YXIgcmV0ID0gQ29tbW9uLnNldEZvcm1TdGF0ZShUZXh0LnJlZ2lzdGVyLCB2YWxpZCk7XG5cdFx0cmV0Lm5hbWUgPSAncmVnaXN0ZXInO1xuXHRcdHJldHVybiByZXQ7XG5cdH0sXG5cdGhhbmRsZVN1Ym1pdDogZnVuY3Rpb24oZSkge1xuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG5cdFx0Q29tbW9uLkZvcm1JbnB1dE9uQ2hhbmdlLmNhbGwodGhpcywgZSwgVGV4dC5yZWdpc3Rlcik7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKDxmb3JtICByZWY9J3NpZ25pbicgIGNsYXNzTmFtZT1cInNpZ25pbi1mb3JtXCIgICBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9PlxuXHRcdFx0XHQ8aDI+e1RleHQuaG9tZS5yZWdpc3Rlcn0gPENvbW1vbi5HTWFuIC8+PC9oMj5cblx0XHRcdFx0e3RoaXMucHJvcHMuZmxhc2h9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PENvbW1vbi5Gb3JtIGlucHV0cz17VGV4dC5yZWdpc3Rlcn0gY29udGV4dD17dGhpc30gLz5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgc3R5bGU9e3t0ZXh0QWxpZ246J2xlZnQnfX0gPjxCb290c3RyYXBCdXR0b24gb25DbGljaz17dGhpcy5yZWdpc3Rlcn0gcmVmPVwicmVnaXN0ZXJidXR0b25cIiBkYXRhLWxvYWRpbmctdGV4dD1cIlJlZ2lzdGVyaW5nLi4uXCIgcm9sZT1cImJ1dHRvblwiICBic1N0eWxlPSd3YXJuaW5nJyBjbGFzc05hbWU9XCJidG4gIGJ0bi13YXJuaW5nXCIgIGRpc2FibGVkPXtDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0+ICB7VGV4dC5idG5zLnJlZ2lzdGVyfSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiAgIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5wcm9wcy5zaG93cmVnaXN0ZXJ9ICBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHRcIj4gIHtUZXh0LmJ0bnMubG9naW5jdXJyZW50fSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjwvZGl2PlxuXHRcdFx0PC9mb3JtPik7XG5cdH0sXG5cdHJlZ2lzdGVyOiBmdW5jdGlvbigpIHtcblx0XHQvKiB2YWxpZGF0aW9uIG9jY3VycyBhcyBpbnB1dCBpcyByZWNlaXZlZCBcblx0XHQgKiB0aGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBhdmlhbGFibGUgaWZcblx0XHQgKiBhbGwgdmFsaWRhdGlvbiBpcyBhbHJlYWR5IG1ldCBzbyBqdXN0IHJ1blxuXHRcdCAqICovXG5cdFx0Y29uc29sZS5sb2coJ2Zvcm0nLCB0aGlzLnN0YXRlLmZvcm0sICdUZXh0JywgVGV4dC5yZWdpc3RlciApOyBcblx0XHR2YXIgbXlkYXRhID0ge3JlZ2lzdGVyOid5ZXMnfTtcblx0XHRfLmVhY2godGhpcy5zdGF0ZS5mb3JtLCBmdW5jdGlvbih2LGspIHtcblx0XHRcdGlmKHYudHlwZSAhPT0gJ2hlYWRlcicpIHtcblx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodik7XG5cdFx0XHRcdG15ZGF0YVtrXSA9IGVsLnZhbHVlO1xuXHRcdFx0fVxuXHRcdH0sdGhpcyk7IFxuXHRcdG15ZGF0YVtpc0tleV0gPSBpc01lO1xuXHRcdGNvbnNvbGUubG9nKCdteWRhdGEnLCBteWRhdGEsICdUZXh0JywgVGV4dC5yZWdpc3RlciApO1xuXHRcdHZhciBidG4gPSAkKHRoaXMucmVmcy5yZWdpc3RlcmJ1dHRvbi5nZXRET01Ob2RlKCkpXG5cdFx0YnRuLmJ1dHRvbignbG9hZGluZycpXG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogVGV4dC5yZWxheSxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdGRhdGE6IG15ZGF0YSxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdGZ1bmN0aW9uIG1lc3NhZ2UoKSB7XG5cdFx0XHRcdFx0dmFyIHNlY3MgPSAoZGF0YS5yZWRpcmVjdC53aGVuIC0gcnJyKSAvIDEwMDA7XG5cdFx0XHRcdFx0cnJyKz0xMDAwO1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSA9IGRhdGEucmVwZWF0ZXIgKyAnPGJyIC8+WW91IHdpbGwgYmUgcmVkaXJlY3RlZCB0byA8YSBocmVmPVwiJyArIGRhdGEucmVkaXJlY3QucGF0aCArICdcIj4nICsgZGF0YS5yZWRpcmVjdC5wYXRoLnN1YnN0cigxKSArICc8L2E+ICAnO1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSs9IHNlY3MgPT09IDAgPyAnIG5vdyc6JyBpbiAnICsgc2VjcyArICcgc2Vjb25kcy4nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGlmIHdlIGdldCBhIHJlZGlyZWN0IGNoZWNrIHRoZSB0aW1lIGFuZCBydW4gYW4gaW50ZXJ2YWxcblx0XHRcdFx0ICogdGhpcyBpcyByZWFsbHkganVzdCB0byBzaG93IFJlYWN0IHdvcmtcblx0XHRcdFx0ICogKi9cdFxuXHRcdFx0XHRpZih0eXBlb2YgZGF0YS5yZWRpcmVjdCA9PT0gJ29iamVjdCcgJiYgZGF0YS5yZWRpcmVjdC53aGVuPjEwMDApIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRkYXRhLnJlcGVhdGVyID0gZGF0YS5tZXNzYWdlOyAvL2tlZXAgb3VyIG9yaWdpbmFsIG1lc3NhZ2UgZm9yIHRoZSByZXBlYXRlclxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZhciBycnIgPSAxMDAwXG5cdFx0XHRcdFx0XHRfc2VsZiA9IHRoaXMucHJvcHMuY29udGV4dDtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRTbm93cGlJbnRlcnZhbC5yZWRpcmVjdCA9IFNub3dwaUludGVydmFsLnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0LyogdGhpcyBpcyByZWFsbHkgc2ltcGxlXG5cdFx0XHRcdFx0XHQgKiBqdXN0IHJlY2FjdWxhdGUgdGhlIG1lc3NhZ2UgYW5kIGxldCByZWFjdCBkbyB0aGUgcmVzdFxuXHRcdFx0XHRcdFx0ICogKi9cblx0XHRcdFx0XHRcdG1lc3NhZ2UoKTtcblx0XHRcdFx0XHRcdF9zZWxmLnNldFN0YXRlKHtyZXNwb25zZTp5ZXMsZGF0YTpkYXRhfSk7XG5cdFx0XHRcdFx0fSwxMDAwKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvKiBraWxsIHRoZSBpbnRlcnZhbCBhbmQgcmVkaXJlY3Qgb24gdGhlIHRpbWVvdXQgXG5cdFx0XHRcdFx0ICogKi9cblx0XHRcdFx0XHRHSW50ZXJ2YWwudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdEdJbnRlcnZhbC5jbGVhckludGVydmFscyhHSW50ZXJ2YWwucmVkaXJlY3QpO1xuXHRcdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdFx0fSxkYXRhLnJlZGlyZWN0LndoZW4pO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdG1lc3NhZ2UoKVxuXHRcdFx0XHRcblx0XHRcdFx0fSBlbHNlIGlmKHR5cGVvZiBkYXRhLnJlZGlyZWN0ID09PSAnb2JqZWN0JyAmJiBkYXRhLnJlZGlyZWN0LnBhdGgpe1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gZGF0YS5yZWRpcmVjdC5wYXRoO1xuXHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0LyogZmxhc2ggbWVzc2FnZXMgYXJlIHNob3duIHdpdGggcmVzcG9uc2UgOiB5ZXNcblx0XHRcdFx0ICogKi9cdFxuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe3Jlc3BvbnNlOnllcyxkYXRhOmRhdGF9KTtcblx0XHRcdFx0XG5cdFx0XHR9LmJpbmQodGhpcyksXG5cdFx0XHRcblx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMucHJvcHMudXJsLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMsZGF0YToge3N0YXR1czpzdGF0dXMsZXJyOmVyci50b1N0cmluZygpfSB9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdFxuXHRcdC8qIG5lYXQgbGl0dGxlIHRyaWNrIHRvIGFsd2F5cyByZXNldCBvdXIgYnV0dG9uc1xuXHRcdCogKi9cdFxuXHRcdH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcblx0XHRcdGJ0bi5idXR0b24oJ3Jlc2V0Jyk7XG5cdFx0fSk7XG5cdFx0XG5cdH0sXG59KTsgXG5cbm1vZHVsZS5leHBvcnRzID0gUlI7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uLmpzJyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcbi8vdmFyIHllcyA9IHRydWUsIG5vID0gZmFsc2U7XG5cbnZhciBSZXNldFBhc3N3b3JkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5yZXNldCwgdmFsaWQpO1xuXHRcdHJldC5uYW1lID0gJ3Jlc2V0Jztcblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuXHRcdENvbW1vbi5Gb3JtSW5wdXRPbkNoYW5nZS5jYWxsKHRoaXMsIGUsIFRleHQucmVzZXQpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICg8Zm9ybSAgcmVmPSdzaWduaW4nICBjbGFzc05hbWU9XCJzaWduaW4tZm9ybVwiICBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9ID5cblx0XHRcdFx0PGgyPntUZXh0LmhvbWUucmVzZXR9IDxDb21tb24uR01hbiAvPjwvaDI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmZsYXNofVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQucmVzZXR9IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiICA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5yZXNldGVtYWlsfSByZWY9XCJyZXNldGJ1dHRvblwiIGJzU3R5bGU9J2luZm8nIGRpc2FibGVkPXtDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0gIGRhdGEtbG9hZGluZy10ZXh0PVwiQ2hlY2tpbmcuLi5cIiA+ICB7VGV4dC5idG5zLnJlc2V0cGFzc30gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgc3R5bGU9e3t0ZXh0QWxpZ246J3JpZ2h0J319ID48Qm9vdHN0cmFwQnV0dG9uIG9uQ2xpY2s9e3RoaXMucHJvcHMuY2hhbmdlUmVzZXR9ICBic1N0eWxlPSdkZWZhdWx0Jz4gIHtUZXh0LmJ0bnMubG9naW5jdXJyZW50fSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48L2Rpdj5cblx0XHRcdDwvZm9ybT4pO1xuXHRcdFx0XG5cdH0sXG5cdHJlc2V0ZW1haWw6IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHZhbGlkYXRpb24gb2NjdXJzIGFzIGlucHV0IGlzIHJlY2VpdmVkIFxuXHRcdCAqIHRoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIGF2aWFsYWJsZSBpZlxuXHRcdCAqIGFsbCB2YWxpZGF0aW9uIGlzIGFscmVhZHkgbWV0IHNvIGp1c3QgcnVuXG5cdFx0ICogKi9cblx0XHR2YXIgbXlkYXRhID0ge3Jlc2V0Oid5ZXMnfTtcblx0XHRfLmVhY2godGhpcy5zdGF0ZS5mb3JtLCBmdW5jdGlvbih2LGspIHtcblx0XHRcdGlmKHYudHlwZSAhPT0gJ2hlYWRlcicpIHtcblx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodik7XG5cdFx0XHRcdG15ZGF0YVtrXSA9IGVsLnZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0aWYodi5hdHRhY2gpIHtcblx0XHRcdFx0dmFyIGVsQSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHYgKyAnX2F0dGFjaCcpO1xuXHRcdFx0XHRteWRhdGFbdi5hdHRhY2guZmllbGRdID0gZWxBLnZhbHVlO1x0XG5cdFx0XHR9XG5cdFx0fSx0aGlzKTtcblx0XHRteWRhdGFbaXNLZXldID0gaXNNZTtcblx0XHR2YXIgYnRuID0gJCh0aGlzLnJlZnMucmVzZXRidXR0b24uZ2V0RE9NTm9kZSgpKVxuXHRcdGJ0bi5idXR0b24oJ2xvYWRpbmcnKVxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IFRleHQucmVzZXRlbWFpbCxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdGRhdGE6IG15ZGF0YSxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcdFxuXHRcdFx0XHRmdW5jdGlvbiBtZXNzYWdlKCkge1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSA9ICdTdWNjZXNzJztcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBmbGFzaCBtZXNzYWdlcyBhcmUgc2hvd24gd2l0aCByZXNwb25zZSA6IHllc1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLGRhdGE6ZGF0YSxyZXNldGZvcm06bm99KTtcblx0XHRcdFx0XG5cdFx0XHR9LmJpbmQodGhpcyksXG5cdFx0XHRcblx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMucHJvcHMudXJsLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMscmVzZXRmb3JtOm5vLGRhdGE6IHtzdGF0dXM6c3RhdHVzLGVycjplcnIudG9TdHJpbmcoKX0gfSk7XG5cdFx0XHR9LmJpbmQodGhpcylcblx0XHRcblx0XHQvKiBhbHdheXMgcmVzZXQgb3VyIGJ1dHRvbnNcblx0XHQqICovXHRcblx0XHR9KS5hbHdheXMoZnVuY3Rpb24gKCkge1xuXHRcdFx0XG5cdFx0XHRidG4uYnV0dG9uKCdyZXNldCcpO1xuXHRcdH0pO1xuXHRcdFxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNldFBhc3N3b3JkO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIExvZ2luID0gcmVxdWlyZSgnLi9mb3Jtcy9sb2dpbicpO1xudmFyIFJlZyA9IHJlcXVpcmUoJy4vZm9ybXMvcmVnJyk7XG52YXIgUmVzZXRQYXNzd29yZCA9IHJlcXVpcmUoJy4vZm9ybXMvcmVzZXQnKTtcbnZhciBHRmxhc2ggPSByZXF1aXJlKCcuL2ZsYXNoJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24uanMnKTtcbnZhciBHSW50ZXJ2YWwgPSBDb21tb24uR0ludGVydmFsO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG5cbi8qKlxuICogdXNlIHllcyBmb3IgdHJ1ZVxuICogdXNlIG5vIGZvciBmYWxzZVxuICogXG4gKiB0aGlzIHNpbmdsZSBhcHAgdXNlcyB0aGUgeWVzL25vIHZhciBzbyBpZiB5b3Ugd2FudCB5b3UgY2FuIHN3aXRjaCBiYWNrIHRvIHRydWUvZmFsc2VcbiAqIFxuICogKi9cbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxuLyogdGhpcyBpcyBvdXIgbWFpbiBjb21wb25lbnRcbiAqIHNpbmNlIHRoaXMgaXMgYSBzaW5nbGUgZnVuY3Rpb24gYXBwIHdlIHdpbGwgY2FsbCB0aGlzIGRpcmVjdGx5XG4gKiBcbiAqIHRvIGluY2x1ZGUgdGhpcyBpbiB5b3VyIFJlYWN0IHNldHVwIG1vZGlmeSBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIHRvIHJlY2lldmUgYW55IGRlZmF1bHQgdmFsdWVzIFxuICogXG4gKiAqL1xuXG52YXIgQm9vdHN0cmFwQnV0dG9uID0gUmVhY3RCb290c3RyYXAuQnV0dG9uO1xuXG52YXIgR0xvZ2luID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5vdyA9IG5ldyBEYXRlKCk7XG5cdFx0LyogaW5pdGlhbGl6ZSB0aGUgbG9naW5cblx0XHQgKiByZWdpc3RlciBpcyBubywgaWYgd2Ugd2FudCB0byBzaG93IHRoZSByZWdpc3RlciBmb3JtIHNldCB0byB5ZXNcblx0XHQgKiBtb3VudGVkIGlzIHNldCB0byB5ZXMgd2hlbiB0aGUgYXBwIG1vdW50cyBpZiB5b3UgbmVlZCB0byB3YWl0IGZvciB0aGF0XG5cdFx0ICogc2V0IHJlc3BvbnNlIHRvIHllcyB0byBzaG93IGEgZmxhc2ggbWVzc2FnZVxuXHRcdCAqIGVycm9yIG1lc3NhZ2VzIGFyZSBpbiBkYXRhXG5cdFx0ICogKi9cblx0XHRyZXR1cm4ge3JlZ2lzdGVyOiBubyxtb3VudGVkOiBubyxyZXNwb25zZTpubyxkYXRhOnt9fTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0Lyogd2Ugd2FudCB0byBraWxsIHRoZSBmbGFzaCBhbnl0aW1lIHRoZSBmb3JtIGlzIHJlbmRlcmVkXG5cdFx0ICogeW91IGNhbiBhZGQgYW55IG90aGVyIHByb3BzIHlvdSBuZWVkIGhlcmUgaWYgeW91IGluY2x1ZGVcblx0XHQgKiB0aGlzIGluIGFub3RoZXIgY29tcG9uZW50IFxuXHRcdCAqICovXG5cdFx0dGhpcy5zZXRTdGF0ZSh7cmVzcG9uc2U6bm99KTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNob3dmbGFzaG1lc3NhZ2UgPSBmYWxzZTtcblx0XHR2YXIgaGFzZXJyb3IgPSBmYWxzZTtcblx0XHR2YXIgbG9naW5PUnJlZ2lzdGVyID0gKHRoaXMuc3RhdGUucmVnaXN0ZXIgPT09IHllcykgPyAncmVnaXN0ZXInIDogJ2xvZ2luJztcblx0XHQvKiBpZiByZXNwb25zZSBzdGF0ZSBpcyB5ZXMgd2UgaGF2ZSBhIGZsYXNoIG1lc3NhZ2UgdG8gc2hvd1xuXHRcdCAqIHRoZSBtZXNzYWdlIGlzIGluIGRhdGFcblx0XHQgKiAqL1xuXHRcdGlmKHRoaXMuc3RhdGUucmVzcG9uc2UgPT09IHllcykge1xuXHRcdFx0XG5cdFx0XHR2YXIgcGlja2NsYXNzID0gKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSB5ZXMgKSA/ICdzdWNjZXNzJyA6ICd3YXJuaW5nJzsgXG5cdFx0XHRcblx0XHRcdHNob3dmbGFzaG1lc3NhZ2UgPSA8R0ZsYXNoIHNob3djbGFzcz17cGlja2NsYXNzfSBjbGVhcnRpbWVvdXRzPXtbR0ludGVydmFsLnRpbWVvdXRdfSBjbGVhcmludGVydmFscz17W0dJbnRlcnZhbC5yZWRpcmVjdF19PjxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHRoaXMuc3RhdGUuZGF0YS5tZXNzYWdlIHx8ICcnfX0gLz48L0dGbGFzaCA+O1xuXHRcdFx0XG5cdFx0XHQvKiBpZiB3ZSBoYXZlIGFuIGVycm9yIHNoYWtlIHRoZSBmb3JtLiAgdGhpcyBpcyBkb25lIHdpdGggdGhlXG5cdFx0XHQgKiBoYXMtZXJyb3JzIGNsYXNzXG5cdFx0XHQgKiAqL1xuXHRcdFx0aWYodGhpcy5zdGF0ZS5kYXRhLnN1Y2Nlc3MgPT09IG5vKSBoYXNlcnJvciA9ICcgaGFzLWVycm9ycyc7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0aWYodGhpcy5zdGF0ZS5yZXNldGZvcm0gPT09IHllcykge1xuXHRcdFx0dmFyIHJldCA9IDxSZXNldFBhc3N3b3JkICBjb250ZXh0PXt0aGlzfSBjaGFuZ2VSZXNldD17dGhpcy5jaGFuZ2VSZXNldH0gZmxhc2g9e3Nob3dmbGFzaG1lc3NhZ2V9IC8+XG5cdFx0fSBlbHNlIGlmKHRoaXMuc3RhdGUucmVnaXN0ZXIgPT09IG5vKSB7XG5cdFx0XHR2YXIgcmV0ID0gPExvZ2luICBjb250ZXh0PXt0aGlzfSBzaG93cmVnaXN0ZXI9e3RoaXMuc2hvd3JlZ2lzdGVyfSBjaGFuZ2VSZXNldD17dGhpcy5jaGFuZ2VSZXNldH0gZmxhc2g9e3Nob3dmbGFzaG1lc3NhZ2V9IC8+XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciByZXQgPSA8UmVnIHNob3dyZWdpc3Rlcj17dGhpcy5zaG93cmVnaXN0ZXJ9IGZsYXNoPXtzaG93Zmxhc2htZXNzYWdlfSBjb250ZXh0PXt0aGlzfSAvPlxuXHRcdH1cblx0XHRyZXR1cm4gKCA8ZGl2ICBjbGFzc05hbWU9e2xvZ2luT1JyZWdpc3RlciArIFwiIGNlbnRlcm1lIGNvbC14cy0xMiBzaGFrZW1lIFwiICsgaGFzZXJyb3J9PntyZXR9IDwvZGl2Pik7XG5cdH0sXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcblx0XHQvLyBXaGVuIHRoZSBjb21wb25lbnQgaXMgYWRkZWQgbGV0IG1lIGtub3dcblx0XHR0aGlzLnNldFN0YXRlKHttb3VudGVkOiB5ZXN9KVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0c2hvd3JlZ2lzdGVyOiBmdW5jdGlvbiAoZSkge1xuXHRcdC8qIHRvZ2dsZSB0aGUgcmVnaXN0ZXIgLyBsb2dpbiBmb3Jtc1xuXHRcdCAqICovXG5cdFx0dGhpcy5zZXRTdGF0ZSh7cmVnaXN0ZXI6IHRoaXMuc3RhdGUucmVnaXN0ZXI9PT15ZXM/bm86eWVzLHJlc3BvbnNlOm5vfSlcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRjaGFuZ2VSZXNldDogZnVuY3Rpb24gKGUpIHtcblx0XHQvKiB0b2dnbGUgdGhlIHBhc3N3b3JkIHJlc2V0XG5cdFx0ICogKi9cblx0XHR0aGlzLnNldFN0YXRlKHtyZXNldGZvcm06IHRoaXMuc3RhdGUucmVzZXRmb3JtPT09eWVzP25vOnllcyxyZXNwb25zZTpub30pXG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fSxcblx0aGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR0xvZ2luO1xuIl19
