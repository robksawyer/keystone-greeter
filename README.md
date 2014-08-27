# Snowpi Greeter (module only)
### A Keystone signin / registration form (ReactJS)

Built with ReactJS (decent commenting)

### Install

```
npm install snowpi-greeter
```

### Conform

We use like to use username for signin instead of email. <br />
Update your User model (change `email` to `String` and add `realEmail`)
```
email: { type: String, initial: true, required: true, index: true, label: 'username' },
realEmail: { type: Types.Email, initial: true,  index: true, label:'email' },
```
Notice the label field.  Your Keystone admin UI will still show the correct labels.

### or
Set username to off
```
greeter.set('use username',false)
```
Set the form text.  See below.


The username field remains in the form. You can remove it yourself or use it for another field.  Remember to update the controller if you want to use a new field.
```
node_modules/snowpi-greeter/index.js
```

The compiled client ReactJS file is:
```
node_modules/snowpi_greeter/public/snowpi/js/lib/react/build/greeter.js
``` 

The client jsx is not included.  Get it from [snowpi-greeter](https://github.com/snowkeeper/snowpi-greeter) which also contains the module

### then

In your keystone start file 

```
var greeter = require('snowpi-greeter');

//replace or update keystone.start() with this

keystone.start({
	onMount: function() {
		
		/* include our greeter pages
		 * */
		greeter.add();
	}
});

```

**Note:
If you have Keystone < 0.2.27 you must add the static files before `keystone.start()`
```
var greeter = require('snowpi-greeter');

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
You will receive a 404 error if you do not do this.


###Configuration

The form submits to `/snowpi-greeter`

The greeter page the user can access is set by `Keystone` settings:
```
//will default to /greeter if not defined

keystone.set('signin url','/greeter'),
```


User registration can be toggled with `keystone.set` before calling `greeter.add`:
```
//these are the default values
keystone.set('allow register', true),
keystone.set('new user can admin', false),


```

Control the stylesheets before calling `greeter.add`:

```javascript
greeter.set('greeter style',true), // include default css
greeter.set('keystone style',true), // include /styles/site.min.css
greeter.set('custom style','/styles/custom.css'), // include custom css
```
The default is to include default greeter css first and `/styles/site.min.css` second so that your css automatically overrides the greeter out of the box.  Custom styles is false unless explicitly set.


You can change the default form text values before calling `greeter.add`:

```javascript
greeter.set('username text','Email'),
greeter.set('email text','Username'),
greeter.set('password text','Password'),
greeter.set('confirm text','Confirm'),
greeter.set('name text','Full Name'),
greeter.set('info text','An email is the only way you ca reset your password.'),
```



