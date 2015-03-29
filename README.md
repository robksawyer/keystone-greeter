# Keystone Greeter 
### A Keystone signin / registration form (ReactJS)

Built with ReactJS (decent commenting)

[Demo - styled](https://code.snowpi.org/signin) <br />
[Demo - un-styled](https://code.snowpi.org/greeter)


### Install

```
npm install keystone-greeter

//or add to package.json
"dependencies": {
	"keystone-greeter": "~0.2.x"
}
```

You can update the controller if you want to use more than 4 registration fields.
```
node_modules/keystone-greeter/index.js
```
The compiled client ReactJS file is located at:
```
node_modules/keystone_greeter/public/snowpi/js/lib/react/build/greeter.js
``` 

The client jsx is now included at:  
```
node_modules/keystone_greeter/public/snowpi/js/lib/react/jsx/greeter.js
``` 

### Setup

In your Keystone (v. 0.2.27 & up) start file 

```
var keystone = require('keystone');
var greeter = require('keystone-greeter');

//replace or update keystone.start() with this

keystone.start({
	onMount: function() {
		
		/* include our greeter pages
		 * */
		greeter.add();
	}
});

```

**Note:**
if you have Keystone < 0.2.27 you must add the static files before `keystone.start()`
```
var greeter = require('keystone-greeter');

greeter.statics()

//replace or update keystone.start() with this

keystone.start({
	onMount: function() {
		
		/* include our greeter pages
		 * */
		greeter.add();
	}
});

```
**You will receive 404 errors if you do not do this and you are less than 0.2.27.**


###Configuration

debug
```
greeter.set('debug',false)
```

#####All items need to be set before calling `greeter.add`:

The form submits to `/keystone-greeter`.  This is a static value.

The User Model defaults to `keystone.get('user model')`. Override with:
```
greeter.set('user model','myUsers')
```

The greeter uri defaults to `/greeter` and can be set 3 ways in overriding order:
```
keystone.set('sign url','/greeter') 

greeter.set('greeter','/greeter') //this overrides keystone.set

//set the page on add
greeter.add('/greeter') //this overrides everything
```

The success redirect page is inherited from Keystone
```
//set the redirect 
keystone.set('signin redirect','/')
```
Set the redirect timer for successful login or registration in milliseconds
```
greeter.set('redirect timer',0) //default = 5000 (5 seconds)
```
####Style Sheets
Control the stylesheets 

```javascript
greeter.set('greeter style',true), // include default css
greeter.set('keystone style',true), // include /styles/site.min.css
greeter.set('custom style','/styles/custom.css'), // include custom css
```
The default is to include default greeter css first and `/styles/site.min.css` second so that your css automatically overrides the greeter out of the box.  Custom styles is false unless explicitly set.

####Registration


User registration can be toggled before calling `greeter.add`:
```
//these are the default values
greeter.set('allow register', true),
greeter.set('new user can admin', false),

```

Assign the form fields to your model fields. 

The first signin form field is  **username**. We will use this to check signins.
```
//these are the default values
	greeter.set('field username', 'email');
	greeter.set('field password', 'password');
	greeter.set('field name', ['name','first','last']);
    
```

There is a 4th input available if you use usernames instead of emails to login.  
```
//this would change to using a true username
	greeter.set('field username', 'email');
	greeter.set('field password', 'password');
	greeter.set('field name', ['name','first','last']);
	greeter.set('field email', 'realEmail');
    
// model changes -- email to String
email: { type: String, initial: true, required: true, index: true, label: 'username' },
realEmail: { type: Types.Email, initial: true,  index: true, label:'email' },

```
*Notice that `label` in the field definitions keeps Keystone UI the same

The **` name `** form field is a special case. 
It can be a `String` or an `Array`.  An `Array` will be used to form a new `Object`:
```
greeter.set('field name', ['name','first','last'])

```
wll create
```
var splitName = req.body.name.split(' ');

... other stuff ...

userDoc.name = {
	first: 'before_first_space',
    last:'after first space'
}
```
A two element `Array` creates an object without the `split()`
```
greeter.set('field name', ['person','name'])
```
wll create
```
userDoc.person = {
	name: req.body.name
}
```
A simple string or single element `Array` are the same
```
greeter.set('field name', ['name']);
greeter.set('field name', 'name');
```
and create
```
userDoc.name = req.body.name
```

####Form Text
Change the default form labels to match your model 
```javascript
	greeter.set('username label','This is the login input and first register input'),
	greeter.set('password label','Password'),
	greeter.set('confirm label','Confirm'),
	greeter.set('info label','Providing a valid email is the only way to reset your password.'),
	greeter.set('name label','Full Name'),
	greeter.set('email label','Remember this is not the login input'),
	
	//change the logo in the header
	greeter.set('logoman','<span></span>'),
	
```

####Return Messages
Change the return message contents
```
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
