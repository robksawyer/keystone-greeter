var 	keystone = require('keystone'),
	_ = require('underscore'),
	express = require('express'),
	fs = require('fs'),
	path = require('path'),
	async = require('async'),
	jade = require('jade'),
	sanitizer=require('sanitizer'),
	yes = 'yes', /* true === 'yes' - isTrue = true;  >> will fail; use isTrue = yes*/
	no = 'no' /* false === 'no'  - isTrue = no;  >> for true false */;

var templateCache = {};
/**
 * grabs the true app root
 * from Keystone:
 * Don't use process.cwd() as it breaks module encapsulation
 * Instead, let's use module.parent if it's present, or the module itself if there is no parent (probably testing keystone directly if that's the case)
 * This way, the consuming app/module can be an embedded node_module and path resolutions will still work
 * (process.cwd() breaks module encapsulation if the consuming app/module is itself a node_module)
 */
var appRoot = (function(_rootPath) {
	var parts = _rootPath.split(path.sep);
	parts.pop(); //get rid of /node_modules from the end of the path
	return parts.join(path.sep);
})(module.parent ? module.parent.paths[0] : module.paths[0]);


var SnowpiGreeter = function() {
	
	/* set the keystone variables
	 * */	 
	keystone.set('allow register',keystone.get('allow register') || true);
	keystone.set('new user can admin',keystone.set('new user can admin') || true);
	
	this._options = {
		greeter: keystone.get('signin url') || '/greeter',
	};
}



