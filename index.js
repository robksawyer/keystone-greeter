var keystone = require('keystone'),
	_ = require('lodash'),
	express = require('express'),
	fs = require('fs'),
	path = require('path'),
	async = require('async'),
	jade = require('jade'),
	sanitizer=require('sanitizer'),
	config = require('./lib/config.js'),
	debug = require('debug')('greeter'),
	yes = 'yes', /* true === 'yes' - isTrue === true;  >> will fail; use isTrue === yes*/
	no = 'no' /* false === 'no'  - isTrue === no;  >> for truely false */;

var templateCache = {};
/**
 * grabs the true app root
 */
var appRoot = (function(_rootPath) {
	var parts = _rootPath.split(path.sep);
	parts.pop(); // rid of /node_modules
	return parts.join(path.sep);
})(module.parent ? module.parent.paths[0] : module.paths[0]);


var SnowpiGreeter = function() {
	
	this._options = {}
	/* set the module variables
	 * */	
	this._defaults();
}

SnowpiGreeter.prototype._defaults = function() {
		
	this.set('user model',keystone.get('user model') || 'User');
	
	this.set('allow register',true);
	this.set('new user can admin',false);
	
	this.set('greeter',keystone.get('signin url') || '/greeter');
	this.set('redirect timer',0);
	
	this.set('greeter style',true);
	this.set('keystone style',true);
	
	this.setField('field username', 'email');
	this.setField('field password', 'password');
	this.setField('field name', ['name','first','last']);
	this.setField('field email', false);
	this.setField('field security', {
		'placeholder': 'answer',
		'label': 'Answer the following questions for password reset options.'
	});
	this.setField('field info', {
		'label': 'A name and email are optional.  Supplying an email is the only way to reset a lost password'
	});
	
	this.setField('field reset questions', [
		{
			field: 'q1',
			answer: 'q1Answer',
			label: 'Question 1',
			placeholder: 'answer',
			questions: [
				'Mothers maiden name',
				'Fathers middle name',
				'Hospital you were born in',
				'House number you grew up in'
			]
		},
		{
			field: 'q2',
			answer: 'q2Answer',
			label: 'Question 2',
			placeholder: 'answer question 2',
			questions: [
				'Favorite Color',
				'Favorite Dog Breed',
				'Do you cat?',
				'Your first phone number'
			]
		}
	]);
	
	this.set('message valid credentials', 'a valid username and password are required');
	this.set('message welcome', 'Welcome back {user}. ');
	this.set('message welcome login', 'Welcome back.  Please signin');
	this.set('message registration closed', 'registration is currently closed');
	this.set('message current user', 'You are currently signed in.  Do you want to <a href="/keystone/signout">sign out</a>? ');
	this.set('message bad token', 'bad request token.  <a href="javascript:location.reload()">refresh</a>');
	this.set('message username taken', 'the username requested is not available');
	this.set('message failed register', 'there was a problem creating your new account.');
	this.set('message register all fields', 'please fill in username, password and password again...');
	this.set('message reset email sent', 'check your email.  reset instructions have been sent.');
	
	this._emailDefaults();
}

SnowpiGreeter.prototype.setField = function(field,options) {
	if(_.isString(options)) {
		options = {
			'label': options,
			'field': options,
		}
	}
	
	this.set(field,options);
	
}

SnowpiGreeter.prototype._emailDefaults = function() {
	
	this.set('emails from name', keystone.get('name'));
	this.set('emails from email', 'info@inquisive.com');
	this.set('emails reset subject', 'Reset password request from ' + keystone.get('name'));
	this.set('emails template', '<div>A request has been made to reset your password on ' + keystone.get('name') + '.</div> <div> If this is an error ignore this email.</div><div><br /><a href="{link}">Visit this link to reset your password.</a></div>');
}

SnowpiGreeter.prototype._statics = function() {
	var app = keystone.app;
	app.use( express.static(__dirname + "/public"));
}

SnowpiGreeter.prototype.statics = function() {
	var static = keystone.get('static');
	if (!_.isArray(static)) {
		static = [static]
	}
	static.push(__dirname + "/public");
	keystone.set('static',static);
	this._public = true;
}

SnowpiGreeter.prototype.resetQuestion = function(options) {
	if(_.isObject(options) && options.name && _.isArray(options.questions)) {
		this._options['field reset questions'].push(options);
		debug('set field reset questions');
		debug(this._options['field reset questions']);
	}
}

