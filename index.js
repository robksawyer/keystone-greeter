var keystone;
var _ = require('lodash');
var express = require('express');
var fs = require('fs');
var path = require('path');
var async = require('async');
var jade = require('jade');
var sanitizer=require('sanitizer');
var config = require('./lib/config.js');
var debug = require('debug')('greeter');
var i18n = require("i18n");
var Text = i18n.__;

var yes = 'yes'; /* true === 'yes' - isTrue === true;  >> will fail; use isTrue === yes*/
var no = 'no' /* false === 'no'  - isTrue === no;  >> for truely false */;

i18n.configure({
	locales:['en'],
	directory: __dirname + '/locales'
});
	
var templateCache = {};
/**
 * grabs the true app root
 */
var appRoot = (function(_rootPath) {
	var parts = _rootPath.split(path.sep);
	parts.pop(); // rid of /node_modules
	return parts.join(path.sep);
})(module.parent ? module.parent.paths[0] : module.paths[0]);


var SnowGreeter = function() {
	
	this._options = {}
	/* set the module variables
	 * */	
	
	
	this.set('defaults', true);
	
	this.set('allow register', true);
	this.set('new user can admin', false);
	this.set('2FA', false);
	this.set('social', false);
	this.set('register security', false);
	
	
	this.set('route relay', '/greeter-keystone-relay');
	this.set('route reset', '/greeter-reset-password');
	this.set('route logout', '/goodbye');
	
	this.set('redirect timer', 0);
	
	this.set('greeter style', true);
	this.set('keystone style', true);
	
	this.resetField('all');
	
	this._formDefaults();
	
	this.setButtons({
		login: Text('login'),
		logincurrent: Text('current user?'),
		register: Text('register new account'),
		reset: Text('reset your password'),
		resetpass: Text('reset passwords'),
		resetemail: Text('send reset email'),
		resetcode: Text('apply reset code'),
	});
	
	this.setMessage('register header', Text('register new account'));
	this.setMessage('login header', Text('welcome back'));
	this.setMessage('reset header', Text('reset your password'));
	this.setMessage('valid credentials', Text('a valid username and password are required'));
	this.setMessage('welcome', Text('Welcome back %s','{user}.'));
	this.setMessage('welcome login', Text('Welcome back.  Please signin'));
	this.setMessage('registration closed', Text('registration is currently closed'));
	this.setMessage('current user', Text('You are currently signed in.  Do you want to <a href="/keystone/signout">sign out</a>? '));
	this.setMessage('bad token', Text('bad request token. %s',' <a href="javascript:location.reload()">refresh</a>'));
	this.setMessage('username taken', Text('the username requested is not available'));
	this.setMessage('password match', Text('Your passwords do not match'));
	this.setMessage('failed register', Text('there was a problem creating your new account.'));
	this.setMessage('register all fields', Text('please fill in username, password and password again...'));
	this.setMessage('reset email sent', Text('check your email.  reset instructions have been sent.'));	
	
}

SnowGreeter.prototype.init = function(options, statics) {
	
	if(!options.keystone) {
		console.log('A Keystone instance must be included');
		return false;
	}
	
	keystone = this.keystone = options.keystone;
	
	this.set('user model', keystone.get('user model') || 'User');
	this.set('route greeter', keystone.get('signin url') || '/greeter');
	
	this._emailDefaults();
	
	this.options(options, function() {
		if(this.get('defaults')) {
			this.formDefaults();
		}
	}.bind(this));
	
	if(!statics) {
		this.statics();
	}
	
	return this;
	
}

