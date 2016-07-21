function logout (req, res) {
	var user = req.user;
	var snowpi = this;
	var keystone = snowpi.keystone;
	
	keystone.callHook(user, 'pre:signout', function (err) {
		if (err) {
			return res.snowpiResponse({action:'greeter',command:'logout',success:'no',message:'Error logging out',code:401,data:{}});
		}
		res.clearCookie('keystone.uid');
		req.user = null;
		req.session.regenerate(function (err) {
			if (err) return res.json({ error: 'session error', detail: err });
			keystone.callHook(user, 'post:signout', function (err) {
				if (err) {
					return res.snowpiResponse({action:'greeter',command:'logout',success:'no',message:'Error logging out.',code:401,data:{}});
				}
				res.redirect(keystone.get('signout redirect') || keystone.get('signin url'));
			});
		});
	});
}

module.exports = logout;