SnowpiGreeter.prototype.statics = function() {
	var app = keystone.app;
	console.log('add static',__dirname + "/public");
	//app.use("/snowpi", express.static(__dirname + "/public"));
	app.use( express.static(__dirname + "/public"));
	/*
	var statics = keystone.get('static');
	
	if(statics && statics instanceof Array) {
		
		statics.push(__dirname + "/public")
	
	} else if(statics) {
		
		var _statics = statics;
		statics = [_statics,__dirname + "/public"]
	
	} else {
		
		statics = [__dirname + "/public"]
		
	}
	
	keystone.set('static',statics);
	* */
}
SnowpiGreeter.prototype.add = function(setview) {
	/* add the greeter page
	 * */
	var 	app = keystone.app,
		view = setview || this.get('greeter') || '/greeter',
		snowpi = this;
	
	/* add out static files as an additional directory
	 * */
	snowpi.statics();
	
	app.get(view,
		function(req, res) {
			
			//keystone isnt ready for custom templates so we need to send our own result here
			var templatePath = __dirname + '/templates/views' + view + '.jade';
			
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
				emailText: snowpi.get('email text'),
				usernameText: snowpi.get('username text'),
				passwordText: snowpi.get('password text'),
				confirmText: snowpi.get('confirm text'),
				nameText: snowpi.get('name text'),
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
	app.post('/snowpi-greeter', 
		function(req, res, next) {
			res.apiResponse = function(status) {
				//add the requesting url back to the response
				status.url=req.protocol + '://' + req.get('host') + req.originalUrl; 
				/* you can customize the response here using the status object.  dont overwrite your existing props. */
				
				/* add in the response with json */
				if (req.query.callback)
					res.jsonp(status);
				else
					res.json(status);
			};
			res.apiError = function(key, err, msg, code) {
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
				res.apiResponse({ error: key || 'error', detail: err });
			};
			next();
		},
		function(req, res) {
	
			if (req.user) {
				return res.apiResponse({action:'greeter',command:'login',success:'yes',message:'You are currently signed in.  Do you want to <a href="/keystone/signout">sign out</a>? ',code:200,data:{},redirect:{path:'/keystone',when:20000}});
			}
			
			if (req.method === 'POST') {
				
				console.log('session',req.session)
				if (!keystone.security.csrf.validate(req)) {
					return res.apiResponse({action:'greeter',command:'directions',success:'no',message:'Bad token',code:501,data:{}});
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
						
						return res.apiResponse({action:'greeter',command:'login',success:'no',message:'username and password required',code:401,data:{}});
					}
					
					var onSuccess = function(user) {			
						
						return res.apiResponse({action:'greeter',command:'login',success:'yes',message:'welcome back ' + user.fullname,code:200,data:{person:user},redirect:{path:'/keystone',when:10000}});
					}
					
					var onFail = function() {
						return res.apiResponse({action:'greeter',command:'login',success:'no',message:'valid username and password required',code:401,data:{}});
					}
					
					keystone.session.signin({ email: req.body.username, password: req.body.password }, req, res, onSuccess, onFail);
					
				} else if(req.body.register === yes) { 
					
					if(keystone.get('allow register'))
					{
						async.series([
							
							function(cb) {
								
								if (!req.body.password || !req.body.confirm || !req.body.username) {
									return res.apiResponse({action:'greeter',command:'register',success:'no',message:'please enter a username, password and password again...',code:401,data:{}});
								}
								
								if (req.body.password != req.body.confirm) {
									return res.apiResponse({action:'greeter',command:'register',success:'no',message:'your passwords must match',code:401,data:{}});
								}
								
								return cb();
								
							},
							
							function(cb) {
								console.log('check user');
								keystone.list('User').model.findOne({ email: req.body.username }, function(err, user) {
									
									if (err || user) {
										return res.apiResponse({action:'greeter',command:'register',success:'no',message:'user exists with that username',code:401,data:{}});
									}
									
									return cb();
									
								});
								
							},
							function(cb) {
								console.log('check email');
								keystone.list('User').model.findOne({ realEmail: req.body.email }, function(err, user) {
									
									if (err || user) {
										return res.apiResponse({action:'greeter',command:'register',success:'no',message:'user exists with that email',code:401,data:{}});
									}
									
									return cb();
									
								});
								
							},
							
							function(cb) {
								console.log('add user');
								var splitName = req.body.name.split(' '),
									firstName = splitName[0],
									lastName = splitName[1];
								var userData = {
									email: req.body.username,
									password: req.body.password,
									realEmail: req.body.email,
									name: {
										first: firstName,
										last: lastName,
									},
									isAdmin: keystone.get('new user can admin')
								};
								var User = keystone.list('User').model,
									newUser = new User(userData);
								
								newUser.save(function(err) {
									return cb(err);
								});
							
							}
							
						], function(err){
							
							if (err) 
							{
								return res.apiResponse({action:'greeter',command:'register',success:'no',message:'there was a problem creating the user account',code:401,data:{}});
							}
							var onSuccess = function(user) {
								return res.apiResponse({action:'greeter',command:'register',success:'yes',message:'welcome ' + user.fullname + '.',code:200,data:{person:user},redirect:{path:'/keystone',when:10000}});
							}
							
							var onFail = function(e) {
								return res.apiResponse({action:'greeter',command:'register',success:'yes',message:'User account was created.  Please log in.',code:401,data:{}});
							}
							
							keystone.session.signin({ email: req.body.username, password: req.body.password }, req, res, onSuccess, onFail);
							
						});
					} else {
						return res.apiResponse({action:'greeter',command:'register',success:'no',message:'registration is not allowed at this time.',code:401,data:{}});
					}
					
				} else {
					return res.apiResponse({action:'greeter',command:'directions',success:'no',message:'You are lost.  Try and send a command I understand.',code:501,data:{}});
				}
			
			} else {
				//no return for gets
			}
			
		}
	); //end app.post
}


SnowpiGreeter.prototype.set = function(key,value) {
	
	if(key && !value) return this._options[key];
	
	this._options[key] = value;
	
	return this._options[key];
	
}

SnowpiGreeter.prototype.get = SnowpiGreeter.prototype.set;

var snowpigreeter = module.exports = exports = new SnowpiGreeter();
