/**
	Text
 */

var defaults = {
	build: {
		release: '0.3.3',
		name: 'Keystone Greeter',
		text: 'build',
	},
	text: {
		login: 'welcome back ',
		register: 'register new account',
		reset: 'reset your password',
		resetcode: 'apply reset code',
	},//end main
	btns: {
		login: 'login',
		logincurrent: 'current user?',
		register: 'register new account',
		reset: 'reset your password',
		resetpass: 'send reset email',
	},
	logoman: '<span></span>'
	//logoman: '<div class="logoman"><div class="dotdot flip">.</div><div>i</div><div class="dotdot flip">.</div></div>',
};

defaults.home = defaults.text;

module.exports = defaults;

