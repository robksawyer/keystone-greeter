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
		if(v.required && !ret.valid[v.field]) {
			ret.valid[v.field] = false;
		}
		if(v.attach) {
			ret.form[v.attach.field] = v._name + '_attach';
			if(v.required && !ret.valid[v.attach.field]) {
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
		console.log(this.props.inputs);
		var sorted_list = _(this.props.inputs).keys().sort().map(function (key) {
			var value = _this.props.inputs[key];
			form.push(container(key, value, _this.props.inputs, _this.props.context));
		}).value();
		
		return form.length === 0 ? (React.createElement("span", null)) : (React.createElement("div", null, form));
	}
});

module.exports.FormInputOnChange = function(event, form) {
    // get the current value
    var change = {
		valid: _.clone(this.state.valid),
	};
	
	var valid = false;
	var parent = false;
	
	// is this attached
	if(event.target.dataset.dependson !== 'false') {
		parent =  form[event.target.dataset.dependson];
		var input = form[event.target.id];
		parent.DOM = document.getElementById(parent._name);
		//console.log(event.target.dataset.dependson);
	} else {
		var input = form[event.target.id];
	}
	
	if(input.required) {	
		if(_.isArray(input.regex)) {
			var rx = new RegExp(input.regex[0],input.regex[1]);
			valid = rx.test(event.target.value);
		} else {
			valid = event.target.value !== '';
		}
		if(valid && parent && parent.type === 'password') {
			if(event.target.value !== '' && event.target.value === parent.DOM.value) {
				valid = true;
			}
		}
		if(valid && parent && parent.type === 'select') {
			if(event.target.value !== '' && parent.DOM.value !== '') {
				valid = true;
			}
		}
		
		change.valid[input.field] = valid;
		
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
		return (
			React.createElement("input", {type: "text", id: options._name, refs: options._name, className: "form-control", "data-dependson": dependsOn, onChange: context.onChange})
		);
		
	} else if(type === 'password') {
		// add password field
		var dependsOn = options.dependsOn ? options.dependsOn : false;
		return ( 
			React.createElement("input", {type: "password", id: options._name, className: "form-control", "data-dependson": dependsOn, onChange: context.onChange})
		);
		
	} else if(type === 'select') {
		
		var other, opts;
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
		return (
			React.createElement("select", {id: options._name, className: "form-control", "data-dependson": dependsOn, onChange: context.onChange}, 
				opts
			)
		);
		
	} 
	
}

function container(name, options, inputs, context) {
	
	if(!_.isObject(options)) {
		return false;
	}
	if(options.attached) {
		return false;
	}
	
	var type = options.type;
	
	if(type === 'header') {
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
		
	} else {
		var theinput = input(name, options, context);
		var attached = false;
		if(inputs[name + '_attach']) {
			attached = input(name + '_attach', inputs[name + '_attach'], context);
		}
		
		var clas = validate_class(options, context);

		return (
			React.createElement("div", {key: name}, 
			React.createElement("div", {className: clas}, 		
				React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: options.label || ''}}), 
				theinput, 
				attached
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


},{"./greeter.js":8}],3:[function(require,module,exports){
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
		var ret = Common.setFormState(Text.resetcode, valid);
		ret.name = 'reset';
		return ret;
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	},
	onChange: function(e) {
		Common.FormInputOnChange.call(this, e, Text.resetcode);
	},
	render: function() {
			return (React.createElement("form", {ref: "resetcode", className: "code-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.resetcode, " ", React.createElement(Common.GMan, null)), 
				this.props.flash, 
					
					React.createElement(Common.Form, {inputs: Text.resetcode, context: this}), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 "}, React.createElement(BootstrapButton, {role: "button", onClick: this.resetemail, ref: "resetbutton", bsStyle: "info", disabled: Common.showButton(this.state.valid), "data-loading-text": "Checking..."}, "  ", Text.btns.resetcode, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {onClick: this.props.changeReset, bsStyle: "default"}, "  ", Text.btns.logincurrent, " ")), 
					React.createElement("div", {className: "clearfix"})
			));
			
	},
	resetemail: function() {
		/* validation occurs as input is received 
		 * this method should only be avialable if
		 * all validation is already met so just run
		 * */
		var mydata = {code:'yes'};
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
				this.props.context.setState({response:yes,data:data,resetcode:no});
				
			}.bind(this),
			
			error: function(xhr, status, err) {
				console.log(this.props.url, status, err.toString());
				this.props.context.setState({response:yes,resetform:yes,resetcode:no,data: {status:status,err:err.toString()} });
			}.bind(this)
		
		/* always reset our buttons
		* */	
		}).always(function () {
			
			btn.button('reset');
		});
		
	}
});

module.exports = ResetPassword;


},{"../common.js":1}],5:[function(require,module,exports){
var React = window.React;
var Text = JSON.parse(window.Text);
var Common = require('../common.js');
var GInterval = Common.GInterval;
var GFlash = require('../flash');
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
			return (React.createElement("form", {ref: "signin", className: "signin-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.login, " "), 
				this.props.flash, 
					
					React.createElement(Common.Form, {inputs: Text.login, context: this}), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 "}, React.createElement(BootstrapButton, {role: "button", onClick: this.login, bsStyle: "info", disabled: Common.showButton(this.state.valid)}, "  ", Text.btns.login, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {onClick: this.props.showregister, bsStyle: "warning"}, "  ", Text.btns.register, " ")), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-offset-6 col-xs-6 ", style: {textAlign:'right', paddingTop:10}}, React.createElement(BootstrapButton, {role: "button", onClick: this.props.changeReset, bsStyle: "default"}, "  ", Text.btns.reset, " ")), 
					
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
					data.message += secs === 0 ? ' now':' in ' + secs + ' seconds.';
				}
				if(typeof data.redirect === 'object' && data.redirect.when > 1000) {
					data.repeater = data.message;
					var rrr = 1000
						_self = this.props.context;
					GInterval.redirect = GInterval.setInterval(function() {
						message();
						_self.setState({response:yes,data:data});
					},1000);
					GInterval.timeout = setTimeout(function(){
						GInterval.clearIntervals(GInterval.redirect);
						window.location.href = data.redirect.path;
					},data.redirect.when);
					message()
				}
				else if(typeof data.redirect === 'object' && data.redirect.path){
					window.location.href = data.redirect.path;
				}
				
				this.props.context.setState({
					response: yes,
					data: data
				});
			}.bind(this),
			error: function(xhr, status, err) {
				this.props.context.setState({
					response:yes,
					data: {
						status:status,
						err:err.toString()
					} 
				});
			}.bind(this)
		});		
	}
}); 

module.exports = Login;


},{"../common.js":1,"../flash":3}],6:[function(require,module,exports){
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
		var mydata = { register: 'yes' };
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
						_self.setState({
							response: yes,
							data: data
						});
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
				this.props.context.setState({
					response: yes,
					data: data
				});
				
			}.bind(this),
			
			error: function(xhr, status, err) {
				console.log(this.props.url, status, err.toString());
				this.props.context.setState({
					response:yes,
					data: {
						status:status,
						err:err.toString()
					}
				});
			}.bind(this)
		
		/* neat little trick to always reset our buttons
		* */	
		}).always(function () {
			
			btn.button('reset');
		});
		
	},
}); 

