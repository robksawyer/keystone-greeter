function login ( req, res) {
	var snowpi = this;
	var keystone = snowpi.keystone;
	var utils = keystone.utils;
	
	if (!req.body.email || !req.body.password) {
		return res.status(401).json({ error: 'email and password required' });
	}
	var User = keystone.list(keystone.get('user model'));
	var emailRegExp = new RegExp('^' + utils.escapeRegExp(req.body.email) + '$', 'i');
	User.model.findOne({ email: emailRegExp }).exec(function (err, user) {
		if (user) {
			keystone.callHook(user, 'pre:signin', function (err) {
				if (err) {
					return res.snowpiResponse({action:'greeter',command:'login',success:'no',message:snowpi.get('message valid credentials'),code:401,data:{}});
				}
				user._.password.compare(req.body.password, function (err, isMatch) {
					if (isMatch) {
						keystone.session.signinWithUser(user, req, res, function () {
							keystone.callHook(user, 'post:signin', function (err) {
								if (err) return res.snowpiResponse({action:'greeter',command:'login',success:'no',message: snowpi.get('message valid credentials'),code:401,data:{}});
								return res.snowpiResponse({action:'greeter',command:'login',success:'yes',message: snowpi.get('message welcome').replace('{user}',user.name.full),code:200,data:{person:user},redirect:{path:user.isAdmin ? '/' + keystone.get('admin path') : keystone.get('signin redirect'),when:snowpi.get('redirect timer')}});
							});
						});
					} else if (err) {
						return res.snowpiResponse({action:'greeter',command:'login',success:'no',message:snowpi.get('message valid credentials'),code:401,data:{}});
					} else {
						return res.snowpiResponse({action:'greeter',command:'login',success:'no',message:snowpi.get('message valid credentials'),code:401,data:{}});
					}
				});
			});
		} else if (err) {
			return res.snowpiResponse({action:'greeter',command:'login',success:'no',message:snowpi.get('message valid credentials'),code:401,data:{}});
		} else {
			return res.snowpiResponse({action:'greeter',command:'login',success:'no',message:snowpi.get('message valid credentials'),code:401,data:{}});
		}
	});
}

module.exports = login;