SnowpiGreeter.prototype.add = function(setview) {
	/* add the greeter page
	 * */
	var app = keystone.app,
		view = setview && setview !== undefined ? setview: this.get('greeter') || '/greeter',
		snowpi = this,
		userModel = this.get('user model');
	
	this._emailDefaults();
	
	/* add our static files as an additional directory
	 * */
	if(!this._public) snowpi._statics();
	
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
	
	app.get(view,
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
			
			var locals = {
				env: keystone.get('env'),
				brand: keystone.get('name'),
				emailText: snowpi.get('field email').label,
				usernameText: snowpi.get('field username').label,
				passwordText: snowpi.get('field password').label,
				confirmText: snowpi.get('field confirm').label,
				logoman: snowpi.get('logoman'),
				nameText: snowpi.get('field name').label,
				infoText: snowpi.get('field info').label,
				greeterStyle: snowpi.get('greeter style'),
				keystoneStyle: snowpi.get('keystone style'),
				customStyle: snowpi.get('custom style'),
				user: req.user,
				signout: keystone.get('signout url'),
				section: {},
				title: keystone.get('brand'),
				csrf_token_key: keystone.security.csrf.TOKEN_KEY,
				csrf_token_value: keystone.security.csrf.getToken(req, res),
				csrf_query: '&' + keystone.security.csrf.TOKEN_KEY + '=' + keystone.security.csrf.getToken(req, res),
			};
	
			// Render the view
			var html = template(locals);
	
			res.send(html);
			
		}
	);
	
	/* add the api controller
	 * */
	app.post('/greeter-reset-password',
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
				if (snowpi.get('debug') && err) console.log(err);
				//console.log(info);
				res.snowpiResponse({action:'greeter',command:'reset',success:'yes',message:snowpi.get('message reset email sent'),code:401,data:{}});
			});
		
		}
	);
	app.post('/greeter-keystone-relay', 
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
					
					if (!req.body.username || !req.body.password) {
						
						return res.snowpiResponse({action:'greeter',command:'login',success:'no',message:snowpi.get('message valid credentials'),code:401,data:{}});
					}
					
					var onSuccess = function(user) {			
						
						return res.snowpiResponse({action:'greeter',command:'login',success:'yes',message:snowpi.get('message welcome').replace('{user}',req.body.username),code:200,data:{person:user},redirect:{path:keystone.get('signin redirect'),when:snowpi.get('redirect timer')}});
					}
					
					var onFail = function() {
						return res.snowpiResponse({action:'greeter',command:'login',success:'no',message:snowpi.get('message valid credentials'),code:401,data:{}});
					}
					
					keystone.session.signin({ email: req.body.username, password: req.body.password }, req, res, onSuccess, onFail);
					
				} else if(req.body.register === yes) { 
					if(snowpi.get('debug'))console.log('allow register',snowpi.get('allow register'))
					if(snowpi.get('allow register'))
					{
						async.series([
							
							function(cb) {
								
								if (!req.body.password || !req.body.confirm || !req.body.username) {
									return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:snowpi.get('message register all fields'),code:401,data:{}});
								}
								
								if (req.body.password != req.body.confirm) {
									return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:snowpi.get('message password match'),code:401,data:{}});
								}
								
								return cb();
								
							},
							
							function(cb) {
								if(snowpi.get('debug'))console.log('check user');
								keystone.list(userModel).model.findOne({ email: req.body.username }, function(err, user) {
									
									if (err || user) {
										return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:snowpi.get('message username taken'),code:401,data:{}});
									}
									
									return cb();
									
								});
								
							},
							function(cb) {
								if(snowpi.get('debug'))console.log('check email');
								keystone.list(userModel).model.findOne({ realEmail: req.body.email }, function(err, user) {
									
									if (err || user) {
										return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:'user exists with that email',code:401,data:{}});
									}
									
									return cb();
									
								});
								
							},
							
							function(cb) {
								if(snowpi.get('debug'))console.log('add user');
								/* build the doc from our set variables
								 * */
								
								var userData = {}
								var name =snowpi.get('field name');
								if(name) {
									if(name instanceof Array && name.length > 2) {
										
										var splitName = req.body.name.split(' ');
										
										userData[name[0]] = {}
										
										userData[name[0]][name[1]] = splitName[0];
										var cname;
										if(splitName.length >2) {
											
											for(var i=1;i<=splitName.length;i++) {
												cname+=' ' + (splitName[i] || '');
											}
											
										} else {
											cname = splitName[1] || '';
										}
										userData[name[0]][name[2]] =cname;
									
									} else if(name instanceof Array && name.length === 2) {
										
										userData[name[0]] = {}
										userData[name[0]][name[1]] = req.body.name;
										
									} else if(name instanceof Array){
										
										userData[name[0]] = req.body.name;
										
									} else {
										
										userData[name] = req.body.name;
										
									}
								}
								if(snowpi.get('field username'))
									userData[snowpi.get('field username').field] = req.body.username
								if(snowpi.get('field password'))
									userData[snowpi.get('field password').field] = req.body.password
								if(snowpi.get('field email'))
									userData[snowpi.get('field email').field] = req.body.email
								userData.isAdmin = snowpi.get('new user can admin')
								
								// security questions
								var sq = snowpi.get('field reset questions');
								if(_.isArray(sq) && sq.length > 0) {
									userData.questions = {};
									sq.forEach(function (val) {
										userData.questions[val.field] = req.body[val.field + '_select']
										userData.questions[val.answer] = req.body[val.field]
									});
								}
								
								var User = keystone.list(userModel).model,
									newUser = new User(userData);
								if(snowpi.get('debug'))console.log('new user set to save',newUser,req.body);
								newUser.save(function(err) {
									return cb(err);
								});
							
							}
							
						], function(err){
							
							if (err) 
							{
								if(snowpi.get('debug'))console.log('user reg failed',err);
								return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:snowpi.get('message failed register'),code:401,data:{}});
							}
							var onSuccess = function(user) {
								return res.snowpiResponse({action:'greeter',command:'register',success:'yes',message:snowpi.get('message welcome').replace('{user}',user.fullname),code:200,data:{person:user},redirect:{path:keystone.get('signin redirect'),when:snowpi.get('redirect timer')}});
							}
							
							var onFail = function(e) {
								return res.snowpiResponse({action:'greeter',command:'register',success:'yes',message:snowpi.get('message welcome login'),code:401,data:{}});
							}
							
							keystone.session.signin({ email: req.body.username, password: req.body.password }, req, res, onSuccess, onFail);
							
						});
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
	
	app.get('/greeter_keystone.js',
		function(req, res) {
			
			config.registerSecurityQuestions = !snowpi.get('field security') ? false : _.isArray(snowpi.get('field reset questions')) ? snowpi.get('field reset questions') : false;
			var root = {
				name: keystone.get('name'),
				logoman: snowpi.get('logoman'),
				host: req.get('host'),
				signout: keystone.get('signout url'),
				brand: keystone.get('brand'),
				csrf_token_key: keystone.security.csrf.TOKEN_KEY,
				csrf_token_value: keystone.security.csrf.getToken(req, res),
				csrf_query: '&' + keystone.security.csrf.TOKEN_KEY + '=' + keystone.security.csrf.getToken(req, res),
			};
			root.home = {
				email: snowpi.get('field email'),
				username: snowpi.get('field username'),
				password: snowpi.get('field password'),
				confirm: snowpi.get('field confirm'),
				name: snowpi.get('field name'),
				emailnotice: snowpi.get('field info'),
				securityHeader: snowpi.get('field security').label,
				securityPlaceholder: snowpi.get('field security').placeholder
			}
			//debug(config);
			var cfg = _.merge(config, root);
			//cfg.home = _.defaults(root.home, config.home);
			var vars = JSON.stringify(cfg);
			var send = 'var isMe = "' + root.csrf_token_value + '";var isKey = "' + root.csrf_token_key + '";var Text = ' + vars + ';';
			var send = send + 'console.log(Text);';
			res.setHeader('Content-Type', 'text/javascript');
			debug('send config in /greeter-keystone.js');
			debug(cfg);
			res.send(send);
			//res.write(send);
			//res.end();
		}
	);
	
}


SnowpiGreeter.prototype.set = function(key,value) {
	
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

SnowpiGreeter.prototype.get = SnowpiGreeter.prototype.set;

var snowpigreeter = module.exports = exports = new SnowpiGreeter();
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
