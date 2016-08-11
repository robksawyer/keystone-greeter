# Keystone Greeter 
### A KeystoneJS signin / registration form (ReactJS)

### Install

```javascript
npm install keystone-greeter

//or add to package.json
"dependencies": {
	"keystone-greeter": "~0.3.3"
}
```

![screenshot](http://i.imgur.com/I0doe6el.png)
![screenshot](http://imgur.com/nyyUJBml.png)
![screenshot](http://imgur.com/aYffqnXl.png)  


The compiled client ReactJS file is located at:
```javascript
node_modules/keystone_greeter/public/snowpi/js/lib/react/build/greeter.js
``` 

The client jsx is included at:  
```javascript
node_modules/keystone_greeter/public/snowpi/js/lib/react/jsx/greeter.js
``` 

### Setup

```javascript
var keystone = require('keystone');
var greeter = require('keystone-greeter');

// add the greeter in your routes file
keystone.set('routes', function(app) {
	
	/**
	* set the 2nd parameter true to add statics without using keystone.set('static').
	* You must do this to run .init in Keystone's route setup.
	*
	* Set to false if you set init right sfter Keystone.init
	* if false we grab the statics with `keystone.get('static')`
	* convert it to an Array and push our static routes on.
	*
	* DEFAULT: false
	*
	* **/
	
	greeter.init({ keystone: keystone }, true);
	
	greeter.add('/greeter');
	
	// change the first login field
	greeter.setField('login', 'text', 'A-username', {
		label: 'username',
		field: 'username',
		//regex: ["^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "gi"],
		model: {
			field: 'email',
			unique: true
		},
		required: true
	});
});


```


### Configuration  

#### Locales   
The locales file will be created on first run.  You can create additional locales without them being overwritten.  Copy the `en.json` file and replace the values.
```javascript
node_modules/keystone_greeter/locales
-- node_modules/keystone_greeter/locales/en.json
``` 

#### Debugging  
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
		field: 'username',
		//regex: ["^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "gi"],
		model: {
			field: 'email',
		},
		required: true
	});
	greeter.setField('register', 'text', 'A-username', {
		label: 'username',
		field: 'username',
		//regex: ["^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", "gi"],
		required: true,
		model: {
			field: 'email',
			unique: true
		},
	});
    
```

It can accept a `modify` **Array** to split a text field into an **Object** for registration:
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

**This will overwrite the built in i18n locales text.  To continue using locales do something similiar:**  
```javascript 
var Text = i18n.__;
i18n.configure({
	locales:['en'],
	directory: __dirname + '/locales'
});
greeter.set('message valid credentials', Text('a valid username and password are required'));
```  
