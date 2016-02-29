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
				
				this.setState({response:yes,data:data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.log(err, status, err.toString());
				this.props.context.setState({response:yes,data: {status:status,err:err.toString()} });
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
		this.setState({mounted: yes})
		return false;
	},
	showregister: function (e) {
		/* toggle the register / login forms
		 * */
		this.setState({register: this.state.register === yes ? no : yes,response:no})
		return e.preventDefault();
	},
	changeReset: function (e) {
		/* toggle the password reset
		 * */
		this.setState({resetform: this.state.resetform === yes ?no : yes,response:no})
		return e.preventDefault();
	},
	changeCode: function (e) {
		/* toggle the password reset
		 * */
		this.setState({resetcode: this.state.resetcode === yes ?no : yes,response:no})
		return e.preventDefault();
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	}
});

module.exports = GLogin;


},{"./common.js":1,"./flash":3,"./forms/code":4,"./forms/login":5,"./forms/reg":6,"./forms/reset":7}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvY29tbW9uLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZmFrZV85YzYxOTMwZC5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL3Nub3dwaS9qcy9saWIvcmVhY3QvanN4L2ZsYXNoLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvY29kZS5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL3Nub3dwaS9qcy9saWIvcmVhY3QvanN4L2Zvcm1zL2xvZ2luLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvcmVnLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvc25vd3BpL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvcmVzZXQuanMiLCIvaG9tZS9zbm93L3Byb2plY3RzL2dpdGh1Yi9rZXlzdG9uZS1ncmVldGVyL3B1YmxpYy9zbm93cGkvanMvbGliL3JlYWN0L2pzeC9ncmVldGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGlu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QUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUM3RSxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMxQjtBQUNGLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQzNCOztFQUVFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEtBQUssR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQzlFLE9BQU8sQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0VBQzFCO0FBQ0YsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDMUI7O0VBRUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDOUUsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDMUI7Q0FDRCxZQUFZLEVBQUUsU0FBUyxDQUFDLEVBQUU7RUFDekIsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDMUI7QUFDRixDQUFDLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG4vKiBtYW4gY29tcG9uZW50XG4gKiBzaW1wbGUgZXhhbXBsZVxuICogKi9cbnZhciBHTWFuID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoe2RpdnN0eWxlOntmbG9hdDoncmlnaHQnLH19KTtcblx0fSxcblx0XG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdCAgICByZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e3RoaXMucHJvcHMuZGl2c3R5bGV9IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBUZXh0LmxvZ29tYW4gfHwgJyd9fSAvPlxuXHQgICAgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzLkdNYW4gPSBHTWFuO1xuXG4vKiBcbiAqIHdlIHVzZSB0aGlzIGZvciB0aGUgY291bnRkb3duIHRpbWVyIGJlZm9yZSB3ZSByZWRpcmVjdCBhIGxvZ2dlZCBcbiAqIGluIHVzZXIuICB5b3UgY2FuIGRpc2FibGUgaXQgXG4gKiBieSBzZW5kaW5nIGEgcmVkaXJlY3QgdGltZSBvZiAwXG4gKiAqL1xudmFyIEdJbnRlcnZhbCA9IHtcblx0ICBpbnRlcnZhbHM6IFtdLFxuXHQgIHNldEludGVydmFsOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcnZhbHMucHVzaChzZXRJbnRlcnZhbC5hcHBseShudWxsLCBhcmd1bWVudHMpKTtcblx0ICB9LFxuXHQgIGNsZWFySW50ZXJ2YWxzOiBmdW5jdGlvbih3aG8pIHtcblx0XHR3aG8gPSB3aG8gLSAxO1xuXHRcdGlmKEdJbnRlcnZhbC5pbnRlcnZhbHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdjbGVhciBhbGwgaW50ZXJ2YWxzJyx0aGlzLmludGVydmFscylcblx0XHRcdEdJbnRlcnZhbC5pbnRlcnZhbHMubWFwKGNsZWFySW50ZXJ2YWwpO1xuXHRcdFx0R0ludGVydmFsLmludGVydmFscyA9IFtdO1xuXHRcdH0gZWxzZSBpZih3aG8gJiYgR0ludGVydmFsLmludGVydmFsc1t3aG9dKSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdjbGVhciBpbnRlcnZhbHMnLHdobyx0aGlzLmludGVydmFsc1t3aG9dKVxuXHRcdFx0Y2xlYXJJbnRlcnZhbChHSW50ZXJ2YWwuaW50ZXJ2YWxzW3dob10pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdtYXAgaW50ZXJ2YWxzJyx0aGlzLmludGVydmFscylcblx0XHRcdEdJbnRlcnZhbC5pbnRlcnZhbHMubWFwKGNsZWFySW50ZXJ2YWwpO1xuXHRcdFx0R0ludGVydmFsLmludGVydmFscyA9IFtdO1xuXHRcdH1cblx0ICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5HSW50ZXJ2YWwgPSBHSW50ZXJ2YWw7XG5cbm1vZHVsZS5leHBvcnRzLnNob3dCdXR0b24gPSBmdW5jdGlvbihpbnB1dHMpIHtcblx0dmFyIHZhbGlkID0gXy5pbmNsdWRlcyhpbnB1dHMsIGZhbHNlKTtcblx0Ly9jb25zb2xlLmxvZygnYnV0dG9uJywgaW5wdXRzLCB2YWxpZCk7XG5cdHJldHVybiB2YWxpZDtcbn1cblxubW9kdWxlLmV4cG9ydHMuc2V0Rm9ybVN0YXRlID0gZnVuY3Rpb24oaW5wdXRzLCB2YWxpZCkge1xuXHR2YXIgcmV0ID0ge307XG5cdHJldC52YWxpZCA9IF8uaXNPYmplY3QodmFsaWQpID8gdmFsaWQgOiB7fTtcblx0cmV0LmZvcm0gPSB7fTtcblx0Xy5lYWNoKGlucHV0cywgZnVuY3Rpb24odikge1xuXHRcdGlmKHYudHlwZSAhPT0gJ2hlYWRlcicpIHJldC5mb3JtW3YuZmllbGRdID0gdi5fbmFtZTtcblx0XHRpZih2LnJlcXVpcmVkKSB7XG5cdFx0XHRyZXQudmFsaWRbdi5maWVsZF0gPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYodi5hdHRhY2gpIHtcblx0XHRcdHJldC5mb3JtW3YuYXR0YWNoLmZpZWxkXSA9IHYuX25hbWUgKyAnX2F0dGFjaCc7XG5cdFx0XHRpZih2LnJlcXVpcmVkKSB7XG5cdFx0XHRcdHJldC52YWxpZFt2LmF0dGFjaC5maWVsZF0gPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gcmV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5Gb3JtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cdFx0dmFyIGZvcm0gPSBbXTtcblx0XHQvLyBzb3J0IG91dCBvYmplY3Qgb2YgZm9ybSBlbGVtZW50cyBhbmQgYWRkIHRoZW0gdG8gYW4gYXJyYXlcblx0XHRjb25zb2xlLmxvZyh0aGlzLnByb3BzLmlucHV0cyk7XG5cdFx0dmFyIHNvcnRlZF9saXN0ID0gXyh0aGlzLnByb3BzLmlucHV0cykua2V5cygpLnNvcnQoKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0dmFyIHZhbHVlID0gX3RoaXMucHJvcHMuaW5wdXRzW2tleV07XG5cdFx0XHRmb3JtLnB1c2goY29udGFpbmVyKGtleSwgdmFsdWUsIF90aGlzLnByb3BzLmlucHV0cywgX3RoaXMucHJvcHMuY29udGV4dCkpO1xuXHRcdH0pLnZhbHVlKCk7XG5cdFx0XG5cdFx0cmV0dXJuIGZvcm0ubGVuZ3RoID09PSAwID8gKDxzcGFuIC8+KSA6ICg8ZGl2Pntmb3JtfTwvZGl2Pik7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cy5Gb3JtSW5wdXRPbkNoYW5nZSA9IGZ1bmN0aW9uKGV2ZW50LCBmb3JtKSB7XG4gICAgLy8gZ2V0IHRoZSBjdXJyZW50IHZhbHVlXG4gICAgdmFyIGNoYW5nZSA9IHtcblx0XHR2YWxpZDogXy5jbG9uZSh0aGlzLnN0YXRlLnZhbGlkKSxcblx0fTtcblx0XG5cdHZhciB2YWxpZCA9IGZhbHNlO1xuXHR2YXIgcGFyZW50ID0gZmFsc2U7XG5cdFxuXHQvLyBpcyB0aGlzIGF0dGFjaGVkXG5cdGlmKGV2ZW50LnRhcmdldC5kYXRhc2V0LmRlcGVuZHNvbiAhPT0gJ2ZhbHNlJykge1xuXHRcdHBhcmVudCA9ICBmb3JtW2V2ZW50LnRhcmdldC5kYXRhc2V0LmRlcGVuZHNvbl07XG5cdFx0dmFyIGlucHV0ID0gZm9ybVtldmVudC50YXJnZXQuaWRdO1xuXHRcdHBhcmVudC5ET00gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJlbnQuX25hbWUpO1xuXHRcdC8vY29uc29sZS5sb2coZXZlbnQudGFyZ2V0LmRhdGFzZXQuZGVwZW5kc29uKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgaW5wdXQgPSBmb3JtW2V2ZW50LnRhcmdldC5pZF07XG5cdH1cblx0XG5cdGlmKGlucHV0LnJlcXVpcmVkKSB7XHRcblx0XHRpZihfLmlzQXJyYXkoaW5wdXQucmVnZXgpKSB7XG5cdFx0XHR2YXIgcnggPSBuZXcgUmVnRXhwKGlucHV0LnJlZ2V4WzBdLGlucHV0LnJlZ2V4WzFdKTtcblx0XHRcdHZhbGlkID0gcngudGVzdChldmVudC50YXJnZXQudmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YWxpZCA9IGV2ZW50LnRhcmdldC52YWx1ZSAhPT0gJyc7XG5cdFx0fVxuXHRcdGlmKHZhbGlkICYmIHBhcmVudCAmJiBwYXJlbnQudHlwZSA9PT0gJ3Bhc3N3b3JkJykge1xuXHRcdFx0aWYoZXZlbnQudGFyZ2V0LnZhbHVlICE9PSAnJyAmJiBldmVudC50YXJnZXQudmFsdWUgPT09IHBhcmVudC5ET00udmFsdWUpIHtcblx0XHRcdFx0dmFsaWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZih2YWxpZCAmJiBwYXJlbnQgJiYgcGFyZW50LnR5cGUgPT09ICdzZWxlY3QnKSB7XG5cdFx0XHRpZihldmVudC50YXJnZXQudmFsdWUgIT09ICcnICYmIHBhcmVudC5ET00udmFsdWUgIT09ICcnKSB7XG5cdFx0XHRcdHZhbGlkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYodmFsaWQpIHtcblx0XHRcdGNoYW5nZS52YWxpZFtpbnB1dC5maWVsZF0gPSB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjaGFuZ2UudmFsaWRbaW5wdXQuZmllbGRdID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdFxuXHQvL2NvbnNvbGUubG9nKCdjaGFuZ2UnLCB2YWxpZCwgY2hhbmdlKTtcbiAgICB0aGlzLnNldFN0YXRlKGNoYW5nZSk7XG59XG5cblxuZnVuY3Rpb24gdmFsaWRhdGVfY2xhc3MoaW5wdXQsIGNvbnRleHQpIHtcblx0dmFyIHZhbGlkID0gY29udGV4dC5zdGF0ZS52YWxpZDtcblx0aWYoIWlucHV0LnJlcXVpcmVkKSB7XG5cdFx0cmV0dXJuICdpbnB1dC1ncm91cCc7XG5cdH0gZWxzZSB7XG5cdFx0aWYodmFsaWRbaW5wdXQuZmllbGRdKSB7XG5cdFx0XHRyZXR1cm4gJ2lucHV0LWdyb3VwJztcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuICdpbnB1dC1ncm91cCBoYXMtZXJyb3InO1xuXHRcdH1cblx0fVxufVxuXG5cbmZ1bmN0aW9uIGlucHV0KG5hbWUsIG9wdGlvbnMsIGNvbnRleHQpIHtcblx0XG5cdGlmKCFfLmlzT2JqZWN0KG9wdGlvbnMpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdFxuXHR2YXIgdHlwZSA9IG9wdGlvbnMudHlwZTtcblx0dmFyIGRlcGVuZHNPbiA9IG9wdGlvbnMuZGVwZW5kc09uID8gb3B0aW9ucy5kZXBlbmRzT24gOiBmYWxzZTtcblx0XG5cdGlmKHR5cGUgPT09ICd0ZXh0Jykge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8aW5wdXQgdHlwZT1cInRleHRcIiBpZD17b3B0aW9ucy5fbmFtZX0gIHJlZnM9e29wdGlvbnMuX25hbWV9IGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIGRhdGEtZGVwZW5kc29uPXtkZXBlbmRzT259ICBvbkNoYW5nZT17Y29udGV4dC5vbkNoYW5nZX0gICAvPlxuXHRcdCk7XG5cdFx0XG5cdH0gZWxzZSBpZih0eXBlID09PSAncGFzc3dvcmQnKSB7XG5cdFx0Ly8gYWRkIHBhc3N3b3JkIGZpZWxkXG5cdFx0dmFyIGRlcGVuZHNPbiA9IG9wdGlvbnMuZGVwZW5kc09uID8gb3B0aW9ucy5kZXBlbmRzT24gOiBmYWxzZTtcblx0XHRyZXR1cm4gKCBcblx0XHRcdDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBpZD17b3B0aW9ucy5fbmFtZX0gY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgZGF0YS1kZXBlbmRzb249e2RlcGVuZHNPbn0gIG9uQ2hhbmdlPXtjb250ZXh0Lm9uQ2hhbmdlfSAgLz5cblx0XHQpO1xuXHRcdFxuXHR9IGVsc2UgaWYodHlwZSA9PT0gJ3NlbGVjdCcpIHtcblx0XHRcblx0XHR2YXIgb3RoZXIsIG9wdHM7XG5cdFx0Ly8gYnVpbGQgdGhlIG9wdGlvbnMgbGlzdFxuXHRcdGlmKF8uaXNBcnJheShvcHRpb25zLm9wdGlvbnMpKSB7XG5cdFx0XHRvcHRzID0gb3B0aW9ucy5vcHRpb25zLm1hcChmdW5jdGlvbihvcCkge1xuXHRcdFx0XHRpZihfLmlzU3RyaW5nKG9wKSkge1xuXHRcdFx0XHRcdG9wID0ge1xuXHRcdFx0XHRcdFx0bGFiZWw6b3AsXG5cdFx0XHRcdFx0XHR2YWx1ZTpvcFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gKCBcblx0XHRcdFx0XHQ8b3B0aW9uIGtleT17b3AubGFiZWx9IHZhbHVlPXtvcC52YWx1ZSB8fCBvcC5sYWJlbH0+e29wLmxhYmVsfTwvb3B0aW9uPlxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHZhciBkZXBlbmRzT24gPSBvcHRpb25zLmRlcGVuZHNPbiA/IG9wdGlvbnMuZGVwZW5kc09uIDogZmFsc2U7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxzZWxlY3QgaWQ9e29wdGlvbnMuX25hbWV9IGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIGRhdGEtZGVwZW5kc29uPXtkZXBlbmRzT259ICBvbkNoYW5nZT17Y29udGV4dC5vbkNoYW5nZX0gID5cblx0XHRcdFx0e29wdHN9XG5cdFx0XHQ8L3NlbGVjdD5cblx0XHQpO1xuXHRcdFxuXHR9IFxuXHRcbn1cblxuZnVuY3Rpb24gY29udGFpbmVyKG5hbWUsIG9wdGlvbnMsIGlucHV0cywgY29udGV4dCkge1xuXHRcblx0aWYoIV8uaXNPYmplY3Qob3B0aW9ucykpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0aWYob3B0aW9ucy5hdHRhY2hlZCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRcblx0dmFyIHR5cGUgPSBvcHRpb25zLnR5cGU7XG5cdFxuXHRpZih0eXBlID09PSAnaGVhZGVyJykge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGtleT17bmFtZX0+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXNtLTEyXCI+XG5cdFx0XHRcdFx0XHQ8cCBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2wtc3RhdGljXCIgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IG9wdGlvbnMubGFiZWwgfHwgJyd9fSAvPlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XHRcblx0XHRcblx0fSBlbHNlIHtcblx0XHR2YXIgdGhlaW5wdXQgPSBpbnB1dChuYW1lLCBvcHRpb25zLCBjb250ZXh0KTtcblx0XHR2YXIgYXR0YWNoZWQgPSBmYWxzZTtcblx0XHRpZihpbnB1dHNbbmFtZSArICdfYXR0YWNoJ10pIHtcblx0XHRcdGF0dGFjaGVkID0gaW5wdXQobmFtZSArICdfYXR0YWNoJywgaW5wdXRzW25hbWUgKyAnX2F0dGFjaCddLCBjb250ZXh0KTtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIGNsYXMgPSB2YWxpZGF0ZV9jbGFzcyhvcHRpb25zLCBjb250ZXh0KTtcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGtleT17bmFtZX0+XG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17Y2xhc30+XHRcdFxuXHRcdFx0XHQ8c3BhbiBjbGFzc05hbWU9XCJpbnB1dC1ncm91cC1hZGRvblwiICBkYW5nZXJvdXNseVNldElubmVySFRNTD17e19faHRtbDogb3B0aW9ucy5sYWJlbCB8fCAnJ319IC8+IFxuXHRcdFx0XHR7dGhlaW5wdXR9XG5cdFx0XHRcdHthdHRhY2hlZH1cblx0XHRcdDwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdCk7XG5cdH1cbn1cbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgQXBwID0gcmVxdWlyZSgnLi9ncmVldGVyLmpzJyk7XG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG4kKGZ1bmN0aW9uKCkge1xuXHQvL2NvbnNvbGUubG9nKCdyZWFjdCcsUmVhY3QpO1xuXHQvKiBzdGFydCBvdXIgYXBwIGFmdGVyIHRoZSBwYWdlIGlzIHJlYWR5ICovIFx0XG5cdFJlYWN0LnJlbmRlcig8QXBwICAvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nub3dwaScpKTtcblxufSk7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFJlYWN0Qm9vdHN0cmFwID0gcmVxdWlyZSgncmVhY3QtYm9vdHN0cmFwJyk7XG5cbi8qIGNyZWF0ZSBmbGFzaCBtZXNzYWdlIFxuICogKi9cbnZhciBGbGFzaCA9IFJlYWN0Qm9vdHN0cmFwLkFsZXJ0O1xuXG52YXIgR0ZsYXNoID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpc1Zpc2libGU6IHRydWVcblx0XHR9O1xuXHR9LFxuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoe3Nob3djbGFzczonaW5mbyd9KTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRpZighdGhpcy5zdGF0ZS5pc1Zpc2libGUpXG5cdFx0ICAgIHJldHVybiBudWxsO1xuXG5cdFx0dmFyIG1lc3NhZ2UgPSB0aGlzLnByb3BzLmNoaWxkcmVuO1xuXHRcdHJldHVybiAoXG5cdFx0ICAgIDxGbGFzaCBic1N0eWxlPXt0aGlzLnByb3BzLnNob3djbGFzc30gb25EaXNtaXNzPXt0aGlzLmRpc21pc3NGbGFzaH0+XG5cdFx0XHQ8cD57bWVzc2FnZX08L3A+XG5cdFx0ICAgIDwvRmxhc2g+XG5cdFx0KTtcblx0fSxcblx0LyogbWFrZSBzdXJlIHRoZSB1c2VyIGNhbiBjYW5jZWwgYW55IHJlZGlyZWN0cyBieSBjbGVhcmluZyB0aGUgZmxhc2ggbWVzc2FnZVxuXHQgKiAqL1xuXHRkaXNtaXNzRmxhc2g6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe2lzVmlzaWJsZTogZmFsc2V9KTtcblx0XHRpZih0aGlzLnByb3BzLmNsZWFyaW50ZXJ2YWxzIGluc3RhbmNlb2YgQXJyYXkpdGhpcy5wcm9wcy5jbGVhcmludGVydmFscy5tYXAoR0ludGVydmFsLmNsZWFySW50ZXJ2YWxzKTtcblx0XHRpZih0aGlzLnByb3BzLmNsZWFydGltZW91dHMgaW5zdGFuY2VvZiBBcnJheSl0aGlzLnByb3BzLmNsZWFydGltZW91dHMubWFwKGNsZWFyVGltZW91dCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdGbGFzaDtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24uanMnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIEJvb3RzdHJhcEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkJ1dHRvbjtcbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxudmFyIFJlc2V0UGFzc3dvcmQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG1peGluczogW1JlYWN0LmFkZG9ucy5MaW5rZWRTdGF0ZU1peGluXSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRGb3JtU3RhdGUoKTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLnNldEZvcm1TdGF0ZSh0aGlzLnN0YXRlLnZhbGlkKSk7XG5cdH0sXG5cdHNldEZvcm1TdGF0ZTogZnVuY3Rpb24odmFsaWQpIHtcblx0XHR2YXIgcmV0ID0gQ29tbW9uLnNldEZvcm1TdGF0ZShUZXh0LnJlc2V0Y29kZSwgdmFsaWQpO1xuXHRcdHJldC5uYW1lID0gJ3Jlc2V0Jztcblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuXHRcdENvbW1vbi5Gb3JtSW5wdXRPbkNoYW5nZS5jYWxsKHRoaXMsIGUsIFRleHQucmVzZXRjb2RlKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAoPGZvcm0gIHJlZj0ncmVzZXRjb2RlJyAgY2xhc3NOYW1lPVwiY29kZS1mb3JtXCIgIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0gPlxuXHRcdFx0XHQ8aDI+e1RleHQuaG9tZS5yZXNldGNvZGV9IDxDb21tb24uR01hbiAvPjwvaDI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmZsYXNofVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQucmVzZXRjb2RlfSBjb250ZXh0PXt0aGlzfSAvPlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiAgPjxCb290c3RyYXBCdXR0b24gcm9sZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucmVzZXRlbWFpbH0gcmVmPVwicmVzZXRidXR0b25cIiBic1N0eWxlPSdpbmZvJyBkaXNhYmxlZD17Q29tbW9uLnNob3dCdXR0b24odGhpcy5zdGF0ZS52YWxpZCl9ICBkYXRhLWxvYWRpbmctdGV4dD1cIkNoZWNraW5nLi4uXCIgPiAge1RleHQuYnRucy5yZXNldGNvZGV9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLmNoYW5nZVJlc2V0fSAgYnNTdHlsZT0nZGVmYXVsdCc+ICB7VGV4dC5idG5zLmxvZ2luY3VycmVudH0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PC9kaXY+XG5cdFx0XHQ8L2Zvcm0+KTtcblx0XHRcdFxuXHR9LFxuXHRyZXNldGVtYWlsOiBmdW5jdGlvbigpIHtcblx0XHQvKiB2YWxpZGF0aW9uIG9jY3VycyBhcyBpbnB1dCBpcyByZWNlaXZlZCBcblx0XHQgKiB0aGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBhdmlhbGFibGUgaWZcblx0XHQgKiBhbGwgdmFsaWRhdGlvbiBpcyBhbHJlYWR5IG1ldCBzbyBqdXN0IHJ1blxuXHRcdCAqICovXG5cdFx0dmFyIG15ZGF0YSA9IHtjb2RlOid5ZXMnfTtcblx0XHRfLmVhY2godGhpcy5zdGF0ZS5mb3JtLCBmdW5jdGlvbih2LGspIHtcblx0XHRcdGlmKHYudHlwZSAhPT0gJ2hlYWRlcicpIHtcblx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodik7XG5cdFx0XHRcdG15ZGF0YVtrXSA9IGVsLnZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0aWYodi5hdHRhY2gpIHtcblx0XHRcdFx0dmFyIGVsQSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHYgKyAnX2F0dGFjaCcpO1xuXHRcdFx0XHRteWRhdGFbdi5hdHRhY2guZmllbGRdID0gZWxBLnZhbHVlO1x0XG5cdFx0XHR9XG5cdFx0fSx0aGlzKTtcblx0XHRteWRhdGFbaXNLZXldID0gaXNNZTtcblx0XHR2YXIgYnRuID0gJCh0aGlzLnJlZnMucmVzZXRidXR0b24uZ2V0RE9NTm9kZSgpKVxuXHRcdGJ0bi5idXR0b24oJ2xvYWRpbmcnKVxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IFRleHQucmVzZXRlbWFpbCxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdGRhdGE6IG15ZGF0YSxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcdFxuXHRcdFx0XHRmdW5jdGlvbiBtZXNzYWdlKCkge1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSA9ICdTdWNjZXNzJztcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBmbGFzaCBtZXNzYWdlcyBhcmUgc2hvd24gd2l0aCByZXNwb25zZSA6IHllc1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLGRhdGE6ZGF0YSxyZXNldGNvZGU6bm99KTtcblx0XHRcdFx0XG5cdFx0XHR9LmJpbmQodGhpcyksXG5cdFx0XHRcblx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMucHJvcHMudXJsLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMscmVzZXRmb3JtOnllcyxyZXNldGNvZGU6bm8sZGF0YToge3N0YXR1czpzdGF0dXMsZXJyOmVyci50b1N0cmluZygpfSB9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdFxuXHRcdC8qIGFsd2F5cyByZXNldCBvdXIgYnV0dG9uc1xuXHRcdCogKi9cdFxuXHRcdH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcblx0XHRcdGJ0bi5idXR0b24oJ3Jlc2V0Jyk7XG5cdFx0fSk7XG5cdFx0XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2V0UGFzc3dvcmQ7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uLmpzJyk7XG52YXIgR0ludGVydmFsID0gQ29tbW9uLkdJbnRlcnZhbDtcbnZhciBHRmxhc2ggPSByZXF1aXJlKCcuLi9mbGFzaCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIEJvb3RzdHJhcEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkJ1dHRvbjtcbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxudmFyIExvZ2luID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5sb2dpbiwgdmFsaWQpO1xuXHRcdHJldC5uYW1lID0gJ2xvZ2luJztcblx0XHRyZXR1cm4gcmV0OyBcblx0fSxcblx0aGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fSxcblx0b25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcblx0XHRDb21tb24uRm9ybUlucHV0T25DaGFuZ2UuY2FsbCh0aGlzLCBlLCBUZXh0LmxvZ2luKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHQvKiBpZiByZXNwb25zZSBzdGF0ZSBpcyB5ZXMgd2UgaGF2ZSBhIGZsYXNoIG1lc3NhZ2UgdG8gc2hvd1xuXHRcdCAqIHRoZSBtZXNzYWdlIGlzIGluIGRhdGFcblx0XHQgKiAqL1xuXHRcdGlmKHRoaXMuc3RhdGUucmVzcG9uc2UgPT09IHllcykge1xuXHRcdFx0XG5cdFx0XHR2YXIgcGlja2NsYXNzID0gKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSB5ZXMgKSA/ICdzdWNjZXNzJyA6ICd3YXJuaW5nJzsgXG5cdFx0XHRcblx0XHRcdHNob3dmbGFzaG1lc3NhZ2UgPSA8R0ZsYXNoIHNob3djbGFzcz17cGlja2NsYXNzfSBjbGVhcnRpbWVvdXRzPXtbR0ludGVydmFsLnRpbWVvdXRdfSBjbGVhcmludGVydmFscz17W0dJbnRlcnZhbC5yZWRpcmVjdF19PjxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHRoaXMuc3RhdGUuZGF0YS5tZXNzYWdlIHx8ICcnfX0gLz48L0dGbGFzaCA+O1xuXHRcdFx0XG5cdFx0XHQvKiBpZiB3ZSBoYXZlIGFuIGVycm9yIHNoYWtlIHRoZSBmb3JtLiAgdGhpcyBpcyBkb25lIHdpdGggdGhlXG5cdFx0XHQgKiBoYXMtZXJyb3JzIGNsYXNzXG5cdFx0XHQgKiAqL1xuXHRcdFx0aWYodGhpcy5zdGF0ZS5kYXRhLnN1Y2Nlc3MgPT09IG5vKSBoYXNlcnJvciA9ICcgaGFzLWVycm9ycyc7XG5cdFx0XHRcblx0XHR9XHRcdFx0XG5cdFx0XHRyZXR1cm4gKDxmb3JtICByZWY9J3NpZ25pbicgIGNsYXNzTmFtZT1cInNpZ25pbi1mb3JtXCIgIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0gPlxuXHRcdFx0XHQ8aDI+e1RleHQuaG9tZS5sb2dpbn0gPENvbW1vbi5HTWFuIC8+PC9oMj5cblx0XHRcdFx0e3RoaXMucHJvcHMuZmxhc2h9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PENvbW1vbi5Gb3JtIGlucHV0cz17VGV4dC5sb2dpbn0gY29udGV4dD17dGhpc30gLz5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgID48Qm9vdHN0cmFwQnV0dG9uIHJvbGU9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLmxvZ2lufSAgYnNTdHlsZT0naW5mbycgZGlzYWJsZWQ9e0NvbW1vbi5zaG93QnV0dG9uKHRoaXMuc3RhdGUudmFsaWQpfT4gIHtUZXh0LmJ0bnMubG9naW59IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLnNob3dyZWdpc3Rlcn0gIGJzU3R5bGU9J3dhcm5pbmcnPiAge1RleHQuYnRucy5yZWdpc3Rlcn0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtb2Zmc2V0LTYgY29sLXhzLTYgXCIgc3R5bGU9e3t0ZXh0QWxpZ246J3JpZ2h0J319ID48Qm9vdHN0cmFwQnV0dG9uIHJvbGU9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLnByb3BzLmNoYW5nZVJlc2V0fSAgYnNTdHlsZT0nZGVmYXVsdCcgPiAge1RleHQuYnRucy5yZXNldH0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PC9kaXY+XG5cdFx0XHQ8L2Zvcm0+KTtcblx0XHRcdFxuXHR9LFxuXHRsb2dpbjogZnVuY3Rpb24oKSB7XG5cdFx0Lyogc2FtZSBhcyByZWdpc3RlciBidXQgbGVzcyBpbmZvIHNlbnRcblx0XHQgKiB5b3UgY291bGQgY29tYmluZSB0aGVtIGJvdGggaWYgeW91IGxpa2UgbGVzcyBjb2RlXG5cdFx0ICogKi9cblx0XHR2YXIgbXlkYXRhID0ge2xvZ2luOid5ZXMnfTtcblx0XHQvL2NvbnNvbGUubG9nKCdmb3JtJywgdGhpcy5zdGF0ZS5mb3JtLCBUZXh0LmxvZ2luICk7XG5cdFx0Xy5lYWNoKHRoaXMuc3RhdGUuZm9ybSwgZnVuY3Rpb24odixrKSB7XG5cdFx0XHRpZih2LnR5cGUgIT09ICdoZWFkZXInKSB7XG5cdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHYpO1xuXHRcdFx0XHRteWRhdGFba10gPSBlbC52YWx1ZTtcblx0XHRcdH1cblx0XHR9LHRoaXMpOyBcblx0XHRteWRhdGFbaXNLZXldID0gaXNNZTtcblx0XHQvL2NvbnNvbGUubG9nKCdteWRhdGEnLCBteWRhdGEsICdUZXh0JywgVGV4dC5sb2dpbiApO1xuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IFRleHQucmVsYXksXG5cdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRkYXRhOiBteWRhdGEsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdGZ1bmN0aW9uIG1lc3NhZ2UoKSB7XG5cdFx0XHRcdFx0dmFyIHNlY3MgPSAoZGF0YS5yZWRpcmVjdC53aGVuIC0gcnJyKSAvIDEwMDA7XG5cdFx0XHRcdFx0cnJyKz0xMDAwO1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSA9IGRhdGEucmVwZWF0ZXIgKyAnPGJyIC8+WW91IHdpbGwgYmUgcmVkaXJlY3RlZCB0byA8YSBocmVmPVwiJyArIGRhdGEucmVkaXJlY3QucGF0aCArICdcIj4nICsgZGF0YS5yZWRpcmVjdC5wYXRoLnN1YnN0cigxKSArICc8L2E+ICAnO1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSs9IHNlY3MgPT09IDAgPyAnIG5vdyc6JyBpbiAnICsgc2VjcyArICcgc2Vjb25kcy4nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKHR5cGVvZiBkYXRhLnJlZGlyZWN0ID09PSAnb2JqZWN0JyAmJiBkYXRhLnJlZGlyZWN0LndoZW4+MTAwMCkge1xuXHRcdFx0XHRcdGRhdGEucmVwZWF0ZXIgPSBkYXRhLm1lc3NhZ2U7XG5cdFx0XHRcdFx0dmFyIHJyciA9IDEwMDBcblx0XHRcdFx0XHRcdF9zZWxmID0gdGhpcy5wcm9wcy5jb250ZXh0O1xuXHRcdFx0XHRcdEdJbnRlcnZhbC5yZWRpcmVjdCA9IEdJbnRlcnZhbC5zZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdG1lc3NhZ2UoKTtcblx0XHRcdFx0XHRcdF9zZWxmLnNldFN0YXRlKHtyZXNwb25zZTp5ZXMsZGF0YTpkYXRhfSk7XG5cdFx0XHRcdFx0fSwxMDAwKTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhHSW50ZXJ2YWwuaW50ZXJ2YWxzKVxuXHRcdFx0XHRcdEdJbnRlcnZhbC50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0R0ludGVydmFsLmNsZWFySW50ZXJ2YWxzKEdJbnRlcnZhbC5yZWRpcmVjdCk7XG5cdFx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGRhdGEucmVkaXJlY3QucGF0aDtcblx0XHRcdFx0XHR9LGRhdGEucmVkaXJlY3Qud2hlbik7XG5cdFx0XHRcdFx0bWVzc2FnZSgpXG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZih0eXBlb2YgZGF0YS5yZWRpcmVjdCA9PT0gJ29iamVjdCcgJiYgZGF0YS5yZWRpcmVjdC5wYXRoKXtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGRhdGEucmVkaXJlY3QucGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0dGhpcy5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLGRhdGE6ZGF0YX0pO1xuXHRcdFx0fS5iaW5kKHRoaXMpLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMsZGF0YToge3N0YXR1czpzdGF0dXMsZXJyOmVyci50b1N0cmluZygpfSB9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdH0pO1x0XHRcblx0fVxufSk7IFxuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2luO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBUZXh0ID0gSlNPTi5wYXJzZShyZXF1aXJlKCd0ZXh0JykpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi5qcycpO1xudmFyIEdJbnRlcnZhbCA9IENvbW1vbi5HSW50ZXJ2YWw7XG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xudmFyIFJlYWN0Qm9vdHN0cmFwID0gcmVxdWlyZSgncmVhY3QtYm9vdHN0cmFwJyk7XG52YXIgQm9vdHN0cmFwQnV0dG9uID0gUmVhY3RCb290c3RyYXAuQnV0dG9uO1xudmFyIHllcyA9ICd5ZXMnLCBubyA9ICdubyc7XG4vL3ZhciB5ZXMgPSB0cnVlLCBubyA9IGZhbHNlO1xuXG52YXIgUlIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG1peGluczogW1JlYWN0LmFkZG9ucy5MaW5rZWRTdGF0ZU1peGluXSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRGb3JtU3RhdGUoKTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLnNldEZvcm1TdGF0ZSh0aGlzLnN0YXRlLnZhbGlkKSk7XG5cdH0sXG5cdHNldEZvcm1TdGF0ZTogZnVuY3Rpb24odmFsaWQpIHtcblx0XHR2YXIgcmV0ID0gQ29tbW9uLnNldEZvcm1TdGF0ZShUZXh0LnJlZ2lzdGVyLCB2YWxpZCk7XG5cdFx0cmV0Lm5hbWUgPSAncmVnaXN0ZXInO1xuXHRcdHJldHVybiByZXQ7XG5cdH0sXG5cdGhhbmRsZVN1Ym1pdDogZnVuY3Rpb24oZSkge1xuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG5cdFx0Q29tbW9uLkZvcm1JbnB1dE9uQ2hhbmdlLmNhbGwodGhpcywgZSwgVGV4dC5yZWdpc3Rlcik7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gKDxmb3JtICByZWY9J3NpZ25pbicgIGNsYXNzTmFtZT1cInNpZ25pbi1mb3JtXCIgICBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9PlxuXHRcdFx0XHQ8aDI+e1RleHQuaG9tZS5yZWdpc3Rlcn0gPENvbW1vbi5HTWFuIC8+PC9oMj5cblx0XHRcdFx0e3RoaXMucHJvcHMuZmxhc2h9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PENvbW1vbi5Gb3JtIGlucHV0cz17VGV4dC5yZWdpc3Rlcn0gY29udGV4dD17dGhpc30gLz5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgc3R5bGU9e3t0ZXh0QWxpZ246J2xlZnQnfX0gPjxCb290c3RyYXBCdXR0b24gb25DbGljaz17dGhpcy5yZWdpc3Rlcn0gcmVmPVwicmVnaXN0ZXJidXR0b25cIiBkYXRhLWxvYWRpbmctdGV4dD1cIlJlZ2lzdGVyaW5nLi4uXCIgcm9sZT1cImJ1dHRvblwiICBic1N0eWxlPSd3YXJuaW5nJyBjbGFzc05hbWU9XCJidG4gIGJ0bi13YXJuaW5nXCIgIGRpc2FibGVkPXtDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0+ICB7VGV4dC5idG5zLnJlZ2lzdGVyfSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiAgIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5wcm9wcy5zaG93cmVnaXN0ZXJ9ICBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHRcIj4gIHtUZXh0LmJ0bnMubG9naW5jdXJyZW50fSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjwvZGl2PlxuXHRcdFx0PC9mb3JtPik7XG5cdH0sXG5cdHJlZ2lzdGVyOiBmdW5jdGlvbigpIHtcblx0XHQvKiB2YWxpZGF0aW9uIG9jY3VycyBhcyBpbnB1dCBpcyByZWNlaXZlZCBcblx0XHQgKiB0aGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBhdmlhbGFibGUgaWZcblx0XHQgKiBhbGwgdmFsaWRhdGlvbiBpcyBhbHJlYWR5IG1ldCBzbyBqdXN0IHJ1blxuXHRcdCAqICovXG5cdFx0Y29uc29sZS5sb2coJ2Zvcm0nLCB0aGlzLnN0YXRlLmZvcm0sICdUZXh0JywgVGV4dC5yZWdpc3RlciApOyBcblx0XHR2YXIgbXlkYXRhID0ge3JlZ2lzdGVyOid5ZXMnfTtcblx0XHRfLmVhY2godGhpcy5zdGF0ZS5mb3JtLCBmdW5jdGlvbih2LGspIHtcblx0XHRcdGlmKHYudHlwZSAhPT0gJ2hlYWRlcicpIHtcblx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodik7XG5cdFx0XHRcdG15ZGF0YVtrXSA9IGVsLnZhbHVlO1xuXHRcdFx0fVxuXHRcdH0sdGhpcyk7IFxuXHRcdG15ZGF0YVtpc0tleV0gPSBpc01lO1xuXHRcdGNvbnNvbGUubG9nKCdteWRhdGEnLCBteWRhdGEsICdUZXh0JywgVGV4dC5yZWdpc3RlciApO1xuXHRcdHZhciBidG4gPSAkKHRoaXMucmVmcy5yZWdpc3RlcmJ1dHRvbi5nZXRET01Ob2RlKCkpXG5cdFx0YnRuLmJ1dHRvbignbG9hZGluZycpXG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogVGV4dC5yZWxheSxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdGRhdGE6IG15ZGF0YSxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdGZ1bmN0aW9uIG1lc3NhZ2UoKSB7XG5cdFx0XHRcdFx0dmFyIHNlY3MgPSAoZGF0YS5yZWRpcmVjdC53aGVuIC0gcnJyKSAvIDEwMDA7XG5cdFx0XHRcdFx0cnJyKz0xMDAwO1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSA9IGRhdGEucmVwZWF0ZXIgKyAnPGJyIC8+WW91IHdpbGwgYmUgcmVkaXJlY3RlZCB0byA8YSBocmVmPVwiJyArIGRhdGEucmVkaXJlY3QucGF0aCArICdcIj4nICsgZGF0YS5yZWRpcmVjdC5wYXRoLnN1YnN0cigxKSArICc8L2E+ICAnO1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSs9IHNlY3MgPT09IDAgPyAnIG5vdyc6JyBpbiAnICsgc2VjcyArICcgc2Vjb25kcy4nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGlmIHdlIGdldCBhIHJlZGlyZWN0IGNoZWNrIHRoZSB0aW1lIGFuZCBydW4gYW4gaW50ZXJ2YWxcblx0XHRcdFx0ICogdGhpcyBpcyByZWFsbHkganVzdCB0byBzaG93IFJlYWN0IHdvcmtcblx0XHRcdFx0ICogKi9cdFxuXHRcdFx0XHRpZih0eXBlb2YgZGF0YS5yZWRpcmVjdCA9PT0gJ29iamVjdCcgJiYgZGF0YS5yZWRpcmVjdC53aGVuPjEwMDApIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRkYXRhLnJlcGVhdGVyID0gZGF0YS5tZXNzYWdlOyAvL2tlZXAgb3VyIG9yaWdpbmFsIG1lc3NhZ2UgZm9yIHRoZSByZXBlYXRlclxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZhciBycnIgPSAxMDAwXG5cdFx0XHRcdFx0XHRfc2VsZiA9IHRoaXMucHJvcHMuY29udGV4dDtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRTbm93cGlJbnRlcnZhbC5yZWRpcmVjdCA9IFNub3dwaUludGVydmFsLnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0LyogdGhpcyBpcyByZWFsbHkgc2ltcGxlXG5cdFx0XHRcdFx0XHQgKiBqdXN0IHJlY2FjdWxhdGUgdGhlIG1lc3NhZ2UgYW5kIGxldCByZWFjdCBkbyB0aGUgcmVzdFxuXHRcdFx0XHRcdFx0ICogKi9cblx0XHRcdFx0XHRcdG1lc3NhZ2UoKTtcblx0XHRcdFx0XHRcdF9zZWxmLnNldFN0YXRlKHtyZXNwb25zZTp5ZXMsZGF0YTpkYXRhfSk7XG5cdFx0XHRcdFx0fSwxMDAwKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvKiBraWxsIHRoZSBpbnRlcnZhbCBhbmQgcmVkaXJlY3Qgb24gdGhlIHRpbWVvdXQgXG5cdFx0XHRcdFx0ICogKi9cblx0XHRcdFx0XHRHSW50ZXJ2YWwudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdEdJbnRlcnZhbC5jbGVhckludGVydmFscyhHSW50ZXJ2YWwucmVkaXJlY3QpO1xuXHRcdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdFx0fSxkYXRhLnJlZGlyZWN0LndoZW4pO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdG1lc3NhZ2UoKVxuXHRcdFx0XHRcblx0XHRcdFx0fSBlbHNlIGlmKHR5cGVvZiBkYXRhLnJlZGlyZWN0ID09PSAnb2JqZWN0JyAmJiBkYXRhLnJlZGlyZWN0LnBhdGgpe1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gZGF0YS5yZWRpcmVjdC5wYXRoO1xuXHRcdFx0XHRcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0LyogZmxhc2ggbWVzc2FnZXMgYXJlIHNob3duIHdpdGggcmVzcG9uc2UgOiB5ZXNcblx0XHRcdFx0ICogKi9cdFxuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe3Jlc3BvbnNlOnllcyxkYXRhOmRhdGF9KTtcblx0XHRcdFx0XG5cdFx0XHR9LmJpbmQodGhpcyksXG5cdFx0XHRcblx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMucHJvcHMudXJsLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMsZGF0YToge3N0YXR1czpzdGF0dXMsZXJyOmVyci50b1N0cmluZygpfSB9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdFxuXHRcdC8qIG5lYXQgbGl0dGxlIHRyaWNrIHRvIGFsd2F5cyByZXNldCBvdXIgYnV0dG9uc1xuXHRcdCogKi9cdFxuXHRcdH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcblx0XHRcdGJ0bi5idXR0b24oJ3Jlc2V0Jyk7XG5cdFx0fSk7XG5cdFx0XG5cdH0sXG59KTsgXG5cbm1vZHVsZS5leHBvcnRzID0gUlI7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uLmpzJyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcbi8vdmFyIHllcyA9IHRydWUsIG5vID0gZmFsc2U7XG5cbnZhciBSZXNldFBhc3N3b3JkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5yZXNldCwgdmFsaWQpO1xuXHRcdHJldC5uYW1lID0gJ3Jlc2V0Jztcblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuXHRcdENvbW1vbi5Gb3JtSW5wdXRPbkNoYW5nZS5jYWxsKHRoaXMsIGUsIFRleHQucmVzZXQpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICg8Zm9ybSAgcmVmPSdzaWduaW4nICBjbGFzc05hbWU9XCJzaWduaW4tZm9ybVwiICBvblN1Ym1pdD17dGhpcy5oYW5kbGVTdWJtaXR9ID5cblx0XHRcdFx0PGgyPntUZXh0LmhvbWUucmVzZXR9IDxDb21tb24uR01hbiAvPjwvaDI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmZsYXNofVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQucmVzZXR9IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiICA+PEJvb3RzdHJhcEJ1dHRvbiByb2xlPVwiYnV0dG9uXCIgb25DbGljaz17dGhpcy5yZXNldGVtYWlsfSByZWY9XCJyZXNldGJ1dHRvblwiIGJzU3R5bGU9J2luZm8nIGRpc2FibGVkPXtDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0gIGRhdGEtbG9hZGluZy10ZXh0PVwiQ2hlY2tpbmcuLi5cIiA+ICB7VGV4dC5idG5zLnJlc2V0ZW1haWx9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLmNoYW5nZVJlc2V0fSAgYnNTdHlsZT0nZGVmYXVsdCc+ICB7VGV4dC5idG5zLmxvZ2luY3VycmVudH0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PC9kaXY+XG5cdFx0XHQ8L2Zvcm0+KTtcblx0XHRcdFxuXHR9LFxuXHRyZXNldGVtYWlsOiBmdW5jdGlvbigpIHtcblx0XHQvKiB2YWxpZGF0aW9uIG9jY3VycyBhcyBpbnB1dCBpcyByZWNlaXZlZCBcblx0XHQgKiB0aGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBhdmlhbGFibGUgaWZcblx0XHQgKiBhbGwgdmFsaWRhdGlvbiBpcyBhbHJlYWR5IG1ldCBzbyBqdXN0IHJ1blxuXHRcdCAqICovXG5cdFx0dmFyIG15ZGF0YSA9IHtyZXNldDoneWVzJ307XG5cdFx0Y29uc29sZS5sb2codGhpcy5zdGF0ZS5mb3JtKTtcblx0XHRfLmVhY2godGhpcy5zdGF0ZS5mb3JtLCBmdW5jdGlvbih2LGspIHtcblx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodik7XG5cdFx0XHRcdG15ZGF0YVtrXSA9IGVsLnZhbHVlO1xuXHRcdH0sdGhpcyk7XG5cdFx0bXlkYXRhW2lzS2V5XSA9IGlzTWU7XG5cdFx0dmFyIGJ0biA9ICQodGhpcy5yZWZzLnJlc2V0YnV0dG9uLmdldERPTU5vZGUoKSlcblx0XHRidG4uYnV0dG9uKCdsb2FkaW5nJylcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBUZXh0LnJlc2V0ZW1haWwsXG5cdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRkYXRhOiBteWRhdGEsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHRcblx0XHRcdFx0ZnVuY3Rpb24gbWVzc2FnZSgpIHtcblx0XHRcdFx0XHRkYXRhLm1lc3NhZ2UgPSAnU3VjY2Vzcyc7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogZmxhc2ggbWVzc2FnZXMgYXJlIHNob3duIHdpdGggcmVzcG9uc2UgOiB5ZXNcblx0XHRcdFx0ICogKi9cdFxuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe3Jlc3BvbnNlOnllcyxkYXRhOmRhdGEscmVzZXRmb3JtOm5vLHJlc2V0Y29kZTp5ZXN9KTtcblx0XHRcdFx0XG5cdFx0XHR9LmJpbmQodGhpcyksXG5cdFx0XHRcblx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMucHJvcHMudXJsLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMscmVzZXRmb3JtOm5vLGRhdGE6IHtzdGF0dXM6c3RhdHVzLGVycjplcnIudG9TdHJpbmcoKX0gfSk7XG5cdFx0XHR9LmJpbmQodGhpcylcblx0XHRcblx0XHQvKiBhbHdheXMgcmVzZXQgb3VyIGJ1dHRvbnNcblx0XHQqICovXHRcblx0XHR9KS5hbHdheXMoZnVuY3Rpb24gKCkge1xuXHRcdFx0XG5cdFx0XHRidG4uYnV0dG9uKCdyZXNldCcpO1xuXHRcdH0pO1xuXHRcdFxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNldFBhc3N3b3JkO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIExvZ2luID0gcmVxdWlyZSgnLi9mb3Jtcy9sb2dpbicpO1xudmFyIFJlZyA9IHJlcXVpcmUoJy4vZm9ybXMvcmVnJyk7XG52YXIgUmVzZXRQYXNzd29yZCA9IHJlcXVpcmUoJy4vZm9ybXMvcmVzZXQnKTtcbnZhciBSZXNldENvZGUgPSByZXF1aXJlKCcuL2Zvcm1zL2NvZGUnKTtcbnZhciBHRmxhc2ggPSByZXF1aXJlKCcuL2ZsYXNoJyk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi9jb21tb24uanMnKTtcbnZhciBHSW50ZXJ2YWwgPSBDb21tb24uR0ludGVydmFsO1xudmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG5cbi8qKlxuICogdXNlIHllcyBmb3IgdHJ1ZVxuICogdXNlIG5vIGZvciBmYWxzZVxuICogXG4gKiB0aGlzIHNpbmdsZSBhcHAgdXNlcyB0aGUgeWVzL25vIHZhciBzbyBpZiB5b3Ugd2FudCB5b3UgY2FuIHN3aXRjaCBiYWNrIHRvIHRydWUvZmFsc2VcbiAqIFxuICogKi9cbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxuLyogdGhpcyBpcyBvdXIgbWFpbiBjb21wb25lbnRcbiAqIHNpbmNlIHRoaXMgaXMgYSBzaW5nbGUgZnVuY3Rpb24gYXBwIHdlIHdpbGwgY2FsbCB0aGlzIGRpcmVjdGx5XG4gKiBcbiAqIHRvIGluY2x1ZGUgdGhpcyBpbiB5b3VyIFJlYWN0IHNldHVwIG1vZGlmeSBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIHRvIHJlY2lldmUgYW55IGRlZmF1bHQgdmFsdWVzIFxuICogXG4gKiAqL1xuXG52YXIgQm9vdHN0cmFwQnV0dG9uID0gUmVhY3RCb290c3RyYXAuQnV0dG9uO1xuXG52YXIgR0xvZ2luID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5vdyA9IG5ldyBEYXRlKCk7XG5cdFx0LyogaW5pdGlhbGl6ZSB0aGUgbG9naW5cblx0XHQgKiByZWdpc3RlciBpcyBubywgaWYgd2Ugd2FudCB0byBzaG93IHRoZSByZWdpc3RlciBmb3JtIHNldCB0byB5ZXNcblx0XHQgKiBtb3VudGVkIGlzIHNldCB0byB5ZXMgd2hlbiB0aGUgYXBwIG1vdW50cyBpZiB5b3UgbmVlZCB0byB3YWl0IGZvciB0aGF0XG5cdFx0ICogc2V0IHJlc3BvbnNlIHRvIHllcyB0byBzaG93IGEgZmxhc2ggbWVzc2FnZVxuXHRcdCAqIGVycm9yIG1lc3NhZ2VzIGFyZSBpbiBkYXRhXG5cdFx0ICogKi9cblx0XHRyZXR1cm4ge3JlZ2lzdGVyOiBubyxtb3VudGVkOiBubyxyZXNwb25zZTpubyxkYXRhOnt9fTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0Lyogd2Ugd2FudCB0byBraWxsIHRoZSBmbGFzaCBhbnl0aW1lIHRoZSBmb3JtIGlzIHJlbmRlcmVkXG5cdFx0ICogeW91IGNhbiBhZGQgYW55IG90aGVyIHByb3BzIHlvdSBuZWVkIGhlcmUgaWYgeW91IGluY2x1ZGVcblx0XHQgKiB0aGlzIGluIGFub3RoZXIgY29tcG9uZW50IFxuXHRcdCAqICovXG5cdFx0dGhpcy5zZXRTdGF0ZSh7cmVzcG9uc2U6bm99KTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNob3dmbGFzaG1lc3NhZ2UgPSBmYWxzZTtcblx0XHR2YXIgaGFzZXJyb3IgPSBmYWxzZTtcblx0XHR2YXIgbG9naW5PUnJlZ2lzdGVyID0gKHRoaXMuc3RhdGUucmVnaXN0ZXIgPT09IHllcykgPyAncmVnaXN0ZXInIDogJ2xvZ2luJztcblx0XHQvKiBpZiByZXNwb25zZSBzdGF0ZSBpcyB5ZXMgd2UgaGF2ZSBhIGZsYXNoIG1lc3NhZ2UgdG8gc2hvd1xuXHRcdCAqIHRoZSBtZXNzYWdlIGlzIGluIGRhdGFcblx0XHQgKiAqL1xuXHRcdGlmKHRoaXMuc3RhdGUucmVzcG9uc2UgPT09IHllcykge1xuXHRcdFx0XG5cdFx0XHR2YXIgcGlja2NsYXNzID0gKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSB5ZXMgKSA/ICdzdWNjZXNzJyA6ICd3YXJuaW5nJzsgXG5cdFx0XHRcblx0XHRcdHNob3dmbGFzaG1lc3NhZ2UgPSA8R0ZsYXNoIHNob3djbGFzcz17cGlja2NsYXNzfSBjbGVhcnRpbWVvdXRzPXtbR0ludGVydmFsLnRpbWVvdXRdfSBjbGVhcmludGVydmFscz17W0dJbnRlcnZhbC5yZWRpcmVjdF19PjxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHRoaXMuc3RhdGUuZGF0YS5tZXNzYWdlIHx8ICcnfX0gLz48L0dGbGFzaCA+O1xuXHRcdFx0XG5cdFx0XHQvKiBpZiB3ZSBoYXZlIGFuIGVycm9yIHNoYWtlIHRoZSBmb3JtLiAgdGhpcyBpcyBkb25lIHdpdGggdGhlXG5cdFx0XHQgKiBoYXMtZXJyb3JzIGNsYXNzXG5cdFx0XHQgKiAqL1xuXHRcdFx0aWYodGhpcy5zdGF0ZS5kYXRhLnN1Y2Nlc3MgPT09IG5vKSBoYXNlcnJvciA9ICcgaGFzLWVycm9ycyc7XG5cdFx0XHRcblx0XHR9XG5cdFx0XG5cdFx0aWYodGhpcy5zdGF0ZS5yZXNldGNvZGUgPT09IHllcykge1xuXHRcdFx0dmFyIHJldCA9IDxSZXNldENvZGUgIGNvbnRleHQ9e3RoaXN9IGNoYW5nZVJlc2V0PXt0aGlzLmNoYW5nZUNvZGV9IGZsYXNoPXtzaG93Zmxhc2htZXNzYWdlfSAvPlxuXHRcdH0gZWxzZSBpZih0aGlzLnN0YXRlLnJlc2V0Zm9ybSA9PT0geWVzKSB7XG5cdFx0XHR2YXIgcmV0ID0gPFJlc2V0UGFzc3dvcmQgIGNvbnRleHQ9e3RoaXN9IGNoYW5nZVJlc2V0PXt0aGlzLmNoYW5nZVJlc2V0fSBmbGFzaD17c2hvd2ZsYXNobWVzc2FnZX0gLz5cblx0XHR9IGVsc2UgaWYodGhpcy5zdGF0ZS5yZWdpc3RlciA9PT0gbm8pIHtcblx0XHRcdHZhciByZXQgPSA8TG9naW4gIGNvbnRleHQ9e3RoaXN9IHNob3dyZWdpc3Rlcj17dGhpcy5zaG93cmVnaXN0ZXJ9IGNoYW5nZVJlc2V0PXt0aGlzLmNoYW5nZVJlc2V0fSBmbGFzaD17c2hvd2ZsYXNobWVzc2FnZX0gLz5cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHJldCA9IDxSZWcgc2hvd3JlZ2lzdGVyPXt0aGlzLnNob3dyZWdpc3Rlcn0gZmxhc2g9e3Nob3dmbGFzaG1lc3NhZ2V9IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0fVxuXHRcdHJldHVybiAoIDxkaXYgIGNsYXNzTmFtZT17bG9naW5PUnJlZ2lzdGVyICsgXCIgY2VudGVybWUgY29sLXhzLTEyIHNoYWtlbWUgXCIgKyBoYXNlcnJvcn0+e3JldH0gPC9kaXY+KTtcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFdoZW4gdGhlIGNvbXBvbmVudCBpcyBhZGRlZCBsZXQgbWUga25vd1xuXHRcdHRoaXMuc2V0U3RhdGUoe21vdW50ZWQ6IHllc30pXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHRzaG93cmVnaXN0ZXI6IGZ1bmN0aW9uIChlKSB7XG5cdFx0LyogdG9nZ2xlIHRoZSByZWdpc3RlciAvIGxvZ2luIGZvcm1zXG5cdFx0ICogKi9cblx0XHR0aGlzLnNldFN0YXRlKHtyZWdpc3RlcjogdGhpcy5zdGF0ZS5yZWdpc3RlciA9PT0geWVzID8gbm8gOiB5ZXMscmVzcG9uc2U6bm99KVxuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdGNoYW5nZVJlc2V0OiBmdW5jdGlvbiAoZSkge1xuXHRcdC8qIHRvZ2dsZSB0aGUgcGFzc3dvcmQgcmVzZXRcblx0XHQgKiAqL1xuXHRcdHRoaXMuc2V0U3RhdGUoe3Jlc2V0Zm9ybTogdGhpcy5zdGF0ZS5yZXNldGZvcm0gPT09IHllcyA/bm8gOiB5ZXMscmVzcG9uc2U6bm99KVxuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdGNoYW5nZUNvZGU6IGZ1bmN0aW9uIChlKSB7XG5cdFx0LyogdG9nZ2xlIHRoZSBwYXNzd29yZCByZXNldFxuXHRcdCAqICovXG5cdFx0dGhpcy5zZXRTdGF0ZSh7cmVzZXRjb2RlOiB0aGlzLnN0YXRlLnJlc2V0Y29kZSA9PT0geWVzID9ubyA6IHllcyxyZXNwb25zZTpub30pXG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fSxcblx0aGFuZGxlU3VibWl0OiBmdW5jdGlvbihlKSB7XG5cdFx0cmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR0xvZ2luO1xuIl19
