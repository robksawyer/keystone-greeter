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
				React.createElement("h2", null, Text.home.login, " ", React.createElement(Common.GMan, null)), 
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
				
				this.props.context.setState({
					response: yes,
					data: data
				});
			}.bind(this),
			error: function(xhr, status, err) {
				console.log(err, status, err.toString());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvY29tbW9uLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZmFrZV9kMjc0YjU5Yy5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL3Nub3dwaS9qcy9saWIvcmVhY3QvanN4L2ZsYXNoLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvY29kZS5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL3Nub3dwaS9qcy9saWIvcmVhY3QvanN4L2Zvcm1zL2xvZ2luLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvcmVnLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvcmVzZXQuanMiLCIvaG9tZS9zbm93L3Byb2plY3RzL2dpdGh1Yi9rZXlzdG9uZS1ncmVldGVyL3B1YmxpYy9zbm93cGkvanMvbGliL3JlYWN0L2pzeC9ncmVldGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGlu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QUM7RUFDYjtBQUNGLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQzVCOztFQUVFLElBQUksQ0FBQyxRQUFRLENBQUM7R0FDYixRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHO0dBQ2hELFFBQVEsRUFBRSxFQUFFO0dBQ1osQ0FBQyxDQUFDO0VBQ0gsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDMUI7QUFDRixDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRTtBQUMzQjs7RUFFRSxJQUFJLENBQUMsUUFBUSxDQUFDO0dBQ2IsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRztHQUNsRCxRQUFRLEVBQUUsRUFBRTtHQUNaLENBQUMsQ0FBQztFQUNILE9BQU8sQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0VBQzFCO0FBQ0YsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDMUI7O0VBRUUsSUFBSSxDQUFDLFFBQVEsQ0FBQztHQUNiLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUc7R0FDakQsUUFBUSxDQUFDLEVBQUU7R0FDWCxDQUFDLENBQUM7RUFDSCxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMxQjtDQUNELFlBQVksRUFBRSxTQUFTLENBQUMsRUFBRTtFQUN6QixPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMxQjtBQUNGLENBQUMsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbi8qIG1hbiBjb21wb25lbnRcbiAqIHNpbXBsZSBleGFtcGxlXG4gKiAqL1xudmFyIEdNYW4gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICh7ZGl2c3R5bGU6e2Zsb2F0OidyaWdodCcsfX0pO1xuXHR9LFxuXHRcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0ICAgIHJldHVybiAoXG5cdFx0PGRpdiBzdHlsZT17dGhpcy5wcm9wcy5kaXZzdHlsZX0gZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IFRleHQubG9nb21hbiB8fCAnJ319IC8+XG5cdCAgICApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMuR01hbiA9IEdNYW47XG5cbi8qIFxuICogd2UgdXNlIHRoaXMgZm9yIHRoZSBjb3VudGRvd24gdGltZXIgYmVmb3JlIHdlIHJlZGlyZWN0IGEgbG9nZ2VkIFxuICogaW4gdXNlci4gIHlvdSBjYW4gZGlzYWJsZSBpdCBcbiAqIGJ5IHNlbmRpbmcgYSByZWRpcmVjdCB0aW1lIG9mIDBcbiAqICovXG52YXIgR0ludGVydmFsID0ge1xuXHQgIGludGVydmFsczogW10sXG5cdCAgc2V0SW50ZXJ2YWw6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmludGVydmFscy5wdXNoKHNldEludGVydmFsLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuXHQgIH0sXG5cdCAgY2xlYXJJbnRlcnZhbHM6IGZ1bmN0aW9uKHdobykge1xuXHRcdHdobyA9IHdobyAtIDE7XG5cdFx0aWYoR0ludGVydmFsLmludGVydmFscy5sZW5ndGggPT09IDEpIHtcblx0XHRcdC8vY29uc29sZS5sb2coJ2NsZWFyIGFsbCBpbnRlcnZhbHMnLHRoaXMuaW50ZXJ2YWxzKVxuXHRcdFx0R0ludGVydmFsLmludGVydmFscy5tYXAoY2xlYXJJbnRlcnZhbCk7XG5cdFx0XHRHSW50ZXJ2YWwuaW50ZXJ2YWxzID0gW107XG5cdFx0fSBlbHNlIGlmKHdobyAmJiBHSW50ZXJ2YWwuaW50ZXJ2YWxzW3dob10pIHtcblx0XHRcdC8vY29uc29sZS5sb2coJ2NsZWFyIGludGVydmFscycsd2hvLHRoaXMuaW50ZXJ2YWxzW3dob10pXG5cdFx0XHRjbGVhckludGVydmFsKEdJbnRlcnZhbC5pbnRlcnZhbHNbd2hvXSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vY29uc29sZS5sb2coJ21hcCBpbnRlcnZhbHMnLHRoaXMuaW50ZXJ2YWxzKVxuXHRcdFx0R0ludGVydmFsLmludGVydmFscy5tYXAoY2xlYXJJbnRlcnZhbCk7XG5cdFx0XHRHSW50ZXJ2YWwuaW50ZXJ2YWxzID0gW107XG5cdFx0fVxuXHQgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLkdJbnRlcnZhbCA9IEdJbnRlcnZhbDtcblxubW9kdWxlLmV4cG9ydHMuc2hvd0J1dHRvbiA9IGZ1bmN0aW9uKGlucHV0cykge1xuXHR2YXIgdmFsaWQgPSBfLmluY2x1ZGVzKGlucHV0cywgZmFsc2UpO1xuXHQvL2NvbnNvbGUubG9nKCdidXR0b24nLCBpbnB1dHMsIHZhbGlkKTtcblx0cmV0dXJuIHZhbGlkO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5zZXRGb3JtU3RhdGUgPSBmdW5jdGlvbihpbnB1dHMsIHZhbGlkKSB7XG5cdHZhciByZXQgPSB7fTtcblx0cmV0LnZhbGlkID0gXy5pc09iamVjdCh2YWxpZCkgPyB2YWxpZCA6IHt9O1xuXHRyZXQuZm9ybSA9IHt9O1xuXHRfLmVhY2goaW5wdXRzLCBmdW5jdGlvbih2KSB7XG5cdFx0aWYodi50eXBlICE9PSAnaGVhZGVyJykgcmV0LmZvcm1bdi5maWVsZF0gPSB2Ll9uYW1lO1xuXHRcdGlmKHYucmVxdWlyZWQgJiYgIXJldC52YWxpZFt2LmZpZWxkXSkge1xuXHRcdFx0cmV0LnZhbGlkW3YuZmllbGRdID0gZmFsc2U7XG5cdFx0fVxuXHRcdGlmKHYuYXR0YWNoKSB7XG5cdFx0XHRyZXQuZm9ybVt2LmF0dGFjaC5maWVsZF0gPSB2Ll9uYW1lICsgJ19hdHRhY2gnO1xuXHRcdFx0aWYodi5yZXF1aXJlZCAmJiAhcmV0LnZhbGlkW3YuYXR0YWNoLmZpZWxkXSkge1xuXHRcdFx0XHRyZXQudmFsaWRbdi5hdHRhY2guZmllbGRdID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHJldDtcbn1cblxubW9kdWxlLmV4cG9ydHMuRm9ybSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXHRcdHZhciBmb3JtID0gW107XG5cdFx0Ly8gc29ydCBvdXQgb2JqZWN0IG9mIGZvcm0gZWxlbWVudHMgYW5kIGFkZCB0aGVtIHRvIGFuIGFycmF5XG5cdFx0Y29uc29sZS5sb2codGhpcy5wcm9wcy5pbnB1dHMpO1xuXHRcdHZhciBzb3J0ZWRfbGlzdCA9IF8odGhpcy5wcm9wcy5pbnB1dHMpLmtleXMoKS5zb3J0KCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHZhciB2YWx1ZSA9IF90aGlzLnByb3BzLmlucHV0c1trZXldO1xuXHRcdFx0Zm9ybS5wdXNoKGNvbnRhaW5lcihrZXksIHZhbHVlLCBfdGhpcy5wcm9wcy5pbnB1dHMsIF90aGlzLnByb3BzLmNvbnRleHQpKTtcblx0XHR9KS52YWx1ZSgpO1xuXHRcdFxuXHRcdHJldHVybiBmb3JtLmxlbmd0aCA9PT0gMCA/ICg8c3BhbiAvPikgOiAoPGRpdj57Zm9ybX08L2Rpdj4pO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMuRm9ybUlucHV0T25DaGFuZ2UgPSBmdW5jdGlvbihldmVudCwgZm9ybSkge1xuICAgIC8vIGdldCB0aGUgY3VycmVudCB2YWx1ZVxuICAgIHZhciBjaGFuZ2UgPSB7XG5cdFx0dmFsaWQ6IF8uY2xvbmUodGhpcy5zdGF0ZS52YWxpZCksXG5cdH07XG5cdFxuXHR2YXIgdmFsaWQgPSBmYWxzZTtcblx0dmFyIHBhcmVudCA9IGZhbHNlO1xuXHRcblx0Ly8gaXMgdGhpcyBhdHRhY2hlZFxuXHRpZihldmVudC50YXJnZXQuZGF0YXNldC5kZXBlbmRzb24gIT09ICdmYWxzZScpIHtcblx0XHRwYXJlbnQgPSAgZm9ybVtldmVudC50YXJnZXQuZGF0YXNldC5kZXBlbmRzb25dO1xuXHRcdHZhciBpbnB1dCA9IGZvcm1bZXZlbnQudGFyZ2V0LmlkXTtcblx0XHRwYXJlbnQuRE9NID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFyZW50Ll9uYW1lKTtcblx0XHQvL2NvbnNvbGUubG9nKGV2ZW50LnRhcmdldC5kYXRhc2V0LmRlcGVuZHNvbik7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGlucHV0ID0gZm9ybVtldmVudC50YXJnZXQuaWRdO1xuXHR9XG5cdFxuXHRpZihpbnB1dC5yZXF1aXJlZCkge1x0XG5cdFx0aWYoXy5pc0FycmF5KGlucHV0LnJlZ2V4KSkge1xuXHRcdFx0dmFyIHJ4ID0gbmV3IFJlZ0V4cChpbnB1dC5yZWdleFswXSxpbnB1dC5yZWdleFsxXSk7XG5cdFx0XHR2YWxpZCA9IHJ4LnRlc3QoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFsaWQgPSBldmVudC50YXJnZXQudmFsdWUgIT09ICcnO1xuXHRcdH1cblx0XHRpZih2YWxpZCAmJiBwYXJlbnQgJiYgcGFyZW50LnR5cGUgPT09ICdwYXNzd29yZCcpIHtcblx0XHRcdGlmKGV2ZW50LnRhcmdldC52YWx1ZSAhPT0gJycgJiYgZXZlbnQudGFyZ2V0LnZhbHVlID09PSBwYXJlbnQuRE9NLnZhbHVlKSB7XG5cdFx0XHRcdHZhbGlkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYodmFsaWQgJiYgcGFyZW50ICYmIHBhcmVudC50eXBlID09PSAnc2VsZWN0Jykge1xuXHRcdFx0aWYoZXZlbnQudGFyZ2V0LnZhbHVlICE9PSAnJyAmJiBwYXJlbnQuRE9NLnZhbHVlICE9PSAnJykge1xuXHRcdFx0XHR2YWxpZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdGNoYW5nZS52YWxpZFtpbnB1dC5maWVsZF0gPSB2YWxpZDtcblx0XHRcblx0fVxuXHRcblx0Ly9jb25zb2xlLmxvZygnY2hhbmdlJywgdmFsaWQsIGNoYW5nZSk7XG4gICAgdGhpcy5zZXRTdGF0ZShjaGFuZ2UpO1xufVxuXG5cbmZ1bmN0aW9uIHZhbGlkYXRlX2NsYXNzKGlucHV0LCBjb250ZXh0KSB7XG5cdHZhciB2YWxpZCA9IGNvbnRleHQuc3RhdGUudmFsaWQ7XG5cdGlmKCFpbnB1dC5yZXF1aXJlZCkge1xuXHRcdHJldHVybiAnaW5wdXQtZ3JvdXAnO1xuXHR9IGVsc2Uge1xuXHRcdGlmKHZhbGlkW2lucHV0LmZpZWxkXSkge1xuXHRcdFx0cmV0dXJuICdpbnB1dC1ncm91cCc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAnaW5wdXQtZ3JvdXAgaGFzLWVycm9yJztcblx0XHR9XG5cdH1cbn1cblxuXG5mdW5jdGlvbiBpbnB1dChuYW1lLCBvcHRpb25zLCBjb250ZXh0KSB7XG5cdFxuXHRpZighXy5pc09iamVjdChvcHRpb25zKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRcblx0dmFyIHR5cGUgPSBvcHRpb25zLnR5cGU7XG5cdHZhciBkZXBlbmRzT24gPSBvcHRpb25zLmRlcGVuZHNPbiA/IG9wdGlvbnMuZGVwZW5kc09uIDogZmFsc2U7XG5cdFxuXHRpZih0eXBlID09PSAndGV4dCcpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9e29wdGlvbnMuX25hbWV9ICByZWZzPXtvcHRpb25zLl9uYW1lfSBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWRlcGVuZHNvbj17ZGVwZW5kc09ufSAgb25DaGFuZ2U9e2NvbnRleHQub25DaGFuZ2V9ICAgLz5cblx0XHQpO1xuXHRcdFxuXHR9IGVsc2UgaWYodHlwZSA9PT0gJ3Bhc3N3b3JkJykge1xuXHRcdC8vIGFkZCBwYXNzd29yZCBmaWVsZFxuXHRcdHZhciBkZXBlbmRzT24gPSBvcHRpb25zLmRlcGVuZHNPbiA/IG9wdGlvbnMuZGVwZW5kc09uIDogZmFsc2U7XG5cdFx0cmV0dXJuICggXG5cdFx0XHQ8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgaWQ9e29wdGlvbnMuX25hbWV9IGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIGRhdGEtZGVwZW5kc29uPXtkZXBlbmRzT259ICBvbkNoYW5nZT17Y29udGV4dC5vbkNoYW5nZX0gIC8+XG5cdFx0KTtcblx0XHRcblx0fSBlbHNlIGlmKHR5cGUgPT09ICdzZWxlY3QnKSB7XG5cdFx0XG5cdFx0dmFyIG90aGVyLCBvcHRzO1xuXHRcdC8vIGJ1aWxkIHRoZSBvcHRpb25zIGxpc3Rcblx0XHRpZihfLmlzQXJyYXkob3B0aW9ucy5vcHRpb25zKSkge1xuXHRcdFx0b3B0cyA9IG9wdGlvbnMub3B0aW9ucy5tYXAoZnVuY3Rpb24ob3ApIHtcblx0XHRcdFx0aWYoXy5pc1N0cmluZyhvcCkpIHtcblx0XHRcdFx0XHRvcCA9IHtcblx0XHRcdFx0XHRcdGxhYmVsOm9wLFxuXHRcdFx0XHRcdFx0dmFsdWU6b3Bcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuICggXG5cdFx0XHRcdFx0PG9wdGlvbiBrZXk9e29wLmxhYmVsfSB2YWx1ZT17b3AudmFsdWUgfHwgb3AubGFiZWx9PntvcC5sYWJlbH08L29wdGlvbj5cblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR2YXIgZGVwZW5kc09uID0gb3B0aW9ucy5kZXBlbmRzT24gPyBvcHRpb25zLmRlcGVuZHNPbiA6IGZhbHNlO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8c2VsZWN0IGlkPXtvcHRpb25zLl9uYW1lfSBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWRlcGVuZHNvbj17ZGVwZW5kc09ufSAgb25DaGFuZ2U9e2NvbnRleHQub25DaGFuZ2V9ICA+XG5cdFx0XHRcdHtvcHRzfVxuXHRcdFx0PC9zZWxlY3Q+XG5cdFx0KTtcblx0XHRcblx0fSBcblx0XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5lcihuYW1lLCBvcHRpb25zLCBpbnB1dHMsIGNvbnRleHQpIHtcblx0XG5cdGlmKCFfLmlzT2JqZWN0KG9wdGlvbnMpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGlmKG9wdGlvbnMuYXR0YWNoZWQpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0XG5cdHZhciB0eXBlID0gb3B0aW9ucy50eXBlO1xuXHRcblx0aWYodHlwZSA9PT0gJ2hlYWRlcicpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBrZXk9e25hbWV9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC1zbS0xMlwiPlxuXHRcdFx0XHRcdFx0PHAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sLXN0YXRpY1wiIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBvcHRpb25zLmxhYmVsIHx8ICcnfX0gLz5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1x0XG5cdFx0XG5cdH0gZWxzZSB7XG5cdFx0dmFyIHRoZWlucHV0ID0gaW5wdXQobmFtZSwgb3B0aW9ucywgY29udGV4dCk7XG5cdFx0dmFyIGF0dGFjaGVkID0gZmFsc2U7XG5cdFx0aWYoaW5wdXRzW25hbWUgKyAnX2F0dGFjaCddKSB7XG5cdFx0XHRhdHRhY2hlZCA9IGlucHV0KG5hbWUgKyAnX2F0dGFjaCcsIGlucHV0c1tuYW1lICsgJ19hdHRhY2gnXSwgY29udGV4dCk7XG5cdFx0fVxuXHRcdFxuXHRcdHZhciBjbGFzID0gdmFsaWRhdGVfY2xhc3Mob3B0aW9ucywgY29udGV4dCk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBrZXk9e25hbWV9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXN9Plx0XHRcblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiaW5wdXQtZ3JvdXAtYWRkb25cIiAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IG9wdGlvbnMubGFiZWwgfHwgJyd9fSAvPiBcblx0XHRcdFx0e3RoZWlucHV0fVxuXHRcdFx0XHR7YXR0YWNoZWR9XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIEFwcCA9IHJlcXVpcmUoJy4vZ3JlZXRlci5qcycpO1xudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcblxuJChmdW5jdGlvbigpIHtcblx0Ly9jb25zb2xlLmxvZygncmVhY3QnLFJlYWN0KTtcblx0Lyogc3RhcnQgb3VyIGFwcCBhZnRlciB0aGUgcGFnZSBpcyByZWFkeSAqLyBcdFxuXHRSZWFjdC5yZW5kZXIoPEFwcCAgLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbm93cGknKSk7XG5cbn0pO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xuXG4vKiBjcmVhdGUgZmxhc2ggbWVzc2FnZSBcbiAqICovXG52YXIgRmxhc2ggPSBSZWFjdEJvb3RzdHJhcC5BbGVydDtcblxudmFyIEdGbGFzaCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aXNWaXNpYmxlOiB0cnVlXG5cdFx0fTtcblx0fSxcblx0Z2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKHtzaG93Y2xhc3M6J2luZm8nfSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0aWYoIXRoaXMuc3RhdGUuaXNWaXNpYmxlKVxuXHRcdCAgICByZXR1cm4gbnVsbDtcblxuXHRcdHZhciBtZXNzYWdlID0gdGhpcy5wcm9wcy5jaGlsZHJlbjtcblx0XHRyZXR1cm4gKFxuXHRcdCAgICA8Rmxhc2ggYnNTdHlsZT17dGhpcy5wcm9wcy5zaG93Y2xhc3N9IG9uRGlzbWlzcz17dGhpcy5kaXNtaXNzRmxhc2h9PlxuXHRcdFx0PHA+e21lc3NhZ2V9PC9wPlxuXHRcdCAgICA8L0ZsYXNoPlxuXHRcdCk7XG5cdH0sXG5cdC8qIG1ha2Ugc3VyZSB0aGUgdXNlciBjYW4gY2FuY2VsIGFueSByZWRpcmVjdHMgYnkgY2xlYXJpbmcgdGhlIGZsYXNoIG1lc3NhZ2Vcblx0ICogKi9cblx0ZGlzbWlzc0ZsYXNoOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtpc1Zpc2libGU6IGZhbHNlfSk7XG5cdFx0aWYodGhpcy5wcm9wcy5jbGVhcmludGVydmFscyBpbnN0YW5jZW9mIEFycmF5KXRoaXMucHJvcHMuY2xlYXJpbnRlcnZhbHMubWFwKEdJbnRlcnZhbC5jbGVhckludGVydmFscyk7XG5cdFx0aWYodGhpcy5wcm9wcy5jbGVhcnRpbWVvdXRzIGluc3RhbmNlb2YgQXJyYXkpdGhpcy5wcm9wcy5jbGVhcnRpbWVvdXRzLm1hcChjbGVhclRpbWVvdXQpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHRmxhc2g7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uLmpzJyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcbi8vdmFyIHllcyA9IHRydWUsIG5vID0gZmFsc2U7XG5cbnZhciBSZXNldFBhc3N3b3JkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5yZXNldGNvZGUsIHZhbGlkKTtcblx0XHRyZXQubmFtZSA9ICdyZXNldCc7XG5cdFx0cmV0dXJuIHJldDtcblx0fSxcblx0aGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fSxcblx0b25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcblx0XHRDb21tb24uRm9ybUlucHV0T25DaGFuZ2UuY2FsbCh0aGlzLCBlLCBUZXh0LnJlc2V0Y29kZSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKDxmb3JtICByZWY9J3Jlc2V0Y29kZScgIGNsYXNzTmFtZT1cImNvZGUtZm9ybVwiICBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9ID5cblx0XHRcdFx0PGgyPntUZXh0LmhvbWUucmVzZXRjb2RlfSA8Q29tbW9uLkdNYW4gLz48L2gyPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5mbGFzaH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8Q29tbW9uLkZvcm0gaW5wdXRzPXtUZXh0LnJlc2V0Y29kZX0gY29udGV4dD17dGhpc30gLz5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgID48Qm9vdHN0cmFwQnV0dG9uIHJvbGU9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLnJlc2V0ZW1haWx9IHJlZj1cInJlc2V0YnV0dG9uXCIgYnNTdHlsZT0naW5mbycgZGlzYWJsZWQ9e0NvbW1vbi5zaG93QnV0dG9uKHRoaXMuc3RhdGUudmFsaWQpfSAgZGF0YS1sb2FkaW5nLXRleHQ9XCJDaGVja2luZy4uLlwiID4gIHtUZXh0LmJ0bnMucmVzZXRjb2RlfSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiBzdHlsZT17e3RleHRBbGlnbjoncmlnaHQnfX0gPjxCb290c3RyYXBCdXR0b24gb25DbGljaz17dGhpcy5wcm9wcy5jaGFuZ2VSZXNldH0gIGJzU3R5bGU9J2RlZmF1bHQnPiAge1RleHQuYnRucy5sb2dpbmN1cnJlbnR9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjwvZGl2PlxuXHRcdFx0PC9mb3JtPik7XG5cdFx0XHRcblx0fSxcblx0cmVzZXRlbWFpbDogZnVuY3Rpb24oKSB7XG5cdFx0LyogdmFsaWRhdGlvbiBvY2N1cnMgYXMgaW5wdXQgaXMgcmVjZWl2ZWQgXG5cdFx0ICogdGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgYXZpYWxhYmxlIGlmXG5cdFx0ICogYWxsIHZhbGlkYXRpb24gaXMgYWxyZWFkeSBtZXQgc28ganVzdCBydW5cblx0XHQgKiAqL1xuXHRcdHZhciBteWRhdGEgPSB7Y29kZToneWVzJ307XG5cdFx0Xy5lYWNoKHRoaXMuc3RhdGUuZm9ybSwgZnVuY3Rpb24odixrKSB7XG5cdFx0XHRpZih2LnR5cGUgIT09ICdoZWFkZXInKSB7XG5cdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHYpO1xuXHRcdFx0XHRteWRhdGFba10gPSBlbC52YWx1ZTtcblx0XHRcdH1cblx0XHRcdGlmKHYuYXR0YWNoKSB7XG5cdFx0XHRcdHZhciBlbEEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2ICsgJ19hdHRhY2gnKTtcblx0XHRcdFx0bXlkYXRhW3YuYXR0YWNoLmZpZWxkXSA9IGVsQS52YWx1ZTtcdFxuXHRcdFx0fVxuXHRcdH0sdGhpcyk7XG5cdFx0bXlkYXRhW2lzS2V5XSA9IGlzTWU7XG5cdFx0dmFyIGJ0biA9ICQodGhpcy5yZWZzLnJlc2V0YnV0dG9uLmdldERPTU5vZGUoKSlcblx0XHRidG4uYnV0dG9uKCdsb2FkaW5nJylcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBUZXh0LnJlc2V0ZW1haWwsXG5cdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRkYXRhOiBteWRhdGEsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHRcblx0XHRcdFx0ZnVuY3Rpb24gbWVzc2FnZSgpIHtcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UgPSAnU3VjY2Vzcyc7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogZmxhc2ggbWVzc2FnZXMgYXJlIHNob3duIHdpdGggcmVzcG9uc2UgOiB5ZXNcblx0XHRcdFx0ICogKi9cdFxuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe3Jlc3BvbnNlOnllcyxkYXRhOmRhdGEscmVzZXRjb2RlOm5vfSk7XG5cdFx0XHRcdFxuXHRcdFx0fS5iaW5kKHRoaXMpLFxuXHRcdFx0XG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLnByb3BzLnVybCwgc3RhdHVzLCBlcnIudG9TdHJpbmcoKSk7XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLHJlc2V0Zm9ybTp5ZXMscmVzZXRjb2RlOm5vLGRhdGE6IHtzdGF0dXM6c3RhdHVzLGVycjplcnIudG9TdHJpbmcoKX0gfSk7XG5cdFx0XHR9LmJpbmQodGhpcylcblx0XHRcblx0XHQvKiBhbHdheXMgcmVzZXQgb3VyIGJ1dHRvbnNcblx0XHQqICovXHRcblx0XHR9KS5hbHdheXMoZnVuY3Rpb24gKCkge1xuXHRcdFx0XG5cdFx0XHRidG4uYnV0dG9uKCdyZXNldCcpO1xuXHRcdH0pO1xuXHRcdFxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNldFBhc3N3b3JkO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUZXh0ID0gSlNPTi5wYXJzZShyZXF1aXJlKCd0ZXh0JykpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi5qcycpO1xudmFyIEdJbnRlcnZhbCA9IENvbW1vbi5HSW50ZXJ2YWw7XG52YXIgR0ZsYXNoID0gcmVxdWlyZSgnLi4vZmxhc2gnKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcbi8vdmFyIHllcyA9IHRydWUsIG5vID0gZmFsc2U7XG5cbnZhciBMb2dpbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zOiBbUmVhY3QuYWRkb25zLkxpbmtlZFN0YXRlTWl4aW5dLFxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnNldEZvcm1TdGF0ZSgpO1xuXHR9LFxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFN0YXRlKHRoaXMuc2V0Rm9ybVN0YXRlKHRoaXMuc3RhdGUudmFsaWQpKTtcblx0fSxcblx0c2V0Rm9ybVN0YXRlOiBmdW5jdGlvbih2YWxpZCkge1xuXHRcdHZhciByZXQgPSBDb21tb24uc2V0Rm9ybVN0YXRlKFRleHQubG9naW4sIHZhbGlkKTtcblx0XHRyZXQubmFtZSA9ICdsb2dpbic7XG5cdFx0cmV0dXJuIHJldDsgXG5cdH0sXG5cdGhhbmRsZVN1Ym1pdDogZnVuY3Rpb24oZSkge1xuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG5cdFx0Q29tbW9uLkZvcm1JbnB1dE9uQ2hhbmdlLmNhbGwodGhpcywgZSwgVGV4dC5sb2dpbik7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0LyogaWYgcmVzcG9uc2Ugc3RhdGUgaXMgeWVzIHdlIGhhdmUgYSBmbGFzaCBtZXNzYWdlIHRvIHNob3dcblx0XHQgKiB0aGUgbWVzc2FnZSBpcyBpbiBkYXRhXG5cdFx0ICogKi9cblx0XHRpZih0aGlzLnN0YXRlLnJlc3BvbnNlID09PSB5ZXMpIHtcblx0XHRcdFxuXHRcdFx0dmFyIHBpY2tjbGFzcyA9ICh0aGlzLnN0YXRlLmRhdGEuc3VjY2VzcyA9PT0geWVzICkgPyAnc3VjY2VzcycgOiAnd2FybmluZyc7IFxuXHRcdFx0XG5cdFx0XHRzaG93Zmxhc2htZXNzYWdlID0gPEdGbGFzaCBzaG93Y2xhc3M9e3BpY2tjbGFzc30gY2xlYXJ0aW1lb3V0cz17W0dJbnRlcnZhbC50aW1lb3V0XX0gY2xlYXJpbnRlcnZhbHM9e1tHSW50ZXJ2YWwucmVkaXJlY3RdfT48ZGl2IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiB0aGlzLnN0YXRlLmRhdGEubWVzc2FnZSB8fCAnJ319IC8+PC9HRmxhc2ggPjtcblx0XHRcdFxuXHRcdFx0LyogaWYgd2UgaGF2ZSBhbiBlcnJvciBzaGFrZSB0aGUgZm9ybS4gIHRoaXMgaXMgZG9uZSB3aXRoIHRoZVxuXHRcdFx0ICogaGFzLWVycm9ycyBjbGFzc1xuXHRcdFx0ICogKi9cblx0XHRcdGlmKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSBubykgaGFzZXJyb3IgPSAnIGhhcy1lcnJvcnMnO1xuXHRcdFx0XG5cdFx0fVx0XHRcdFxuXHRcdFx0cmV0dXJuICg8Zm9ybSAgcmVmPSdzaWduaW4nICBjbGFzc05hbWU9XCJzaWduaW4tZm9ybVwiICBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9ID5cblx0XHRcdFx0PGgyPntUZXh0LmhvbWUubG9naW59IDxDb21tb24uR01hbiAvPjwvaDI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmZsYXNofVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQubG9naW59IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiICA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5sb2dpbn0gIGJzU3R5bGU9J2luZm8nIGRpc2FibGVkPXtDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0+ICB7VGV4dC5idG5zLmxvZ2lufSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiBzdHlsZT17e3RleHRBbGlnbjoncmlnaHQnfX0gPjxCb290c3RyYXBCdXR0b24gb25DbGljaz17dGhpcy5wcm9wcy5zaG93cmVnaXN0ZXJ9ICBic1N0eWxlPSd3YXJuaW5nJz4gIHtUZXh0LmJ0bnMucmVnaXN0ZXJ9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLW9mZnNldC02IGNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCcsIHBhZGRpbmdUb3A6MTB9fSA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5wcm9wcy5jaGFuZ2VSZXNldH0gIGJzU3R5bGU9J2RlZmF1bHQnID4gIHtUZXh0LmJ0bnMucmVzZXR9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjwvZGl2PlxuXHRcdFx0PC9mb3JtPik7XG5cdFx0XHRcblx0fSxcblx0bG9naW46IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHNhbWUgYXMgcmVnaXN0ZXIgYnV0IGxlc3MgaW5mbyBzZW50XG5cdFx0ICogeW91IGNvdWxkIGNvbWJpbmUgdGhlbSBib3RoIGlmIHlvdSBsaWtlIGxlc3MgY29kZVxuXHRcdCAqICovXG5cdFx0dmFyIG15ZGF0YSA9IHtsb2dpbjoneWVzJ307XG5cdFx0Ly9jb25zb2xlLmxvZygnZm9ybScsIHRoaXMuc3RhdGUuZm9ybSwgVGV4dC5sb2dpbiApO1xuXHRcdF8uZWFjaCh0aGlzLnN0YXRlLmZvcm0sIGZ1bmN0aW9uKHYsaykge1xuXHRcdFx0aWYodi50eXBlICE9PSAnaGVhZGVyJykge1xuXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2KTtcblx0XHRcdFx0bXlkYXRhW2tdID0gZWwudmFsdWU7XG5cdFx0XHR9XG5cdFx0fSx0aGlzKTsgXG5cdFx0bXlkYXRhW2lzS2V5XSA9IGlzTWU7XG5cdFx0Ly9jb25zb2xlLmxvZygnbXlkYXRhJywgbXlkYXRhLCAnVGV4dCcsIFRleHQubG9naW4gKTtcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBUZXh0LnJlbGF5LFxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0ZGF0YTogbXlkYXRhLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRmdW5jdGlvbiBtZXNzYWdlKCkge1xuXHRcdFx0XHRcdHZhciBzZWNzID0gKGRhdGEucmVkaXJlY3Qud2hlbiAtIHJycikgLyAxMDAwO1xuXHRcdFx0XHRcdHJycis9MTAwMDtcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UgPSBkYXRhLnJlcGVhdGVyICsgJzxiciAvPllvdSB3aWxsIGJlIHJlZGlyZWN0ZWQgdG8gPGEgaHJlZj1cIicgKyBkYXRhLnJlZGlyZWN0LnBhdGggKyAnXCI+JyArIGRhdGEucmVkaXJlY3QucGF0aC5zdWJzdHIoMSkgKyAnPC9hPiAgJztcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UgKz0gc2VjcyA9PT0gMCA/ICcgbm93JzonIGluICcgKyBzZWNzICsgJyBzZWNvbmRzLic7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYodHlwZW9mIGRhdGEucmVkaXJlY3QgPT09ICdvYmplY3QnICYmIGRhdGEucmVkaXJlY3Qud2hlbiA+IDEwMDApIHtcblx0XHRcdFx0XHRkYXRhLnJlcGVhdGVyID0gZGF0YS5tZXNzYWdlO1xuXHRcdFx0XHRcdHZhciBycnIgPSAxMDAwXG5cdFx0XHRcdFx0XHRfc2VsZiA9IHRoaXMucHJvcHMuY29udGV4dDtcblx0XHRcdFx0XHRHSW50ZXJ2YWwucmVkaXJlY3QgPSBHSW50ZXJ2YWwuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRtZXNzYWdlKCk7XG5cdFx0XHRcdFx0XHRfc2VsZi5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLGRhdGE6ZGF0YX0pO1xuXHRcdFx0XHRcdH0sMTAwMCk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coR0ludGVydmFsLmludGVydmFscylcblx0XHRcdFx0XHRHSW50ZXJ2YWwudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdEdJbnRlcnZhbC5jbGVhckludGVydmFscyhHSW50ZXJ2YWwucmVkaXJlY3QpO1xuXHRcdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdFx0fSxkYXRhLnJlZGlyZWN0LndoZW4pO1xuXHRcdFx0XHRcdG1lc3NhZ2UoKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRhdGEucmVkaXJlY3QgPT09ICdvYmplY3QnICYmIGRhdGEucmVkaXJlY3QucGF0aCl7XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0cmVzcG9uc2U6IHllcyxcblx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdH0pO1xuXHRcdFx0fS5iaW5kKHRoaXMpLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtcblx0XHRcdFx0XHRyZXNwb25zZTp5ZXMsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0c3RhdHVzOnN0YXR1cyxcblx0XHRcdFx0XHRcdGVycjplcnIudG9TdHJpbmcoKVxuXHRcdFx0XHRcdH0gXG5cdFx0XHRcdH0pO1xuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fSk7XHRcdFxuXHR9XG59KTsgXG5cbm1vZHVsZS5leHBvcnRzID0gTG9naW47XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uLmpzJyk7XG52YXIgR0ludGVydmFsID0gQ29tbW9uLkdJbnRlcnZhbDtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcbi8vdmFyIHllcyA9IHRydWUsIG5vID0gZmFsc2U7XG5cbnZhciBSUiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zOiBbUmVhY3QuYWRkb25zLkxpbmtlZFN0YXRlTWl4aW5dLFxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnNldEZvcm1TdGF0ZSgpO1xuXHR9LFxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFN0YXRlKHRoaXMuc2V0Rm9ybVN0YXRlKHRoaXMuc3RhdGUudmFsaWQpKTtcblx0fSxcblx0c2V0Rm9ybVN0YXRlOiBmdW5jdGlvbih2YWxpZCkge1xuXHRcdHZhciByZXQgPSBDb21tb24uc2V0Rm9ybVN0YXRlKFRleHQucmVnaXN0ZXIsIHZhbGlkKTtcblx0XHRyZXQubmFtZSA9ICdyZWdpc3Rlcic7XG5cdFx0cmV0dXJuIHJldDtcblx0fSxcblx0aGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fSxcblx0b25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcblx0XHRDb21tb24uRm9ybUlucHV0T25DaGFuZ2UuY2FsbCh0aGlzLCBlLCBUZXh0LnJlZ2lzdGVyKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAoPGZvcm0gIHJlZj0nc2lnbmluJyAgY2xhc3NOYW1lPVwic2lnbmluLWZvcm1cIiAgIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0+XG5cdFx0XHRcdDxoMj57VGV4dC5ob21lLnJlZ2lzdGVyfSA8Q29tbW9uLkdNYW4gLz48L2gyPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5mbGFzaH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8Q29tbW9uLkZvcm0gaW5wdXRzPXtUZXh0LnJlZ2lzdGVyfSBjb250ZXh0PXt0aGlzfSAvPlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiBzdHlsZT17e3RleHRBbGlnbjonbGVmdCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiBvbkNsaWNrPXt0aGlzLnJlZ2lzdGVyfSByZWY9XCJyZWdpc3RlcmJ1dHRvblwiIGRhdGEtbG9hZGluZy10ZXh0PVwiUmVnaXN0ZXJpbmcuLi5cIiByb2xlPVwiYnV0dG9uXCIgIGJzU3R5bGU9J3dhcm5pbmcnIGNsYXNzTmFtZT1cImJ0biAgYnRuLXdhcm5pbmdcIiAgZGlzYWJsZWQ9e0NvbW1vbi5zaG93QnV0dG9uKHRoaXMuc3RhdGUudmFsaWQpfT4gIHtUZXh0LmJ0bnMucmVnaXN0ZXJ9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiICAgc3R5bGU9e3t0ZXh0QWxpZ246J3JpZ2h0J319ID48Qm9vdHN0cmFwQnV0dG9uIHJvbGU9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLnByb3BzLnNob3dyZWdpc3Rlcn0gIGNsYXNzTmFtZT1cImJ0biBidG4tZGVmYXVsdFwiPiAge1RleHQuYnRucy5sb2dpbmN1cnJlbnR9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PC9kaXY+XG5cdFx0XHQ8L2Zvcm0+KTtcblx0fSxcblx0cmVnaXN0ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdC8qIHZhbGlkYXRpb24gb2NjdXJzIGFzIGlucHV0IGlzIHJlY2VpdmVkIFxuXHRcdCAqIHRoaXMgbWV0aG9kIHNob3VsZCBvbmx5IGJlIGF2aWFsYWJsZSBpZlxuXHRcdCAqIGFsbCB2YWxpZGF0aW9uIGlzIGFscmVhZHkgbWV0IHNvIGp1c3QgcnVuXG5cdFx0ICogKi9cblx0XHRjb25zb2xlLmxvZygnZm9ybScsIHRoaXMuc3RhdGUuZm9ybSwgJ1RleHQnLCBUZXh0LnJlZ2lzdGVyICk7IFxuXHRcdHZhciBteWRhdGEgPSB7IHJlZ2lzdGVyOiAneWVzJyB9O1xuXHRcdF8uZWFjaCh0aGlzLnN0YXRlLmZvcm0sIGZ1bmN0aW9uKHYsaykge1xuXHRcdFx0aWYodi50eXBlICE9PSAnaGVhZGVyJykge1xuXHRcdFx0XHR2YXIgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh2KTtcblx0XHRcdFx0bXlkYXRhW2tdID0gZWwudmFsdWU7XG5cdFx0XHR9XG5cdFx0fSx0aGlzKTsgXG5cdFx0bXlkYXRhW2lzS2V5XSA9IGlzTWU7XG5cdFx0Y29uc29sZS5sb2coJ215ZGF0YScsIG15ZGF0YSwgJ1RleHQnLCBUZXh0LnJlZ2lzdGVyICk7XG5cdFx0dmFyIGJ0biA9ICQodGhpcy5yZWZzLnJlZ2lzdGVyYnV0dG9uLmdldERPTU5vZGUoKSlcblx0XHRidG4uYnV0dG9uKCdsb2FkaW5nJylcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBUZXh0LnJlbGF5LFxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0ZGF0YTogbXlkYXRhLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0ZnVuY3Rpb24gbWVzc2FnZSgpIHtcblx0XHRcdFx0XHR2YXIgc2VjcyA9IChkYXRhLnJlZGlyZWN0LndoZW4gLSBycnIpIC8gMTAwMDtcblx0XHRcdFx0XHRycnIrPTEwMDA7XG5cdFx0XHRcdFx0ZGF0YS5tZXNzYWdlID0gZGF0YS5yZXBlYXRlciArICc8YnIgLz5Zb3Ugd2lsbCBiZSByZWRpcmVjdGVkIHRvIDxhIGhyZWY9XCInICsgZGF0YS5yZWRpcmVjdC5wYXRoICsgJ1wiPicgKyBkYXRhLnJlZGlyZWN0LnBhdGguc3Vic3RyKDEpICsgJzwvYT4gICc7XG5cdFx0XHRcdFx0ZGF0YS5tZXNzYWdlKz0gc2VjcyA9PT0gMCA/ICcgbm93JzonIGluICcgKyBzZWNzICsgJyBzZWNvbmRzLic7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaWYgd2UgZ2V0IGEgcmVkaXJlY3QgY2hlY2sgdGhlIHRpbWUgYW5kIHJ1biBhbiBpbnRlcnZhbFxuXHRcdFx0XHQgKiB0aGlzIGlzIHJlYWxseSBqdXN0IHRvIHNob3cgUmVhY3Qgd29ya1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdGlmKHR5cGVvZiBkYXRhLnJlZGlyZWN0ID09PSAnb2JqZWN0JyAmJiBkYXRhLnJlZGlyZWN0LndoZW4+MTAwMCkge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGRhdGEucmVwZWF0ZXIgPSBkYXRhLm1lc3NhZ2U7IC8va2VlcCBvdXIgb3JpZ2luYWwgbWVzc2FnZSBmb3IgdGhlIHJlcGVhdGVyXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dmFyIHJyciA9IDEwMDBcblx0XHRcdFx0XHRcdF9zZWxmID0gdGhpcy5wcm9wcy5jb250ZXh0O1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdFNub3dwaUludGVydmFsLnJlZGlyZWN0ID0gU25vd3BpSW50ZXJ2YWwuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQvKiB0aGlzIGlzIHJlYWxseSBzaW1wbGVcblx0XHRcdFx0XHRcdCAqIGp1c3QgcmVjYWN1bGF0ZSB0aGUgbWVzc2FnZSBhbmQgbGV0IHJlYWN0IGRvIHRoZSByZXN0XG5cdFx0XHRcdFx0XHQgKiAqL1xuXHRcdFx0XHRcdFx0bWVzc2FnZSgpO1xuXHRcdFx0XHRcdFx0X3NlbGYuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdFx0XHRyZXNwb25zZTogeWVzLFxuXHRcdFx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9LDEwMDApO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8qIGtpbGwgdGhlIGludGVydmFsIGFuZCByZWRpcmVjdCBvbiB0aGUgdGltZW91dCBcblx0XHRcdFx0XHQgKiAqL1xuXHRcdFx0XHRcdEdJbnRlcnZhbC50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0R0ludGVydmFsLmNsZWFySW50ZXJ2YWxzKEdJbnRlcnZhbC5yZWRpcmVjdCk7XG5cdFx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGRhdGEucmVkaXJlY3QucGF0aDtcblx0XHRcdFx0XHR9LGRhdGEucmVkaXJlY3Qud2hlbik7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bWVzc2FnZSgpXG5cdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYodHlwZW9mIGRhdGEucmVkaXJlY3QgPT09ICdvYmplY3QnICYmIGRhdGEucmVkaXJlY3QucGF0aCl7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvKiBmbGFzaCBtZXNzYWdlcyBhcmUgc2hvd24gd2l0aCByZXNwb25zZSA6IHllc1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0cmVzcG9uc2U6IHllcyxcblx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdH0uYmluZCh0aGlzKSxcblx0XHRcdFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5wcm9wcy51cmwsIHN0YXR1cywgZXJyLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdHJlc3BvbnNlOnllcyxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRzdGF0dXM6c3RhdHVzLFxuXHRcdFx0XHRcdFx0ZXJyOmVyci50b1N0cmluZygpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdFxuXHRcdC8qIG5lYXQgbGl0dGxlIHRyaWNrIHRvIGFsd2F5cyByZXNldCBvdXIgYnV0dG9uc1xuXHRcdCogKi9cdFxuXHRcdH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcblx0XHRcdGJ0bi5idXR0b24oJ3Jlc2V0Jyk7XG5cdFx0fSk7XG5cdFx0XG5cdH0sXG59KTsgXG5cbm1vZHVsZS5leHBvcnRzID0gUlI7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uLmpzJyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcbi8vdmFyIHllcyA9IHRydWUsIG5vID0gZmFsc2U7XG5cbnZhciBSZXNldFBhc3N3b3JkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5yZXNldCwgdmFsaWQpO1xuXHRcdHJldC5uYW1lID0gJ3Jlc2V0Jztcblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuXHRcdENvbW1vbi5Gb3JtSW5wdXRPbkNoYW5nZS5jYWxsKHRoaXMsIGUsIFRleHQucmVzZXQpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICg8Zm9ybSAgcmVmPSdzaWduaW4nICBjbGFzc05hbWU9XCJzaWduaW4tZm9ybVwiICBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9ID5cblx0XHRcdFx0PGgyPntUZXh0LmhvbWUucmVzZXR9IDxDb21tb24uR01hbiAvPjwvaDI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmZsYXNofVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQucmVzZXR9IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiICA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5yZXNldGVtYWlsfSByZWY9XCJyZXNldGJ1dHRvblwiIGJzU3R5bGU9J2luZm8nIGRpc2FibGVkPXtDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0gIGRhdGEtbG9hZGluZy10ZXh0PVwiQ2hlY2tpbmcuLi5cIiA+ICB7VGV4dC5idG5zLnJlc2V0ZW1haWx9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLmNoYW5nZVJlc2V0fSAgYnNTdHlsZT0nZGVmYXVsdCc+ICB7VGV4dC5idG5zLmxvZ2luY3VycmVudH0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PC9kaXY+XG5cdFx0XHQ8L2Zvcm0+KTtcblx0XHRcdFxuXHR9LFxuXHRyZXNldGVtYWlsOiBmdW5jdGlvbigpIHtcblx0XHQvKiB2YWxpZGF0aW9uIG9jY3VycyBhcyBpbnB1dCBpcyByZWNlaXZlZCBcblx0XHQgKiB0aGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBhdmlhbGFibGUgaWZcblx0XHQgKiBhbGwgdmFsaWRhdGlvbiBpcyBhbHJlYWR5IG1ldCBzbyBqdXN0IHJ1blxuXHRcdCAqICovXG5cdFx0dmFyIG15ZGF0YSA9IHtyZXNldDoneWVzJ307XG5cdFx0Y29uc29sZS5sb2codGhpcy5zdGF0ZS5mb3JtKTtcblx0XHRfLmVhY2godGhpcy5zdGF0ZS5mb3JtLCBmdW5jdGlvbih2LGspIHtcblx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodik7XG5cdFx0XHRcdG15ZGF0YVtrXSA9IGVsLnZhbHVlO1xuXHRcdH0sdGhpcyk7XG5cdFx0bXlkYXRhW2lzS2V5XSA9IGlzTWU7XG5cdFx0dmFyIGJ0biA9ICQodGhpcy5yZWZzLnJlc2V0YnV0dG9uLmdldERPTU5vZGUoKSlcblx0XHRidG4uYnV0dG9uKCdsb2FkaW5nJylcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBUZXh0LnJlc2V0ZW1haWwsXG5cdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRkYXRhOiBteWRhdGEsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHRcblx0XHRcdFx0ZnVuY3Rpb24gbWVzc2FnZSgpIHtcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UgPSAnU3VjY2Vzcyc7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogZmxhc2ggbWVzc2FnZXMgYXJlIHNob3duIHdpdGggcmVzcG9uc2UgOiB5ZXNcblx0XHRcdFx0ICogKi9cdFxuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe3Jlc3BvbnNlOnllcyxkYXRhOmRhdGEscmVzZXRmb3JtOm5vLHJlc2V0Y29kZTp5ZXN9KTtcblx0XHRcdFx0XG5cdFx0XHR9LmJpbmQodGhpcyksXG5cdFx0XHRcblx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMucHJvcHMudXJsLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMscmVzZXRmb3JtOm5vLGRhdGE6IHtzdGF0dXM6c3RhdHVzLGVycjplcnIudG9TdHJpbmcoKX0gfSk7XG5cdFx0XHR9LmJpbmQodGhpcylcblx0XHRcblx0XHQvKiBhbHdheXMgcmVzZXQgb3VyIGJ1dHRvbnNcblx0XHQqICovXHRcblx0XHR9KS5hbHdheXMoZnVuY3Rpb24gKCkge1xuXHRcdFx0XG5cdFx0XHRidG4uYnV0dG9uKCdyZXNldCcpO1xuXHRcdH0pO1xuXHRcdFxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNldFBhc3N3b3JkO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIExvZ2luID0gcmVxdWlyZSgnLi9mb3Jtcy9sb2dpbicpO1xudmFyIFJlZyA9IHJlcXVpcmUoJy4vZm9ybXMvcmVnJyk7XG52YXIgUmVzZXRQYXNzd29yZCA9IHJlcXVpcmUoJy4vZm9ybXMvcmVzZXQnKTtcbnZhciBSZXNldENvZGUgPSByZXF1aXJlKCcuL2Zvcm1zL2NvZGUnKTtcbnZhciBHRmxhc2ggPSByZXF1aXJlKCcuL2ZsYXNoJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24uanMnKTtcbnZhciBHSW50ZXJ2YWwgPSBDb21tb24uR0ludGVydmFsO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG5cbi8qKlxuICogdXNlIHllcyBmb3IgdHJ1ZVxuICogdXNlIG5vIGZvciBmYWxzZVxuICogXG4gKiB0aGlzIHNpbmdsZSBhcHAgdXNlcyB0aGUgeWVzL25vIHZhciBzbyBpZiB5b3Ugd2FudCB5b3UgY2FuIHN3aXRjaCBiYWNrIHRvIHRydWUvZmFsc2VcbiAqIFxuICogKi9cbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxuLyogdGhpcyBpcyBvdXIgbWFpbiBjb21wb25lbnRcbiAqIHNpbmNlIHRoaXMgaXMgYSBzaW5nbGUgZnVuY3Rpb24gYXBwIHdlIHdpbGwgY2FsbCB0aGlzIGRpcmVjdGx5XG4gKiBcbiAqIHRvIGluY2x1ZGUgdGhpcyBpbiB5b3VyIFJlYWN0IHNldHVwIG1vZGlmeSBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIHRvIHJlY2lldmUgYW55IGRlZmF1bHQgdmFsdWVzIFxuICogXG4gKiAqL1xuXG52YXIgQm9vdHN0cmFwQnV0dG9uID0gUmVhY3RCb290c3RyYXAuQnV0dG9uO1xuXG52YXIgR0xvZ2luID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5vdyA9IG5ldyBEYXRlKCk7XG5cdFx0LyogaW5pdGlhbGl6ZSB0aGUgbG9naW5cblx0XHQgKiByZWdpc3RlciBpcyBubywgaWYgd2Ugd2FudCB0byBzaG93IHRoZSByZWdpc3RlciBmb3JtIHNldCB0byB5ZXNcblx0XHQgKiBtb3VudGVkIGlzIHNldCB0byB5ZXMgd2hlbiB0aGUgYXBwIG1vdW50cyBpZiB5b3UgbmVlZCB0byB3YWl0IGZvciB0aGF0XG5cdFx0ICogc2V0IHJlc3BvbnNlIHRvIHllcyB0byBzaG93IGEgZmxhc2ggbWVzc2FnZVxuXHRcdCAqIGVycm9yIG1lc3NhZ2VzIGFyZSBpbiBkYXRhXG5cdFx0ICogKi9cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVnaXN0ZXI6IG5vLFxuXHRcdFx0bW91bnRlZDogbm8sIFxuXHRcdFx0cmVzcG9uc2U6IG5vLCBcblx0XHRcdGRhdGE6e31cblx0XHR9O1xuXHR9LFxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbigpIHtcblx0XHQvKiB3ZSB3YW50IHRvIGtpbGwgdGhlIGZsYXNoIGFueXRpbWUgdGhlIGZvcm0gaXMgcmVuZGVyZWRcblx0XHQgKiB5b3UgY2FuIGFkZCBhbnkgb3RoZXIgcHJvcHMgeW91IG5lZWQgaGVyZSBpZiB5b3UgaW5jbHVkZVxuXHRcdCAqIHRoaXMgaW4gYW5vdGhlciBjb21wb25lbnQgXG5cdFx0ICogKi9cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHJlc3BvbnNlOm5vXG5cdFx0fSk7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzaG93Zmxhc2htZXNzYWdlID0gZmFsc2U7XG5cdFx0dmFyIGhhc2Vycm9yID0gZmFsc2U7XG5cdFx0dmFyIGxvZ2luT1JyZWdpc3RlciA9ICh0aGlzLnN0YXRlLnJlZ2lzdGVyID09PSB5ZXMpID8gJ3JlZ2lzdGVyJyA6ICdsb2dpbic7XG5cdFx0LyogaWYgcmVzcG9uc2Ugc3RhdGUgaXMgeWVzIHdlIGhhdmUgYSBmbGFzaCBtZXNzYWdlIHRvIHNob3dcblx0XHQgKiB0aGUgbWVzc2FnZSBpcyBpbiBkYXRhXG5cdFx0ICogKi9cblx0XHRpZih0aGlzLnN0YXRlLnJlc3BvbnNlID09PSB5ZXMpIHtcblx0XHRcdFxuXHRcdFx0dmFyIHBpY2tjbGFzcyA9ICh0aGlzLnN0YXRlLmRhdGEuc3VjY2VzcyA9PT0geWVzICkgPyAnc3VjY2VzcycgOiAnd2FybmluZyc7IFxuXHRcdFx0XG5cdFx0XHRzaG93Zmxhc2htZXNzYWdlID0gPEdGbGFzaCBzaG93Y2xhc3M9e3BpY2tjbGFzc30gY2xlYXJ0aW1lb3V0cz17W0dJbnRlcnZhbC50aW1lb3V0XX0gY2xlYXJpbnRlcnZhbHM9e1tHSW50ZXJ2YWwucmVkaXJlY3RdfT48ZGl2IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiB0aGlzLnN0YXRlLmRhdGEubWVzc2FnZSB8fCAnJ319IC8+PC9HRmxhc2ggPjtcblx0XHRcdFxuXHRcdFx0LyogaWYgd2UgaGF2ZSBhbiBlcnJvciBzaGFrZSB0aGUgZm9ybS4gIHRoaXMgaXMgZG9uZSB3aXRoIHRoZVxuXHRcdFx0ICogaGFzLWVycm9ycyBjbGFzc1xuXHRcdFx0ICogKi9cblx0XHRcdGlmKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSBubykgaGFzZXJyb3IgPSAnIGhhcy1lcnJvcnMnO1xuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHRcdGlmKHRoaXMuc3RhdGUucmVzZXRjb2RlID09PSB5ZXMpIHtcblx0XHRcdHZhciByZXQgPSA8UmVzZXRDb2RlICBjb250ZXh0PXt0aGlzfSBjaGFuZ2VSZXNldD17dGhpcy5jaGFuZ2VDb2RlfSBmbGFzaD17c2hvd2ZsYXNobWVzc2FnZX0gLz5cblx0XHR9IGVsc2UgaWYodGhpcy5zdGF0ZS5yZXNldGZvcm0gPT09IHllcykge1xuXHRcdFx0dmFyIHJldCA9IDxSZXNldFBhc3N3b3JkICBjb250ZXh0PXt0aGlzfSBjaGFuZ2VSZXNldD17dGhpcy5jaGFuZ2VSZXNldH0gZmxhc2g9e3Nob3dmbGFzaG1lc3NhZ2V9IC8+XG5cdFx0fSBlbHNlIGlmKHRoaXMuc3RhdGUucmVnaXN0ZXIgPT09IG5vKSB7XG5cdFx0XHR2YXIgcmV0ID0gPExvZ2luICBjb250ZXh0PXt0aGlzfSBzaG93cmVnaXN0ZXI9e3RoaXMuc2hvd3JlZ2lzdGVyfSBjaGFuZ2VSZXNldD17dGhpcy5jaGFuZ2VSZXNldH0gZmxhc2g9e3Nob3dmbGFzaG1lc3NhZ2V9IC8+XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciByZXQgPSA8UmVnIHNob3dyZWdpc3Rlcj17dGhpcy5zaG93cmVnaXN0ZXJ9IGZsYXNoPXtzaG93Zmxhc2htZXNzYWdlfSBjb250ZXh0PXt0aGlzfSAvPlxuXHRcdH1cblx0XHRyZXR1cm4gKCA8ZGl2ICBjbGFzc05hbWU9e2xvZ2luT1JyZWdpc3RlciArIFwiIGNlbnRlcm1lIGNvbC14cy0xMiBzaGFrZW1lIFwiICsgaGFzZXJyb3J9PntyZXR9IDwvZGl2Pik7XG5cdH0sXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcblx0XHQvLyBXaGVuIHRoZSBjb21wb25lbnQgaXMgYWRkZWQgbGV0IG1lIGtub3dcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdG1vdW50ZWQ6IHllc1xuXHRcdH0pO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0c2hvd3JlZ2lzdGVyOiBmdW5jdGlvbiAoZSkge1xuXHRcdC8qIHRvZ2dsZSB0aGUgcmVnaXN0ZXIgLyBsb2dpbiBmb3Jtc1xuXHRcdCAqICovXG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRyZWdpc3RlcjogdGhpcy5zdGF0ZS5yZWdpc3RlciA9PT0geWVzID8gbm8gOiB5ZXMsXG5cdFx0XHRyZXNwb25zZTogbm9cblx0XHR9KTtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRjaGFuZ2VSZXNldDogZnVuY3Rpb24gKGUpIHtcblx0XHQvKiB0b2dnbGUgdGhlIHBhc3N3b3JkIHJlc2V0XG5cdFx0ICogKi9cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHJlc2V0Zm9ybTogdGhpcy5zdGF0ZS5yZXNldGZvcm0gPT09IHllcyA/IG5vIDogeWVzLFxuXHRcdFx0cmVzcG9uc2U6IG5vXG5cdFx0fSk7XG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fSxcblx0Y2hhbmdlQ29kZTogZnVuY3Rpb24gKGUpIHtcblx0XHQvKiB0b2dnbGUgdGhlIHBhc3N3b3JkIHJlc2V0XG5cdFx0ICogKi9cblx0XHR0aGlzLnNldFN0YXRlKHsgXG5cdFx0XHRyZXNldGNvZGU6IHRoaXMuc3RhdGUucmVzZXRjb2RlID09PSB5ZXMgP25vIDogeWVzLFxuXHRcdFx0cmVzcG9uc2U6bm9cblx0XHR9KTtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHTG9naW47XG4iXX0=