/* always include the dufault reset forms.  They can be overwritten */
SnowGreeter.prototype._formDefaults = function() {
	this.setField('reset', 'text', 'A-email', {
		label: Text('email'),
		field: 'email',
		regex: ["^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "gi"],
		required: true
	});
	this.setField('resetcode', 'text', 'A-code', {
		label: Text('code from email'),
		field: 'resetcode',
		required: true
	});
	
}

SnowGreeter.prototype.formDefaults = function() {
	
	this.setField('login', 'text', 'A-username', {
		label: Text('email'),
		field: 'email',
		regex: ["^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "gi"],
		model: {
			field: 'email',
			unique: false
		},
		required: true
	});
	this.setField('login', 'password', 'B-password', {
		label: Text('password'),
		field: 'password',
		regex: ["^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,}$", "g"],
		required: true
	});
	
	this.setField('register', 'text', 'A-username', {
		label: Text('email'),
		field: 'email',
		regex: ["^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "gi"],
		required: true,
		model: {
			field: 'email',
			unique: true
		},
	});
	this.setField('register', 'password', 'B-password', {
		label: Text('password'),
		field: 'password',
		required: true,
		regex: ["^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,}$", "g"]
	});
	this.setField('register', 'password', 'C-confirm', {
		label: Text('confirm'),
		field: 'confirm',
		required: true,
		dependsOn: 'B-password' 
	});
	
	this.setField('register', 'text','D-name', {
		label: Text('name'),
		'field': 'name',
		modify: ['first','last'],
		modifyParameter: ' ',
		placeholder: Text('first last')
	});
	
	if(this.get('register security')) {
		this.setField('register', 'header', 'F-header', {
			'label': Text('Answer the following questions for password reset options.')
		});
		this.setField('register', 'select', 'F1-security', {
			field: 'q1',
			label: Text('Question 1'),
			options: [
				'Select a question',
				'Mothers maiden name',
				'Fathers middle name',
				'Hospital you were born in',
				'House number you grew up in'
			],
			required: true,
			attach: {
				type: 'text',
				field: 'q1Answer',
				required: true,
				placeholder: Text('answer'),
				dependsOn: 'F1-security'
			}
		});
		this.setField('register', 'select', 'F2-security', {
			field: 'q2',
			label: Text('Question 2'),
			options: [
				'select a question',
				'Favorite Color',
				'Favorite Dog Breed',
				'Do you cat?',
				'Your first phone number'
			],
			required: true,
			attach: {
				type: 'text',
				field: 'q2Answer',
				placeholder: Text('answer question 2'),
				required: true,
				dependsOn: 'F2-security'
			}
		});
	}
	
	this._emailDefaults();
}

SnowGreeter.prototype.resetField = function(field) {
	if(field === 'all') {
		this.set('form login', {});
		this.set('form register', {});
		this.set('form reset', {});
		this.set('form resetcode', {});
		this.set('form code', {});
		this.set('form buttons', {});
	} else if(field) {
		this.set('form ' + field, {});
	}
}

SnowGreeter.prototype.setField = function(form, type, name, options) {
	if(_.isArray(form)) {
		_.each(form, function(v) {
			this.setField(v.form, v.type, v.name, v.options);
		}, this);
		return;
	}
	
	if (!_.isString(form) || !_.isString(type) || !_.isString(name)) {
		return false;
	} 
	if (_.isString(options) || !options) {
		if(!options)options = name;
		options = {
			'label': options,
			'field': options,
			'type': type,
		}
	} else {
		if(!options.label) options.label = options.field || '';
		if(!options.field) options.field = name;
		options.type = type;
		options.form = form;
	}
	options._name = name;
	if(_.isObject(this.get('form ' + form))) {
		var current = this.get('form ' + form);
		current[name] = options;
		this.set('form ' + form, current);
	}
	
	if(_.isObject(options.attach)) {
		if(!options.attach.field) {
			if(this.get('debug')) console.log('failed to create attached field');
			return;
		}
		var newField = {
			field: options.attach.field,
			label: options.attach.label || false,
			model: options.attach.model || false,
			required: options.attach.required || false,
			regex: options.attach.regex || false,
			dependsOn: options.attach.dependsOn || name,
			attached: name,
			placeholder: options.attach.placeholder || false
		}
		this.setField(form, options.attach.type || 'text', name + '_attach', newField);
			
	}
	
}
SnowGreeter.prototype.setMessage = function(field, message) {
	if(_.isString(message)) {
		this.set('message ' + field,message);
	}
}
SnowGreeter.prototype.setButtons = function(button, text) {
	if(_.isObject(button)) {
		_.each(button,function(v,k) {
			this.setButtons(k, v);
		},this);
	} else if(_.isString(button) && _.isString(text)) {
		var current = this.get('form buttons');
		current[button] = Text(text);
		this.set('form buttons', current);
	}
}

SnowGreeter.prototype._emailDefaults = function() {
	
	this.set('emails from name', keystone.get('name'));
	this.set('emails from email', 'greeter@inquisive.com');
	this.set('emails reset subject', Text('Reset password request from %s', keystone.get('name')));
	this.set('emails template', '<div>A request has been made to reset your password on ' + keystone.get('name') + '.</div> <div> If this is an error ignore this email.</div><div><br /><a href="{link}">Visit this link to reset your password.</a></div>');
}

SnowGreeter.prototype._statics = function() {
	var app = keystone.app;
	app.use( express.static(__dirname + "/public"));
}


SnowGreeter.prototype.statics = function() {
	var static = keystone.get('static');
	if (!_.isArray(static)) {
		static = [static]
	}
	static.push(__dirname + "/public");
	keystone.set('static', static);
	this._staticSet = true;
}


/** login function **/
SnowGreeter.prototype.login = require('./lib/login.js');
/** register function **/
SnowGreeter.prototype.register = require('./lib/register.js');
/** logout function **/
SnowGreeter.prototype.goodbye = require('./lib/goodbye.js');

SnowGreeter.prototype.add = function(setview) {
	/* add the greeter routes
	 * */
	var app = keystone.app;
	var view = setview && setview !== undefined ? setview: this.get('route greeter');
	var snowpi = this;
	var userModel = this.get('user model');
	
	/* add our static files as an additional directory
	 * */
	if(!this._staticSet) {
		snowpi._statics();
	}
	
	/* middleware to add snowpiResponse
	 * */
	var publicAPI = function(req, res, next) {
		res.snowpiResponse = function(status) {
			//add the requesting url back to the response
			status.url=req.protocol + '://' + req.get('host') + req.originalUrl; 
			/* you can customize the response here using the status object.  dont overwrite your existing props. */
			
			/* add in the response with json */
			if (req.query.callback)
				res.jsonp(status);
			else
				res.json(status);
		};
		res.snowpiError = function(key, err, msg, code) {
			msg = msg || 'Error';
			key = key || 'unknown error';
			msg += ' (' + key + ')';
			if (keystone.get('logger')) {
				console.log(msg + (err ? ':' : ''));
				if (err) {
					console.log(err);
				}
			}
			res.status(code || 500);
			res.snowpiResponse({ error: key || 'error', detail: err });
		};
		next();
	};
	
	// add a logout route (default is /goodbye)
	app.get(this.get('route logout'), this.goodbye.bind(this));
	
	app.get('/greeter__/greeterformfields.js/:page', function(req,res) {
		var text = JSON.stringify(snowpi._locals(req, res));
		var tv = keystone.security.csrf.getToken(req, res);
		var send = "var isMe = '"+ tv + "';var isKey = '" + keystone.security.csrf.TOKEN_KEY + "';var initialPage = '" + req.params.page + "';var Text = " + text;
		res.setHeader('content-type', 'application/javascript');
		res.send(send);
	});
	
	// main login page (default is /greeter)
	app.get([view, `${view}/:page`, `${view}/:page/:code`],
		function(req, res) {
			
			if (req.user) {
				return res.redirect(keystone.get('signin redirect'));
			}
			
			//send our own result here
			var templatePath = __dirname + '/templates/views/greeter.jade';
			
			var jadeOptions = {
				filename: templatePath,
				pretty: keystone.get('env') !== 'production'
			};
	
			var compileTemplate = function() {
				return jade.compile(fs.readFileSync(templatePath, 'utf8'), jadeOptions);
			};
			
			var template = keystone.get('viewCache')
				? templateCache[view] || (templateCache[view] = compileTemplate())
				: compileTemplate();
			
			var text = JSON.stringify(snowpi._locals(req, res));
			var tv = keystone.security.csrf.getToken(req, res);
			var page = req.params.page != 'undefined' && req.params.page ? req.params.page : 'login';
			var code = req.params.code != 'undefined' && req.params.code ? req.params.code : false;
			var locals = {
				view: view,
				page: page,
				code: code,
				env: keystone.get('env'),
				brand: keystone.get('name'),
				logoman: snowpi.get('logoman'),
				greeterStyle: snowpi.get('greeter style'),
				keystoneStyle: snowpi.get('keystone style'),
				customStyle: snowpi.get('custom style'),
				user: req.user,
				signout: keystone.get('signout url'),
				section: {},
				title: keystone.get('brand'),
				csrf_token_key: keystone.security.csrf.TOKEN_KEY,
				csrf_token_value: tv,
				//csrf_query: '&' + keystone.security.csrf.TOKEN_KEY + '=' + keystone.security.csrf.getToken(req, res),
				text: text,
				userscript: "var isMe = '"+ tv + "';var isKey = '" + keystone.security.csrf.TOKEN_KEY + "';var initialPage = '" + req.params.page + "';var Text = " + text
			};
	
			// Render the view
			var html = template(locals);
	
			res.send(html);
			
		}
	);
	
	/* add the api controller
	 * */
	app.post(snowpi.get('route reset'),
		publicAPI, //middleware to add api response
		function(req,res) {
			
			/* set up Email */
			var Email = new keystone.Email({ 
				templateMandrillName: 'reset-pass',
				templateMandrillContent: [
					{
						"name": "header",
						"content": "<h2>" + keystone.get('name') + "</h2>"
					}
				],
				templateName: 'reset-pass',
				//customCompileTemplate: function(callback) {
				//	callback(null, snowpi.get('emails template').replace('{link}', req.protocol + '://' + req.get('host') + view + '?courier=4567890'));
				//}
			});
			//Email.templateForceHtml = true;
			Email.send({
				to: req.body.email,
				from: {
					name: snowpi.get('emails from name'),
					email: snowpi.get('emails from email')
				},
				subject: snowpi.get('emails reset subject'),
				templateMandrillContent: [
					{
						"name": "main",
						"content": snowpi.get('emails template').replace('{link}', req.protocol + '://' + req.get('host') + view + '?courier=4567890')
					}
				],
				mandrillOptions: {
					track_opens: false,
					track_clicks: false,
					preserve_recipients: false,
					inline_css: true
				},
			}, 
			function(err, info) {
				if (snowpi.get('debug') && err) {
					console.log(err);
				}
				res.snowpiResponse({action:'greeter',command:'reset',success:'yes',message:snowpi.get('message reset email sent'),code:401,data:{}});
			});
		
		}
	);
	app.post(snowpi.get('route relay'), 
		publicAPI, //middleware to add api response
		function(req, res) {
			if (req.user) {
				return res.snowpiResponse({action:'greeter',command:'login',success:'yes',message:snowpi.get('message current user'),code:200,data:{},redirect:{path:keystone.get('signin redirect'),when:20000}});
			}
			
			if (req.method === 'POST') {
				
				if (!keystone.security.csrf.validate(req)) {
					return res.snowpiResponse({action:'greeter',command:'directions',success:'no',message:snowpi.get('message bad token'),code:501,data:{}});
				}
				var locals = res.locals;
				
				var runner=Object.keys(req.body);
				runner.forEach(function(param) {
					req.body[param] = sanitizer.sanitize(req.body[param]);
					//sanitize everything.  I want a better sanitizer for general use
				});
				/* we expect "yes"===true and "no"===false */
				if(req.body.login === yes) { 
					
					if (!req.body.email || !req.body.password) {
						
						return res.snowpiResponse({action:'greeter',command:'login',success:'no',message:snowpi.get('message valid credentials'),code:401,data:{}});
					}
					
					snowpi.login(req, res);
					
				} else if(req.body.register === yes) { 
					if(snowpi.get('debug')) {
						console.log('allow register', snowpi.get('allow register'));
					}
					if(snowpi.get('allow register')) {
						snowpi.register(req, res);
						
					} else {
						return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:snowpi.get('message registration closed'),code:401,data:{}});
					}
					
				} else {
					return res.snowpiResponse({action:'greeter',command:'directions',success:'no',message:'You are lost.  Try and send a command I understand.',code:501,data:{}});
				}
			
			} else {
				//no truth for gets
				return false;
			}
			
		}
	); //end app.post
	
}

SnowGreeter.prototype._locals = function(req, res) {
	var root = {
		name: keystone.get('name'),
		logoman: this.get('logoman'),
		host: req.get('host'),
		relay: this.get('route relay'),
		resetemail: this.get('route reset'),
		signout: keystone.get('signout url'),
		brand: keystone.get('brand'),
		isKey: keystone.security.csrf.TOKEN_KEY,
		isMe: keystone.security.csrf.getToken(req, res),
	};
	root.login = this.get('form login');
	root.reset = this.get('form reset');
	root.resetcode = this.get('form resetcode');
	root.resetpass = this.get('form resetpass');
	root.register = this.get('form register');
	root.btns = this.get('form buttons');
	debug(config);
	
	var cfg = _.merge(config, root);
	
	return cfg;
	
}

SnowGreeter.prototype.set = function(key,value) {
	
	if (arguments.length === 1) {
		return this._options[key];
	}
	// old config used text instead of label
	if(key.trim().slice(-4) === 'text') {
		this._options[key] = value;
		var nn = key.trim().split(' ');
		key = nn[0] + ' label';
	}
	this._options[key] = value;
	
	return this._options[key];
	
}

SnowGreeter.prototype.options = function(options,callback) {
	
	if(_.isObject(options)) {
		_.each(options,function(v,k) {
			this.set(k,v);
		},this);
	}
	if(_.isFunction(callback)) {
		return callback();
	}
	return this._options;
}

SnowGreeter.prototype.get = SnowGreeter.prototype.set;

var snowgreeter = module.exports = exports = new SnowGreeter();
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
