# Snowpi Greeter (module only)
### A Keystone signin / registration form (ReactJS)

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
greeter.statics()

```
You will receive a 404 error if you do not do this.

Built with ReactJS (decent commenting)

The path for the signin page and User registration can be toggled with `keystone.set` before calling `greeter.add`:
```
//these are the default values
keystone.set('allow register', true),
keystone.set('new user can admin', false),
keystone.set('signin url','/greeter'),

```

Change the default text values  before calling `greeter.add`:

```javascript
greeter.set('username text','Email'),
greeter.set('email text','Username'),
greeter.set('password text','Password'),
greeter.set('confirm text','Confirm'),
greeter.set('name text','Full Name'),
```

Update the registration code in `node_modules/snowpi-greeter/index.js` to match your `User` model.



The client jsx is not included.  Get it from [snowpi-greeter](https://github.com/snowkeeper/snowpi-greeter) which also contains the module

`node_modules/snowpi_greeter/public/snowpi/js/lib/react/build/greeter.js` is the javascript file included by the client.
