(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var React = window.React;
//var Text = JSON.parse(require('text'));
var _ = window._;

var Working = React.createClass({displayName: "Working",
	getDefaultProps: function() {
		return ({
			divstyle:{
				width: 0,
				height: '100%',
			},
			enabled: false
		});
	},
	
	render: function() {
	    return (
		React.createElement("div", {style: this.props.divstyle})
	    );
	}
});

module.exports.Working = Working;

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
var GInterval = require('./common.js').GInterval;
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


},{"./common.js":1}],4:[function(require,module,exports){
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
		ret.resetcode = document.getElementById('G__resetcode__G').value;
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
		ret.working =  false;
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
				
				React.createElement("div", {className: "col-xs-6 ", style: {position: 'relative'}}, 
					React.createElement(Common.Working, {enabled: !Common.showButton(this.state.valid)}), 
					React.createElement("input", {type: "submit", onClick: this.login, value: Text.btns.login, className: "btn btn-info", disabled: Common.showButton(this.state.valid)})
				), 
				
				React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {onClick: this.props.showregister, bsStyle: "warning"}, "  ", Text.btns.register, " ")), 
				
				React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
				
				React.createElement("div", {className: "col-xs-offset-6 col-xs-6 ", style: {textAlign:'right', paddingTop:10, display: 'none'}}, React.createElement(BootstrapButton, {role: "button", onClick: this.props.changeReset, bsStyle: "default"}, "  ", Text.btns.reset, " ")), 
				
				React.createElement("div", {className: "clearfix"})
				
			));
			
	},
	login: function() {
	
		this.setState({
			 working: true
		});
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
						_self.setState({ response:yes, data:data });
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
		ret.working =  false;
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
					
					React.createElement("div", {className: "col-xs-6 ", style: {position: 'relative'}}, 
					React.createElement(Common.Working, {enabled: !Common.showButton(this.state.valid)}), 
					React.createElement("input", {type: "submit", onClick: this.register, ref: "registerbutton", value: Text.btns.register, className: "btn btn-warning", disabled: Common.showButton(this.state.valid)})
				), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {role: "button", onClick: this.props.showregister, className: "btn btn-default"}, "  ", Text.btns.logincurrent, " ")), 
					React.createElement("div", {className: "clearfix"})
			));
	},
	register: function() {
		/* validation occurs as input is received 
		 * this method should only be avialable if
		 * all validation is already met so just run
		 * */
		
		this.setState({
			 working: true
		});
		
		//console.log('form', this.state.form, 'Text', Text.register ); 
		var mydata = { register: 'yes' };
		_.each(this.state.form, function(v,k) {
			if(v.type !== 'header') {
				var el = document.getElementById(v);
				mydata[k] = el.value;
			}
		},this); 
		mydata[isKey] = isMe;
		console.log('mydata', mydata, 'Text', Text.register );
		//var btn = $(this.refs.registerbutton.getDOMNode())
		//btn.button('loading')
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
			
			//btn.button('reset');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvX19ncmVldGVyX3N0YXRpY3MvanMvbGliL3JlYWN0L2pzeC9jb21tb24uanMiLCIvaG9tZS9zbm93L3Byb2plY3RzL2dpdGh1Yi9rZXlzdG9uZS1ncmVldGVyL3B1YmxpYy9fX2dyZWV0ZXJfc3RhdGljcy9qcy9saWIvcmVhY3QvanN4L2Zha2VfNzAxMWVmZTkuanMiLCIvaG9tZS9zbm93L3Byb2plY3RzL2dpdGh1Yi9rZXlzdG9uZS1ncmVldGVyL3B1YmxpYy9fX2dyZWV0ZXJfc3RhdGljcy9qcy9saWIvcmVhY3QvanN4L2ZsYXNoLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvX19ncmVldGVyX3N0YXRpY3MvanMvbGliL3JlYWN0L2pzeC9mb3Jtcy9jb2RlLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvX19ncmVldGVyX3N0YXRpY3MvanMvbGliL3JlYWN0L2pzeC9mb3Jtcy9sb2dpbi5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL19fZ3JlZXRlcl9zdGF0aWNzL2pzL2xpYi9yZWFjdC9qc3gvZm9ybXMvcmVnLmpzIiwiL2hvbWUvc25vdy9wcm9qZWN0cy9naXRodWIva2V5c3RvbmUtZ3JlZXRlci9wdWJsaWMvX19ncmVldGVyX3N0YXRpY3MvanMvbGliL3JlYWN0L2pzeC9mb3Jtcy9yZXNldC5qcyIsIi9ob21lL3Nub3cvcHJvamVjdHMvZ2l0aHViL2tleXN0b25lLWdyZWV0ZXIvcHVibGljL19f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IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuLy92YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbnZhciBXb3JraW5nID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoe1xuXHRcdFx0ZGl2c3R5bGU6e1xuXHRcdFx0XHR3aWR0aDogMCxcblx0XHRcdFx0aGVpZ2h0OiAnMTAwJScsXG5cdFx0XHR9LFxuXHRcdFx0ZW5hYmxlZDogZmFsc2Vcblx0XHR9KTtcblx0fSxcblx0XG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdCAgICByZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e3RoaXMucHJvcHMuZGl2c3R5bGV9ICAvPlxuXHQgICAgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzLldvcmtpbmcgPSBXb3JraW5nO1xuXG4vKiBtYW4gY29tcG9uZW50XG4gKiBzaW1wbGUgZXhhbXBsZVxuICogKi9cbnZhciBHTWFuID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoe2RpdnN0eWxlOntmbG9hdDoncmlnaHQnLH19KTtcblx0fSxcblx0XG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdCAgICByZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e3RoaXMucHJvcHMuZGl2c3R5bGV9IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBUZXh0LmxvZ29tYW4gfHwgJyd9fSAvPlxuXHQgICAgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzLkdNYW4gPSBHTWFuO1xuXG4vKiBcbiAqIHdlIHVzZSB0aGlzIGZvciB0aGUgY291bnRkb3duIHRpbWVyIGJlZm9yZSB3ZSByZWRpcmVjdCBhIGxvZ2dlZCBcbiAqIGluIHVzZXIuICB5b3UgY2FuIGRpc2FibGUgaXQgXG4gKiBieSBzZW5kaW5nIGEgcmVkaXJlY3QgdGltZSBvZiAwXG4gKiAqL1xudmFyIEdJbnRlcnZhbCA9IHtcblx0ICBpbnRlcnZhbHM6IFtdLFxuXHQgIHNldEludGVydmFsOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcnZhbHMucHVzaChzZXRJbnRlcnZhbC5hcHBseShudWxsLCBhcmd1bWVudHMpKTtcblx0ICB9LFxuXHQgIGNsZWFySW50ZXJ2YWxzOiBmdW5jdGlvbih3aG8pIHtcblx0XHR3aG8gPSB3aG8gLSAxO1xuXHRcdGlmKEdJbnRlcnZhbC5pbnRlcnZhbHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdjbGVhciBhbGwgaW50ZXJ2YWxzJyx0aGlzLmludGVydmFscylcblx0XHRcdEdJbnRlcnZhbC5pbnRlcnZhbHMubWFwKGNsZWFySW50ZXJ2YWwpO1xuXHRcdFx0R0ludGVydmFsLmludGVydmFscyA9IFtdO1xuXHRcdH0gZWxzZSBpZih3aG8gJiYgR0ludGVydmFsLmludGVydmFsc1t3aG9dKSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdjbGVhciBpbnRlcnZhbHMnLHdobyx0aGlzLmludGVydmFsc1t3aG9dKVxuXHRcdFx0Y2xlYXJJbnRlcnZhbChHSW50ZXJ2YWwuaW50ZXJ2YWxzW3dob10pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdtYXAgaW50ZXJ2YWxzJyx0aGlzLmludGVydmFscylcblx0XHRcdEdJbnRlcnZhbC5pbnRlcnZhbHMubWFwKGNsZWFySW50ZXJ2YWwpO1xuXHRcdFx0R0ludGVydmFsLmludGVydmFscyA9IFtdO1xuXHRcdH1cblx0ICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5HSW50ZXJ2YWwgPSBHSW50ZXJ2YWw7XG5cbm1vZHVsZS5leHBvcnRzLnNob3dCdXR0b24gPSBmdW5jdGlvbihpbnB1dHMpIHtcblx0dmFyIHZhbGlkID0gXy5pbmNsdWRlcyhpbnB1dHMsIGZhbHNlKTtcblx0Ly9jb25zb2xlLmxvZygnYnV0dG9uJywgaW5wdXRzLCB2YWxpZCk7XG5cdHJldHVybiB2YWxpZDtcbn1cblxubW9kdWxlLmV4cG9ydHMuc2V0Rm9ybVN0YXRlID0gZnVuY3Rpb24oaW5wdXRzLCB2YWxpZCkge1xuXHR2YXIgcmV0ID0ge307XG5cdHJldC52YWxpZCA9IF8uaXNPYmplY3QodmFsaWQpID8gdmFsaWQgOiB7fTtcblx0cmV0LmZvcm0gPSB7fTtcblx0Xy5lYWNoKGlucHV0cywgZnVuY3Rpb24odikge1xuXHRcdGlmKHYudHlwZSAhPT0gJ2hlYWRlcicpIHJldC5mb3JtW3YuZmllbGRdID0gdi5fbmFtZTtcblx0XHRpZih2LnJlcXVpcmVkICYmICFyZXQudmFsaWRbdi5maWVsZF0pIHtcblx0XHRcdHJldC52YWxpZFt2LmZpZWxkXSA9IGZhbHNlO1xuXHRcdH1cblx0XHRpZih2LmF0dGFjaCkge1xuXHRcdFx0cmV0LmZvcm1bdi5hdHRhY2guZmllbGRdID0gdi5fbmFtZSArICdfYXR0YWNoJztcblx0XHRcdGlmKHYucmVxdWlyZWQgJiYgIXJldC52YWxpZFt2LmF0dGFjaC5maWVsZF0pIHtcblx0XHRcdFx0cmV0LnZhbGlkW3YuYXR0YWNoLmZpZWxkXSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiByZXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzLkZvcm0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblx0XHR2YXIgZm9ybSA9IFtdO1xuXHRcdC8vIHNvcnQgb3V0IG9iamVjdCBvZiBmb3JtIGVsZW1lbnRzIGFuZCBhZGQgdGhlbSB0byBhbiBhcnJheVxuXHRcdC8vY29uc29sZS5sb2codGhpcy5wcm9wcy5pbnB1dHMpO1xuXHRcdHZhciBzb3J0ZWRfbGlzdCA9IF8odGhpcy5wcm9wcy5pbnB1dHMpLmtleXMoKS5zb3J0KCkubWFwKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHZhciB2YWx1ZSA9IF90aGlzLnByb3BzLmlucHV0c1trZXldO1xuXHRcdFx0Zm9ybS5wdXNoKGNvbnRhaW5lcihrZXksIHZhbHVlLCBfdGhpcy5wcm9wcy5pbnB1dHMsIF90aGlzLnByb3BzLmNvbnRleHQpKTtcblx0XHR9KS52YWx1ZSgpO1xuXHRcdFxuXHRcdHJldHVybiBmb3JtLmxlbmd0aCA9PT0gMCA/ICg8c3BhbiAvPikgOiAoPGRpdj57Zm9ybX08L2Rpdj4pO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMuRm9ybUlucHV0T25DaGFuZ2UgPSBmdW5jdGlvbihldmVudCwgZm9ybSkge1xuICAgIC8vIGdldCB0aGUgY3VycmVudCB2YWx1ZVxuICAgIHZhciBjaGFuZ2UgPSB7XG5cdFx0dmFsaWQ6IF8uY2xvbmUodGhpcy5zdGF0ZS52YWxpZCksXG5cdH07XG5cdFxuXHR2YXIgdmFsaWQgPSBmYWxzZTtcblx0dmFyIHBhcmVudCA9IGZhbHNlO1xuXHRcblx0Ly8gaXMgdGhpcyBhdHRhY2hlZFxuXHRpZihldmVudC50YXJnZXQuZGF0YXNldC5kZXBlbmRzb24gIT09ICdmYWxzZScpIHtcblx0XHRwYXJlbnQgPSAgZm9ybVtldmVudC50YXJnZXQuZGF0YXNldC5kZXBlbmRzb25dO1xuXHRcdHZhciBpbnB1dCA9IGZvcm1bZXZlbnQudGFyZ2V0LmlkXTtcblx0XHRwYXJlbnQuRE9NID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFyZW50Ll9uYW1lKTtcblx0XHQvL2NvbnNvbGUubG9nKGV2ZW50LnRhcmdldC5kYXRhc2V0LmRlcGVuZHNvbik7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGlucHV0ID0gZm9ybVtldmVudC50YXJnZXQuaWRdO1xuXHR9XG5cdFxuXHRpZihpbnB1dC5yZXF1aXJlZCkge1x0XG5cdFx0aWYoXy5pc0FycmF5KGlucHV0LnJlZ2V4KSkge1xuXHRcdFx0dmFyIHJ4ID0gbmV3IFJlZ0V4cChpbnB1dC5yZWdleFswXSxpbnB1dC5yZWdleFsxXSk7XG5cdFx0XHR2YWxpZCA9IHJ4LnRlc3QoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFsaWQgPSBldmVudC50YXJnZXQudmFsdWUgIT09ICcnO1xuXHRcdH1cblx0XHRpZih2YWxpZCAmJiBwYXJlbnQgJiYgcGFyZW50LnR5cGUgPT09ICdwYXNzd29yZCcpIHtcblx0XHRcdGlmKGV2ZW50LnRhcmdldC52YWx1ZSAhPT0gJycgJiYgZXZlbnQudGFyZ2V0LnZhbHVlID09PSBwYXJlbnQuRE9NLnZhbHVlKSB7XG5cdFx0XHRcdHZhbGlkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYodmFsaWQgJiYgcGFyZW50ICYmIHBhcmVudC50eXBlID09PSAnc2VsZWN0Jykge1xuXHRcdFx0aWYoZXZlbnQudGFyZ2V0LnZhbHVlICE9PSAnJyAmJiBwYXJlbnQuRE9NLnZhbHVlICE9PSAnJykge1xuXHRcdFx0XHR2YWxpZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdGNoYW5nZS52YWxpZFtpbnB1dC5maWVsZF0gPSB2YWxpZDtcblx0XHRcblx0fVxuXHRcblx0Ly9jb25zb2xlLmxvZygnY2hhbmdlJywgdmFsaWQsIGNoYW5nZSk7XG4gICAgdGhpcy5zZXRTdGF0ZShjaGFuZ2UpO1xufVxuXG5cbmZ1bmN0aW9uIHZhbGlkYXRlX2NsYXNzKGlucHV0LCBjb250ZXh0KSB7XG5cdHZhciB2YWxpZCA9IGNvbnRleHQuc3RhdGUudmFsaWQ7XG5cdGlmKCFpbnB1dC5yZXF1aXJlZCkge1xuXHRcdHJldHVybiAnaW5wdXQtZ3JvdXAnO1xuXHR9IGVsc2Uge1xuXHRcdGlmKHZhbGlkW2lucHV0LmZpZWxkXSkge1xuXHRcdFx0cmV0dXJuICdpbnB1dC1ncm91cCc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAnaW5wdXQtZ3JvdXAgaGFzLWVycm9yJztcblx0XHR9XG5cdH1cbn1cblxuXG5mdW5jdGlvbiBpbnB1dChuYW1lLCBvcHRpb25zLCBjb250ZXh0KSB7XG5cdFxuXHRpZighXy5pc09iamVjdChvcHRpb25zKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRcblx0dmFyIHR5cGUgPSBvcHRpb25zLnR5cGU7XG5cdHZhciBkZXBlbmRzT24gPSBvcHRpb25zLmRlcGVuZHNPbiA/IG9wdGlvbnMuZGVwZW5kc09uIDogZmFsc2U7XG5cdFxuXHRpZih0eXBlID09PSAndGV4dCcpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGlucHV0IHR5cGU9XCJ0ZXh0XCIgaWQ9e29wdGlvbnMuX25hbWV9ICByZWZzPXtvcHRpb25zLl9uYW1lfSBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWRlcGVuZHNvbj17ZGVwZW5kc09ufSAgb25DaGFuZ2U9e2NvbnRleHQub25DaGFuZ2V9ICAgLz5cblx0XHQpO1xuXHRcdFxuXHR9IGVsc2UgaWYodHlwZSA9PT0gJ3Bhc3N3b3JkJykge1xuXHRcdC8vIGFkZCBwYXNzd29yZCBmaWVsZFxuXHRcdHZhciBkZXBlbmRzT24gPSBvcHRpb25zLmRlcGVuZHNPbiA/IG9wdGlvbnMuZGVwZW5kc09uIDogZmFsc2U7XG5cdFx0cmV0dXJuICggXG5cdFx0XHQ8aW5wdXQgdHlwZT1cInBhc3N3b3JkXCIgaWQ9e29wdGlvbnMuX25hbWV9IGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIGRhdGEtZGVwZW5kc29uPXtkZXBlbmRzT259ICBvbkNoYW5nZT17Y29udGV4dC5vbkNoYW5nZX0gIC8+XG5cdFx0KTtcblx0XHRcblx0fSBlbHNlIGlmKHR5cGUgPT09ICdzZWxlY3QnKSB7XG5cdFx0XG5cdFx0dmFyIG90aGVyLCBvcHRzO1xuXHRcdC8vIGJ1aWxkIHRoZSBvcHRpb25zIGxpc3Rcblx0XHRpZihfLmlzQXJyYXkob3B0aW9ucy5vcHRpb25zKSkge1xuXHRcdFx0b3B0cyA9IG9wdGlvbnMub3B0aW9ucy5tYXAoZnVuY3Rpb24ob3ApIHtcblx0XHRcdFx0aWYoXy5pc1N0cmluZyhvcCkpIHtcblx0XHRcdFx0XHRvcCA9IHtcblx0XHRcdFx0XHRcdGxhYmVsOm9wLFxuXHRcdFx0XHRcdFx0dmFsdWU6b3Bcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuICggXG5cdFx0XHRcdFx0PG9wdGlvbiBrZXk9e29wLmxhYmVsfSB2YWx1ZT17b3AudmFsdWUgfHwgb3AubGFiZWx9PntvcC5sYWJlbH08L29wdGlvbj5cblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR2YXIgZGVwZW5kc09uID0gb3B0aW9ucy5kZXBlbmRzT24gPyBvcHRpb25zLmRlcGVuZHNPbiA6IGZhbHNlO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8c2VsZWN0IGlkPXtvcHRpb25zLl9uYW1lfSBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBkYXRhLWRlcGVuZHNvbj17ZGVwZW5kc09ufSAgb25DaGFuZ2U9e2NvbnRleHQub25DaGFuZ2V9ICA+XG5cdFx0XHRcdHtvcHRzfVxuXHRcdFx0PC9zZWxlY3Q+XG5cdFx0KTtcblx0XHRcblx0fSBcblx0XG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5lcihuYW1lLCBvcHRpb25zLCBpbnB1dHMsIGNvbnRleHQpIHtcblx0XG5cdGlmKCFfLmlzT2JqZWN0KG9wdGlvbnMpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGlmKG9wdGlvbnMuYXR0YWNoZWQpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0XG5cdHZhciB0eXBlID0gb3B0aW9ucy50eXBlO1xuXHRcblx0aWYodHlwZSA9PT0gJ2hlYWRlcicpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBrZXk9e25hbWV9PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC1zbS0xMlwiPlxuXHRcdFx0XHRcdFx0PHAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sLXN0YXRpY1wiIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiBvcHRpb25zLmxhYmVsIHx8ICcnfX0gLz5cblx0XHRcdFx0XHQ8L2Rpdj5cblx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1x0XG5cdFx0XG5cdH0gZWxzZSB7XG5cdFx0dmFyIHRoZWlucHV0ID0gaW5wdXQobmFtZSwgb3B0aW9ucywgY29udGV4dCk7XG5cdFx0dmFyIGF0dGFjaGVkID0gZmFsc2U7XG5cdFx0aWYoaW5wdXRzW25hbWUgKyAnX2F0dGFjaCddKSB7XG5cdFx0XHRhdHRhY2hlZCA9IGlucHV0KG5hbWUgKyAnX2F0dGFjaCcsIGlucHV0c1tuYW1lICsgJ19hdHRhY2gnXSwgY29udGV4dCk7XG5cdFx0fVxuXHRcdFxuXHRcdHZhciBjbGFzID0gdmFsaWRhdGVfY2xhc3Mob3B0aW9ucywgY29udGV4dCk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PGRpdiBrZXk9e25hbWV9PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9e2NsYXN9Plx0XHRcblx0XHRcdFx0PHNwYW4gY2xhc3NOYW1lPVwiaW5wdXQtZ3JvdXAtYWRkb25cIiAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IG9wdGlvbnMubGFiZWwgfHwgJyd9fSAvPiBcblx0XHRcdFx0e3RoZWlucHV0fVxuXHRcdFx0XHR7YXR0YWNoZWR9XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIEFwcCA9IHJlcXVpcmUoJy4vZ3JlZXRlci5qcycpO1xudmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcblxuJChmdW5jdGlvbigpIHtcblx0Ly9jb25zb2xlLmxvZygncmVhY3QnLFJlYWN0KTtcblx0Lyogc3RhcnQgb3VyIGFwcCBhZnRlciB0aGUgcGFnZSBpcyByZWFkeSAqLyBcdFxuXHRSZWFjdC5yZW5kZXIoPEFwcCAgLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbm93cGknKSk7XG5cbn0pO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIEdJbnRlcnZhbCA9IHJlcXVpcmUoJy4vY29tbW9uLmpzJykuR0ludGVydmFsO1xuLyogY3JlYXRlIGZsYXNoIG1lc3NhZ2UgXG4gKiAqL1xudmFyIEZsYXNoID0gUmVhY3RCb290c3RyYXAuQWxlcnQ7XG5cbnZhciBHRmxhc2ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlzVmlzaWJsZTogdHJ1ZVxuXHRcdH07XG5cdH0sXG5cdGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICh7c2hvd2NsYXNzOidpbmZvJ30pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdGlmKCF0aGlzLnN0YXRlLmlzVmlzaWJsZSlcblx0XHQgICAgcmV0dXJuIG51bGw7XG5cblx0XHR2YXIgbWVzc2FnZSA9IHRoaXMucHJvcHMuY2hpbGRyZW47XG5cdFx0cmV0dXJuIChcblx0XHQgICAgPEZsYXNoIGJzU3R5bGU9e3RoaXMucHJvcHMuc2hvd2NsYXNzfSBvbkRpc21pc3M9e3RoaXMuZGlzbWlzc0ZsYXNofT5cblx0XHRcdDxwPnttZXNzYWdlfTwvcD5cblx0XHQgICAgPC9GbGFzaD5cblx0XHQpO1xuXHR9LFxuXHQvKiBtYWtlIHN1cmUgdGhlIHVzZXIgY2FuIGNhbmNlbCBhbnkgcmVkaXJlY3RzIGJ5IGNsZWFyaW5nIHRoZSBmbGFzaCBtZXNzYWdlXG5cdCAqICovXG5cdGRpc21pc3NGbGFzaDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7aXNWaXNpYmxlOiBmYWxzZX0pO1xuXHRcdGlmKHRoaXMucHJvcHMuY2xlYXJpbnRlcnZhbHMgaW5zdGFuY2VvZiBBcnJheSl0aGlzLnByb3BzLmNsZWFyaW50ZXJ2YWxzLm1hcChHSW50ZXJ2YWwuY2xlYXJJbnRlcnZhbHMpO1xuXHRcdGlmKHRoaXMucHJvcHMuY2xlYXJ0aW1lb3V0cyBpbnN0YW5jZW9mIEFycmF5KXRoaXMucHJvcHMuY2xlYXJ0aW1lb3V0cy5tYXAoY2xlYXJUaW1lb3V0KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR0ZsYXNoO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbi8vdmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uLmpzJyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBCb290c3RyYXBCdXR0b24gPSBSZWFjdEJvb3RzdHJhcC5CdXR0b247XG52YXIgeWVzID0gJ3llcycsIG5vID0gJ25vJztcbi8vdmFyIHllcyA9IHRydWUsIG5vID0gZmFsc2U7XG5cbnZhciBSZXNldFBhc3N3b3JkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5yZXNldGNvZGUsIHZhbGlkKTtcblx0XHRyZXQubmFtZSA9ICdyZXNldCc7XG5cdFx0cmV0LnJlc2V0Y29kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdHX19yZXNldGNvZGVfX0cnKS52YWx1ZTtcblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0aWYodGhpcy5zdGF0ZS52YWxpZCkge1xuXHRcdFx0dGhpcy5yZXNldGVtYWlsKCk7XG5cdFx0fVxuXHR9LFxuXHRvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuXHRcdENvbW1vbi5Gb3JtSW5wdXRPbkNoYW5nZS5jYWxsKHRoaXMsIGUsIFRleHQucmVzZXRjb2RlKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAoPGZvcm0gIHJlZj0ncmVzZXRjb2RlJyAgY2xhc3NOYW1lPVwiY29kZS1mb3JtXCIgIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0gPlxuXHRcdFx0XHQ8aDI+e1RleHQuaG9tZS5yZXNldGNvZGV9IDxDb21tb24uR01hbiAvPjwvaDI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmZsYXNofVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQucmVzZXRjb2RlfSBjb250ZXh0PXt0aGlzfSAvPlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiAgPjxCb290c3RyYXBCdXR0b24gcm9sZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucmVzZXRlbWFpbH0gcmVmPVwicmVzZXRidXR0b25cIiBic1N0eWxlPSdpbmZvJyBkaXNhYmxlZD17Q29tbW9uLnNob3dCdXR0b24odGhpcy5zdGF0ZS52YWxpZCl9ICBkYXRhLWxvYWRpbmctdGV4dD1cIkNoZWNraW5nLi4uXCIgPiAge1RleHQuYnRucy5yZXNldGNvZGV9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLmNoYW5nZVJlc2V0fSAgYnNTdHlsZT0nZGVmYXVsdCc+ICB7VGV4dC5idG5zLmxvZ2luY3VycmVudH0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PC9kaXY+XG5cdFx0XHQ8L2Zvcm0+KTtcblx0XHRcdFxuXHR9LFxuXHRyZXNldGVtYWlsOiBmdW5jdGlvbigpIHtcblx0XHQvKiB2YWxpZGF0aW9uIG9jY3VycyBhcyBpbnB1dCBpcyByZWNlaXZlZCBcblx0XHQgKiB0aGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBhdmlhbGFibGUgaWZcblx0XHQgKiBhbGwgdmFsaWRhdGlvbiBpcyBhbHJlYWR5IG1ldCBzbyBqdXN0IHJ1blxuXHRcdCAqICovXG5cdFx0dmFyIG15ZGF0YSA9IHtjb2RlOid5ZXMnfTtcblx0XHRfLmVhY2godGhpcy5zdGF0ZS5mb3JtLCBmdW5jdGlvbih2LGspIHtcblx0XHRcdGlmKHYudHlwZSAhPT0gJ2hlYWRlcicpIHtcblx0XHRcdFx0dmFyIGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodik7XG5cdFx0XHRcdG15ZGF0YVtrXSA9IGVsLnZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0aWYodi5hdHRhY2gpIHtcblx0XHRcdFx0dmFyIGVsQSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHYgKyAnX2F0dGFjaCcpO1xuXHRcdFx0XHRteWRhdGFbdi5hdHRhY2guZmllbGRdID0gZWxBLnZhbHVlO1x0XG5cdFx0XHR9XG5cdFx0fSx0aGlzKTtcblx0XHRteWRhdGFbaXNLZXldID0gaXNNZTtcblx0XHR2YXIgYnRuID0gJCh0aGlzLnJlZnMucmVzZXRidXR0b24uZ2V0RE9NTm9kZSgpKVxuXHRcdGJ0bi5idXR0b24oJ2xvYWRpbmcnKVxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IFRleHQucmVzZXRlbWFpbCxcblx0XHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0XHRtZXRob2Q6ICdwb3N0Jyxcblx0XHRcdGRhdGE6IG15ZGF0YSxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcdFxuXHRcdFx0XHRmdW5jdGlvbiBtZXNzYWdlKCkge1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSA9ICdTdWNjZXNzJztcblx0XHRcdFx0fVxuXHRcdFx0XHQvKiBmbGFzaCBtZXNzYWdlcyBhcmUgc2hvd24gd2l0aCByZXNwb25zZSA6IHllc1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLGRhdGE6ZGF0YSxyZXNldGNvZGU6bm99KTtcblx0XHRcdFx0XG5cdFx0XHR9LmJpbmQodGhpcyksXG5cdFx0XHRcblx0XHRcdGVycm9yOiBmdW5jdGlvbih4aHIsIHN0YXR1cywgZXJyKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHRoaXMucHJvcHMudXJsLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMscmVzZXRmb3JtOnllcyxyZXNldGNvZGU6bm8sZGF0YToge3N0YXR1czpzdGF0dXMsZXJyOmVyci50b1N0cmluZygpfSB9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdFxuXHRcdC8qIGFsd2F5cyByZXNldCBvdXIgYnV0dG9uc1xuXHRcdCogKi9cdFxuXHRcdH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRidG4uYnV0dG9uKCdyZXNldCcpO1xuXHRcdH0pO1xuXHRcdFxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXNldFBhc3N3b3JkO1xuIiwidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbi8vdmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG52YXIgQ29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uLmpzJyk7XG52YXIgR0ludGVydmFsID0gQ29tbW9uLkdJbnRlcnZhbDtcbnZhciBHRmxhc2ggPSByZXF1aXJlKCcuLi9mbGFzaCcpO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIEJvb3RzdHJhcEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkJ1dHRvbjtcbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuXG52YXIgTG9naW4gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdG1peGluczogW1JlYWN0LmFkZG9ucy5MaW5rZWRTdGF0ZU1peGluXSxcblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5zZXRGb3JtU3RhdGUoKTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLnNldEZvcm1TdGF0ZSh0aGlzLnN0YXRlLnZhbGlkKSk7XG5cdH0sXG5cdHNldEZvcm1TdGF0ZTogZnVuY3Rpb24odmFsaWQpIHtcblx0XHR2YXIgcmV0ID0gQ29tbW9uLnNldEZvcm1TdGF0ZShUZXh0LmxvZ2luLCB2YWxpZCk7XG5cdFx0cmV0Lm5hbWUgPSAnbG9naW4nO1xuXHRcdHJldC53b3JraW5nID0gIGZhbHNlO1xuXHRcdHJldHVybiByZXQ7IFxuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0aWYoQ29tbW9uLnNob3dCdXR0b24odGhpcy5zdGF0ZS52YWxpZCkgPT09IGZhbHNlKSB7XG5cdFx0XHR0aGlzLmxvZ2luKCk7XG5cdFx0fVxuXHR9LFxuXHRvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuXHRcdENvbW1vbi5Gb3JtSW5wdXRPbkNoYW5nZS5jYWxsKHRoaXMsIGUsIFRleHQubG9naW4pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkgeyBcblx0XHRcblx0XHR2YXIgaGFzZXJyb3IgPSAnJztcblx0XHQvKiBpZiByZXNwb25zZSBzdGF0ZSBpcyB5ZXMgd2UgaGF2ZSBhIGZsYXNoIG1lc3NhZ2UgdG8gc2hvd1xuXHRcdCAqIHRoZSBtZXNzYWdlIGlzIGluIGRhdGFcblx0XHQgKiAqL1xuXHRcdGlmKHRoaXMuc3RhdGUucmVzcG9uc2UgPT09IHllcykge1xuXHRcdFx0XG5cdFx0XHR2YXIgcGlja2NsYXNzID0gKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSB5ZXMgKSA/ICdzdWNjZXNzJyA6ICd3YXJuaW5nJzsgXG5cdFx0XHRcblx0XHRcdHNob3dmbGFzaG1lc3NhZ2UgPSA8R0ZsYXNoIHNob3djbGFzcz17cGlja2NsYXNzfSBjbGVhcnRpbWVvdXRzPXtbR0ludGVydmFsLnRpbWVvdXRdfSBjbGVhcmludGVydmFscz17W0dJbnRlcnZhbC5yZWRpcmVjdF19PjxkaXYgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tfX2h0bWw6IHRoaXMuc3RhdGUuZGF0YS5tZXNzYWdlIHx8ICcnfX0gLz48L0dGbGFzaCA+O1xuXHRcdFx0XG5cdFx0XHQvKiBpZiB3ZSBoYXZlIGFuIGVycm9yIHNoYWtlIHRoZSBmb3JtLiAgdGhpcyBpcyBkb25lIHdpdGggdGhlXG5cdFx0XHQgKiBoYXMtZXJyb3JzIGNsYXNzIFxuXHRcdFx0ICogKi9cblx0XHRcdCBcblx0XHRcdGlmKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSBubykgaGFzZXJyb3IgPSAnIGhhcy1lcnJvcnMnO1xuXHRcdFx0XG5cdFx0fVx0XHRcdFxuXHRcdFx0cmV0dXJuICg8Zm9ybSAgcmVmPSdzaWduaW4nICBjbGFzc05hbWU9e1wic2lnbmluLWZvcm0gXCIgKyBoYXNlcnJvcn0gIG9uU3VibWl0PXt0aGlzLmhhbmRsZVN1Ym1pdH0gPlxuXHRcdFx0XHQ8aDI+e1RleHQuaG9tZS5sb2dpbn0gPC9oMj5cblx0XHRcdFx0e3RoaXMucHJvcHMuZmxhc2h9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQubG9naW59IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0XHRcdFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjxiciAvPjwvZGl2PlxuXHRcdFx0XHRcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiBzdHlsZT17e3Bvc2l0aW9uOiAncmVsYXRpdmUnfX0gPlxuXHRcdFx0XHRcdDxDb21tb24uV29ya2luZyBlbmFibGVkPXshQ29tbW9uLnNob3dCdXR0b24odGhpcy5zdGF0ZS52YWxpZCl9IC8+XG5cdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJzdWJtaXRcIiBvbkNsaWNrPXt0aGlzLmxvZ2lufSB2YWx1ZT17VGV4dC5idG5zLmxvZ2lufSBjbGFzc05hbWU9J2J0biBidG4taW5mbycgZGlzYWJsZWQ9e0NvbW1vbi5zaG93QnV0dG9uKHRoaXMuc3RhdGUudmFsaWQpfSAvPlxuXHRcdFx0XHQ8L2Rpdj4gXG5cdFx0XHRcdFxuXHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCd9fSA+PEJvb3RzdHJhcEJ1dHRvbiBvbkNsaWNrPXt0aGlzLnByb3BzLnNob3dyZWdpc3Rlcn0gIGJzU3R5bGU9J3dhcm5pbmcnPiAge1RleHQuYnRucy5yZWdpc3Rlcn0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLW9mZnNldC02IGNvbC14cy02IFwiIHN0eWxlPXt7dGV4dEFsaWduOidyaWdodCcsIHBhZGRpbmdUb3A6MTAsIGRpc3BsYXk6ICdub25lJ319ID48Qm9vdHN0cmFwQnV0dG9uIHJvbGU9XCJidXR0b25cIiBvbkNsaWNrPXt0aGlzLnByb3BzLmNoYW5nZVJlc2V0fSAgYnNTdHlsZT0nZGVmYXVsdCcgPiAge1RleHQuYnRucy5yZXNldH0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+IFxuXHRcdFx0XHRcblx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48L2Rpdj5cblx0XHRcdFx0XG5cdFx0XHQ8L2Zvcm0+KTtcblx0XHRcdFxuXHR9LFxuXHRsb2dpbjogZnVuY3Rpb24oKSB7XG5cdFxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0IHdvcmtpbmc6IHRydWVcblx0XHR9KTtcblx0XHR2YXIgbXlkYXRhID0ge2xvZ2luOid5ZXMnfTtcblx0XHQvL2NvbnNvbGUubG9nKCdmb3JtJywgdGhpcy5zdGF0ZS5mb3JtLCBUZXh0LmxvZ2luICk7XG5cdFx0Xy5lYWNoKHRoaXMuc3RhdGUuZm9ybSwgZnVuY3Rpb24odixrKSB7XG5cdFx0XHRpZih2LnR5cGUgIT09ICdoZWFkZXInKSB7XG5cdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHYpO1xuXHRcdFx0XHRteWRhdGFba10gPSBlbC52YWx1ZTtcblx0XHRcdH1cblx0XHR9LHRoaXMpOyBcblx0XHRteWRhdGFbaXNLZXldID0gaXNNZTtcblx0XHQvL2NvbnNvbGUubG9nKCdteWRhdGEnLCBteWRhdGEsICdUZXh0JywgVGV4dC5sb2dpbiApO1xuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IFRleHQucmVsYXksXG5cdFx0XHRkYXRhVHlwZTogJ2pzb24nLFxuXHRcdFx0bWV0aG9kOiAncG9zdCcsXG5cdFx0XHRkYXRhOiBteWRhdGEsXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdGZ1bmN0aW9uIG1lc3NhZ2UoKSB7XG5cdFx0XHRcdFx0dmFyIHNlY3MgPSAoZGF0YS5yZWRpcmVjdC53aGVuIC0gcnJyKSAvIDEwMDA7XG5cdFx0XHRcdFx0cnJyKz0xMDAwO1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSA9IGRhdGEucmVwZWF0ZXIgKyAnPGJyIC8+WW91IHdpbGwgYmUgcmVkaXJlY3RlZCB0byA8YSBocmVmPVwiJyArIGRhdGEucmVkaXJlY3QucGF0aCArICdcIj4nICsgZGF0YS5yZWRpcmVjdC5wYXRoLnN1YnN0cigxKSArICc8L2E+ICAnO1xuXHRcdFx0XHRcdGRhdGEubWVzc2FnZSArPSBzZWNzID09PSAwID8gJyBub3cnOicgaW4gJyArIHNlY3MgKyAnIHNlY29uZHMuJztcblx0XHRcdFx0fVxuXHRcdFx0XHRpZih0eXBlb2YgZGF0YS5yZWRpcmVjdCA9PT0gJ29iamVjdCcgJiYgZGF0YS5yZWRpcmVjdC53aGVuID4gMTAwMCkge1xuXHRcdFx0XHRcdGRhdGEucmVwZWF0ZXIgPSBkYXRhLm1lc3NhZ2U7XG5cdFx0XHRcdFx0dmFyIHJyciA9IDEwMDBcblx0XHRcdFx0XHRcdF9zZWxmID0gdGhpcy5wcm9wcy5jb250ZXh0O1xuXHRcdFx0XHRcdEdJbnRlcnZhbC5yZWRpcmVjdCA9IEdJbnRlcnZhbC5zZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdG1lc3NhZ2UoKTtcblx0XHRcdFx0XHRcdF9zZWxmLnNldFN0YXRlKHsgcmVzcG9uc2U6eWVzLCBkYXRhOmRhdGEgfSk7XG5cdFx0XHRcdFx0fSwxMDAwKTtcblx0XHRcdFx0XHRHSW50ZXJ2YWwudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdEdJbnRlcnZhbC5jbGVhckludGVydmFscyhHSW50ZXJ2YWwucmVkaXJlY3QpO1xuXHRcdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdFx0fSxkYXRhLnJlZGlyZWN0LndoZW4pO1xuXHRcdFx0XHRcdG1lc3NhZ2UoKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYodHlwZW9mIGRhdGEucmVkaXJlY3QgPT09ICdvYmplY3QnICYmIGRhdGEucmVkaXJlY3QucGF0aCl7XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0cmVzcG9uc2U6IHllcyxcblx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdH0pO1xuXHRcdFx0fS5iaW5kKHRoaXMpLFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtcblx0XHRcdFx0XHRyZXNwb25zZTp5ZXMsXG5cdFx0XHRcdFx0ZGF0YToge1xuXHRcdFx0XHRcdFx0c3RhdHVzOnN0YXR1cyxcblx0XHRcdFx0XHRcdGVycjplcnIudG9TdHJpbmcoKVxuXHRcdFx0XHRcdH0gXG5cdFx0XHRcdH0pO1xuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0fSk7XHRcdFxuXHR9XG59KTsgXG5cbm1vZHVsZS5leHBvcnRzID0gTG9naW47XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuLy92YXIgVGV4dCA9IEpTT04ucGFyc2UocmVxdWlyZSgndGV4dCcpKTtcbnZhciBDb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24uanMnKTtcbnZhciBHSW50ZXJ2YWwgPSBDb21tb24uR0ludGVydmFsO1xudmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcbnZhciBSZWFjdEJvb3RzdHJhcCA9IHJlcXVpcmUoJ3JlYWN0LWJvb3RzdHJhcCcpO1xudmFyIEJvb3RzdHJhcEJ1dHRvbiA9IFJlYWN0Qm9vdHN0cmFwLkJ1dHRvbjtcbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxudmFyIFJSID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2V0Rm9ybVN0YXRlKCk7XG5cdH0sXG5cdGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUodGhpcy5zZXRGb3JtU3RhdGUodGhpcy5zdGF0ZS52YWxpZCkpO1xuXHR9LFxuXHRzZXRGb3JtU3RhdGU6IGZ1bmN0aW9uKHZhbGlkKSB7XG5cdFx0dmFyIHJldCA9IENvbW1vbi5zZXRGb3JtU3RhdGUoVGV4dC5yZWdpc3RlciwgdmFsaWQpO1xuXHRcdHJldC5uYW1lID0gJ3JlZ2lzdGVyJztcblx0XHRyZXQud29ya2luZyA9ICBmYWxzZTtcblx0XHRyZXR1cm4gcmV0O1xuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0aWYoQ29tbW9uLnNob3dCdXR0b24odGhpcy5zdGF0ZS52YWxpZCkgPT09IGZhbHNlKSB7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyKCk7XG5cdFx0fVxuXHR9LFxuXHRvbkNoYW5nZTogZnVuY3Rpb24oZSkge1xuXHRcdENvbW1vbi5Gb3JtSW5wdXRPbkNoYW5nZS5jYWxsKHRoaXMsIGUsIFRleHQucmVnaXN0ZXIpO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICg8Zm9ybSAgcmVmPSdzaWduaW4nICBjbGFzc05hbWU9XCJzaWduaW4tZm9ybVwiICAgb25TdWJtaXQ9e3RoaXMuaGFuZGxlU3VibWl0fT5cblx0XHRcdFx0PGgyPntUZXh0LmhvbWUucmVnaXN0ZXJ9IDxDb21tb24uR01hbiAvPjwvaDI+XG5cdFx0XHRcdHt0aGlzLnByb3BzLmZsYXNofVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxDb21tb24uRm9ybSBpbnB1dHM9e1RleHQucmVnaXN0ZXJ9IGNvbnRleHQ9e3RoaXN9IC8+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48YnIgLz48L2Rpdj5cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy02IFwiIHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSA+XG5cdFx0XHRcdFx0PENvbW1vbi5Xb3JraW5nIGVuYWJsZWQ9eyFDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0gLz5cblx0XHRcdFx0XHQ8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIG9uQ2xpY2s9e3RoaXMucmVnaXN0ZXJ9IHJlZj1cInJlZ2lzdGVyYnV0dG9uXCIgdmFsdWU9e1RleHQuYnRucy5yZWdpc3Rlcn0gY2xhc3NOYW1lPSdidG4gYnRuLXdhcm5pbmcnIGRpc2FibGVkPXtDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKX0gLz5cblx0XHRcdFx0PC9kaXY+IFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTYgXCIgICBzdHlsZT17e3RleHRBbGlnbjoncmlnaHQnfX0gPjxCb290c3RyYXBCdXR0b24gcm9sZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucHJvcHMuc2hvd3JlZ2lzdGVyfSAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1kZWZhdWx0XCI+ICB7VGV4dC5idG5zLmxvZ2luY3VycmVudH0gPC9Cb290c3RyYXBCdXR0b24+PC9kaXY+XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjbGVhcmZpeFwiID48L2Rpdj5cblx0XHRcdDwvZm9ybT4pO1xuXHR9LFxuXHRyZWdpc3RlcjogZnVuY3Rpb24oKSB7XG5cdFx0LyogdmFsaWRhdGlvbiBvY2N1cnMgYXMgaW5wdXQgaXMgcmVjZWl2ZWQgXG5cdFx0ICogdGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgYXZpYWxhYmxlIGlmXG5cdFx0ICogYWxsIHZhbGlkYXRpb24gaXMgYWxyZWFkeSBtZXQgc28ganVzdCBydW5cblx0XHQgKiAqL1xuXHRcdFxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0IHdvcmtpbmc6IHRydWVcblx0XHR9KTtcblx0XHRcblx0XHQvL2NvbnNvbGUubG9nKCdmb3JtJywgdGhpcy5zdGF0ZS5mb3JtLCAnVGV4dCcsIFRleHQucmVnaXN0ZXIgKTsgXG5cdFx0dmFyIG15ZGF0YSA9IHsgcmVnaXN0ZXI6ICd5ZXMnIH07XG5cdFx0Xy5lYWNoKHRoaXMuc3RhdGUuZm9ybSwgZnVuY3Rpb24odixrKSB7XG5cdFx0XHRpZih2LnR5cGUgIT09ICdoZWFkZXInKSB7XG5cdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHYpO1xuXHRcdFx0XHRteWRhdGFba10gPSBlbC52YWx1ZTtcblx0XHRcdH1cblx0XHR9LHRoaXMpOyBcblx0XHRteWRhdGFbaXNLZXldID0gaXNNZTtcblx0XHRjb25zb2xlLmxvZygnbXlkYXRhJywgbXlkYXRhLCAnVGV4dCcsIFRleHQucmVnaXN0ZXIgKTtcblx0XHQvL3ZhciBidG4gPSAkKHRoaXMucmVmcy5yZWdpc3RlcmJ1dHRvbi5nZXRET01Ob2RlKCkpXG5cdFx0Ly9idG4uYnV0dG9uKCdsb2FkaW5nJylcblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBUZXh0LnJlbGF5LFxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0ZGF0YTogbXlkYXRhLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0ZnVuY3Rpb24gbWVzc2FnZSgpIHtcblx0XHRcdFx0XHR2YXIgc2VjcyA9IChkYXRhLnJlZGlyZWN0LndoZW4gLSBycnIpIC8gMTAwMDtcblx0XHRcdFx0XHRycnIrPTEwMDA7XG5cdFx0XHRcdFx0ZGF0YS5tZXNzYWdlID0gZGF0YS5yZXBlYXRlciArICc8YnIgLz5Zb3Ugd2lsbCBiZSByZWRpcmVjdGVkIHRvIDxhIGhyZWY9XCInICsgZGF0YS5yZWRpcmVjdC5wYXRoICsgJ1wiPicgKyBkYXRhLnJlZGlyZWN0LnBhdGguc3Vic3RyKDEpICsgJzwvYT4gICc7XG5cdFx0XHRcdFx0ZGF0YS5tZXNzYWdlKz0gc2VjcyA9PT0gMCA/ICcgbm93JzonIGluICcgKyBzZWNzICsgJyBzZWNvbmRzLic7XG5cdFx0XHRcdH1cblx0XHRcdFx0LyogaWYgd2UgZ2V0IGEgcmVkaXJlY3QgY2hlY2sgdGhlIHRpbWUgYW5kIHJ1biBhbiBpbnRlcnZhbFxuXHRcdFx0XHQgKiB0aGlzIGlzIHJlYWxseSBqdXN0IHRvIHNob3cgUmVhY3Qgd29ya1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdGlmKHR5cGVvZiBkYXRhLnJlZGlyZWN0ID09PSAnb2JqZWN0JyAmJiBkYXRhLnJlZGlyZWN0LndoZW4+MTAwMCkge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGRhdGEucmVwZWF0ZXIgPSBkYXRhLm1lc3NhZ2U7IC8va2VlcCBvdXIgb3JpZ2luYWwgbWVzc2FnZSBmb3IgdGhlIHJlcGVhdGVyXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0dmFyIHJyciA9IDEwMDBcblx0XHRcdFx0XHRcdF9zZWxmID0gdGhpcy5wcm9wcy5jb250ZXh0O1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdFNub3dwaUludGVydmFsLnJlZGlyZWN0ID0gU25vd3BpSW50ZXJ2YWwuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQvKiB0aGlzIGlzIHJlYWxseSBzaW1wbGVcblx0XHRcdFx0XHRcdCAqIGp1c3QgcmVjYWN1bGF0ZSB0aGUgbWVzc2FnZSBhbmQgbGV0IHJlYWN0IGRvIHRoZSByZXN0XG5cdFx0XHRcdFx0XHQgKiAqL1xuXHRcdFx0XHRcdFx0bWVzc2FnZSgpO1xuXHRcdFx0XHRcdFx0X3NlbGYuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdFx0XHRyZXNwb25zZTogeWVzLFxuXHRcdFx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9LDEwMDApO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8qIGtpbGwgdGhlIGludGVydmFsIGFuZCByZWRpcmVjdCBvbiB0aGUgdGltZW91dCBcblx0XHRcdFx0XHQgKiAqL1xuXHRcdFx0XHRcdEdJbnRlcnZhbC50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdFx0XHRcdFx0R0ludGVydmFsLmNsZWFySW50ZXJ2YWxzKEdJbnRlcnZhbC5yZWRpcmVjdCk7XG5cdFx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGRhdGEucmVkaXJlY3QucGF0aDtcblx0XHRcdFx0XHR9LGRhdGEucmVkaXJlY3Qud2hlbik7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bWVzc2FnZSgpXG5cdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2UgaWYodHlwZW9mIGRhdGEucmVkaXJlY3QgPT09ICdvYmplY3QnICYmIGRhdGEucmVkaXJlY3QucGF0aCl7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSBkYXRhLnJlZGlyZWN0LnBhdGg7XG5cdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvKiBmbGFzaCBtZXNzYWdlcyBhcmUgc2hvd24gd2l0aCByZXNwb25zZSA6IHllc1xuXHRcdFx0XHQgKiAqL1x0XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0cmVzcG9uc2U6IHllcyxcblx0XHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdH0uYmluZCh0aGlzKSxcblx0XHRcdFxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcblx0XHRcdFx0Y29uc29sZS5sb2codGhpcy5wcm9wcy51cmwsIHN0YXR1cywgZXJyLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHR0aGlzLnByb3BzLmNvbnRleHQuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdHJlc3BvbnNlOnllcyxcblx0XHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0XHRzdGF0dXM6c3RhdHVzLFxuXHRcdFx0XHRcdFx0ZXJyOmVyci50b1N0cmluZygpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0uYmluZCh0aGlzKVxuXHRcdFxuXHRcdC8qIG5lYXQgbGl0dGxlIHRyaWNrIHRvIGFsd2F5cyByZXNldCBvdXIgYnV0dG9uc1xuXHRcdCogKi9cdFxuXHRcdH0pLmFsd2F5cyhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcblx0XHRcdC8vYnRuLmJ1dHRvbigncmVzZXQnKTtcblx0XHR9KTtcblx0XHRcblx0fSxcbn0pOyBcblxubW9kdWxlLmV4cG9ydHMgPSBSUjtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG4vL3ZhciBUZXh0ID0gSlNPTi5wYXJzZShyZXF1aXJlKCd0ZXh0JykpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4uL2NvbW1vbi5qcycpO1xudmFyIFJlYWN0Qm9vdHN0cmFwID0gcmVxdWlyZSgncmVhY3QtYm9vdHN0cmFwJyk7XG52YXIgQm9vdHN0cmFwQnV0dG9uID0gUmVhY3RCb290c3RyYXAuQnV0dG9uO1xudmFyIHllcyA9ICd5ZXMnLCBubyA9ICdubyc7XG4vL3ZhciB5ZXMgPSB0cnVlLCBubyA9IGZhbHNlO1xuXG52YXIgUmVzZXRQYXNzd29yZCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0bWl4aW5zOiBbUmVhY3QuYWRkb25zLkxpbmtlZFN0YXRlTWl4aW5dLFxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnNldEZvcm1TdGF0ZSgpO1xuXHR9LCBcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh0aGlzLnNldEZvcm1TdGF0ZSh0aGlzLnN0YXRlLnZhbGlkKSk7XG5cdH0sXG5cdHNldEZvcm1TdGF0ZTogZnVuY3Rpb24odmFsaWQpIHtcblx0XHR2YXIgcmV0ID0gQ29tbW9uLnNldEZvcm1TdGF0ZShUZXh0LnJlc2V0LCB2YWxpZCk7XG5cdFx0cmV0Lm5hbWUgPSAncmVzZXQnO1xuXHRcdHJldHVybiByZXQ7XG5cdH0sXG5cdGhhbmRsZVN1Ym1pdDogZnVuY3Rpb24oZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRpZihDb21tb24uc2hvd0J1dHRvbih0aGlzLnN0YXRlLnZhbGlkKSA9PT0gZmFsc2UpIHtcblx0XHRcdHRoaXMucmVzZXRlbWFpbCgpO1xuXHRcdH1cblx0fSxcblx0b25DaGFuZ2U6IGZ1bmN0aW9uKGUpIHtcblx0XHRDb21tb24uRm9ybUlucHV0T25DaGFuZ2UuY2FsbCh0aGlzLCBlLCBUZXh0LnJlc2V0KTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAoPGZvcm0gIHJlZj0nc2lnbmluJyAgY2xhc3NOYW1lPVwic2lnbmluLWZvcm1cIiAgb25TdWJtaXQ9e3RoaXMuaGFuZGxlU3VibWl0fSA+XG5cdFx0XHRcdDxoMj57VGV4dC5ob21lLnJlc2V0fSA8Q29tbW9uLkdNYW4gLz48L2gyPlxuXHRcdFx0XHR7dGhpcy5wcm9wcy5mbGFzaH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQ8Q29tbW9uLkZvcm0gaW5wdXRzPXtUZXh0LnJlc2V0fSBjb250ZXh0PXt0aGlzfSAvPlxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwiY2xlYXJmaXhcIiA+PGJyIC8+PC9kaXY+XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiAgPjxCb290c3RyYXBCdXR0b24gcm9sZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucmVzZXRlbWFpbH0gcmVmPVwicmVzZXRidXR0b25cIiBic1N0eWxlPSdpbmZvJyBkaXNhYmxlZD17Q29tbW9uLnNob3dCdXR0b24odGhpcy5zdGF0ZS52YWxpZCl9ICBkYXRhLWxvYWRpbmctdGV4dD1cIkNoZWNraW5nLi4uXCIgPiAge1RleHQuYnRucy5yZXNldGVtYWlsfSA8L0Jvb3RzdHJhcEJ1dHRvbj48L2Rpdj4gXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0PGRpdiBjbGFzc05hbWU9XCJjb2wteHMtNiBcIiBzdHlsZT17e3RleHRBbGlnbjoncmlnaHQnfX0gPjxCb290c3RyYXBCdXR0b24gb25DbGljaz17dGhpcy5wcm9wcy5jaGFuZ2VSZXNldH0gIGJzU3R5bGU9J2RlZmF1bHQnPiAge1RleHQuYnRucy5sb2dpbmN1cnJlbnR9IDwvQm9vdHN0cmFwQnV0dG9uPjwvZGl2PiBcblx0XHRcdFx0XHQ8ZGl2IGNsYXNzTmFtZT1cImNsZWFyZml4XCIgPjwvZGl2PlxuXHRcdFx0PC9mb3JtPik7XG5cdFx0XHRcblx0fSxcblx0cmVzZXRlbWFpbDogZnVuY3Rpb24oKSB7XG5cdFx0LyogdmFsaWRhdGlvbiBvY2N1cnMgYXMgaW5wdXQgaXMgcmVjZWl2ZWQgXG5cdFx0ICogdGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgYXZpYWxhYmxlIGlmXG5cdFx0ICogYWxsIHZhbGlkYXRpb24gaXMgYWxyZWFkeSBtZXQgc28ganVzdCBydW5cblx0XHQgKiAqL1xuXHRcdHZhciBteWRhdGEgPSB7cmVzZXQ6J3llcyd9O1xuXHRcdGNvbnNvbGUubG9nKHRoaXMuc3RhdGUuZm9ybSk7XG5cdFx0Xy5lYWNoKHRoaXMuc3RhdGUuZm9ybSwgZnVuY3Rpb24odixrKSB7XG5cdFx0XHRcdHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHYpO1xuXHRcdFx0XHRteWRhdGFba10gPSBlbC52YWx1ZTtcblx0XHR9LHRoaXMpO1xuXHRcdG15ZGF0YVtpc0tleV0gPSBpc01lO1xuXHRcdHZhciBidG4gPSAkKHRoaXMucmVmcy5yZXNldGJ1dHRvbi5nZXRET01Ob2RlKCkpXG5cdFx0YnRuLmJ1dHRvbignbG9hZGluZycpXG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogVGV4dC5yZXNldGVtYWlsLFxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdG1ldGhvZDogJ3Bvc3QnLFxuXHRcdFx0ZGF0YTogbXlkYXRhLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1x0XG5cdFx0XHRcdGZ1bmN0aW9uIG1lc3NhZ2UoKSB7XG5cdFx0XHRcdFx0ZGF0YS5tZXNzYWdlID0gJ1N1Y2Nlc3MnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8qIGZsYXNoIG1lc3NhZ2VzIGFyZSBzaG93biB3aXRoIHJlc3BvbnNlIDogeWVzXG5cdFx0XHRcdCAqICovXHRcblx0XHRcdFx0dGhpcy5wcm9wcy5jb250ZXh0LnNldFN0YXRlKHtyZXNwb25zZTp5ZXMsZGF0YTpkYXRhLHJlc2V0Zm9ybTpubyxyZXNldGNvZGU6eWVzfSk7XG5cdFx0XHRcdFxuXHRcdFx0fS5iaW5kKHRoaXMpLFxuXHRcdFx0XG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyh0aGlzLnByb3BzLnVybCwgc3RhdHVzLCBlcnIudG9TdHJpbmcoKSk7XG5cdFx0XHRcdHRoaXMucHJvcHMuY29udGV4dC5zZXRTdGF0ZSh7cmVzcG9uc2U6eWVzLHJlc2V0Zm9ybTpubyxkYXRhOiB7c3RhdHVzOnN0YXR1cyxlcnI6ZXJyLnRvU3RyaW5nKCl9IH0pO1xuXHRcdFx0fS5iaW5kKHRoaXMpXG5cdFx0XG5cdFx0LyogYWx3YXlzIHJlc2V0IG91ciBidXR0b25zXG5cdFx0KiAqL1x0XG5cdFx0fSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcblx0XHRcdFxuXHRcdFx0YnRuLmJ1dHRvbigncmVzZXQnKTtcblx0XHR9KTtcblx0XHRcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzZXRQYXNzd29yZDtcbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgUmVhY3RCb290c3RyYXAgPSByZXF1aXJlKCdyZWFjdC1ib290c3RyYXAnKTtcbnZhciBMb2dpbiA9IHJlcXVpcmUoJy4vZm9ybXMvbG9naW4nKTtcbnZhciBSZWcgPSByZXF1aXJlKCcuL2Zvcm1zL3JlZycpO1xudmFyIFJlc2V0UGFzc3dvcmQgPSByZXF1aXJlKCcuL2Zvcm1zL3Jlc2V0Jyk7XG52YXIgUmVzZXRDb2RlID0gcmVxdWlyZSgnLi9mb3Jtcy9jb2RlJyk7XG52YXIgR0ZsYXNoID0gcmVxdWlyZSgnLi9mbGFzaCcpO1xudmFyIENvbW1vbiA9IHJlcXVpcmUoJy4vY29tbW9uLmpzJyk7XG52YXIgR0ludGVydmFsID0gQ29tbW9uLkdJbnRlcnZhbDtcbi8vdmFyIFRleHQgPSBKU09OLnBhcnNlKHJlcXVpcmUoJ3RleHQnKSk7XG5cbi8qKlxuICogdXNlIHllcyBmb3IgdHJ1ZVxuICogdXNlIG5vIGZvciBmYWxzZVxuICogXG4gKiB0aGlzIHNpbmdsZSBhcHAgdXNlcyB0aGUgeWVzL25vIHZhciBzbyBpZiB5b3Ugd2FudCB5b3UgY2FuIHN3aXRjaCBiYWNrIHRvIHRydWUvZmFsc2VcbiAqIFxuICogKi9cbnZhciB5ZXMgPSAneWVzJywgbm8gPSAnbm8nO1xuLy92YXIgeWVzID0gdHJ1ZSwgbm8gPSBmYWxzZTtcblxuLyogdGhpcyBpcyBvdXIgbWFpbiBjb21wb25lbnRcbiAqIHNpbmNlIHRoaXMgaXMgYSBzaW5nbGUgZnVuY3Rpb24gYXBwIHdlIHdpbGwgY2FsbCB0aGlzIGRpcmVjdGx5XG4gKiBcbiAqIHRvIGluY2x1ZGUgdGhpcyBpbiB5b3VyIFJlYWN0IHNldHVwIG1vZGlmeSBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIHRvIHJlY2lldmUgYW55IGRlZmF1bHQgdmFsdWVzIFxuICogXG4gKiAqL1xuXG52YXIgQm9vdHN0cmFwQnV0dG9uID0gUmVhY3RCb290c3RyYXAuQnV0dG9uO1xuXG52YXIgR0xvZ2luID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRtaXhpbnM6IFtSZWFjdC5hZGRvbnMuTGlua2VkU3RhdGVNaXhpbl0sXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5vdyA9IG5ldyBEYXRlKCk7XG5cdFx0LyogaW5pdGlhbGl6ZSB0aGUgbG9naW5cblx0XHQgKiByZWdpc3RlciBpcyBubywgaWYgd2Ugd2FudCB0byBzaG93IHRoZSByZWdpc3RlciBmb3JtIHNldCB0byB5ZXNcblx0XHQgKiBtb3VudGVkIGlzIHNldCB0byB5ZXMgd2hlbiB0aGUgYXBwIG1vdW50cyBpZiB5b3UgbmVlZCB0byB3YWl0IGZvciB0aGF0XG5cdFx0ICogc2V0IHJlc3BvbnNlIHRvIHllcyB0byBzaG93IGEgZmxhc2ggbWVzc2FnZVxuXHRcdCAqIGVycm9yIG1lc3NhZ2VzIGFyZSBpbiBkYXRhXG5cdFx0ICogKi9cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVnaXN0ZXI6IHdpbmRvdy5pbml0aWFsUGFnZSA9PT0gJ3JlZ2lzdGVyJyA/IHllcyA6IG5vLFxuXHRcdFx0cmVzZXRjb2RlOiB3aW5kb3cuaW5pdGlhbFBhZ2UgPT09ICdyZXNldGNvZGUnID8geWVzIDogbm8sXG5cdFx0XHRyZXNldGZvcm06IHdpbmRvdy5pbml0aWFsUGFnZSA9PT0gJ3Jlc2V0LXBhc3N3b3JkJyB8fCB3aW5kb3cuaW5pdGlhbFBhZ2UgPT09ICdyZXNldCcgPyB5ZXMgOiBubyxcblx0XHRcdG1vdW50ZWQ6IG5vLCBcblx0XHRcdHJlc3BvbnNlOiBubywgXG5cdFx0XHRkYXRhOnt9XG5cdFx0fTtcblx0fSxcblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24oKSB7XG5cdFx0Lyogd2Ugd2FudCB0byBraWxsIHRoZSBmbGFzaCBhbnl0aW1lIHRoZSBmb3JtIGlzIHJlbmRlcmVkXG5cdFx0ICogeW91IGNhbiBhZGQgYW55IG90aGVyIHByb3BzIHlvdSBuZWVkIGhlcmUgaWYgeW91IGluY2x1ZGVcblx0XHQgKiB0aGlzIGluIGFub3RoZXIgY29tcG9uZW50IFxuXHRcdCAqICovXG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRyZXNwb25zZTpub1xuXHRcdH0pO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2hvd2ZsYXNobWVzc2FnZSA9IGZhbHNlO1xuXHRcdHZhciBoYXNlcnJvciA9IGZhbHNlO1xuXHRcdHZhciBsb2dpbk9ScmVnaXN0ZXIgPSAodGhpcy5zdGF0ZS5yZWdpc3RlciA9PT0geWVzIHx8IHdpbmRvdy5pbml0aWFsUGFnZSA9PT0gJ3JlZ2lzdGVyJyApID8gJ3JlZ2lzdGVyJyA6ICdsb2dpbic7XG5cdFx0LyogaWYgcmVzcG9uc2Ugc3RhdGUgaXMgeWVzIHdlIGhhdmUgYSBmbGFzaCBtZXNzYWdlIHRvIHNob3dcblx0XHQgKiB0aGUgbWVzc2FnZSBpcyBpbiBkYXRhXG5cdFx0ICogKi9cblx0XHRpZih0aGlzLnN0YXRlLnJlc3BvbnNlID09PSB5ZXMpIHtcblx0XHRcdFxuXHRcdFx0dmFyIHBpY2tjbGFzcyA9ICh0aGlzLnN0YXRlLmRhdGEuc3VjY2VzcyA9PT0geWVzICkgPyAnc3VjY2VzcycgOiAnd2FybmluZyc7IFxuXHRcdFx0XG5cdFx0XHRzaG93Zmxhc2htZXNzYWdlID0gPEdGbGFzaCBzaG93Y2xhc3M9e3BpY2tjbGFzc30gY2xlYXJ0aW1lb3V0cz17W0dJbnRlcnZhbC50aW1lb3V0XX0gY2xlYXJpbnRlcnZhbHM9e1tHSW50ZXJ2YWwucmVkaXJlY3RdfT48ZGl2IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7X19odG1sOiB0aGlzLnN0YXRlLmRhdGEubWVzc2FnZSB8fCAnJ319IC8+PC9HRmxhc2ggPjtcblx0XHRcdFxuXHRcdFx0LyogaWYgd2UgaGF2ZSBhbiBlcnJvciBzaGFrZSB0aGUgZm9ybS4gIHRoaXMgaXMgZG9uZSB3aXRoIHRoZVxuXHRcdFx0ICogaGFzLWVycm9ycyBjbGFzc1xuXHRcdFx0ICogKi9cblx0XHRcdGlmKHRoaXMuc3RhdGUuZGF0YS5zdWNjZXNzID09PSBubykgaGFzZXJyb3IgPSAnIGhhcy1lcnJvcnMnO1xuXHRcdFx0XG5cdFx0fVxuXHRcdGlmKHRoaXMuc3RhdGUucmVzZXRjb2RlID09PSB5ZXMpIHtcblx0XHRcdHZhciByZXQgPSA8UmVzZXRDb2RlICBjb250ZXh0PXt0aGlzfSBjaGFuZ2VSZXNldD17dGhpcy5jaGFuZ2VDb2RlfSBmbGFzaD17c2hvd2ZsYXNobWVzc2FnZX0gLz5cblx0XHR9IGVsc2UgaWYodGhpcy5zdGF0ZS5yZXNldGZvcm0gPT09IHllcykge1xuXHRcdFx0dmFyIHJldCA9IDxSZXNldFBhc3N3b3JkICBjb250ZXh0PXt0aGlzfSBjaGFuZ2VSZXNldD17dGhpcy5jaGFuZ2VSZXNldH0gZmxhc2g9e3Nob3dmbGFzaG1lc3NhZ2V9IC8+XG5cdFx0fSBlbHNlIGlmKHRoaXMuc3RhdGUucmVnaXN0ZXIgPT09IG5vKSB7XG5cdFx0XHR2YXIgcmV0ID0gPExvZ2luICBjb250ZXh0PXt0aGlzfSBzaG93cmVnaXN0ZXI9e3RoaXMuc2hvd3JlZ2lzdGVyfSBjaGFuZ2VSZXNldD17dGhpcy5jaGFuZ2VSZXNldH0gZmxhc2g9e3Nob3dmbGFzaG1lc3NhZ2V9IC8+XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciByZXQgPSA8UmVnIHNob3dyZWdpc3Rlcj17dGhpcy5zaG93cmVnaXN0ZXJ9IGZsYXNoPXtzaG93Zmxhc2htZXNzYWdlfSBjb250ZXh0PXt0aGlzfSAvPlxuXHRcdH1cblx0XHRyZXR1cm4gKCA8ZGl2ICBjbGFzc05hbWU9e2xvZ2luT1JyZWdpc3RlciArIFwiIGNlbnRlcm1lIGNvbC14cy0xMiBzaGFrZW1lIFwiICsgaGFzZXJyb3J9PntyZXR9IDwvZGl2Pik7XG5cdH0sXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcblx0XHQvLyBXaGVuIHRoZSBjb21wb25lbnQgaXMgYWRkZWQgbGV0IG1lIGtub3dcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdG1vdW50ZWQ6IHllc1xuXHRcdH0pO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblx0c2hvd3JlZ2lzdGVyOiBmdW5jdGlvbiAoZSkge1xuXHRcdC8qIHRvZ2dsZSB0aGUgcmVnaXN0ZXIgLyBsb2dpbiBmb3Jtc1xuXHRcdCAqICovXG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRyZWdpc3RlcjogdGhpcy5zdGF0ZS5yZWdpc3RlciA9PT0geWVzID8gbm8gOiB5ZXMsXG5cdFx0XHRyZXNwb25zZTogbm8sXG5cdFx0XHRyZXNldGZvcm06IG5vLFxuXHRcdFx0cmVzZXRjb2RlOiBubyxcblx0XHR9KTtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRjaGFuZ2VSZXNldDogZnVuY3Rpb24gKGUpIHtcblx0XHQvKiB0b2dnbGUgdGhlIHBhc3N3b3JkIHJlc2V0XG5cdFx0ICogKi9cblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHJlc2V0Zm9ybTogdGhpcy5zdGF0ZS5yZXNldGZvcm0gPT09IHllcyA/IG5vIDogeWVzLFxuXHRcdFx0cmVnaXN0ZXI6IG5vLFxuXHRcdFx0cmVzZXRjb2RlOiBubyxcblx0XHRcdHJlc3BvbnNlOiBub1xuXHRcdH0pO1xuXHRcdHJldHVybiBlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdGNoYW5nZUNvZGU6IGZ1bmN0aW9uIChlKSB7XG5cdFx0LyogdG9nZ2xlIHRoZSBwYXNzd29yZCByZXNldFxuXHRcdCAqICovXG5cdFx0dGhpcy5zZXRTdGF0ZSh7IFxuXHRcdFx0cmVzZXRjb2RlOiB0aGlzLnN0YXRlLnJlc2V0Y29kZSA9PT0geWVzID9ubyA6IHllcyxcblx0XHRcdHJlc3BvbnNlOm5vLFxuXHRcdFx0cmVnaXN0ZXI6IG5vLFxuXHRcdFx0cmVzZXRmb3JtOiBubyxcblx0XHR9KTtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXHRoYW5kbGVTdWJtaXQ6IGZ1bmN0aW9uKGUpIHtcblx0XHRyZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHTG9naW47XG4iXX0=
