# Snowpi Greeter (module only)
### A Keystone signin / registration form (ReactJS)

Built with ReactJS (decent commenting)

```
npm install snowpi-greeter
```

Update your User model (change `email` to `String` and add `realEmail`)
```
email: { type: String, initial: true, required: true, index: true, label: 'username' },
realEmail: { type: Types.Email, initial: true,  index: true, label:'email' },
```

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



The path for the signin page uses `Keystone` settings:
```
//will default to /greeter if not defined

keystone.set('signin url','/greeter'),
```
The form submits to `/snowpi-greeter`

User registration can be toggled with `keystone.set` before calling `greeter.add`:
```
//these are the default values
keystone.set('allow register', true),
keystone.set('new user can admin', false),


```

You can change the default form text values before calling `greeter.add`:

```javascript
greeter.set('username text','Email'),
greeter.set('email text','Username'),
greeter.set('password text','Password'),
greeter.set('confirm text','Confirm'),
greeter.set('name text','Full Name'),
```

Update the registration code to match your User model: 
```
node_modules/snowpi-greeter/index.js
```
 


The client ReactJS file is:
```
node_modules/snowpi_greeter/public/snowpi/js/lib/react/build/greeter.js
``` 

The client jsx is not included.  Get it from [snowpi-greeter](https://github.com/snowkeeper/snowpi-greeter) which also contains the module


