/**
	Text
 */

var Text = {
	build: {
		release: '0.1.0',
		name: 'Inqusive Website',
		text: 'build',
	},
	
	screenA: {
		text: 'Release',
		modal: {
			btnA: {
				text: 'Play Ball',
				confirm: 'Really STOP the countdown and go back LIVE?',
			},
			btnB: {
				text: 'Continue Timing',
				
			},
		}
	},
	screenB: {
		text: 'Hold',
		modal: {
			btnA: {
				text: 'Hold',
			},
			btnB: {
				text: 'Live',
			},
			btnC: {
				text: 'Challenge',
			},
			btnD: {
				text: 'Release to Break',
			},
		}
	},
	screenC: {
		text: 'Challenge',
		modal: {
			btnA: {
				text: 'Continue Challenge',
			},
			btnB: {
				text: 'Play Ball',
			},
			btnC: {
				text: 'Release to Break',
			},
			
		}
	},  
	home: {
		username: 'username',
		password: 'password',
		confirm:  '&nbsp; ... again',
		email: 'email',
		name: 'name',
		login: 'welcome back ',
		register: 'register new account',
		emailnotice: 'A name and email are optional.  Supplying an email is the only way to reset a lost password',
		btns: {
			login: 'login',
			logincurrent: 'current user?',
			register: 'register new account',
		}
	},//end main
	logoman: '<div class="logoman"><div class="dotdot flip">.</div><div>i</div><div class="dotdot flip">.</div></div>',
	init: function() { return this },
}.init();

