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
	
	this._options = {}
	/* set the module variables
	 * */	 
	this.set('allow register',true);
	this.set('new user can admin',false);
	
	this.set('greeter',keystone.get('signin url') || '/greeter');
	this.set('redirect timer',5000);
	
	this.set('greeter style',true);
	this.set('keystone style',true);
	
	this.set('field username', 'email');
	this.set('field password', 'password');
	this.set('field name', ['name','first','last']);
	this.set('field email', false);
	
}



SnowpiGreeter.prototype.statics = function() {
	var app = keystone.app;
	app.use( express.static(__dirname + "/public"));
	/*
	 * this was handy but we hit the keystone process too late to use it
	 * 
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
			
			//send our own result here
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
				emailText: snowpi.get('email label'),
				usernameText: snowpi.get('username label'),
				passwordText: snowpi.get('password label'),
				confirmText: snowpi.get('confirm label'),
				nameText: snowpi.get('name label'),
				infoText: snowpi.get('info label'),
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
	app.post('/snowpi-greeter', 
		publicAPI, //middleware to add api response
		function(req, res) {
	
			if (req.user) {
				return res.snowpiResponse({action:'greeter',command:'login',success:'yes',message:'You are currently signed in.  Do you want to <a href="/keystone/signout">sign out</a>? ',code:200,data:{},redirect:{path:keystone.get('signin redirect'),when:20000}});
			}
			
			if (req.method === 'POST') {
				
				
				if (!keystone.security.csrf.validate(req)) {
					return res.snowpiResponse({action:'greeter',command:'directions',success:'no',message:'Bad token',code:501,data:{}});
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
						
						return res.snowpiResponse({action:'greeter',command:'login',success:'no',message:'username and password required',code:401,data:{}});
					}
					
					var onSuccess = function(user) {			
						
						return res.snowpiResponse({action:'greeter',command:'login',success:'yes',message:'welcome back ' + user.fullname,code:200,data:{person:user},redirect:{path:keystone.get('signin redirect'),when:snowpi.get('redirect timer')}});
					}
					
					var onFail = function() {
						return res.snowpiResponse({action:'greeter',command:'login',success:'no',message:'valid username and password required',code:401,data:{}});
					}
					
					keystone.session.signin({ email: req.body.username, password: req.body.password }, req, res, onSuccess, onFail);
					
				} else if(req.body.register === yes) { 
					console.log('allow register',snowpi.get('allow register'))
					if(snowpi.get('allow register'))
					{
						async.series([
							
							function(cb) {
								
								if (!req.body.password || !req.body.confirm || !req.body.username) {
									return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:'please enter a username, password and password again...',code:401,data:{}});
								}
								
								if (req.body.password != req.body.confirm) {
									return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:'your passwords must match',code:401,data:{}});
								}
								
								return cb();
								
							},
							
							function(cb) {
								console.log('check user');
								keystone.list('User').model.findOne({ email: req.body.username }, function(err, user) {
									
									if (err || user) {
										return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:'user exists with that username',code:401,data:{}});
									}
									
									return cb();
									
								});
								
							},
							function(cb) {
								console.log('check email');
								keystone.list('User').model.findOne({ realEmail: req.body.email }, function(err, user) {
									
									if (err || user) {
										return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:'user exists with that email',code:401,data:{}});
									}
									
									return cb();
									
								});
								
							},
							
							function(cb) {
								console.log('add user');
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
												cname+=' ' + splitName[i]
											}
											
										} else {
											cname = splitName[1]
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
									userData[snowpi.get('form username')] = req.body.username
								if(snowpi.get('field password'))
									userData[snowpi.get('form password')] = req.body.password
								if(snowpi.get('field email'))
									userData[snowpi.get('field email')] = req.body.email
								userData.isAdmin = snowpi.get('new user can admin')
								
								var User = keystone.list('User').model,
									newUser = new User(userData);
								
								newUser.save(function(err) {
									return cb(err);
								});
							
							}
							
						], function(err){
							
							if (err) 
							{
								return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:'there was a problem creating the user account',code:401,data:{}});
							}
							var onSuccess = function(user) {
								return res.snowpiResponse({action:'greeter',command:'register',success:'yes',message:'welcome ' + user.fullname + '.',code:200,data:{person:user},redirect:{path:keystone.get('signin redirect'),when:snowpi.get('redirect timer')}});
							}
							
							var onFail = function(e) {
								return res.snowpiResponse({action:'greeter',command:'register',success:'yes',message:'User account was created.  Please log in.',code:401,data:{}});
							}
							
							keystone.session.signin({ email: req.body.username, password: req.body.password }, req, res, onSuccess, onFail);
							
						});
					} else {
						return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:'registration is not allowed at this time.',code:401,data:{}});
					}
					
				} else {
					return res.snowpiResponse({action:'greeter',command:'directions',success:'no',message:'You are lost.  Try and send a command I understand.',code:501,data:{}});
				}
			
			} else {
				//no truth for gets, fuck gets
				return false;
			}
			
		}
	); //end app.post
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
