# Keystone Greeter 
### A KeystoneJS signin / registration form (ReactJS)

### Install

```javascript
npm install keystone-greeter

//or add to package.json
"dependencies": {
	"keystone-greeter": "~0.3.1"
}
```

You can update the controller if you want to use more than 4 registration fields.
```javascript
node_modules/keystone-greeter/index.js
```
The compiled client ReactJS file is located at:
```javascript
node_modules/keystone_greeter/public/snowpi/js/lib/react/build/greeter.js
``` 

The client jsx is now included at:  
```javascript
node_modules/keystone_greeter/public/snowpi/js/lib/react/jsx/greeter.js
``` 

### Setup

```javascript
var keystone = require('keystone');
var greeter = require('keystone-greeter');

// add the greeter in your routes file
keystone.set('routes', function(app) {
	greeter.init({ keystone: keystone }, true).add('/greeter');
	
	// change the first login field
	greeter.setField('login', 'text', 'A-username', {
		label: 'username',
		field: 'email',
		//regex: ["^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "gi"],
		model: {
			field: 'email',
			unique: false
		},
		required: true
	});
});


```


### Configuration

debug
```javascript
greeter.set('debug', true);
```

##### Most items need to be set before calling `greeter.add`:

The User Model defaults to `keystone.get('user model')`. Override with:
```javascript
greeter.set('user model','myUsers')
```

The greeter uri defaults to `/greeter` and can be set 3 ways in overriding order:
```javascript
keystone.set('sign url','/greeter') 

greeter.set('greeter','/greeter') //this overrides keystone.set

//set the page on add
greeter.add('/greeter') //this overrides everything
```

The success redirect page is inherited from Keystone
```javascript
//set the redirect 
keystone.set('signin redirect','/')
```
Set the redirect timer for successful login or registration in milliseconds
```javascript
greeter.set('redirect timer',0) //default = 5000 (5 seconds)
```
#### Style Sheets
Control the stylesheets 

```javascript
greeter.set('greeter style',true), // include default css
greeter.set('keystone style',true), // include /styles/site.min.css
greeter.set('custom style','/styles/custom.css'), // include custom css
```
The default is to include default greeter css first and `/styles/site.min.css` second so that your css automatically overrides the greeter out of the box.  Custom styles is false unless explicitly set.

#### Registration


User registration can be toggled before calling `greeter.add`:
```javascript
//these are the default values
greeter.set('allow register', true),
greeter.set('new user can admin', false),

```

#### Default Fields
```
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
	placeholder: 'first last'
});
```

#### Add or change fields  
The order is determined by the third parameter.  

The first signin form field is  **username**. We will use this to check signins.
```javascript
	greeter.setField('login', 'text', 'A-username', {
		label: 'username',
		field: 'email',
		//regex: ["^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "gi"],
		model: {
			field: 'email',
			unique: false
		},
		required: true
	});
    
```

The **` name `** form field is a special case. 
It can accept a `modify` **Array**:
```javascript
this.setField('register', 'text','D-name', {
	label: Text('name'),
	'field': 'name',
	modify: ['first','last'],
	modifyParameter: ' ',
	placeholder: 'first last'
});
```
code  
```javascript
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
```

#### Return Messages
Change the return message contents
```javascript
	greeter.set('message valid credentials', 'a valid username and password are required');
	greeter.set('message welcome', 'Welcome back {user}. ');
	greeter.set('message welcome login', 'Welcome back.  Please signin');
	greeter.set('message registration closed', 'registration is currently closed');
	greeter.set('message current user', 'You are currently signed in.  Do you want to <a href="/keystone/signout">sign out</a>? ');
	greeter.set('message bad token', 'bad request token.  <a href="javascript:location.reload()">refresh</a>');
	greeter.set('message username taken', 'the username requested is not available');
	greeter.set('message failed register', 'there was a problem creating your new account.');
	greeter.set('message register all fields', 'please fill in username, password and password again...');
```