module.exports = RR;


},{"../common.js":1}],7:[function(require,module,exports){
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
					
					React.createElement("div", {className: "col-xs-6 "}, React.createElement(BootstrapButton, {role: "button", onClick: this.resetemail, ref: "resetbutton", bsStyle: "info", disabled: Common.showButton(this.state.valid), "data-loading-text": "Checking..."}, "  ", Text.btns.resetemail, " ")), 
					
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
		console.log(this.state.form);
		_.each(this.state.form, function(v,k) {
				var el = document.getElementById(v);
				mydata[k] = el.value;
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
				this.props.context.setState({response:yes,data:data,resetform:no,resetcode:yes});
				
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


},{"../common.js":1}],8:[function(require,module,exports){
var React = window.React;
var ReactBootstrap = window.ReactBootstrap;
var Login = require('./forms/login');
var Reg = require('./forms/reg');
var ResetPassword = require('./forms/reset');
var ResetCode = require('./forms/code');
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
		return {
			register: no,
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
		
		if(this.state.resetcode === yes) {
			var ret = React.createElement(ResetCode, {context: this, changeReset: this.changeCode, flash: showflashmessage})
		} else if(this.state.resetform === yes) {
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
			response: no
		});
		return e.preventDefault();
	},
	changeReset: function (e) {
		/* toggle the password reset
		 * */
		this.setState({
			resetform: this.state.resetform === yes ? no : yes,
			response: no
		});
		return e.preventDefault();
	},
	changeCode: function (e) {
		/* toggle the password reset
		 * */
		this.setState({ 
			resetcode: this.state.resetcode === yes ?no : yes,
			response:no
		});
		return e.preventDefault();
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	}
});

module.exports = GLogin;


},{"./common.js":1,"./flash":3,"./forms/code":4,"./forms/login":5,"./forms/reg":6,"./forms/reset":7}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvY29tbW9uLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZmFrZV81ZTUyYWE0NC5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL3Nub3dwaS9qcy9saWIvcmVhY3QvanN4L2ZsYXNoLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvY29kZS5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL3Nub3dwaS9qcy9saWIvcmVhY3QvanN4L2Zvcm1zL2xvZ2luLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvcmVnLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvcmVzZXQuanMiLCIvaG9tZS9zbm93L3Byb2plY3RzL2dpdGh1Yi9rZXlzdG9uZS1ncmVldGVyL3B1YmxpYy9zbm93cGkvanMvbGliL3JlYWN0L2pzeC9ncmVldGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBSSxLQUFL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QUNILE9BQU8sQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0VBQzFCO0FBQ0YsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDM0I7O0VBRUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztHQUNiLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUc7R0FDbEQsUUFBUSxFQUFFLEVBQUU7R0FDWixDQUFDLENBQUM7RUFDSCxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMxQjtBQUNGLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQzFCOztFQUVFLElBQUksQ0FBQyxRQUFRLENBQUM7R0FDYixTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEtBQUssR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHO0dBQ2pELFFBQVEsQ0FBQyxFQUFFO0dBQ1gsQ0FBQyxDQUFDO0VBQ0gsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDMUI7Q0FDRCxZQUFZLEVBQUUsU0FBUyxDQUFDLEVBQUU7RUFDekIsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDMUI7QUFDRixDQUFDLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vKiBtYW4gY29tcG9uZW50XG4gKiBzaW1wbGUgZXhhbXBsZVxuICogKi9cbnZhciBHTWFuID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoe2RpdnN0eWxlOntmbG9hdDoncmlnaHQnLH19KTtcblx0fSxcblx0XG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdCAgICByZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e3RoaXMucHJvcHMuZGl2c3R5bGV9IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBUZXh0LmxvZ29tYW4gfHwgJyd9fSAvPlxuXHQgICAgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzLkdNYW4gPSBHTWFuO1xuXG4vKiBcbiAqIHdlIHVzZSB0aGlzIGZvciB0aGUgY291bnRkb3duIHRpbWVyIGJlZm9yZSB3ZSByZWRpcmVjdCBhIGxvZ2dlZCBcbiAqIGluIHVzZXIuICB5b3UgY2FuIGRpc2FibGUgaXQgXG4gKiBieSBzZW5kaW5nIGEgcmVkaXJlY3QgdGltZSBvZiAwXG4gKiAqL1xudmFyIEdJbnRlcnZhbCA9IHtcblx0ICBpbnRlcnZhbHM6IFtdLFxuXHQgIHNldEludGVydmFsOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcnZhbHMucHVzaChzZXRJbnRlcnZhbC5hcHBseShudWxsLCBhcmd1bWVudHMpKTtcblx0ICB9LFxuXHQgIGNsZWFySW50ZXJ2YWxzOiBmdW5jdGlvbih3aG8pIHtcblx0XHR3aG8gPSB3aG8gLSAxO1xuXHRcdGlmKEdJbnRlcnZhbC5pbnRlcnZhbHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdjbGVhciBhbGwgaW50ZXJ2YWxzJyx0aGlzLmludGVydmFscylcblx0XHRcdEdJbnRlcnZhbC5pbnRlcnZhbHMubWFwKGNsZWFySW50ZXJ2YWwpO1xuXHRcdFx0R0ludGVydmFsLmludGVydmFscyA9IFtdO1xuXHRcdH0gZWxzZSBpZih3aG8gJiYgR0ludGVydmFsLmludGVydmFsc1t3aG9dKSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdjbGVhciBpbnRlcnZhbHMnLHdobyx0aGlzLmludGVydmFsc1t3aG9dKVxuXHRcdFx0Y2xlYXJJbnRlcnZhbChHSW50ZXJ2YWwuaW50ZXJ2YWxzW3dob10pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdtYXAgaW50ZXJ2YWxzJyx0aGlzLmludGVydmFscylcblx0XHRcdEdJbnRlcnZhbC5pbnRlcnZhbHMubWFwKGNsZWFySW50ZXJ2YWwpO1xuXHRcdFx0R0ludGVydmFsLmludGVydmFscyA9IFtdO1xuXHRcdH1cblx0ICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5HSW50ZXJ2YWwgPSBHSW50ZXJ2YWw7XG5cbm1vZHVsZS5leHBvcnRzLnNob3dCdXR0b24gPSBmdW5jdGlvbihpbnB1dHMpIHtcblx0dmFyIHZhbGlkID0gXy5pbmNsdWRlcyhpbnB1dHMsIGZhbHNlKTtcblx0Ly9jb25zb2xlLmxvZygnYnV0dG9uJywgaW5wdXRzLCB2YWxpZCk7XG5cdHJldHVybiB2YWxpZDtcbn1cblxubW9kdWxlLmV4cG9ydHMuc2V0Rm9ybVN0YXRlID0gZnVuY3Rpb24oaW5wdXRzLCB2YWxpZCkge1xuXHR2YXIgcmV0ID0ge307XG5cdHJldC52YWxpZCA9IF8uaXNPYmplY3QodmFsaWQpID8gdmFsaWQgOiB7fTtcblx0cmV0LmZvcm0gPSB7fTtcblx0Xy5lYWNoKGlucHV0cywgZnVuY3Rpb24odikge1xuXHRcdGlmKHYudHlwZSAhPT0gJ2hlYWRlcicpIHJldC5mb3JtW3YuZmllbGRdID0gdi5fbmFtZTtcblx0XHRpZih2LnJlcXVpcmVkICYmICFyZXQudmFsaWRbdi5maWVsZF0pIHtcblx0XHRcdHJldC52YWxpZFt2LmZpZWxkXSA9IGZhbHNlO1xuXHRcdH1cblx0XHRpZih2LmF0dGFjaCkge1xuXHRcdFx0cmV0LmZvcm1bdi5hdHRhY2guZmllbGRdID0gdi5fbmFtZSArICdfYXR0YWNoJztcblx0XHRcdGlmKHYucmVxdWlyZWQgJiYgIXJldC52YWxpZFt2LmF0dGFjaC5maWVsZF0pIHtcblx0XHRcdFx0cmV0LnZhbGlkW3YuYXR0YWNoLmZpZWxkXSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiByZXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzLkZvcm0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblx0XHR2YXIgZm9ybSA9IFtdO1xuXHRcdC8vIHNvcnQgb3V0IG9iamVjdCBvZiBmb3JtIGVsZW1lbnRzIGFuZCBhZGQgdGhlbSB0byBhbiBhcnJheVxuXHRcdGNvbnNvbGUubG9nKHRoaXMucHJvcHMuaW5wdXRzKTtcblx0XHR2YXIgc29ydGVkX2xpc3QgPSBfKHRoaXMucHJvcHMuaW5wdXRzKS5rZXlzKCkuc29ydCgpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHR2YXIgdmFsdWUgPSBfdGhpcy5wcm9wcy5pbnB1dHNba2V5XTtcblx0XHRcdGZvcm0ucHVzaChjb250YWluZXIoa2V5LCB2YWx1ZSwgX3RoaXMucHJvcHMuaW5wdXRzLCBfdGhpcy5wcm9wcy5jb250ZXh0KSk7XG5cdFx0fSkudmFsdWUoKTtcblx0XHRcblx0XHRyZXR1cm4gZm9ybS5sZW5ndGggPT09IDAgPyAoPHNwYW4gLz4pIDogKDxkaXY+e2Zvcm19PC9kaXY+KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzLkZvcm1JbnB1dE9uQ2hhbmdlID0gZnVuY3Rpb24oZXZlbnQsIGZvcm0pIHtcbiAgICAvLyBnZXQgdGhlIGN1cnJlbnQgdmFsdWVcbiAgICB2YXIgY2hhbmdlID0ge1xuXHRcdHZhbGlkOiBfLmNsb25lKHRoaXMuc3RhdGUudmFsaWQpLFxuXHR9O1xuXHRcblx0dmFyIHZhbGlkID0gZmFsc2U7XG5cdHZhciBwYXJlbnQgPSBmYWxzZTtcblx0XG5cdC8vIGlzIHRoaXMgYXR0YWNoZWRcblx0aWYoZXZlbnQudGFyZ2V0LmRhdGFzZXQuZGVwZW5kc29uICE9PSAnZmFsc2UnKSB7XG5cdFx0cGFyZW50ID0gIGZvcm1bZXZlbnQudGFyZ2V0LmRhdGFzZXQuZGVwZW5kc29uXTtcblx0XHR2YXIgaW5wdXQgPSBmb3JtW2V2ZW50LnRhcmdldC5pZF07XG5cdFx0cGFyZW50LkRPTSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcmVudC5fbmFtZSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhldmVudC50YXJnZXQuZGF0YXNldC5kZXBlbmRzb24pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBpbnB1dCA9IGZvcm1bZXZlbnQudGFyZ2V0LmlkXTtcblx0fVxuXHRcblx0aWYoaW5wdXQucmVxdWlyZWQpIHtcdFxuXHRcdGlmKF8uaXNBcnJheShpbnB1dC5yZWdleCkpIHtcblx0XHRcdHZhciByeCA9IG5ldyBSZWdFeHAoaW5wdXQucmVnZXhbMF0saW5wdXQucmVnZXhbMV0pO1xuXHRcdFx0dmFsaWQgPSByeC50ZXN0KGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhbGlkID0gZXZlbnQudGFyZ2V0LnZhbHVlICE9PSAnJztcblx0XHR9XG5cdFx0aWYodmFsaWQgJiYgcGFyZW50ICYmIHBhcmVudC50eXBlID09PSAncGFzc3dvcmQnKSB7XG5cdFx0XHRpZihldmVudC50YXJnZXQudmFsdWUgIT09ICcnICYmIGV2ZW50LnRhcmdldC52YWx1ZSA9PT0gcGFyZW50LkRPTS52YWx1ZSkge1xuXHRcdFx0XHR2YWxpZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHZhbGlkICYmIHBhcmVudCAmJiBwYXJlbnQudHlwZSA9PT0gJ3NlbGVjdCcpIHtcblx0XHRcdGlmKGV2ZW50LnRhcmdldC52YWx1ZSAhPT0gJycgJiYgcGFyZW50LkRPTS52YWx1ZSAhPT0gJycpIHtcblx0XHRcdFx0dmFsaWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRjaGFuZ2UudmFsaWRbaW5wdXQuZmllbGRdID0gdmFsaWQ7XG5cdFx0XG5cdH1cblx0XG5cdC8vY29uc29sZS5sb2coJ2NoYW5nZScsIHZhbGlkLCBjaGFuZ2UpO1xuICAgIHRoaXMuc2V0U3RhdGUoY2hhbmdlKTtcbn1cblxuXG5mdW5jdGlvbiB2YWxpZGF0ZV9jbGFzcyhpbnB1dCwgY29udGV4dCkge1xuXHR2YXIgdmFsaWQgPSBjb250ZXh0LnN0YXRlLnZhbGlkO1xuXHRpZighaW5wdXQucmVxdWlyZWQpIHtcblx0XHRyZXR1cm4gJ2lucHV0LWdyb3VwJztcblx0fSBlbHNlIHtcblx0XHRpZih2YWxpZFtpbnB1dC5maWVsZF0pIHtcblx0XHRcdHJldHVybiAnaW5wdXQtZ3JvdXAnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gJ2lucHV0LWdyb3VwIGhhcy1lcnJvcic7XG5cdFx0fVxuXHR9XG59XG5cblxuZnVuY3Rpb24gaW5wdXQobmFtZSwgb3B0aW9ucywgY29udGV4dCkge1xuXHRcblx0aWYoIV8uaXNPYmplY3Qob3B0aW9ucykpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0XG5cdHZhciB0eXBlID0gb3B0aW9ucy50eXBlO1xuXHR2YXIgZGVwZW5kc09uID0gb3B0aW9ucy5kZXBlbmRzT24gPyBvcHRpb25zLmRlcGVuZHNPbiA6IGZhbHNlO1xuXHRcblx0aWYodHlwZSA9PT0gJ3RleHQnKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPXtvcHRpb25zLl9uYW1lfSAgcmVmcz17b3B0aW9ucy5fbmFtZX0gY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgZGF0YS1kZXBlbmRzb249e2RlcGVuZHNPbn0gIG9uQ2hhbmdlPXtjb250ZXh0Lm9uQ2hhbmdlfSAgIC8+XG5cdFx0KTtcblx0XHRcblx0fSBlbHNlIGlmKHR5cGUgPT09ICdwYXNzd29yZCcpIHtcblx0XHQvLyBhZGQgcGFzc3dvcmQgZmllbGRcblx0XHR2YXIgZGVwZW5kc09uID0gb3B0aW9ucy5kZXBlbmRzT24gPyBvcHRpb25zLmRlcGVuZHNPbiA6IGZhbHNlO1xuXHRcdHJldHVybiAoIFxuXHRcdFx0PGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIGlkPXtvcHRpb25zLl9uYW1lfSBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWRlcGVuZHNvbj17ZGVwZW5kc09ufSAgb25DaGFuZ2U9e2NvbnRleHQub25DaGFuZ2V9ICAvPlxuXHRcdCk7XG5cdFx0XG5cdH0gZWxzZSBpZih0eXBlID09PSAnc2VsZWN0Jykge1xuXHRcdFxuXHRcdHZhciBvdGhlciwgb3B0cztcblx0XHQvLyBidWlsZCB0aGUgb3B0aW9ucyBsaXN0XG5cdFx0aWYoXy5pc0FycmF5KG9wdGlvbnMub3B0aW9ucykpIHtcblx0XHRcdG9wdHMgPSBvcHRpb25zLm9wdGlvbnMubWFwKGZ1bmN0aW9uKG9wKSB7XG5cdFx0XHRcdGlmKF8uaXNTdHJpbmcob3ApKSB7XG5cdFx0XHRcdFx0b3AgPSB7XG5cdFx0XHRcdFx0XHRsYWJlbDpvcCxcblx0XHRcdFx0XHRcdHZhbHVlOm9wXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAoIFxuXHRcdFx0XHRcdDxvcHRpb24ga2V5PXtvcC5sYWJlbH0gdmFsdWU9e29wLnZhbHVlIHx8IG9wLmxhYmVsfT57b3AubGFiZWx9PC9vcHRpb24+XG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dmFyIGRlcGVuZHNPbiA9IG9wdGlvbnMuZGVwZW5kc09uID8gb3B0aW9ucy5kZXBlbmRzT24gOiBmYWxzZTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHNlbGVjdCBpZD17b3B0aW9ucy5fbmFtZX0gY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgZGF0YS1kZXBlbmRzb249e2RlcGVuZHNPbn0gIG9uQ2hhbmdlPXtjb250ZXh0Lm9uQ2hhbmdlfSAgPlxuXHRcdFx0XHR7b3B0c31cblx0XHRcdDwvc2VsZWN0PlxuXHRcdCk7XG5cdFx0XG5cdH0gXG5cdFxufVxuXG5mdW5jdGlvbiBjb250YWluZXIobmFtZSwgb3B0aW9ucywgaW5wdXRzLCBjb250ZXh0KSB7XG5cdFxuXHRpZighXy5pc09iamVjdChvcHRpb25zKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZihvcHRpb25zLmF0dGFjaGVkKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdFxuXHR2YXIgdHlwZSA9IG9wdGlvbnMudHlwZTtcblx0XG5cdGlmKHR5cGUgPT09ICdoZWFkZXInKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYga2V5PXtuYW1lfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wtc20tMTJcIj5cblx0XHRcdFx0XHRcdDxwIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbC1zdGF0aWNcIiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogb3B0aW9ucy5sYWJlbCB8fCAnJ319IC8+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcdFxuXHRcdFxuXHR9IGVsc2Uge1xuXHRcdHZhciB0aGVpbnB1dCA9IGlucHV0KG5hbWUsIG9wdGlvbnMsIGNvbnRleHQpO1xuXHRcdHZhciBhdHRhY2hlZCA9IGZhbHNlO1xuXHRcdGlmKGlucHV0c1tuYW1lICsgJ19hdHRhY2gnXSkge1xuXHRcdFx0YXR0YWNoZWQgPSBpbnB1dChuYW1lICsgJ19hdHRhY2gnLCBpbnB1dHNbbmFtZSArICdfYXR0YWNoJ10sIGNvbnRleHQpO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgY2xhcyA9IHZhbGlkYXRlX2NsYXNzKG9wdGlvbnMsIGNvbnRleHQpO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYga2V5PXtuYW1lfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzfT5cdFx0XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cImlucHV0LWdyb3VwLWFkZG9uXCIgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBvcHRpb25zLmxhYmVsIHx8ICcnfX0gLz4gXG5cdFx0XHRcdHt0aGVpbnB1dH1cblx0XHRcdFx0e2F0dGFjaGVkfVxuXHRcdFx0PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBBcHAgPSByZXF1aXJlKCcuL2dyZWV0ZXIuanMnKTtcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdC8vY29uc29sZS5sb2coJ3JlYWN0JyxSZWFjdCk7XG5cdC8qIHN0YXJ0IG91ciBhcHAgYWZ0ZXIgdGhlIHBhZ2UgaXMgcmVhZHkgKi8gXHRcblx0UmVhY3QucmVuZGVyKDxBcHAgIC8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc25vd3BpJykpO1xuXG59KTtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcblxuLyogY3JlYXRlIGZsYXNoIG1lc3NhZ2UgXG4gKiAqL1xudmFyIEZsYXNoID0gUmVhY3RCb290c3RyYXAuQWxlcnQ7XG5cbnZhciBHRmxhc2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlzVmlzaWJsZTogdHJ1ZVxuXHRcdH07XG5cdH0sXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICh7c2hvd2NsYXNzOidpbmZvJ30pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdGlmKCF0aGlzLnN0YXRlLmlzVmlzaWJsZSlcblx0XHQgICAgcmV0dXJuIG51bGw7XG5cblx0XHR2YXIgbWVzc2FnZSA9IHRoaXMucHJvcHMuY2hpbGRyZW47XG5cdFx0cmV0dXJuIChcblx0XHQgICAgPEZsYXNoIGJzU3R5bGU9e3RoaXMucHJvcHMuc2hvd2NsYXNzfSBvbkRpc21pc3M9e3RoaXMuZGlzbWlzc0ZsYXNofT5cblx0XHRcdDxwPnttZXNzYWdlfTwvcD5cblx0XHQgICAgPC9GbGFzaD5cblx0XHQpO1xuXHR9LFxuXHQvKiBtYWtlIHN1cmUgdGhlIHVzZXIgY2FuIGNhbmNlbCBhbnkgcmVkaXJlY3RzIGJ5IGNsZWFyaW5nIHRoZSBmbGFzaCBtZXNzYWdlXG5cdCAqICovXG5cdGRpc21pc3NGbGFzaDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7aXNWaXNpYmxlOiBmYWxzZX0pO1xuXHRcdGlmKHRoaXMucHJvcHMuY2xlYXJpbnRlcnZhbHMgaW5zdGFuY2VvZiBBcnJheSl0aGlzLnByb3BzLmNsZWFyaW50ZXJ2YWxzLm1hcChHSW50ZXJ2YWwuY2xlYXJJbnRlcnZhbHMpO1xuXHRcdGlmKHRoaXMucHJvcHMuY2xlYXJ0aW1lb3V0cyBpbnN0YW5jZW9mIEFycmF5KXRoaXMucHJvcHMuY2xlYXJ0aW1lb3V0cy5tYXAoY2xlYXJUaW1lb3V0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR0ZsYXNoO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUZXh0ID0gSlNPTi5wYXJzZShyZXF1aXJlKCd0ZXh0JykpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi5qcycpO1xudmFyIFJlYWN0Qm9vdHN0cmFwID0gcmVxdWlyZSgncmVhY3QtYm9vdHN0cmFwJyk7XG52YXIgQm9vdHN0cmFwQnV0dG9uID0gUmVhY3RCb290c3RyYXAuQnV0dG9uO1xudmFyIHllcyA9ICd5ZXMnLCBubyA9ICdubyc7XG4vL3ZhciB5ZXMgPSB0cnVlLCBubyA9IGZhbHNlO1xuXG52YXIgUmVzZXRQYXNzd29yZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zOiBbUmVhY3QuYWRkb25zLkxpbmtlZFN0YXRlTWl4aW5dLFxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnNldEZvcm1TdGF0ZSgpO1xuXHR9LFxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFN0YXRlKHRoaXMuc2V0Rm9ybVN0YXRlKHRoaXMuc3RhdGUudmFsaWQpKTtcblx0fSxcblx0c2V0Rm9ybVN0YXRlOiBmdW5jdGlvbih2YWxpZCkge1xuXHRcdHZhciByZXQgPSBDb21tb24uc2V0Rm9ybVN0YXRlKFRleHQucmVzZXRjb2RlLCB2YWxpZCk7XG5cdFx0cmV0Lm5hbWUgPSAncmVzZXQnO1xuXHRcdHJldHVybiByZXQ7XG5cdH0sXG5cdGhhbmRsZVN1Ym1pdDogZnVuY3Rpb24oZSkge1xuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG5cdFx0Q29tbW9uLkZvcm1JbnB1dE9uQ2hhbmdlLmNhbGwodGhpcywgZSwgVGV4dC5yZXNldGNvZGUpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICg8Zm9ybSAgcmVmPSdyZXNldGNvZGUnICBjbGFzc05hbWU9XCJjb2RlLWZvcm1cIiAgb25TdWJtaXQ9e3RoaXMuaGFuZGxlU3VibWl0fSA+XG5cdFx0XHRcdDxoMj57VGV4dC5ob21lLnJlc2V0Y29kZX0gPENvbW1vbi5HTWFuIC8+PC9oMj5cblx0XHRcdFx0e3RoaXMucHJvcHMuZmxhc2h9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PENvbW1vbi5Gb3JtIGlucHV0cz17VGV4dC5yZXNldGNvZGV9IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiICA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5yZXNldGVtYWlsfSByZWY9XCJyZXNldGJ1dHRvblwiIGJzU3R5bGU9J2luZm8nIGRpc2FibGVkPXtDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0gIGRhdGEtbG9hZGluZy10ZXh0PVwiQ2hlY2tpbmcuLi5cIiA+ICB7VGV4dC5idG5zLnJlc2V0Y29kZX0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgc3R5bGU9e3t0ZXh0QWxpZ246J3JpZ2h0J319ID48Qm9vdHN0cmFwQnV0dG9uIG9uQ2xpY2s9e3RoaXMucHJvcHMuY2hhbmdlUmVzZXR9ICBic1N0eWxlPSdkZWZhdWx0Jz4gIHtUZXh0LmJ0bnMubG9naW5jdXJyZW50fSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48L2Rpdj5cblx0XHRcdDwvZm9ybT4pO1xuXHRcdFx0XG5cdH0sXG5cdHJlc2V0ZW1haWw6IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHZhbGlkYXRpb24gb2NjdXJzIGFzIGlucHV0IGlzIHJlY2VpdmVkIFxuXHRcdCAqIHRoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIGF2aWFsYWJsZSBpZlxuXHRcdCAqIGFsbCB2YWxpZGF0aW9uIGlzIGFscmVhZHkgbWV0IHNvIGp1c3QgcnVuXG5cdFx0ICogKi9cblx0XHR2YXIgbXlkYXRhID0ge2NvZGU6J3llcyd9O1xuXHRcdF8uZWFjaCh0aGlzLnN0YXRlLmZvcm0sIGZ1bmN0aW9uKHYsaykge1xuXHRcdFx0aWYodi50eXBlICE9PSAnaGVhZGVyJykge1xuXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2KTtcblx0XHRcdFx0bXlkYXRhW2tdID0gZWwudmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRpZih2LmF0dGFjaCkge1xuXHRcdFx0XHR2YXIgZWxBID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodiArICdfYXR0YWNoJyk7XG5cdFx0XHRcdG15ZGF0YVt2LmF0dGFjaC5maWVsZF0gPSBlbEEudmFsdWU7XHRcblx0XHRcdH1cblx0XHR9LHRoaXMpO1xuXHRcdG15ZGF0YVtpc0tleV0gPSBpc01lO1xuXHRcdHZhciBidG4gPSAkKHRoaXMucmVmcy5yZXNldGJ1dHRvbi5nZXRET01Ob2RlKCkpXG5cdFx0YnRuLmJ1dHRvbignbG9hZGluZycpXG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogVGV4dC5yZXNldGVtYWlsLFxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0ZGF0YTogbXlkYXRhLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1x0XG5cdFx0XHRcdGZ1bmN0aW9uIG1lc3NhZ2UoKSB7XG5cdFx0XHRcdFx0ZGF0YS5tZXNzYWdlID0gJ1N1Y2Nlc3MnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGZsYXNoIG1lc3NhZ2VzIGFyZSBzaG93biB3aXRoIHJlc3BvbnNlIDogeWVzXG5cdFx0XHRcdCAqICovXHRcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMsZGF0YTpkYXRhLHJlc2V0Y29kZTpub30pO1xuXHRcdFx0XHRcblx0XHRcdH0uYmluZCh0aGlzKSxcblx0XHRcdFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5wcm9wcy51cmwsIHN0YXR1cywgZXJyLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe3Jlc3BvbnNlOnllcyxyZXNldGZvcm06eWVzLHJlc2V0Y29kZTpubyxkYXRhOiB7c3RhdHVzOnN0YXR1cyxlcnI6ZXJyLnRvU3RyaW5nKCl9IH0pO1xuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0XG5cdFx0LyogYWx3YXlzIHJlc2V0IG91ciBidXR0b25zXG5cdFx0KiAqL1x0XG5cdFx0fSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcblx0XHRcdFxuXHRcdFx0YnRuLmJ1dHRvbigncmVzZXQnKTtcblx0XHR9KTtcblx0XHRcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzZXRQYXNzd29yZDtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24uanMnKTtcbnZhciBHSW50ZXJ2YWwgPSBDb21tb24uR0ludGVydmFsO1xudmFyIEdGbGFzaCA9IHJlcXVpcmUoJy4uL2ZsYXNoJyk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIFJlYWN0Qm9vdHN0cmFwID0gcmVxdWlyZSgncmVhY3QtYm9vdHN0cmFwJyk7XG52YXIgQm9vdHN0cmFwQnV0dG9uID0gUmVhY3RCb290c3RyYXAuQnV0dG9uO1xudmFyIHllcyA9ICd5ZXMnLCBubyA9ICdubyc7XG4vL3ZhciB5ZXMgPSB0cnVlLCBubyA9IGZhbHNlO1xuXG52YXIgTG9naW4gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG1peGluczogW1JlYWN0LmFkZG9ucy5MaW5rZWRTdGF0ZU1peGluXSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRGb3JtU3RhdGUoKTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLnNldEZvcm1TdGF0ZSh0aGlzLnN0YXRlLnZhbGlkKSk7XG5cdH0sXG5cdHNldEZvcm1TdGF0ZTogZnVuY3Rpb24odmFsaWQpIHtcblx0XHR2YXIgcmV0ID0gQ29tbW9uLnNldEZvcm1TdGF0ZShUZXh0LmxvZ2luLCB2YWxpZCk7XG5cdFx0cmV0Lm5hbWUgPSAnbG9naW4nO1xuXHRcdHJldHVybiByZXQ7IFxuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuXHRcdENvbW1vbi5Gb3JtSW5wdXRPbkNoYW5nZS5jYWxsKHRoaXMsIGUsIFRleHQubG9naW4pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdC8qIGlmIHJlc3BvbnNlIHN0YXRlIGlzIHllcyB3ZSBoYXZlIGEgZmxhc2ggbWVzc2FnZSB0byBzaG93XG5cdFx0ICogdGhlIG1lc3NhZ2UgaXMgaW4gZGF0YVxuXHRcdCAqICovXG5cdFx0aWYodGhpcy5zdGF0ZS5yZXNwb25zZSA9PT0geWVzKSB7XG5cdFx0XHRcblx0XHRcdHZhciBwaWNrY2xhc3MgPSAodGhpcy5zdGF0ZS5kYXRhLnN1Y2Nlc3MgPT09IHllcyApID8gJ3N1Y2Nlc3MnIDogJ3dhcm5pbmcnOyBcblx0XHRcdFxuXHRcdFx0c2hvd2ZsYXNobWVzc2FnZSA9IDxHRmxhc2ggc2hvd2NsYXNzPXtwaWNrY2xhc3N9IGNsZWFydGltZW91dHM9e1tHSW50ZXJ2YWwudGltZW91dF19IGNsZWFyaW50ZXJ2YWxzPXtbR0ludGVydmFsLnJlZGlyZWN0XX0+PGRpdiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogdGhpcy5zdGF0ZS5kYXRhLm1lc3NhZ2UgfHwgJyd9fSAvPjwvR0ZsYXNoID47XG5cdFx0XHRcblx0XHRcdC8qIGlmIHdlIGhhdmUgYW4gZXJyb3Igc2hha2UgdGhlIGZvcm0uICB0aGlzIGlzIGRvbmUgd2l0aCB0aGVcblx0XHRcdCAqIGhhcy1lcnJvcnMgY2xhc3Ncblx0XHRcdCAqICovXG5cdFx0XHRpZih0aGlzLnN0YXRlLmRhdGEuc3VjY2VzcyA9PT0gbm8pIGhhc2Vycm9yID0gJyBoYXMtZXJyb3JzJztcblx0XHRcdFxuXHRcdH1cdFx0XHRcblx0XHRcdHJldHVybiAoPGZvcm0gIHJlZj0nc2lnbmluJyAgY2xhc3NOYW1lPVwic2lnbmluLWZvcm1cIiAgb25TdWJtaXQ9e3RoaXMuaGFuZGxlU3VibWl0fSA+XG5cdFx0XHRcdDxoMj57VGV4dC5ob21lLmxvZ2lufSA8L2gyPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5mbGFzaH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8Q29tbW9uLkZvcm0gaW5wdXRzPXtUZXh0LmxvZ2lufSBjb250ZXh0PXt0aGlzfSAvPlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiAgPjxCb290c3RyYXBCdXR0b24gcm9sZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMubG9naW59ICBic1N0eWxlPSdpbmZvJyBkaXNhYmxlZD17Q29tbW9uLnNob3dCdXR0b24odGhpcy5zdGF0ZS52YWxpZCl9PiAge1RleHQuYnRucy5sb2dpbn0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgc3R5bGU9e3t0ZXh0QWxpZ246J3JpZ2h0J319ID48Qm9vdHN0cmFwQnV0dG9uIG9uQ2xpY2s9e3RoaXMucHJvcHMuc2hvd3JlZ2lzdGVyfSAgYnNTdHlsZT0nd2FybmluZyc+ICB7VGV4dC5idG5zLnJlZ2lzdGVyfSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy1vZmZzZXQtNiBjb2wteHMtNiBcIiBzdHlsZT17e3RleHRBbGlnbjoncmlnaHQnLCBwYWRkaW5nVG9wOjEwfX0gPjxCb290c3RyYXBCdXR0b24gcm9sZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucHJvcHMuY2hhbmdlUmVzZXR9ICBic1N0eWxlPSdkZWZhdWx0JyA+ICB7VGV4dC5idG5zLnJlc2V0fSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48L2Rpdj5cblx0XHRcdDwvZm9ybT4pO1xuXHRcdFx0XG5cdH0sXG5cdGxvZ2luOiBmdW5jdGlvbigpIHtcblx0XHQvKiBzYW1lIGFzIHJlZ2lzdGVyIGJ1dCBsZXNzIGluZm8gc2VudFxuXHRcdCAqIHlvdSBjb3VsZCBjb21iaW5lIHRoZW0gYm90aCBpZiB5b3UgbGlrZSBsZXNzIGNvZGVcblx0XHQgKiAqL1xuXHRcdHZhciBteWRhdGEgPSB7bG9naW46J3llcyd9O1xuXHRcdC8vY29uc29sZS5sb2coJ2Zvcm0nLCB0aGlzLnN0YXRlLmZvcm0sIFRleHQubG9naW4gKTtcblx0XHRfLmVhY2godGhpcy5zdGF0ZS5mb3JtLCBmdW5jdGlvbih2LGspIHtcblx0XHRcdGlmKHYudHlwZSAhPT0gJ2hlYWRlcicpIHtcblx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodik7XG5cdFx0XHRcdG15ZGF0YVtrXSA9IGVsLnZhbHVlO1xuXHRcdFx0fVxuXHRcdH0sdGhpcyk7IFxuXHRcdG15ZGF0YVtpc0tleV0gPSBpc01lO1xuXHRcdC8vY29uc29sZS5sb2coJ215ZGF0YScsIG15ZGF0YSwgJ1RleHQnLCBUZXh0LmxvZ2luICk7XG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogVGV4dC5yZWxheSxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdGRhdGE6IG15ZGF0YSxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0ZnVuY3Rpb24gbWVzc2FnZSgpIHtcblx0XHRcdFx0XHR2YXIgc2VjcyA9IChkYXRhLnJlZGlyZWN0LndoZW4gLSBycnIpIC8gMTAwMDtcblx0XHRcdFx0XHRycnIrPTEwMDA7XG5cdFx0XHRcdFx0ZGF0YS5tZXNzYWdlID0gZGF0YS5yZXBlYXRlciArICc8YnIgLz5Zb3Ugd2lsbCBiZSByZWRpcmVjdGVkIHRvIDxhIGhyZWY9XCInICsgZGF0YS5yZWRpcmVjdC5wYXRoICsgJ1wiPicgKyBkYXRhLnJlZGlyZWN0LnBhdGguc3Vic3RyKDEpICsgJzwvYT4gICc7XG5cdFx0XHRcdFx0ZGF0YS5tZXNzYWdlICs9IHNlY3MgPT09IDAgPyAnIG5vdyc6JyBpbiAnICsgc2VjcyArICcgc2Vjb25kcy4nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKHR5cGVvZiBkYXRhLnJlZGlyZWN0ID09PSAnb2JqZWN0JyAmJiBkYXRhLnJlZGlyZWN0LndoZW4gPiAxMDAwKSB7XG5cdFx0XHRcdFx0ZGF0YS5yZXBlYXRlciA9IGRhdGEubWVzc2FnZTtcblx0XHRcdFx0XHR2YXIgcnJyID0gMTAwMFxuXHRcdFx0XHRcdFx0X3NlbGYgPSB0aGlzLnByb3BzLmNvbnRleHQ7XG5cdFx0XHRcdFx0R0ludGVydmFsLnJlZGlyZWN0ID0gR0ludGVydmFsLnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0bWVzc2FnZSgpO1xuXHRcdFx0XHRcdFx0X3NlbGYuc2V0U3RhdGUoe3Jlc3BvbnNlOnllcyxkYXRhOmRhdGF9KTtcblx0XHRcdFx0XHR9LDEwMDApO1xuXHRcdFx0XHRcdEdJbnRlcnZhbC50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0R0ludGVydmFsLmNsZWFySW50ZXJ2YWxzKEdJbnRlcnZhbC5yZWRpcmVjdCk7XG5cdFx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGRhdGEucmVkaXJlY3QucGF0aDtcblx0XHRcdFx0XHR9LGRhdGEucmVkaXJlY3Qud2hlbik7XG5cdFx0XHRcdFx0bWVzc2FnZSgpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZih0eXBlb2YgZGF0YS5yZWRpcmVjdCA9PT0gJ29iamVjdCcgJiYgZGF0YS5yZWRpcmVjdC5wYXRoKXtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGRhdGEucmVkaXJlY3QucGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtcblx0XHRcdFx0XHRyZXNwb25zZTogeWVzLFxuXHRcdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdFx0fSk7XG5cdFx0XHR9LmJpbmQodGhpcyksXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdHJlc3BvbnNlOnllcyxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRzdGF0dXM6c3RhdHVzLFxuXHRcdFx0XHRcdFx0ZXJyOmVyci50b1N0cmluZygpXG5cdFx0XHRcdFx0fSBcblx0XHRcdFx0fSk7XG5cdFx0XHR9LmJpbmQodGhpcylcblx0XHR9KTtcdFx0XG5cdH1cbn0pOyBcblxubW9kdWxlLmV4cG9ydHMgPSBMb2dpbjtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24uanMnKTtcbnZhciBHSW50ZXJ2YWwgPSBDb21tb24uR0ludGVydmFsO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIEJvb3RzdHJhcEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkJ1dHRvbjtcbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxudmFyIFJSID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5yZWdpc3RlciwgdmFsaWQpO1xuXHRcdHJldC5uYW1lID0gJ3JlZ2lzdGVyJztcblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuXHRcdENvbW1vbi5Gb3JtSW5wdXRPbkNoYW5nZS5jYWxsKHRoaXMsIGUsIFRleHQucmVnaXN0ZXIpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICg8Zm9ybSAgcmVmPSdzaWduaW4nICBjbGFzc05hbWU9XCJzaWduaW4tZm9ybVwiICAgb25TdWJtaXQ9e3RoaXMuaGFuZGxlU3VibWl0fT5cblx0XHRcdFx0PGgyPntUZXh0LmhvbWUucmVnaXN0ZXJ9IDxDb21tb24uR01hbiAvPjwvaDI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmZsYXNofVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQucmVnaXN0ZXJ9IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidsZWZ0J319ID48Qm9vdHN0cmFwQnV0dG9uIG9uQ2xpY2s9e3RoaXMucmVnaXN0ZXJ9IHJlZj1cInJlZ2lzdGVyYnV0dG9uXCIgZGF0YS1sb2FkaW5nLXRleHQ9XCJSZWdpc3RlcmluZy4uLlwiIHJvbGU9XCJidXR0b25cIiAgYnNTdHlsZT0nd2FybmluZycgY2xhc3NOYW1lPVwiYnRuICBidG4td2FybmluZ1wiICBkaXNhYmxlZD17Q29tbW9uLnNob3dCdXR0b24odGhpcy5zdGF0ZS52YWxpZCl9PiAge1RleHQuYnRucy5yZWdpc3Rlcn0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgICBzdHlsZT17e3RleHRBbGlnbjoncmlnaHQnfX0gPjxCb290c3RyYXBCdXR0b24gcm9sZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucHJvcHMuc2hvd3JlZ2lzdGVyfSAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0XCI+ICB7VGV4dC5idG5zLmxvZ2luY3VycmVudH0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48L2Rpdj5cblx0XHRcdDwvZm9ybT4pO1xuXHR9LFxuXHRyZWdpc3RlcjogZnVuY3Rpb24oKSB7XG5cdFx0LyogdmFsaWRhdGlvbiBvY2N1cnMgYXMgaW5wdXQgaXMgcmVjZWl2ZWQgXG5cdFx0ICogdGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgYXZpYWxhYmxlIGlmXG5cdFx0ICogYWxsIHZhbGlkYXRpb24gaXMgYWxyZWFkeSBtZXQgc28ganVzdCBydW5cblx0XHQgKiAqL1xuXHRcdGNvbnNvbGUubG9nKCdmb3JtJywgdGhpcy5zdGF0ZS5mb3JtLCAnVGV4dCcsIFRleHQucmVnaXN0ZXIgKTsgXG5cdFx0dmFyIG15ZGF0YSA9IHsgcmVnaXN0ZXI6ICd5ZXMnIH07XG5cdFx0Xy5lYWNoKHRoaXMuc3RhdGUuZm9ybSwgZnVuY3Rpb24odixrKSB7XG5cdFx0XHRpZih2LnR5cGUgIT09ICdoZWFkZXInKSB7XG5cdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHYpO1xuXHRcdFx0XHRteWRhdGFba10gPSBlbC52YWx1ZTtcblx0XHRcdH1cblx0XHR9LHRoaXMpOyBcblx0XHRteWRhdGFbaXNLZXldID0gaXNNZTtcblx0XHRjb25zb2xlLmxvZygnbXlkYXRhJywgbXlkYXRhLCAnVGV4dCcsIFRleHQucmVnaXN0ZXIgKTtcblx0XHR2YXIgYnRuID0gJCh0aGlzLnJlZnMucmVnaXN0ZXJidXR0b24uZ2V0RE9NTm9kZSgpKVxuXHRcdGJ0bi5idXR0b24oJ2xvYWRpbmcnKVxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IFRleHQucmVsYXksXG5cdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRkYXRhOiBteWRhdGEsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRmdW5jdGlvbiBtZXNzYWdlKCkge1xuXHRcdFx0XHRcdHZhciBzZWNzID0gKGRhdGEucmVkaXJlY3Qud2hlbiAtIHJycikgLyAxMDAwO1xuXHRcdFx0XHRcdHJycis9MTAwMDtcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UgPSBkYXRhLnJlcGVhdGVyICsgJzxiciAvPllvdSB3aWxsIGJlIHJlZGlyZWN0ZWQgdG8gPGEgaHJlZj1cIicgKyBkYXRhLnJlZGlyZWN0LnBhdGggKyAnXCI+JyArIGRhdGEucmVkaXJlY3QucGF0aC5zdWJzdHIoMSkgKyAnPC9hPiAgJztcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UrPSBzZWNzID09PSAwID8gJyBub3cnOicgaW4gJyArIHNlY3MgKyAnIHNlY29uZHMuJztcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBpZiB3ZSBnZXQgYSByZWRpcmVjdCBjaGVjayB0aGUgdGltZSBhbmQgcnVuIGFuIGludGVydmFsXG5cdFx0XHRcdCAqIHRoaXMgaXMgcmVhbGx5IGp1c3QgdG8gc2hvdyBSZWFjdCB3b3JrXG5cdFx0XHRcdCAqICovXHRcblx0XHRcdFx0aWYodHlwZW9mIGRhdGEucmVkaXJlY3QgPT09ICdvYmplY3QnICYmIGRhdGEucmVkaXJlY3Qud2hlbj4xMDAwKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0ZGF0YS5yZXBlYXRlciA9IGRhdGEubWVzc2FnZTsgLy9rZWVwIG91ciBvcmlnaW5hbCBtZXNzYWdlIGZvciB0aGUgcmVwZWF0ZXJcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR2YXIgcnJyID0gMTAwMFxuXHRcdFx0XHRcdFx0X3NlbGYgPSB0aGlzLnByb3BzLmNvbnRleHQ7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0U25vd3BpSW50ZXJ2YWwucmVkaXJlY3QgPSBTbm93cGlJbnRlcnZhbC5zZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdC8qIHRoaXMgaXMgcmVhbGx5IHNpbXBsZVxuXHRcdFx0XHRcdFx0ICoganVzdCByZWNhY3VsYXRlIHRoZSBtZXNzYWdlIGFuZCBsZXQgcmVhY3QgZG8gdGhlIHJlc3Rcblx0XHRcdFx0XHRcdCAqICovXG5cdFx0XHRcdFx0XHRtZXNzYWdlKCk7XG5cdFx0XHRcdFx0XHRfc2VsZi5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0XHRcdHJlc3BvbnNlOiB5ZXMsXG5cdFx0XHRcdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0sMTAwMCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Lyoga2lsbCB0aGUgaW50ZXJ2YWwgYW5kIHJlZGlyZWN0IG9uIHRoZSB0aW1lb3V0IFxuXHRcdFx0XHRcdCAqICovXG5cdFx0XHRcdFx0R0ludGVydmFsLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRHSW50ZXJ2YWwuY2xlYXJJbnRlcnZhbHMoR0ludGVydmFsLnJlZGlyZWN0KTtcblx0XHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gZGF0YS5yZWRpcmVjdC5wYXRoO1xuXHRcdFx0XHRcdH0sZGF0YS5yZWRpcmVjdC53aGVuKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRtZXNzYWdlKClcblx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSBpZih0eXBlb2YgZGF0YS5yZWRpcmVjdCA9PT0gJ29iamVjdCcgJiYgZGF0YS5yZWRpcmVjdC5wYXRoKXtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGRhdGEucmVkaXJlY3QucGF0aDtcblx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8qIGZsYXNoIG1lc3NhZ2VzIGFyZSBzaG93biB3aXRoIHJlc3BvbnNlIDogeWVzXG5cdFx0XHRcdCAqICovXHRcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtcblx0XHRcdFx0XHRyZXNwb25zZTogeWVzLFxuXHRcdFx0XHRcdGRhdGE6IGRhdGFcblx0XHRcdFx0fSk7XG5cdFx0XHRcdFxuXHRcdFx0fS5iaW5kKHRoaXMpLFxuXHRcdFx0XG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLnByb3BzLnVybCwgc3RhdHVzLCBlcnIudG9TdHJpbmcoKSk7XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0cmVzcG9uc2U6eWVzLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdHN0YXR1czpzdGF0dXMsXG5cdFx0XHRcdFx0XHRlcnI6ZXJyLnRvU3RyaW5nKClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0XG5cdFx0LyogbmVhdCBsaXR0bGUgdHJpY2sgdG8gYWx3YXlzIHJlc2V0IG91ciBidXR0b25zXG5cdFx0KiAqL1x0XG5cdFx0fSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcblx0XHRcdFxuXHRcdFx0YnRuLmJ1dHRvbigncmVzZXQnKTtcblx0XHR9KTtcblx0XHRcblx0fSxcbn0pOyBcblxubW9kdWxlLmV4cG9ydHMgPSBSUjtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24uanMnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIEJvb3RzdHJhcEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkJ1dHRvbjtcbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxudmFyIFJlc2V0UGFzc3dvcmQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG1peGluczogW1JlYWN0LmFkZG9ucy5MaW5rZWRTdGF0ZU1peGluXSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRGb3JtU3RhdGUoKTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLnNldEZvcm1TdGF0ZSh0aGlzLnN0YXRlLnZhbGlkKSk7XG5cdH0sXG5cdHNldEZvcm1TdGF0ZTogZnVuY3Rpb24odmFsaWQpIHtcblx0XHR2YXIgcmV0ID0gQ29tbW9uLnNldEZvcm1TdGF0ZShUZXh0LnJlc2V0LCB2YWxpZCk7XG5cdFx0cmV0Lm5hbWUgPSAncmVzZXQnO1xuXHRcdHJldHVybiByZXQ7XG5cdH0sXG5cdGhhbmRsZVN1Ym1pdDogZnVuY3Rpb24oZSkge1xuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG5cdFx0Q29tbW9uLkZvcm1JbnB1dE9uQ2hhbmdlLmNhbGwodGhpcywgZSwgVGV4dC5yZXNldCk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKDxmb3JtICByZWY9J3NpZ25pbicgIGNsYXNzTmFtZT1cInNpZ25pbi1mb3JtXCIgIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0gPlxuXHRcdFx0XHQ8aDI+e1RleHQuaG9tZS5yZXNldH0gPENvbW1vbi5HTWFuIC8+PC9oMj5cblx0XHRcdFx0e3RoaXMucHJvcHMuZmxhc2h9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PENvbW1vbi5Gb3JtIGlucHV0cz17VGV4dC5yZXNldH0gY29udGV4dD17dGhpc30gLz5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgID48Qm9vdHN0cmFwQnV0dG9uIHJvbGU9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLnJlc2V0ZW1haWx9IHJlZj1cInJlc2V0YnV0dG9uXCIgYnNTdHlsZT0naW5mbycgZGlzYWJsZWQ9e0NvbW1vbi5zaG93QnV0dG9uKHRoaXMuc3RhdGUudmFsaWQpfSAgZGF0YS1sb2FkaW5nLXRleHQ9XCJDaGVja2luZy4uLlwiID4gIHtUZXh0LmJ0bnMucmVzZXRlbWFpbH0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgc3R5bGU9e3t0ZXh0QWxpZ246J3JpZ2h0J319ID48Qm9vdHN0cmFwQnV0dG9uIG9uQ2xpY2s9e3RoaXMucHJvcHMuY2hhbmdlUmVzZXR9ICBic1N0eWxlPSdkZWZhdWx0Jz4gIHtUZXh0LmJ0bnMubG9naW5jdXJyZW50fSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48L2Rpdj5cblx0XHRcdDwvZm9ybT4pO1xuXHRcdFx0XG5cdH0sXG5cdHJlc2V0ZW1haWw6IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHZhbGlkYXRpb24gb2NjdXJzIGFzIGlucHV0IGlzIHJlY2VpdmVkIFxuXHRcdCAqIHRoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIGF2aWFsYWJsZSBpZlxuXHRcdCAqIGFsbCB2YWxpZGF0aW9uIGlzIGFscmVhZHkgbWV0IHNvIGp1c3QgcnVuXG5cdFx0ICogKi9cblx0XHR2YXIgbXlkYXRhID0ge3Jlc2V0Oid5ZXMnfTtcblx0XHRjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmZvcm0pO1xuXHRcdF8uZWFjaCh0aGlzLnN0YXRlLmZvcm0sIGZ1bmN0aW9uKHYsaykge1xuXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2KTtcblx0XHRcdFx0bXlkYXRhW2tdID0gZWwudmFsdWU7XG5cdFx0fSx0aGlzKTtcblx0XHRteWRhdGFbaXNLZXldID0gaXNNZTtcblx0XHR2YXIgYnRuID0gJCh0aGlzLnJlZnMucmVzZXRidXR0b24uZ2V0RE9NTm9kZSgpKVxuXHRcdGJ0bi5idXR0b24oJ2xvYWRpbmcnKVxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IFRleHQucmVzZXRlbWFpbCxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdGRhdGE6IG15ZGF0YSxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcdFxuXHRcdFx0XHRmdW5jdGlvbiBtZXNzYWdlKCkge1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSA9ICdTdWNjZXNzJztcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBmbGFzaCBtZXNzYWdlcyBhcmUgc2hvd24gd2l0aCByZXNwb25zZSA6IHllc1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLGRhdGE6ZGF0YSxyZXNldGZvcm06bm8scmVzZXRjb2RlOnllc30pO1xuXHRcdFx0XHRcblx0XHRcdH0uYmluZCh0aGlzKSxcblx0XHRcdFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5wcm9wcy51cmwsIHN0YXR1cywgZXJyLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe3Jlc3BvbnNlOnllcyxyZXNldGZvcm06bm8sZGF0YToge3N0YXR1czpzdGF0dXMsZXJyOmVyci50b1N0cmluZygpfSB9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdFxuXHRcdC8qIGFsd2F5cyByZXNldCBvdXIgYnV0dG9uc1xuXHRcdCogKi9cdFxuXHRcdH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcblx0XHRcdGJ0bi5idXR0b24oJ3Jlc2V0Jyk7XG5cdFx0fSk7XG5cdFx0XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2V0UGFzc3dvcmQ7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFJlYWN0Qm9vdHN0cmFwID0gcmVxdWlyZSgncmVhY3QtYm9vdHN0cmFwJyk7XG52YXIgTG9naW4gPSByZXF1aXJlKCcuL2Zvcm1zL2xvZ2luJyk7XG52YXIgUmVnID0gcmVxdWlyZSgnLi9mb3Jtcy9yZWcnKTtcbnZhciBSZXNldFBhc3N3b3JkID0gcmVxdWlyZSgnLi9mb3Jtcy9yZXNldCcpO1xudmFyIFJlc2V0Q29kZSA9IHJlcXVpcmUoJy4vZm9ybXMvY29kZScpO1xudmFyIEdGbGFzaCA9IHJlcXVpcmUoJy4vZmxhc2gnKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbi5qcycpO1xudmFyIEdJbnRlcnZhbCA9IENvbW1vbi5HSW50ZXJ2YWw7XG52YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcblxuLyoqXG4gKiB1c2UgeWVzIGZvciB0cnVlXG4gKiB1c2Ugbm8gZm9yIGZhbHNlXG4gKiBcbiAqIHRoaXMgc2luZ2xlIGFwcCB1c2VzIHRoZSB5ZXMvbm8gdmFyIHNvIGlmIHlvdSB3YW50IHlvdSBjYW4gc3dpdGNoIGJhY2sgdG8gdHJ1ZS9mYWxzZVxuICogXG4gKiAqL1xudmFyIHllcyA9ICd5ZXMnLCBubyA9ICdubyc7XG4vL3ZhciB5ZXMgPSB0cnVlLCBubyA9IGZhbHNlO1xuXG4vKiB0aGlzIGlzIG91ciBtYWluIGNvbXBvbmVudFxuICogc2luY2UgdGhpcyBpcyBhIHNpbmdsZSBmdW5jdGlvbiBhcHAgd2Ugd2lsbCBjYWxsIHRoaXMgZGlyZWN0bHlcbiAqIFxuICogdG8gaW5jbHVkZSB0aGlzIGluIHlvdXIgUmVhY3Qgc2V0dXAgbW9kaWZ5IGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMgdG8gcmVjaWV2ZSBhbnkgZGVmYXVsdCB2YWx1ZXMgXG4gKiBcbiAqICovXG5cbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG5cbnZhciBHTG9naW4gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG1peGluczogW1JlYWN0LmFkZG9ucy5MaW5rZWRTdGF0ZU1peGluXSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbm93ID0gbmV3IERhdGUoKTtcblx0XHQvKiBpbml0aWFsaXplIHRoZSBsb2dpblxuXHRcdCAqIHJlZ2lzdGVyIGlzIG5vLCBpZiB3ZSB3YW50IHRvIHNob3cgdGhlIHJlZ2lzdGVyIGZvcm0gc2V0IHRvIHllc1xuXHRcdCAqIG1vdW50ZWQgaXMgc2V0IHRvIHllcyB3aGVuIHRoZSBhcHAgbW91bnRzIGlmIHlvdSBuZWVkIHRvIHdhaXQgZm9yIHRoYXRcblx0XHQgKiBzZXQgcmVzcG9uc2UgdG8geWVzIHRvIHNob3cgYSBmbGFzaCBtZXNzYWdlXG5cdFx0ICogZXJyb3IgbWVzc2FnZXMgYXJlIGluIGRhdGFcblx0XHQgKiAqL1xuXHRcdHJldHVybiB7XG5cdFx0XHRyZWdpc3Rlcjogbm8sXG5cdFx0XHRtb3VudGVkOiBubywgXG5cdFx0XHRyZXNwb25zZTogbm8sIFxuXHRcdFx0ZGF0YTp7fVxuXHRcdH07XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHdlIHdhbnQgdG8ga2lsbCB0aGUgZmxhc2ggYW55dGltZSB0aGUgZm9ybSBpcyByZW5kZXJlZFxuXHRcdCAqIHlvdSBjYW4gYWRkIGFueSBvdGhlciBwcm9wcyB5b3UgbmVlZCBoZXJlIGlmIHlvdSBpbmNsdWRlXG5cdFx0ICogdGhpcyBpbiBhbm90aGVyIGNvbXBvbmVudCBcblx0XHQgKiAqL1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0cmVzcG9uc2U6bm9cblx0XHR9KTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNob3dmbGFzaG1lc3NhZ2UgPSBmYWxzZTtcblx0XHR2YXIgaGFzZXJyb3IgPSBmYWxzZTtcblx0XHR2YXIgbG9naW5PUnJlZ2lzdGVyID0gKHRoaXMuc3RhdGUucmVnaXN0ZXIgPT09IHllcykgPyAncmVnaXN0ZXInIDogJ2xvZ2luJztcblx0XHQvKiBpZiByZXNwb25zZSBzdGF0ZSBpcyB5ZXMgd2UgaGF2ZSBhIGZsYXNoIG1lc3NhZ2UgdG8gc2hvd1xuXHRcdCAqIHRoZSBtZXNzYWdlIGlzIGluIGRhdGFcblx0XHQgKiAqL1xuXHRcdGlmKHRoaXMuc3RhdGUucmVzcG9uc2UgPT09IHllcykge1xuXHRcdFx0XG5cdFx0XHR2YXIgcGlja2NsYXNzID0gKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSB5ZXMgKSA/ICdzdWNjZXNzJyA6ICd3YXJuaW5nJzsgXG5cdFx0XHRcblx0XHRcdHNob3dmbGFzaG1lc3NhZ2UgPSA8R0ZsYXNoIHNob3djbGFzcz17cGlja2NsYXNzfSBjbGVhcnRpbWVvdXRzPXtbR0ludGVydmFsLnRpbWVvdXRdfSBjbGVhcmludGVydmFscz17W0dJbnRlcnZhbC5yZWRpcmVjdF19PjxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHRoaXMuc3RhdGUuZGF0YS5tZXNzYWdlIHx8ICcnfX0gLz48L0dGbGFzaCA+O1xuXHRcdFx0XG5cdFx0XHQvKiBpZiB3ZSBoYXZlIGFuIGVycm9yIHNoYWtlIHRoZSBmb3JtLiAgdGhpcyBpcyBkb25lIHdpdGggdGhlXG5cdFx0XHQgKiBoYXMtZXJyb3JzIGNsYXNzXG5cdFx0XHQgKiAqL1xuXHRcdFx0aWYodGhpcy5zdGF0ZS5kYXRhLnN1Y2Nlc3MgPT09IG5vKSBoYXNlcnJvciA9ICcgaGFzLWVycm9ycyc7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0aWYodGhpcy5zdGF0ZS5yZXNldGNvZGUgPT09IHllcykge1xuXHRcdFx0dmFyIHJldCA9IDxSZXNldENvZGUgIGNvbnRleHQ9e3RoaXN9IGNoYW5nZVJlc2V0PXt0aGlzLmNoYW5nZUNvZGV9IGZsYXNoPXtzaG93Zmxhc2htZXNzYWdlfSAvPlxuXHRcdH0gZWxzZSBpZih0aGlzLnN0YXRlLnJlc2V0Zm9ybSA9PT0geWVzKSB7XG5cdFx0XHR2YXIgcmV0ID0gPFJlc2V0UGFzc3dvcmQgIGNvbnRleHQ9e3RoaXN9IGNoYW5nZVJlc2V0PXt0aGlzLmNoYW5nZVJlc2V0fSBmbGFzaD17c2hvd2ZsYXNobWVzc2FnZX0gLz5cblx0XHR9IGVsc2UgaWYodGhpcy5zdGF0ZS5yZWdpc3RlciA9PT0gbm8pIHtcblx0XHRcdHZhciByZXQgPSA8TG9naW4gIGNvbnRleHQ9e3RoaXN9IHNob3dyZWdpc3Rlcj17dGhpcy5zaG93cmVnaXN0ZXJ9IGNoYW5nZVJlc2V0PXt0aGlzLmNoYW5nZVJlc2V0fSBmbGFzaD17c2hvd2ZsYXNobWVzc2FnZX0gLz5cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHJldCA9IDxSZWcgc2hvd3JlZ2lzdGVyPXt0aGlzLnNob3dyZWdpc3Rlcn0gZmxhc2g9e3Nob3dmbGFzaG1lc3NhZ2V9IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0fVxuXHRcdHJldHVybiAoIDxkaXYgIGNsYXNzTmFtZT17bG9naW5PUnJlZ2lzdGVyICsgXCIgY2VudGVybWUgY29sLXhzLTEyIHNoYWtlbWUgXCIgKyBoYXNlcnJvcn0+e3JldH0gPC9kaXY+KTtcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFdoZW4gdGhlIGNvbXBvbmVudCBpcyBhZGRlZCBsZXQgbWUga25vd1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bW91bnRlZDogeWVzXG5cdFx0fSk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHRzaG93cmVnaXN0ZXI6IGZ1bmN0aW9uIChlKSB7XG5cdFx0LyogdG9nZ2xlIHRoZSByZWdpc3RlciAvIGxvZ2luIGZvcm1zXG5cdFx0ICogKi9cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHJlZ2lzdGVyOiB0aGlzLnN0YXRlLnJlZ2lzdGVyID09PSB5ZXMgPyBubyA6IHllcyxcblx0XHRcdHJlc3BvbnNlOiBub1xuXHRcdH0pO1xuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdGNoYW5nZVJlc2V0OiBmdW5jdGlvbiAoZSkge1xuXHRcdC8qIHRvZ2dsZSB0aGUgcGFzc3dvcmQgcmVzZXRcblx0XHQgKiAqL1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0cmVzZXRmb3JtOiB0aGlzLnN0YXRlLnJlc2V0Zm9ybSA9PT0geWVzID8gbm8gOiB5ZXMsXG5cdFx0XHRyZXNwb25zZTogbm9cblx0XHR9KTtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRjaGFuZ2VDb2RlOiBmdW5jdGlvbiAoZSkge1xuXHRcdC8qIHRvZ2dsZSB0aGUgcGFzc3dvcmQgcmVzZXRcblx0XHQgKiAqL1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBcblx0XHRcdHJlc2V0Y29kZTogdGhpcy5zdGF0ZS5yZXNldGNvZGUgPT09IHllcyA/bm8gOiB5ZXMsXG5cdFx0XHRyZXNwb25zZTpub1xuXHRcdH0pO1xuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdGhhbmRsZVN1Ym1pdDogZnVuY3Rpb24oZSkge1xuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdMb2dpbjtcbiJdfQ==
