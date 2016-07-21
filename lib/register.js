var async = require('async');
var _ = require('lodash');

function register ( req, res) {
	var snowpi = this;
	var keystone = snowpi.keystone;
	var app = keystone.app;
	var snowpi = this;
	var userModel = this.get('user model');
	
	async.series([
							
		function(cb) {
			
			if (!req.body.password || !req.body.confirm || !req.body.email) {
				return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:snowpi.get('message register all fields'),code:401,data:{}});
			}
			
			if (req.body.password != req.body.confirm) {
				return res.snowpiResponse({action:'greeter',command:'register',success:'no',message:snowpi.get('message password match'),code:401,data:{}});
			}
			
			return cb();
			
		},
		
		function(cb) {
			if(snowpi.get('debug')) console.log('check user');
			keystone.list(userModel).model.findOne({ email: req.body.email }, function(err, user) {
				
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
			if(snowpi.get('debug')) console.log('add user');
			/* build the doc from our set variables
			 * */
			
			var userData = {}
																	
			_.each(snowpi.get('form register'), function(v) {
				var value = req.body[v.field];
				if(v.modify) {
					userData[v.field] = modify(value, v);
				} else {
					userData[v.field] = value;
				}
				
			});
			
			function modify(value, modify ) {
				
				if(!value) return false;
				if(!modify.modify) return false;
				
				var save = {};									
				var modifiers = modify.modify;
				var modifyParameter = modify.modifyParameter || ' ';
				
				if(modifiers instanceof Array && modifiers.length > 1) {
					
					var splitName = value.split(' ');
															
					save[modifiers[0]] = splitName[0];
					var cname;
					if(splitName.length > 2) {
						
						for(var i=1;i<=splitName.length;i++) {
							cname+=' ' + (splitName[i] || '');
						}
						
					} else {
						cname = splitName[1] || '';
					}
					save[modifiers[1]] = cname;
				
				} else if(modifiers instanceof Array){
					
					save[modifiers[0]] = req.body.name;
					
				} else if(typeof modifiers === 'string'){
					
					save[modifiers] = req.body.name;
					
				} else {
					
					save = req.body.name;
					
				}
				return save;
			}
			
			userData.isAdmin = snowpi.get('new user can admin')
			
			// security questions
			var sq = snowpi.get('form reset questions');
			if(_.isArray(sq) && sq.length > 0) {
				userData.questions = {};
				sq.forEach(function (val) {
					userData.questions[val.field] = req.body[val.field + '_select']
					userData.questions[val.answer] = req.body[val.field]
				});
			}
			
			var User = keystone.list(userModel).model;
			var newUser = new User(userData);
			if(snowpi.get('debug')) {
				console.log('new user set to save',newUser,userData,req.body);
			}
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
		
		snowpi.login( req, res );
		
	});
}

module.exports = register;
