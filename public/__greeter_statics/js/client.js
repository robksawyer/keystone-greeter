(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var React = window.React;
//var Text = JSON.parse(require('text'));
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
		//console.log(this.props.inputs);
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
//var Text = JSON.parse(require('text'));
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
		e.preventDefault();
		if(this.state.valid) {
			this.resetemail();
		}
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
//var Text = JSON.parse(require('text'));
var Common = require('../common.js');
var GInterval = Common.GInterval;
var GFlash = require('../flash');
var _ = window._;
var ReactBootstrap = window.ReactBootstrap;
var BootstrapButton = ReactBootstrap.Button;
var yes = 'yes', no = 'no';

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
		e.preventDefault();
		
		if(Common.showButton(this.state.valid) === false) {
			this.login();
		}
	},
	onChange: function(e) {
		Common.FormInputOnChange.call(this, e, Text.login);
	},
	render: function() {
		
		var haserror = '';
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
			return (React.createElement("form", {ref: "signin", className: "signin-form " + haserror, onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.login, " "), 
				this.props.flash, 
					
				React.createElement(Common.Form, {inputs: Text.login, context: this}), 
				
				React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
				
				React.createElement("div", {className: "col-xs-6 "}, React.createElement("input", {type: "submit", onClick: this.login, value: Text.btns.login, className: "btn btn-info", disabled: Common.showButton(this.state.valid)})), 
				
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
//var Text = JSON.parse(require('text'));
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
		e.preventDefault();
		if(Common.showButton(this.state.valid) === false) {
			this.register();
		}
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
//var Text = JSON.parse(require('text'));
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
		e.preventDefault();
		if(Common.showButton(this.state.valid) === false) {
			this.resetemail();
		}
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
			register: window.initialPage === 'register' ? yes : no,
			resetcode: window.initialPage === 'resetcode' ? yes : no,
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


},{"./common.js":1,"./flash":3,"./forms/code":4,"./forms/login":5,"./forms/reg":6,"./forms/reset":7}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvY29tbW9uLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZmFrZV9mM2M0MmQ3My5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL3Nub3dwaS9qcy9saWIvcmVhY3QvanN4L2ZsYXNoLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvY29kZS5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL3Nub3dwaS9qcy9saWIvcmVhY3QvanN4L2Zvcm1zL2xvZ2luLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvcmVnLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvcmVzZXQuanMiLCIvaG9tZS9zbm93L3Byb2plY3RzL2dpdGh1Yi9rZXlzdG9uZS1ncmVldGVyL3B1YmxpYy9zbm93cGkvanMvbGliL3JlYWN0L2pzeC9ncmVldGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBSSxLQUFL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QU0sQ0FBRSxJQUFJLENBQUMsS0FBSyxFQUFDLENBQUMsT0FBQSxFQUFPLENBQUUsSUFBSyxDQUFBLENBQUcsQ0FBQSxFQUFBOztBQUV2RCxLQUFLLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsVUFBVSxDQUFFLENBQUEsRUFBQSxvQkFBQSxJQUFHLEVBQUEsSUFBQSxDQUFHLENBQU0sQ0FBQSxFQUFBOztBQUU1QyxLQUFLLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsV0FBVyxFQUFHLENBQUEsRUFBQSxvQkFBQyxlQUFlLEVBQUEsQ0FBQSxDQUFDLElBQUEsRUFBSSxDQUFDLFFBQUEsRUFBUSxDQUFDLE9BQUEsRUFBTyxDQUFFLElBQUksQ0FBQyxVQUFVLEVBQUMsQ0FBQyxHQUFBLEVBQUcsQ0FBQyxhQUFBLEVBQWEsQ0FBQyxPQUFBLEVBQU8sQ0FBQyxNQUFBLEVBQU0sQ0FBQyxRQUFBLEVBQVEsQ0FBRSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUMsRUFBRSxtQkFBQSxFQUFpQixDQUFDLGFBQWEsQ0FBRSxDQUFBLEVBQUEsSUFBQSxFQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLEdBQW1CLENBQU0sQ0FBQSxFQUFBOztLQUV6UCxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLFdBQUEsRUFBVyxDQUFDLEtBQUEsRUFBSyxDQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBRSxDQUFFLENBQUEsRUFBQSxvQkFBQyxlQUFlLEVBQUEsQ0FBQSxDQUFDLE9BQUEsRUFBTyxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFDLEVBQUUsT0FBQSxFQUFPLENBQUMsU0FBVSxDQUFBLEVBQUEsSUFBQSxFQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFDLEdBQW1CLENBQU0sQ0FBQSxFQUFBO0tBQ2hMLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsVUFBVSxDQUFFLENBQU0sQ0FBQTtBQUN0QyxHQUFVLENBQUEsRUFBRTs7RUFFVjtBQUNGLENBQUMsVUFBVSxFQUFFLFdBQVc7QUFDeEI7QUFDQTtBQUNBOztFQUVFLElBQUksTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUM3QixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUNwQyxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0dBQ3RCLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDUixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO0VBQ3JCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztFQUMvQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztFQUNyQixDQUFDLENBQUMsSUFBSSxDQUFDO0dBQ04sR0FBRyxFQUFFLElBQUksQ0FBQyxVQUFVO0dBQ3BCLFFBQVEsRUFBRSxNQUFNO0dBQ2hCLE1BQU0sRUFBRSxNQUFNO0dBQ2QsSUFBSSxFQUFFLE1BQU07R0FDWixPQUFPLEVBQUUsU0FBUyxJQUFJLEVBQUU7SUFDdkIsU0FBUyxPQUFPLEdBQUc7S0FDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDOUIsS0FBSztBQUNMOztBQUVBLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRXJGLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOztHQUVaLEtBQUssRUFBRSxTQUFTLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO0lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDZjtBQUNBOztBQUVBLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZOztHQUVyQixHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZCLEdBQUcsQ0FBQyxDQUFDOztFQUVIO0FBQ0YsQ0FBQyxDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUM7Ozs7QUMxRi9CLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNoRCxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDckMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2pDLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM3QyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDeEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNwQyxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ2pDLHlDQUF5Qzs7QUFFekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7S0FFSztBQUNMLElBQUksR0FBRyxHQUFHLEtBQUssRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQzNCLDZCQUE2Qjs7QUFFN0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSzs7QUFFTCxJQUFJLGVBQWUsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDOztBQUU1QyxJQUFJLDRCQUE0QixzQkFBQTtDQUMvQixNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0NBQ3ZDLGVBQWUsRUFBRSxXQUFXO0FBQzdCLEVBQUUsSUFBSSxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztFQUVFLE9BQU87R0FDTixRQUFRLEVBQUUsTUFBTSxDQUFDLFdBQVcsS0FBSyxVQUFVLEdBQUcsR0FBRyxHQUFHLEVBQUU7R0FDdEQsU0FBUyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEtBQUssV0FBVyxHQUFHLEdBQUcsR0FBRyxFQUFFO0dBQ3hELFNBQVMsRUFBRSxNQUFNLENBQUMsV0FBVyxLQUFLLGdCQUFnQixJQUFJLE1BQU0sQ0FBQyxXQUFXLEtBQUssT0FBTyxHQUFHLEdBQUcsR0FBRyxFQUFFO0dBQy9GLE9BQU8sRUFBRSxFQUFFO0dBQ1gsUUFBUSxFQUFFLEVBQUU7R0FDWixJQUFJLENBQUMsRUFBRTtHQUNQLENBQUM7RUFDRjtBQUNGLENBQUMseUJBQXlCLEVBQUUsV0FBVztBQUN2QztBQUNBO0FBQ0E7O0VBRUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztHQUNiLFFBQVEsQ0FBQyxFQUFFO0dBQ1gsQ0FBQyxDQUFDO0VBQ0gsT0FBTyxLQUFLLENBQUM7RUFDYjtDQUNELE1BQU0sRUFBRSxXQUFXO0VBQ2xCLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0VBQzdCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztBQUN2QixFQUFFLElBQUksZUFBZSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEtBQUssVUFBVSxLQUFLLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFDbkg7QUFDQTs7QUFFQSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssR0FBRyxFQUFFOztBQUVsQyxHQUFHLElBQUksU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLEdBQUcsS0FBSyxTQUFTLEdBQUcsU0FBUyxDQUFDOztBQUU5RSxHQUFHLGdCQUFnQixHQUFHLG9CQUFDLE1BQU0sRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUUsU0FBUyxFQUFDLENBQUMsYUFBQSxFQUFhLENBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxjQUFBLEVBQWMsQ0FBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUcsQ0FBQSxFQUFBLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsdUJBQUEsRUFBdUIsQ0FBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFFLENBQUEsQ0FBRyxDQUFVLENBQUEsQ0FBQztBQUNsTjtBQUNBO0FBQ0E7O0FBRUEsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxFQUFFLEVBQUUsUUFBUSxHQUFHLGFBQWEsQ0FBQzs7R0FFNUQ7RUFDRCxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLEdBQUcsRUFBRTtHQUNoQyxJQUFJLEdBQUcsR0FBRyxvQkFBQyxTQUFTLEVBQUEsQ0FBQSxFQUFFLE9BQUEsRUFBTyxDQUFFLElBQUksRUFBQyxDQUFDLFdBQUEsRUFBVyxDQUFFLElBQUksQ0FBQyxVQUFVLEVBQUMsQ0FBQyxLQUFBLEVBQUssQ0FBRSxnQkFBaUIsQ0FBQSxDQUFHLENBQUE7R0FDOUYsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLEdBQUcsRUFBRTtHQUN2QyxJQUFJLEdBQUcsR0FBRyxvQkFBQyxhQUFhLEVBQUEsQ0FBQSxFQUFFLE9BQUEsRUFBTyxDQUFFLElBQUksRUFBQyxDQUFDLFdBQUEsRUFBVyxDQUFFLElBQUksQ0FBQyxXQUFXLEVBQUMsQ0FBQyxLQUFBLEVBQUssQ0FBRSxnQkFBaUIsQ0FBQSxDQUFHLENBQUE7R0FDbkcsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLEVBQUUsRUFBRTtHQUNyQyxJQUFJLEdBQUcsR0FBRyxvQkFBQyxLQUFLLEVBQUEsQ0FBQSxFQUFFLE9BQUEsRUFBTyxDQUFFLElBQUksRUFBQyxDQUFDLFlBQUEsRUFBWSxDQUFFLElBQUksQ0FBQyxZQUFZLEVBQUMsQ0FBQyxXQUFBLEVBQVcsQ0FBRSxJQUFJLENBQUMsV0FBVyxFQUFDLENBQUMsS0FBQSxFQUFLLENBQUUsZ0JBQWlCLENBQUEsQ0FBRyxDQUFBO0dBQzVILE1BQU07R0FDTixJQUFJLEdBQUcsR0FBRyxvQkFBQyxHQUFHLEVBQUEsQ0FBQSxDQUFDLFlBQUEsRUFBWSxDQUFFLElBQUksQ0FBQyxZQUFZLEVBQUMsQ0FBQyxLQUFBLEVBQUssQ0FBRSxnQkFBZ0IsRUFBQyxDQUFDLE9BQUEsRUFBTyxDQUFFLElBQUssQ0FBQSxDQUFHLENBQUE7R0FDMUY7RUFDRCxTQUFTLG9CQUFBLEtBQUksRUFBQSxDQUFBLEVBQUUsU0FBQSxFQUFTLENBQUUsZUFBZSxHQUFHLDhCQUE4QixHQUFHLFFBQVUsQ0FBQSxFQUFDLEdBQUcsRUFBQyxHQUFPLENBQUEsRUFBRTtFQUNyRztBQUNGLENBQUMsaUJBQWlCLEVBQUUsV0FBVzs7RUFFN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQztHQUNiLE9BQU8sRUFBRSxHQUFHO0dBQ1osQ0FBQyxDQUFDO0VBQ0gsT0FBTyxLQUFLLENBQUM7RUFDYjtBQUNGLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQzVCOztFQUVFLElBQUksQ0FBQyxRQUFRLENBQUM7R0FDYixRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHO0dBQ2hELFFBQVEsRUFBRSxFQUFFO0dBQ1osU0FBUyxFQUFFLEVBQUU7R0FDYixTQUFTLEVBQUUsRUFBRTtHQUNiLENBQUMsQ0FBQztFQUNILE9BQU8sQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0VBQzFCO0FBQ0YsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDM0I7O0VBRUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztHQUNiLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUc7R0FDbEQsUUFBUSxFQUFFLEVBQUU7R0FDWixTQUFTLEVBQUUsRUFBRTtHQUNiLFFBQVEsRUFBRSxFQUFFO0dBQ1osQ0FBQyxDQUFDO0VBQ0gsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDMUI7QUFDRixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRTtBQUMxQjs7RUFFRSxJQUFJLENBQUMsUUFBUSxDQUFDO0dBQ2IsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLEdBQUcsRUFBRSxFQUFFLEdBQUcsR0FBRztHQUNqRCxRQUFRLENBQUMsRUFBRTtHQUNYLFFBQVEsRUFBRSxFQUFFO0dBQ1osU0FBUyxFQUFFLEVBQUU7R0FDYixDQUFDLENBQUM7RUFDSCxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMxQjtDQUNELFlBQVksRUFBRSxTQUFTLENBQUMsRUFBRTtFQUN6QixPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMxQjtBQUNGLENBQUMsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG4vL3ZhciBUZXh0ID0gSlNPTi5wYXJzZShyZXF1aXJlKCd0ZXh0JykpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuLyogbWFuIGNvbXBvbmVudFxuICogc2ltcGxlIGV4YW1wbGVcbiAqICovXG52YXIgR01hbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKHtkaXZzdHlsZTp7ZmxvYXQ6J3JpZ2h0Jyx9fSk7XG5cdH0sXG5cdFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHQgICAgcmV0dXJuIChcblx0XHQ8ZGl2IHN0eWxlPXt0aGlzLnByb3BzLmRpdnN0eWxlfSBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogVGV4dC5sb2dvbWFuIHx8ICcnfX0gLz5cblx0ICAgICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cy5HTWFuID0gR01hbjtcblxuLyogXG4gKiB3ZSB1c2UgdGhpcyBmb3IgdGhlIGNvdW50ZG93biB0aW1lciBiZWZvcmUgd2UgcmVkaXJlY3QgYSBsb2dnZWQgXG4gKiBpbiB1c2VyLiAgeW91IGNhbiBkaXNhYmxlIGl0IFxuICogYnkgc2VuZGluZyBhIHJlZGlyZWN0IHRpbWUgb2YgMFxuICogKi9cbnZhciBHSW50ZXJ2YWwgPSB7XG5cdCAgaW50ZXJ2YWxzOiBbXSxcblx0ICBzZXRJbnRlcnZhbDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuaW50ZXJ2YWxzLnB1c2goc2V0SW50ZXJ2YWwuYXBwbHkobnVsbCwgYXJndW1lbnRzKSk7XG5cdCAgfSxcblx0ICBjbGVhckludGVydmFsczogZnVuY3Rpb24od2hvKSB7XG5cdFx0d2hvID0gd2hvIC0gMTtcblx0XHRpZihHSW50ZXJ2YWwuaW50ZXJ2YWxzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0Ly9jb25zb2xlLmxvZygnY2xlYXIgYWxsIGludGVydmFscycsdGhpcy5pbnRlcnZhbHMpXG5cdFx0XHRHSW50ZXJ2YWwuaW50ZXJ2YWxzLm1hcChjbGVhckludGVydmFsKTtcblx0XHRcdEdJbnRlcnZhbC5pbnRlcnZhbHMgPSBbXTtcblx0XHR9IGVsc2UgaWYod2hvICYmIEdJbnRlcnZhbC5pbnRlcnZhbHNbd2hvXSkge1xuXHRcdFx0Ly9jb25zb2xlLmxvZygnY2xlYXIgaW50ZXJ2YWxzJyx3aG8sdGhpcy5pbnRlcnZhbHNbd2hvXSlcblx0XHRcdGNsZWFySW50ZXJ2YWwoR0ludGVydmFsLmludGVydmFsc1t3aG9dKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly9jb25zb2xlLmxvZygnbWFwIGludGVydmFscycsdGhpcy5pbnRlcnZhbHMpXG5cdFx0XHRHSW50ZXJ2YWwuaW50ZXJ2YWxzLm1hcChjbGVhckludGVydmFsKTtcblx0XHRcdEdJbnRlcnZhbC5pbnRlcnZhbHMgPSBbXTtcblx0XHR9XG5cdCAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuR0ludGVydmFsID0gR0ludGVydmFsO1xuXG5tb2R1bGUuZXhwb3J0cy5zaG93QnV0dG9uID0gZnVuY3Rpb24oaW5wdXRzKSB7XG5cdHZhciB2YWxpZCA9IF8uaW5jbHVkZXMoaW5wdXRzLCBmYWxzZSk7XG5cdC8vY29uc29sZS5sb2coJ2J1dHRvbicsIGlucHV0cywgdmFsaWQpO1xuXHRyZXR1cm4gdmFsaWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzLnNldEZvcm1TdGF0ZSA9IGZ1bmN0aW9uKGlucHV0cywgdmFsaWQpIHtcblx0dmFyIHJldCA9IHt9O1xuXHRyZXQudmFsaWQgPSBfLmlzT2JqZWN0KHZhbGlkKSA/IHZhbGlkIDoge307XG5cdHJldC5mb3JtID0ge307XG5cdF8uZWFjaChpbnB1dHMsIGZ1bmN0aW9uKHYpIHtcblx0XHRpZih2LnR5cGUgIT09ICdoZWFkZXInKSByZXQuZm9ybVt2LmZpZWxkXSA9IHYuX25hbWU7XG5cdFx0aWYodi5yZXF1aXJlZCAmJiAhcmV0LnZhbGlkW3YuZmllbGRdKSB7XG5cdFx0XHRyZXQudmFsaWRbdi5maWVsZF0gPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYodi5hdHRhY2gpIHtcblx0XHRcdHJldC5mb3JtW3YuYXR0YWNoLmZpZWxkXSA9IHYuX25hbWUgKyAnX2F0dGFjaCc7XG5cdFx0XHRpZih2LnJlcXVpcmVkICYmICFyZXQudmFsaWRbdi5hdHRhY2guZmllbGRdKSB7XG5cdFx0XHRcdHJldC52YWxpZFt2LmF0dGFjaC5maWVsZF0gPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gcmV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5Gb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cdFx0dmFyIGZvcm0gPSBbXTtcblx0XHQvLyBzb3J0IG91dCBvYmplY3Qgb2YgZm9ybSBlbGVtZW50cyBhbmQgYWRkIHRoZW0gdG8gYW4gYXJyYXlcblx0XHQvL2NvbnNvbGUubG9nKHRoaXMucHJvcHMuaW5wdXRzKTtcblx0XHR2YXIgc29ydGVkX2xpc3QgPSBfKHRoaXMucHJvcHMuaW5wdXRzKS5rZXlzKCkuc29ydCgpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHR2YXIgdmFsdWUgPSBfdGhpcy5wcm9wcy5pbnB1dHNba2V5XTtcblx0XHRcdGZvcm0ucHVzaChjb250YWluZXIoa2V5LCB2YWx1ZSwgX3RoaXMucHJvcHMuaW5wdXRzLCBfdGhpcy5wcm9wcy5jb250ZXh0KSk7XG5cdFx0fSkudmFsdWUoKTtcblx0XHRcblx0XHRyZXR1cm4gZm9ybS5sZW5ndGggPT09IDAgPyAoPHNwYW4gLz4pIDogKDxkaXY+e2Zvcm19PC9kaXY+KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzLkZvcm1JbnB1dE9uQ2hhbmdlID0gZnVuY3Rpb24oZXZlbnQsIGZvcm0pIHtcbiAgICAvLyBnZXQgdGhlIGN1cnJlbnQgdmFsdWVcbiAgICB2YXIgY2hhbmdlID0ge1xuXHRcdHZhbGlkOiBfLmNsb25lKHRoaXMuc3RhdGUudmFsaWQpLFxuXHR9O1xuXHRcblx0dmFyIHZhbGlkID0gZmFsc2U7XG5cdHZhciBwYXJlbnQgPSBmYWxzZTtcblx0XG5cdC8vIGlzIHRoaXMgYXR0YWNoZWRcblx0aWYoZXZlbnQudGFyZ2V0LmRhdGFzZXQuZGVwZW5kc29uICE9PSAnZmFsc2UnKSB7XG5cdFx0cGFyZW50ID0gIGZvcm1bZXZlbnQudGFyZ2V0LmRhdGFzZXQuZGVwZW5kc29uXTtcblx0XHR2YXIgaW5wdXQgPSBmb3JtW2V2ZW50LnRhcmdldC5pZF07XG5cdFx0cGFyZW50LkRPTSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcmVudC5fbmFtZSk7XG5cdFx0Ly9jb25zb2xlLmxvZyhldmVudC50YXJnZXQuZGF0YXNldC5kZXBlbmRzb24pO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBpbnB1dCA9IGZvcm1bZXZlbnQudGFyZ2V0LmlkXTtcblx0fVxuXHRcblx0aWYoaW5wdXQucmVxdWlyZWQpIHtcdFxuXHRcdGlmKF8uaXNBcnJheShpbnB1dC5yZWdleCkpIHtcblx0XHRcdHZhciByeCA9IG5ldyBSZWdFeHAoaW5wdXQucmVnZXhbMF0saW5wdXQucmVnZXhbMV0pO1xuXHRcdFx0dmFsaWQgPSByeC50ZXN0KGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhbGlkID0gZXZlbnQudGFyZ2V0LnZhbHVlICE9PSAnJztcblx0XHR9XG5cdFx0aWYodmFsaWQgJiYgcGFyZW50ICYmIHBhcmVudC50eXBlID09PSAncGFzc3dvcmQnKSB7XG5cdFx0XHRpZihldmVudC50YXJnZXQudmFsdWUgIT09ICcnICYmIGV2ZW50LnRhcmdldC52YWx1ZSA9PT0gcGFyZW50LkRPTS52YWx1ZSkge1xuXHRcdFx0XHR2YWxpZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHZhbGlkICYmIHBhcmVudCAmJiBwYXJlbnQudHlwZSA9PT0gJ3NlbGVjdCcpIHtcblx0XHRcdGlmKGV2ZW50LnRhcmdldC52YWx1ZSAhPT0gJycgJiYgcGFyZW50LkRPTS52YWx1ZSAhPT0gJycpIHtcblx0XHRcdFx0dmFsaWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRjaGFuZ2UudmFsaWRbaW5wdXQuZmllbGRdID0gdmFsaWQ7XG5cdFx0XG5cdH1cblx0XG5cdC8vY29uc29sZS5sb2coJ2NoYW5nZScsIHZhbGlkLCBjaGFuZ2UpO1xuICAgIHRoaXMuc2V0U3RhdGUoY2hhbmdlKTtcbn1cblxuXG5mdW5jdGlvbiB2YWxpZGF0ZV9jbGFzcyhpbnB1dCwgY29udGV4dCkge1xuXHR2YXIgdmFsaWQgPSBjb250ZXh0LnN0YXRlLnZhbGlkO1xuXHRpZighaW5wdXQucmVxdWlyZWQpIHtcblx0XHRyZXR1cm4gJ2lucHV0LWdyb3VwJztcblx0fSBlbHNlIHtcblx0XHRpZih2YWxpZFtpbnB1dC5maWVsZF0pIHtcblx0XHRcdHJldHVybiAnaW5wdXQtZ3JvdXAnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gJ2lucHV0LWdyb3VwIGhhcy1lcnJvcic7XG5cdFx0fVxuXHR9XG59XG5cblxuZnVuY3Rpb24gaW5wdXQobmFtZSwgb3B0aW9ucywgY29udGV4dCkge1xuXHRcblx0aWYoIV8uaXNPYmplY3Qob3B0aW9ucykpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0XG5cdHZhciB0eXBlID0gb3B0aW9ucy50eXBlO1xuXHR2YXIgZGVwZW5kc09uID0gb3B0aW9ucy5kZXBlbmRzT24gPyBvcHRpb25zLmRlcGVuZHNPbiA6IGZhbHNlO1xuXHRcblx0aWYodHlwZSA9PT0gJ3RleHQnKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxpbnB1dCB0eXBlPVwidGV4dFwiIGlkPXtvcHRpb25zLl9uYW1lfSAgcmVmcz17b3B0aW9ucy5fbmFtZX0gY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgZGF0YS1kZXBlbmRzb249e2RlcGVuZHNPbn0gIG9uQ2hhbmdlPXtjb250ZXh0Lm9uQ2hhbmdlfSAgIC8+XG5cdFx0KTtcblx0XHRcblx0fSBlbHNlIGlmKHR5cGUgPT09ICdwYXNzd29yZCcpIHtcblx0XHQvLyBhZGQgcGFzc3dvcmQgZmllbGRcblx0XHR2YXIgZGVwZW5kc09uID0gb3B0aW9ucy5kZXBlbmRzT24gPyBvcHRpb25zLmRlcGVuZHNPbiA6IGZhbHNlO1xuXHRcdHJldHVybiAoIFxuXHRcdFx0PGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIGlkPXtvcHRpb25zLl9uYW1lfSBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWRlcGVuZHNvbj17ZGVwZW5kc09ufSAgb25DaGFuZ2U9e2NvbnRleHQub25DaGFuZ2V9ICAvPlxuXHRcdCk7XG5cdFx0XG5cdH0gZWxzZSBpZih0eXBlID09PSAnc2VsZWN0Jykge1xuXHRcdFxuXHRcdHZhciBvdGhlciwgb3B0cztcblx0XHQvLyBidWlsZCB0aGUgb3B0aW9ucyBsaXN0XG5cdFx0aWYoXy5pc0FycmF5KG9wdGlvbnMub3B0aW9ucykpIHtcblx0XHRcdG9wdHMgPSBvcHRpb25zLm9wdGlvbnMubWFwKGZ1bmN0aW9uKG9wKSB7XG5cdFx0XHRcdGlmKF8uaXNTdHJpbmcob3ApKSB7XG5cdFx0XHRcdFx0b3AgPSB7XG5cdFx0XHRcdFx0XHRsYWJlbDpvcCxcblx0XHRcdFx0XHRcdHZhbHVlOm9wXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAoIFxuXHRcdFx0XHRcdDxvcHRpb24ga2V5PXtvcC5sYWJlbH0gdmFsdWU9e29wLnZhbHVlIHx8IG9wLmxhYmVsfT57b3AubGFiZWx9PC9vcHRpb24+XG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0dmFyIGRlcGVuZHNPbiA9IG9wdGlvbnMuZGVwZW5kc09uID8gb3B0aW9ucy5kZXBlbmRzT24gOiBmYWxzZTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHNlbGVjdCBpZD17b3B0aW9ucy5fbmFtZX0gY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgZGF0YS1kZXBlbmRzb249e2RlcGVuZHNPbn0gIG9uQ2hhbmdlPXtjb250ZXh0Lm9uQ2hhbmdlfSAgPlxuXHRcdFx0XHR7b3B0c31cblx0XHRcdDwvc2VsZWN0PlxuXHRcdCk7XG5cdFx0XG5cdH0gXG5cdFxufVxuXG5mdW5jdGlvbiBjb250YWluZXIobmFtZSwgb3B0aW9ucywgaW5wdXRzLCBjb250ZXh0KSB7XG5cdFxuXHRpZighXy5pc09iamVjdChvcHRpb25zKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZihvcHRpb25zLmF0dGFjaGVkKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdFxuXHR2YXIgdHlwZSA9IG9wdGlvbnMudHlwZTtcblx0XG5cdGlmKHR5cGUgPT09ICdoZWFkZXInKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYga2V5PXtuYW1lfT5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wtc20tMTJcIj5cblx0XHRcdFx0XHRcdDxwIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbC1zdGF0aWNcIiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogb3B0aW9ucy5sYWJlbCB8fCAnJ319IC8+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcdFxuXHRcdFxuXHR9IGVsc2Uge1xuXHRcdHZhciB0aGVpbnB1dCA9IGlucHV0KG5hbWUsIG9wdGlvbnMsIGNvbnRleHQpO1xuXHRcdHZhciBhdHRhY2hlZCA9IGZhbHNlO1xuXHRcdGlmKGlucHV0c1tuYW1lICsgJ19hdHRhY2gnXSkge1xuXHRcdFx0YXR0YWNoZWQgPSBpbnB1dChuYW1lICsgJ19hdHRhY2gnLCBpbnB1dHNbbmFtZSArICdfYXR0YWNoJ10sIGNvbnRleHQpO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgY2xhcyA9IHZhbGlkYXRlX2NsYXNzKG9wdGlvbnMsIGNvbnRleHQpO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxkaXYga2V5PXtuYW1lfT5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjbGFzfT5cdFx0XG5cdFx0XHRcdDxzcGFuIGNsYXNzTmFtZT1cImlucHV0LWdyb3VwLWFkZG9uXCIgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBvcHRpb25zLmxhYmVsIHx8ICcnfX0gLz4gXG5cdFx0XHRcdHt0aGVpbnB1dH1cblx0XHRcdFx0e2F0dGFjaGVkfVxuXHRcdFx0PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0KTtcblx0fVxufVxuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBBcHAgPSByZXF1aXJlKCcuL2dyZWV0ZXIuanMnKTtcbnZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbiQoZnVuY3Rpb24oKSB7XG5cdC8vY29uc29sZS5sb2coJ3JlYWN0JyxSZWFjdCk7XG5cdC8qIHN0YXJ0IG91ciBhcHAgYWZ0ZXIgdGhlIHBhZ2UgaXMgcmVhZHkgKi8gXHRcblx0UmVhY3QucmVuZGVyKDxBcHAgIC8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc25vd3BpJykpO1xuXG59KTtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcblxuLyogY3JlYXRlIGZsYXNoIG1lc3NhZ2UgXG4gKiAqL1xudmFyIEZsYXNoID0gUmVhY3RCb290c3RyYXAuQWxlcnQ7XG5cbnZhciBHRmxhc2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlzVmlzaWJsZTogdHJ1ZVxuXHRcdH07XG5cdH0sXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICh7c2hvd2NsYXNzOidpbmZvJ30pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdGlmKCF0aGlzLnN0YXRlLmlzVmlzaWJsZSlcblx0XHQgICAgcmV0dXJuIG51bGw7XG5cblx0XHR2YXIgbWVzc2FnZSA9IHRoaXMucHJvcHMuY2hpbGRyZW47XG5cdFx0cmV0dXJuIChcblx0XHQgICAgPEZsYXNoIGJzU3R5bGU9e3RoaXMucHJvcHMuc2hvd2NsYXNzfSBvbkRpc21pc3M9e3RoaXMuZGlzbWlzc0ZsYXNofT5cblx0XHRcdDxwPnttZXNzYWdlfTwvcD5cblx0XHQgICAgPC9GbGFzaD5cblx0XHQpO1xuXHR9LFxuXHQvKiBtYWtlIHN1cmUgdGhlIHVzZXIgY2FuIGNhbmNlbCBhbnkgcmVkaXJlY3RzIGJ5IGNsZWFyaW5nIHRoZSBmbGFzaCBtZXNzYWdlXG5cdCAqICovXG5cdGRpc21pc3NGbGFzaDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7aXNWaXNpYmxlOiBmYWxzZX0pO1xuXHRcdGlmKHRoaXMucHJvcHMuY2xlYXJpbnRlcnZhbHMgaW5zdGFuY2VvZiBBcnJheSl0aGlzLnByb3BzLmNsZWFyaW50ZXJ2YWxzLm1hcChHSW50ZXJ2YWwuY2xlYXJJbnRlcnZhbHMpO1xuXHRcdGlmKHRoaXMucHJvcHMuY2xlYXJ0aW1lb3V0cyBpbnN0YW5jZW9mIEFycmF5KXRoaXMucHJvcHMuY2xlYXJ0aW1lb3V0cy5tYXAoY2xlYXJUaW1lb3V0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR0ZsYXNoO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbi8vdmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uLmpzJyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcbi8vdmFyIHllcyA9IHRydWUsIG5vID0gZmFsc2U7XG5cbnZhciBSZXNldFBhc3N3b3JkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5yZXNldGNvZGUsIHZhbGlkKTtcblx0XHRyZXQubmFtZSA9ICdyZXNldCc7XG5cdFx0cmV0dXJuIHJldDtcblx0fSxcblx0aGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGlmKHRoaXMuc3RhdGUudmFsaWQpIHtcblx0XHRcdHRoaXMucmVzZXRlbWFpbCgpO1xuXHRcdH1cblx0fSxcblx0b25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcblx0XHRDb21tb24uRm9ybUlucHV0T25DaGFuZ2UuY2FsbCh0aGlzLCBlLCBUZXh0LnJlc2V0Y29kZSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKDxmb3JtICByZWY9J3Jlc2V0Y29kZScgIGNsYXNzTmFtZT1cImNvZGUtZm9ybVwiICBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9ID5cblx0XHRcdFx0PGgyPntUZXh0LmhvbWUucmVzZXRjb2RlfSA8Q29tbW9uLkdNYW4gLz48L2gyPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5mbGFzaH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8Q29tbW9uLkZvcm0gaW5wdXRzPXtUZXh0LnJlc2V0Y29kZX0gY29udGV4dD17dGhpc30gLz5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgID48Qm9vdHN0cmFwQnV0dG9uIHJvbGU9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLnJlc2V0ZW1haWx9IHJlZj1cInJlc2V0YnV0dG9uXCIgYnNTdHlsZT0naW5mbycgZGlzYWJsZWQ9e0NvbW1vbi5zaG93QnV0dG9uKHRoaXMuc3RhdGUudmFsaWQpfSAgZGF0YS1sb2FkaW5nLXRleHQ9XCJDaGVja2luZy4uLlwiID4gIHtUZXh0LmJ0bnMucmVzZXRjb2RlfSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiBzdHlsZT17e3RleHRBbGlnbjoncmlnaHQnfX0gPjxCb290c3RyYXBCdXR0b24gb25DbGljaz17dGhpcy5wcm9wcy5jaGFuZ2VSZXNldH0gIGJzU3R5bGU9J2RlZmF1bHQnPiAge1RleHQuYnRucy5sb2dpbmN1cnJlbnR9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjwvZGl2PlxuXHRcdFx0PC9mb3JtPik7XG5cdFx0XHRcblx0fSxcblx0cmVzZXRlbWFpbDogZnVuY3Rpb24oKSB7XG5cdFx0LyogdmFsaWRhdGlvbiBvY2N1cnMgYXMgaW5wdXQgaXMgcmVjZWl2ZWQgXG5cdFx0ICogdGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgYXZpYWxhYmxlIGlmXG5cdFx0ICogYWxsIHZhbGlkYXRpb24gaXMgYWxyZWFkeSBtZXQgc28ganVzdCBydW5cblx0XHQgKiAqL1xuXHRcdHZhciBteWRhdGEgPSB7Y29kZToneWVzJ307XG5cdFx0Xy5lYWNoKHRoaXMuc3RhdGUuZm9ybSwgZnVuY3Rpb24odixrKSB7XG5cdFx0XHRpZih2LnR5cGUgIT09ICdoZWFkZXInKSB7XG5cdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHYpO1xuXHRcdFx0XHRteWRhdGFba10gPSBlbC52YWx1ZTtcblx0XHRcdH1cblx0XHRcdGlmKHYuYXR0YWNoKSB7XG5cdFx0XHRcdHZhciBlbEEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2ICsgJ19hdHRhY2gnKTtcblx0XHRcdFx0bXlkYXRhW3YuYXR0YWNoLmZpZWxkXSA9IGVsQS52YWx1ZTtcdFxuXHRcdFx0fVxuXHRcdH0sdGhpcyk7XG5cdFx0bXlkYXRhW2lzS2V5XSA9IGlzTWU7XG5cdFx0dmFyIGJ0biA9ICQodGhpcy5yZWZzLnJlc2V0YnV0dG9uLmdldERPTU5vZGUoKSlcblx0XHRidG4uYnV0dG9uKCdsb2FkaW5nJylcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBUZXh0LnJlc2V0ZW1haWwsXG5cdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRkYXRhOiBteWRhdGEsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHRcblx0XHRcdFx0ZnVuY3Rpb24gbWVzc2FnZSgpIHtcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UgPSAnU3VjY2Vzcyc7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogZmxhc2ggbWVzc2FnZXMgYXJlIHNob3duIHdpdGggcmVzcG9uc2UgOiB5ZXNcblx0XHRcdFx0ICogKi9cdFxuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe3Jlc3BvbnNlOnllcyxkYXRhOmRhdGEscmVzZXRjb2RlOm5vfSk7XG5cdFx0XHRcdFxuXHRcdFx0fS5iaW5kKHRoaXMpLFxuXHRcdFx0XG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLnByb3BzLnVybCwgc3RhdHVzLCBlcnIudG9TdHJpbmcoKSk7XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLHJlc2V0Zm9ybTp5ZXMscmVzZXRjb2RlOm5vLGRhdGE6IHtzdGF0dXM6c3RhdHVzLGVycjplcnIudG9TdHJpbmcoKX0gfSk7XG5cdFx0XHR9LmJpbmQodGhpcylcblx0XHRcblx0XHQvKiBhbHdheXMgcmVzZXQgb3VyIGJ1dHRvbnNcblx0XHQqICovXHRcblx0XHR9KS5hbHdheXMoZnVuY3Rpb24gKCkge1xuXHRcdFx0YnRuLmJ1dHRvbigncmVzZXQnKTtcblx0XHR9KTtcblx0XHRcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzZXRQYXNzd29yZDtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG4vL3ZhciBUZXh0ID0gSlNPTi5wYXJzZShyZXF1aXJlKCd0ZXh0JykpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi5qcycpO1xudmFyIEdJbnRlcnZhbCA9IENvbW1vbi5HSW50ZXJ2YWw7XG52YXIgR0ZsYXNoID0gcmVxdWlyZSgnLi4vZmxhc2gnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcblxudmFyIExvZ2luID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5sb2dpbiwgdmFsaWQpO1xuXHRcdHJldC5uYW1lID0gJ2xvZ2luJztcblx0XHRyZXR1cm4gcmV0OyBcblx0fSxcblx0aGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFxuXHRcdGlmKENvbW1vbi5zaG93QnV0dG9uKHRoaXMuc3RhdGUudmFsaWQpID09PSBmYWxzZSkge1xuXHRcdFx0dGhpcy5sb2dpbigpO1xuXHRcdH1cblx0fSxcblx0b25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcblx0XHRDb21tb24uRm9ybUlucHV0T25DaGFuZ2UuY2FsbCh0aGlzLCBlLCBUZXh0LmxvZ2luKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgaGFzZXJyb3IgPSAnJztcblx0XHQvKiBpZiByZXNwb25zZSBzdGF0ZSBpcyB5ZXMgd2UgaGF2ZSBhIGZsYXNoIG1lc3NhZ2UgdG8gc2hvd1xuXHRcdCAqIHRoZSBtZXNzYWdlIGlzIGluIGRhdGFcblx0XHQgKiAqL1xuXHRcdGlmKHRoaXMuc3RhdGUucmVzcG9uc2UgPT09IHllcykge1xuXHRcdFx0XG5cdFx0XHR2YXIgcGlja2NsYXNzID0gKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSB5ZXMgKSA/ICdzdWNjZXNzJyA6ICd3YXJuaW5nJzsgXG5cdFx0XHRcblx0XHRcdHNob3dmbGFzaG1lc3NhZ2UgPSA8R0ZsYXNoIHNob3djbGFzcz17cGlja2NsYXNzfSBjbGVhcnRpbWVvdXRzPXtbR0ludGVydmFsLnRpbWVvdXRdfSBjbGVhcmludGVydmFscz17W0dJbnRlcnZhbC5yZWRpcmVjdF19PjxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHRoaXMuc3RhdGUuZGF0YS5tZXNzYWdlIHx8ICcnfX0gLz48L0dGbGFzaCA+O1xuXHRcdFx0XG5cdFx0XHQvKiBpZiB3ZSBoYXZlIGFuIGVycm9yIHNoYWtlIHRoZSBmb3JtLiAgdGhpcyBpcyBkb25lIHdpdGggdGhlXG5cdFx0XHQgKiBoYXMtZXJyb3JzIGNsYXNzIFxuXHRcdFx0ICogKi9cblx0XHRcdCBcblx0XHRcdGlmKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSBubykgaGFzZXJyb3IgPSAnIGhhcy1lcnJvcnMnO1xuXHRcdFx0XG5cdFx0fVx0XHRcdFxuXHRcdFx0cmV0dXJuICg8Zm9ybSAgcmVmPSdzaWduaW4nICBjbGFzc05hbWU9e1wic2lnbmluLWZvcm0gXCIgKyBoYXNlcnJvcn0gIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0gPlxuXHRcdFx0XHQ8aDI+e1RleHQuaG9tZS5sb2dpbn0gPC9oMj5cblx0XHRcdFx0e3RoaXMucHJvcHMuZmxhc2h9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQubG9naW59IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0XHRcdFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiAgPjxpbnB1dCB0eXBlPVwic3VibWl0XCIgb25DbGljaz17dGhpcy5sb2dpbn0gdmFsdWU9e1RleHQuYnRucy5sb2dpbn0gY2xhc3NOYW1lPSdidG4gYnRuLWluZm8nIGRpc2FibGVkPXtDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0gLz48L2Rpdj4gXG5cdFx0XHRcdFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLnNob3dyZWdpc3Rlcn0gIGJzU3R5bGU9J3dhcm5pbmcnPiAge1RleHQuYnRucy5yZWdpc3Rlcn0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLW9mZnNldC02IGNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCcsIHBhZGRpbmdUb3A6MTB9fSA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5wcm9wcy5jaGFuZ2VSZXNldH0gIGJzU3R5bGU9J2RlZmF1bHQnID4gIHtUZXh0LmJ0bnMucmVzZXR9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PC9kaXY+XG5cdFx0XHRcdFxuXHRcdFx0PC9mb3JtPik7XG5cdFx0XHRcblx0fSxcblx0bG9naW46IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHNhbWUgYXMgcmVnaXN0ZXIgYnV0IGxlc3MgaW5mbyBzZW50XG5cdFx0ICogeW91IGNvdWxkIGNvbWJpbmUgdGhlbSBib3RoIGlmIHlvdSBsaWtlIGxlc3MgY29kZVxuXHRcdCAqICovXG5cdFx0dmFyIG15ZGF0YSA9IHtsb2dpbjoneWVzJ307XG5cdFx0Ly9jb25zb2xlLmxvZygnZm9ybScsIHRoaXMuc3RhdGUuZm9ybSwgVGV4dC5sb2dpbiApO1xuXHRcdF8uZWFjaCh0aGlzLnN0YXRlLmZvcm0sIGZ1bmN0aW9uKHYsaykge1xuXHRcdFx0aWYodi50eXBlICE9PSAnaGVhZGVyJykge1xuXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2KTtcblx0XHRcdFx0bXlkYXRhW2tdID0gZWwudmFsdWU7XG5cdFx0XHR9XG5cdFx0fSx0aGlzKTsgXG5cdFx0bXlkYXRhW2lzS2V5XSA9IGlzTWU7XG5cdFx0Ly9jb25zb2xlLmxvZygnbXlkYXRhJywgbXlkYXRhLCAnVGV4dCcsIFRleHQubG9naW4gKTtcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBUZXh0LnJlbGF5LFxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0ZGF0YTogbXlkYXRhLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRmdW5jdGlvbiBtZXNzYWdlKCkge1xuXHRcdFx0XHRcdHZhciBzZWNzID0gKGRhdGEucmVkaXJlY3Qud2hlbiAtIHJycikgLyAxMDAwO1xuXHRcdFx0XHRcdHJycis9MTAwMDtcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UgPSBkYXRhLnJlcGVhdGVyICsgJzxiciAvPllvdSB3aWxsIGJlIHJlZGlyZWN0ZWQgdG8gPGEgaHJlZj1cIicgKyBkYXRhLnJlZGlyZWN0LnBhdGggKyAnXCI+JyArIGRhdGEucmVkaXJlY3QucGF0aC5zdWJzdHIoMSkgKyAnPC9hPiAgJztcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UgKz0gc2VjcyA9PT0gMCA/ICcgbm93JzonIGluICcgKyBzZWNzICsgJyBzZWNvbmRzLic7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYodHlwZW9mIGRhdGEucmVkaXJlY3QgPT09ICdvYmplY3QnICYmIGRhdGEucmVkaXJlY3Qud2hlbiA+IDEwMDApIHtcblx0XHRcdFx0XHRkYXRhLnJlcGVhdGVyID0gZGF0YS5tZXNzYWdlO1xuXHRcdFx0XHRcdHZhciBycnIgPSAxMDAwXG5cdFx0XHRcdFx0XHRfc2VsZiA9IHRoaXMucHJvcHMuY29udGV4dDtcblx0XHRcdFx0XHRHSW50ZXJ2YWwucmVkaXJlY3QgPSBHSW50ZXJ2YWwuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRtZXNzYWdlKCk7XG5cdFx0XHRcdFx0XHRfc2VsZi5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLGRhdGE6ZGF0YX0pO1xuXHRcdFx0XHRcdH0sMTAwMCk7XG5cdFx0XHRcdFx0R0ludGVydmFsLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRHSW50ZXJ2YWwuY2xlYXJJbnRlcnZhbHMoR0ludGVydmFsLnJlZGlyZWN0KTtcblx0XHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gZGF0YS5yZWRpcmVjdC5wYXRoO1xuXHRcdFx0XHRcdH0sZGF0YS5yZWRpcmVjdC53aGVuKTtcblx0XHRcdFx0XHRtZXNzYWdlKClcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKHR5cGVvZiBkYXRhLnJlZGlyZWN0ID09PSAnb2JqZWN0JyAmJiBkYXRhLnJlZGlyZWN0LnBhdGgpe1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gZGF0YS5yZWRpcmVjdC5wYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdHJlc3BvbnNlOiB5ZXMsXG5cdFx0XHRcdFx0ZGF0YTogZGF0YVxuXHRcdFx0XHR9KTtcblx0XHRcdH0uYmluZCh0aGlzKSxcblx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0cmVzcG9uc2U6eWVzLFxuXHRcdFx0XHRcdGRhdGE6IHtcblx0XHRcdFx0XHRcdHN0YXR1czpzdGF0dXMsXG5cdFx0XHRcdFx0XHRlcnI6ZXJyLnRvU3RyaW5nKClcblx0XHRcdFx0XHR9IFxuXHRcdFx0XHR9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdH0pO1x0XHRcblx0fVxufSk7IFxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2luO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbi8vdmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uLmpzJyk7XG52YXIgR0ludGVydmFsID0gQ29tbW9uLkdJbnRlcnZhbDtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcbi8vdmFyIHllcyA9IHRydWUsIG5vID0gZmFsc2U7XG5cbnZhciBSUiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zOiBbUmVhY3QuYWRkb25zLkxpbmtlZFN0YXRlTWl4aW5dLFxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnNldEZvcm1TdGF0ZSgpO1xuXHR9LFxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFN0YXRlKHRoaXMuc2V0Rm9ybVN0YXRlKHRoaXMuc3RhdGUudmFsaWQpKTtcblx0fSxcblx0c2V0Rm9ybVN0YXRlOiBmdW5jdGlvbih2YWxpZCkge1xuXHRcdHZhciByZXQgPSBDb21tb24uc2V0Rm9ybVN0YXRlKFRleHQucmVnaXN0ZXIsIHZhbGlkKTtcblx0XHRyZXQubmFtZSA9ICdyZWdpc3Rlcic7XG5cdFx0cmV0dXJuIHJldDtcblx0fSxcblx0aGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGlmKENvbW1vbi5zaG93QnV0dG9uKHRoaXMuc3RhdGUudmFsaWQpID09PSBmYWxzZSkge1xuXHRcdFx0dGhpcy5yZWdpc3RlcigpO1xuXHRcdH1cblx0fSxcblx0b25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcblx0XHRDb21tb24uRm9ybUlucHV0T25DaGFuZ2UuY2FsbCh0aGlzLCBlLCBUZXh0LnJlZ2lzdGVyKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAoPGZvcm0gIHJlZj0nc2lnbmluJyAgY2xhc3NOYW1lPVwic2lnbmluLWZvcm1cIiAgIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0+XG5cdFx0XHRcdDxoMj57VGV4dC5ob21lLnJlZ2lzdGVyfSA8Q29tbW9uLkdNYW4gLz48L2gyPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5mbGFzaH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8Q29tbW9uLkZvcm0gaW5wdXRzPXtUZXh0LnJlZ2lzdGVyfSBjb250ZXh0PXt0aGlzfSAvPlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiBzdHlsZT17e3RleHRBbGlnbjonbGVmdCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiBvbkNsaWNrPXt0aGlzLnJlZ2lzdGVyfSByZWY9XCJyZWdpc3RlcmJ1dHRvblwiIGRhdGEtbG9hZGluZy10ZXh0PVwiUmVnaXN0ZXJpbmcuLi5cIiByb2xlPVwiYnV0dG9uXCIgIGJzU3R5bGU9J3dhcm5pbmcnIGNsYXNzTmFtZT1cImJ0biAgYnRuLXdhcm5pbmdcIiAgZGlzYWJsZWQ9e0NvbW1vbi5zaG93QnV0dG9uKHRoaXMuc3RhdGUudmFsaWQpfT4gIHtUZXh0LmJ0bnMucmVnaXN0ZXJ9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiICAgc3R5bGU9e3t0ZXh0QWxpZ246J3JpZ2h0J319ID48Qm9vdHN0cmFwQnV0dG9uIHJvbGU9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLnByb3BzLnNob3dyZWdpc3Rlcn0gIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdFwiPiAge1RleHQuYnRucy5sb2dpbmN1cnJlbnR9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PC9kaXY+XG5cdFx0XHQ8L2Zvcm0+KTtcblx0fSxcblx0cmVnaXN0ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHZhbGlkYXRpb24gb2NjdXJzIGFzIGlucHV0IGlzIHJlY2VpdmVkIFxuXHRcdCAqIHRoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIGF2aWFsYWJsZSBpZlxuXHRcdCAqIGFsbCB2YWxpZGF0aW9uIGlzIGFscmVhZHkgbWV0IHNvIGp1c3QgcnVuXG5cdFx0ICogKi9cblx0XHRjb25zb2xlLmxvZygnZm9ybScsIHRoaXMuc3RhdGUuZm9ybSwgJ1RleHQnLCBUZXh0LnJlZ2lzdGVyICk7IFxuXHRcdHZhciBteWRhdGEgPSB7IHJlZ2lzdGVyOiAneWVzJyB9O1xuXHRcdF8uZWFjaCh0aGlzLnN0YXRlLmZvcm0sIGZ1bmN0aW9uKHYsaykge1xuXHRcdFx0aWYodi50eXBlICE9PSAnaGVhZGVyJykge1xuXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2KTtcblx0XHRcdFx0bXlkYXRhW2tdID0gZWwudmFsdWU7XG5cdFx0XHR9XG5cdFx0fSx0aGlzKTsgXG5cdFx0bXlkYXRhW2lzS2V5XSA9IGlzTWU7XG5cdFx0Y29uc29sZS5sb2coJ215ZGF0YScsIG15ZGF0YSwgJ1RleHQnLCBUZXh0LnJlZ2lzdGVyICk7XG5cdFx0dmFyIGJ0biA9ICQodGhpcy5yZWZzLnJlZ2lzdGVyYnV0dG9uLmdldERPTU5vZGUoKSlcblx0XHRidG4uYnV0dG9uKCdsb2FkaW5nJylcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBUZXh0LnJlbGF5LFxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0ZGF0YTogbXlkYXRhLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0ZnVuY3Rpb24gbWVzc2FnZSgpIHtcblx0XHRcdFx0XHR2YXIgc2VjcyA9IChkYXRhLnJlZGlyZWN0LndoZW4gLSBycnIpIC8gMTAwMDtcblx0XHRcdFx0XHRycnIrPTEwMDA7XG5cdFx0XHRcdFx0ZGF0YS5tZXNzYWdlID0gZGF0YS5yZXBlYXRlciArICc8YnIgLz5Zb3Ugd2lsbCBiZSByZWRpcmVjdGVkIHRvIDxhIGhyZWY9XCInICsgZGF0YS5yZWRpcmVjdC5wYXRoICsgJ1wiPicgKyBkYXRhLnJlZGlyZWN0LnBhdGguc3Vic3RyKDEpICsgJzwvYT4gICc7XG5cdFx0XHRcdFx0ZGF0YS5tZXNzYWdlKz0gc2VjcyA9PT0gMCA/ICcgbm93JzonIGluICcgKyBzZWNzICsgJyBzZWNvbmRzLic7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaWYgd2UgZ2V0IGEgcmVkaXJlY3QgY2hlY2sgdGhlIHRpbWUgYW5kIHJ1biBhbiBpbnRlcnZhbFxuXHRcdFx0XHQgKiB0aGlzIGlzIHJlYWxseSBqdXN0IHRvIHNob3cgUmVhY3Qgd29ya1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdGlmKHR5cGVvZiBkYXRhLnJlZGlyZWN0ID09PSAnb2JqZWN0JyAmJiBkYXRhLnJlZGlyZWN0LndoZW4+MTAwMCkge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGRhdGEucmVwZWF0ZXIgPSBkYXRhLm1lc3NhZ2U7IC8va2VlcCBvdXIgb3JpZ2luYWwgbWVzc2FnZSBmb3IgdGhlIHJlcGVhdGVyXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dmFyIHJyciA9IDEwMDBcblx0XHRcdFx0XHRcdF9zZWxmID0gdGhpcy5wcm9wcy5jb250ZXh0O1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdFNub3dwaUludGVydmFsLnJlZGlyZWN0ID0gU25vd3BpSW50ZXJ2YWwuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQvKiB0aGlzIGlzIHJlYWxseSBzaW1wbGVcblx0XHRcdFx0XHRcdCAqIGp1c3QgcmVjYWN1bGF0ZSB0aGUgbWVzc2FnZSBhbmQgbGV0IHJlYWN0IGRvIHRoZSByZXN0XG5cdFx0XHRcdFx0XHQgKiAqL1xuXHRcdFx0XHRcdFx0bWVzc2FnZSgpO1xuXHRcdFx0XHRcdFx0X3NlbGYuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdFx0XHRyZXNwb25zZTogeWVzLFxuXHRcdFx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9LDEwMDApO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8qIGtpbGwgdGhlIGludGVydmFsIGFuZCByZWRpcmVjdCBvbiB0aGUgdGltZW91dCBcblx0XHRcdFx0XHQgKiAqL1xuXHRcdFx0XHRcdEdJbnRlcnZhbC50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0R0ludGVydmFsLmNsZWFySW50ZXJ2YWxzKEdJbnRlcnZhbC5yZWRpcmVjdCk7XG5cdFx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGRhdGEucmVkaXJlY3QucGF0aDtcblx0XHRcdFx0XHR9LGRhdGEucmVkaXJlY3Qud2hlbik7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bWVzc2FnZSgpXG5cdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYodHlwZW9mIGRhdGEucmVkaXJlY3QgPT09ICdvYmplY3QnICYmIGRhdGEucmVkaXJlY3QucGF0aCl7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvKiBmbGFzaCBtZXNzYWdlcyBhcmUgc2hvd24gd2l0aCByZXNwb25zZSA6IHllc1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0cmVzcG9uc2U6IHllcyxcblx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdH0uYmluZCh0aGlzKSxcblx0XHRcdFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5wcm9wcy51cmwsIHN0YXR1cywgZXJyLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdHJlc3BvbnNlOnllcyxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRzdGF0dXM6c3RhdHVzLFxuXHRcdFx0XHRcdFx0ZXJyOmVyci50b1N0cmluZygpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdFxuXHRcdC8qIG5lYXQgbGl0dGxlIHRyaWNrIHRvIGFsd2F5cyByZXNldCBvdXIgYnV0dG9uc1xuXHRcdCogKi9cdFxuXHRcdH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcblx0XHRcdGJ0bi5idXR0b24oJ3Jlc2V0Jyk7XG5cdFx0fSk7XG5cdFx0XG5cdH0sXG59KTsgXG5cbm1vZHVsZS5leHBvcnRzID0gUlI7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuLy92YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24uanMnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIEJvb3RzdHJhcEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkJ1dHRvbjtcbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxudmFyIFJlc2V0UGFzc3dvcmQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG1peGluczogW1JlYWN0LmFkZG9ucy5MaW5rZWRTdGF0ZU1peGluXSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRGb3JtU3RhdGUoKTtcblx0fSwgXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5yZXNldCwgdmFsaWQpO1xuXHRcdHJldC5uYW1lID0gJ3Jlc2V0Jztcblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0aWYoQ29tbW9uLnNob3dCdXR0b24odGhpcy5zdGF0ZS52YWxpZCkgPT09IGZhbHNlKSB7XG5cdFx0XHR0aGlzLnJlc2V0ZW1haWwoKTtcblx0XHR9XG5cdH0sXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG5cdFx0Q29tbW9uLkZvcm1JbnB1dE9uQ2hhbmdlLmNhbGwodGhpcywgZSwgVGV4dC5yZXNldCk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKDxmb3JtICByZWY9J3NpZ25pbicgIGNsYXNzTmFtZT1cInNpZ25pbi1mb3JtXCIgIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0gPlxuXHRcdFx0XHQ8aDI+e1RleHQuaG9tZS5yZXNldH0gPENvbW1vbi5HTWFuIC8+PC9oMj5cblx0XHRcdFx0e3RoaXMucHJvcHMuZmxhc2h9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PENvbW1vbi5Gb3JtIGlucHV0cz17VGV4dC5yZXNldH0gY29udGV4dD17dGhpc30gLz5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgID48Qm9vdHN0cmFwQnV0dG9uIHJvbGU9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLnJlc2V0ZW1haWx9IHJlZj1cInJlc2V0YnV0dG9uXCIgYnNTdHlsZT0naW5mbycgZGlzYWJsZWQ9e0NvbW1vbi5zaG93QnV0dG9uKHRoaXMuc3RhdGUudmFsaWQpfSAgZGF0YS1sb2FkaW5nLXRleHQ9XCJDaGVja2luZy4uLlwiID4gIHtUZXh0LmJ0bnMucmVzZXRlbWFpbH0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgc3R5bGU9e3t0ZXh0QWxpZ246J3JpZ2h0J319ID48Qm9vdHN0cmFwQnV0dG9uIG9uQ2xpY2s9e3RoaXMucHJvcHMuY2hhbmdlUmVzZXR9ICBic1N0eWxlPSdkZWZhdWx0Jz4gIHtUZXh0LmJ0bnMubG9naW5jdXJyZW50fSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48L2Rpdj5cblx0XHRcdDwvZm9ybT4pO1xuXHRcdFx0XG5cdH0sXG5cdHJlc2V0ZW1haWw6IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHZhbGlkYXRpb24gb2NjdXJzIGFzIGlucHV0IGlzIHJlY2VpdmVkIFxuXHRcdCAqIHRoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIGF2aWFsYWJsZSBpZlxuXHRcdCAqIGFsbCB2YWxpZGF0aW9uIGlzIGFscmVhZHkgbWV0IHNvIGp1c3QgcnVuXG5cdFx0ICogKi9cblx0XHR2YXIgbXlkYXRhID0ge3Jlc2V0Oid5ZXMnfTtcblx0XHRjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmZvcm0pO1xuXHRcdF8uZWFjaCh0aGlzLnN0YXRlLmZvcm0sIGZ1bmN0aW9uKHYsaykge1xuXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2KTtcblx0XHRcdFx0bXlkYXRhW2tdID0gZWwudmFsdWU7XG5cdFx0fSx0aGlzKTtcblx0XHRteWRhdGFbaXNLZXldID0gaXNNZTtcblx0XHR2YXIgYnRuID0gJCh0aGlzLnJlZnMucmVzZXRidXR0b24uZ2V0RE9NTm9kZSgpKVxuXHRcdGJ0bi5idXR0b24oJ2xvYWRpbmcnKVxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IFRleHQucmVzZXRlbWFpbCxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdGRhdGE6IG15ZGF0YSxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcdFxuXHRcdFx0XHRmdW5jdGlvbiBtZXNzYWdlKCkge1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSA9ICdTdWNjZXNzJztcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBmbGFzaCBtZXNzYWdlcyBhcmUgc2hvd24gd2l0aCByZXNwb25zZSA6IHllc1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLGRhdGE6ZGF0YSxyZXNldGZvcm06bm8scmVzZXRjb2RlOnllc30pO1xuXHRcdFx0XHRcblx0XHRcdH0uYmluZCh0aGlzKSxcblx0XHRcdFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5wcm9wcy51cmwsIHN0YXR1cywgZXJyLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe3Jlc3BvbnNlOnllcyxyZXNldGZvcm06bm8sZGF0YToge3N0YXR1czpzdGF0dXMsZXJyOmVyci50b1N0cmluZygpfSB9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdFxuXHRcdC8qIGFsd2F5cyByZXNldCBvdXIgYnV0dG9uc1xuXHRcdCogKi9cdFxuXHRcdH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcblx0XHRcdGJ0bi5idXR0b24oJ3Jlc2V0Jyk7XG5cdFx0fSk7XG5cdFx0XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2V0UGFzc3dvcmQ7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFJlYWN0Qm9vdHN0cmFwID0gcmVxdWlyZSgncmVhY3QtYm9vdHN0cmFwJyk7XG52YXIgTG9naW4gPSByZXF1aXJlKCcuL2Zvcm1zL2xvZ2luJyk7XG52YXIgUmVnID0gcmVxdWlyZSgnLi9mb3Jtcy9yZWcnKTtcbnZhciBSZXNldFBhc3N3b3JkID0gcmVxdWlyZSgnLi9mb3Jtcy9yZXNldCcpO1xudmFyIFJlc2V0Q29kZSA9IHJlcXVpcmUoJy4vZm9ybXMvY29kZScpO1xudmFyIEdGbGFzaCA9IHJlcXVpcmUoJy4vZmxhc2gnKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuL2NvbW1vbi5qcycpO1xudmFyIEdJbnRlcnZhbCA9IENvbW1vbi5HSW50ZXJ2YWw7XG4vL3ZhciBUZXh0ID0gSlNPTi5wYXJzZShyZXF1aXJlKCd0ZXh0JykpO1xuXG4vKipcbiAqIHVzZSB5ZXMgZm9yIHRydWVcbiAqIHVzZSBubyBmb3IgZmFsc2VcbiAqIFxuICogdGhpcyBzaW5nbGUgYXBwIHVzZXMgdGhlIHllcy9ubyB2YXIgc28gaWYgeW91IHdhbnQgeW91IGNhbiBzd2l0Y2ggYmFjayB0byB0cnVlL2ZhbHNlXG4gKiBcbiAqICovXG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcbi8vdmFyIHllcyA9IHRydWUsIG5vID0gZmFsc2U7XG5cbi8qIHRoaXMgaXMgb3VyIG1haW4gY29tcG9uZW50XG4gKiBzaW5jZSB0aGlzIGlzIGEgc2luZ2xlIGZ1bmN0aW9uIGFwcCB3ZSB3aWxsIGNhbGwgdGhpcyBkaXJlY3RseVxuICogXG4gKiB0byBpbmNsdWRlIHRoaXMgaW4geW91ciBSZWFjdCBzZXR1cCBtb2RpZnkgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyB0byByZWNpZXZlIGFueSBkZWZhdWx0IHZhbHVlcyBcbiAqIFxuICogKi9cblxudmFyIEJvb3RzdHJhcEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkJ1dHRvbjtcblxudmFyIEdMb2dpbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zOiBbUmVhY3QuYWRkb25zLkxpbmtlZFN0YXRlTWl4aW5dLFxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuXHRcdC8qIGluaXRpYWxpemUgdGhlIGxvZ2luXG5cdFx0ICogcmVnaXN0ZXIgaXMgbm8sIGlmIHdlIHdhbnQgdG8gc2hvdyB0aGUgcmVnaXN0ZXIgZm9ybSBzZXQgdG8geWVzXG5cdFx0ICogbW91bnRlZCBpcyBzZXQgdG8geWVzIHdoZW4gdGhlIGFwcCBtb3VudHMgaWYgeW91IG5lZWQgdG8gd2FpdCBmb3IgdGhhdFxuXHRcdCAqIHNldCByZXNwb25zZSB0byB5ZXMgdG8gc2hvdyBhIGZsYXNoIG1lc3NhZ2Vcblx0XHQgKiBlcnJvciBtZXNzYWdlcyBhcmUgaW4gZGF0YVxuXHRcdCAqICovXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlZ2lzdGVyOiB3aW5kb3cuaW5pdGlhbFBhZ2UgPT09ICdyZWdpc3RlcicgPyB5ZXMgOiBubyxcblx0XHRcdHJlc2V0Y29kZTogd2luZG93LmluaXRpYWxQYWdlID09PSAncmVzZXRjb2RlJyA/IHllcyA6IG5vLFxuXHRcdFx0cmVzZXRmb3JtOiB3aW5kb3cuaW5pdGlhbFBhZ2UgPT09ICdyZXNldC1wYXNzd29yZCcgfHwgd2luZG93LmluaXRpYWxQYWdlID09PSAncmVzZXQnID8geWVzIDogbm8sXG5cdFx0XHRtb3VudGVkOiBubywgXG5cdFx0XHRyZXNwb25zZTogbm8sIFxuXHRcdFx0ZGF0YTp7fVxuXHRcdH07XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHdlIHdhbnQgdG8ga2lsbCB0aGUgZmxhc2ggYW55dGltZSB0aGUgZm9ybSBpcyByZW5kZXJlZFxuXHRcdCAqIHlvdSBjYW4gYWRkIGFueSBvdGhlciBwcm9wcyB5b3UgbmVlZCBoZXJlIGlmIHlvdSBpbmNsdWRlXG5cdFx0ICogdGhpcyBpbiBhbm90aGVyIGNvbXBvbmVudCBcblx0XHQgKiAqL1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0cmVzcG9uc2U6bm9cblx0XHR9KTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNob3dmbGFzaG1lc3NhZ2UgPSBmYWxzZTtcblx0XHR2YXIgaGFzZXJyb3IgPSBmYWxzZTtcblx0XHR2YXIgbG9naW5PUnJlZ2lzdGVyID0gKHRoaXMuc3RhdGUucmVnaXN0ZXIgPT09IHllcyB8fCB3aW5kb3cuaW5pdGlhbFBhZ2UgPT09ICdyZWdpc3RlcicgKSA/ICdyZWdpc3RlcicgOiAnbG9naW4nO1xuXHRcdC8qIGlmIHJlc3BvbnNlIHN0YXRlIGlzIHllcyB3ZSBoYXZlIGEgZmxhc2ggbWVzc2FnZSB0byBzaG93XG5cdFx0ICogdGhlIG1lc3NhZ2UgaXMgaW4gZGF0YVxuXHRcdCAqICovXG5cdFx0aWYodGhpcy5zdGF0ZS5yZXNwb25zZSA9PT0geWVzKSB7XG5cdFx0XHRcblx0XHRcdHZhciBwaWNrY2xhc3MgPSAodGhpcy5zdGF0ZS5kYXRhLnN1Y2Nlc3MgPT09IHllcyApID8gJ3N1Y2Nlc3MnIDogJ3dhcm5pbmcnOyBcblx0XHRcdFxuXHRcdFx0c2hvd2ZsYXNobWVzc2FnZSA9IDxHRmxhc2ggc2hvd2NsYXNzPXtwaWNrY2xhc3N9IGNsZWFydGltZW91dHM9e1tHSW50ZXJ2YWwudGltZW91dF19IGNsZWFyaW50ZXJ2YWxzPXtbR0ludGVydmFsLnJlZGlyZWN0XX0+PGRpdiBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogdGhpcy5zdGF0ZS5kYXRhLm1lc3NhZ2UgfHwgJyd9fSAvPjwvR0ZsYXNoID47XG5cdFx0XHRcblx0XHRcdC8qIGlmIHdlIGhhdmUgYW4gZXJyb3Igc2hha2UgdGhlIGZvcm0uICB0aGlzIGlzIGRvbmUgd2l0aCB0aGVcblx0XHRcdCAqIGhhcy1lcnJvcnMgY2xhc3Ncblx0XHRcdCAqICovXG5cdFx0XHRpZih0aGlzLnN0YXRlLmRhdGEuc3VjY2VzcyA9PT0gbm8pIGhhc2Vycm9yID0gJyBoYXMtZXJyb3JzJztcblx0XHRcdFxuXHRcdH1cblx0XHRpZih0aGlzLnN0YXRlLnJlc2V0Y29kZSA9PT0geWVzKSB7XG5cdFx0XHR2YXIgcmV0ID0gPFJlc2V0Q29kZSAgY29udGV4dD17dGhpc30gY2hhbmdlUmVzZXQ9e3RoaXMuY2hhbmdlQ29kZX0gZmxhc2g9e3Nob3dmbGFzaG1lc3NhZ2V9IC8+XG5cdFx0fSBlbHNlIGlmKHRoaXMuc3RhdGUucmVzZXRmb3JtID09PSB5ZXMpIHtcblx0XHRcdHZhciByZXQgPSA8UmVzZXRQYXNzd29yZCAgY29udGV4dD17dGhpc30gY2hhbmdlUmVzZXQ9e3RoaXMuY2hhbmdlUmVzZXR9IGZsYXNoPXtzaG93Zmxhc2htZXNzYWdlfSAvPlxuXHRcdH0gZWxzZSBpZih0aGlzLnN0YXRlLnJlZ2lzdGVyID09PSBubykge1xuXHRcdFx0dmFyIHJldCA9IDxMb2dpbiAgY29udGV4dD17dGhpc30gc2hvd3JlZ2lzdGVyPXt0aGlzLnNob3dyZWdpc3Rlcn0gY2hhbmdlUmVzZXQ9e3RoaXMuY2hhbmdlUmVzZXR9IGZsYXNoPXtzaG93Zmxhc2htZXNzYWdlfSAvPlxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgcmV0ID0gPFJlZyBzaG93cmVnaXN0ZXI9e3RoaXMuc2hvd3JlZ2lzdGVyfSBmbGFzaD17c2hvd2ZsYXNobWVzc2FnZX0gY29udGV4dD17dGhpc30gLz5cblx0XHR9XG5cdFx0cmV0dXJuICggPGRpdiAgY2xhc3NOYW1lPXtsb2dpbk9ScmVnaXN0ZXIgKyBcIiBjZW50ZXJtZSBjb2wteHMtMTIgc2hha2VtZSBcIiArIGhhc2Vycm9yfT57cmV0fSA8L2Rpdj4pO1xuXHR9LFxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gV2hlbiB0aGUgY29tcG9uZW50IGlzIGFkZGVkIGxldCBtZSBrbm93XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRtb3VudGVkOiB5ZXNcblx0XHR9KTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHNob3dyZWdpc3RlcjogZnVuY3Rpb24gKGUpIHtcblx0XHQvKiB0b2dnbGUgdGhlIHJlZ2lzdGVyIC8gbG9naW4gZm9ybXNcblx0XHQgKiAqL1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0cmVnaXN0ZXI6IHRoaXMuc3RhdGUucmVnaXN0ZXIgPT09IHllcyA/IG5vIDogeWVzLFxuXHRcdFx0cmVzcG9uc2U6IG5vLFxuXHRcdFx0cmVzZXRmb3JtOiBubyxcblx0XHRcdHJlc2V0Y29kZTogbm8sXG5cdFx0fSk7XG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fSxcblx0Y2hhbmdlUmVzZXQ6IGZ1bmN0aW9uIChlKSB7XG5cdFx0LyogdG9nZ2xlIHRoZSBwYXNzd29yZCByZXNldFxuXHRcdCAqICovXG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRyZXNldGZvcm06IHRoaXMuc3RhdGUucmVzZXRmb3JtID09PSB5ZXMgPyBubyA6IHllcyxcblx0XHRcdHJlZ2lzdGVyOiBubyxcblx0XHRcdHJlc2V0Y29kZTogbm8sXG5cdFx0XHRyZXNwb25zZTogbm9cblx0XHR9KTtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRjaGFuZ2VDb2RlOiBmdW5jdGlvbiAoZSkge1xuXHRcdC8qIHRvZ2dsZSB0aGUgcGFzc3dvcmQgcmVzZXRcblx0XHQgKiAqL1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBcblx0XHRcdHJlc2V0Y29kZTogdGhpcy5zdGF0ZS5yZXNldGNvZGUgPT09IHllcyA/bm8gOiB5ZXMsXG5cdFx0XHRyZXNwb25zZTpubyxcblx0XHRcdHJlZ2lzdGVyOiBubyxcblx0XHRcdHJlc2V0Zm9ybTogbm8sXG5cdFx0fSk7XG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fSxcblx0aGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR0xvZ2luO1xuIl19
