var React = require('react');
//var Text = JSON.parse(require('text'));
var _ = require('lodash');

var Working = React.createClass({
	getDefaultProps: function() {
		return ({
			divstyle:{
				width: 0,
				height: '100%',
			},
			enabled: false
		});
	},
	
	render: function() {
	    return (
		<div style={this.props.divstyle}  />
	    );
	}
});

module.exports.Working = Working;

/* man component
 * simple example
 * */
var GMan = React.createClass({
	getDefaultProps: function() {
		return ({divstyle:{float:'right',}});
	},
	
	render: function() {
	    return (
		<div style={this.props.divstyle} dangerouslySetInnerHTML={{__html: Text.logoman || ''}} />
	    );
	}
});

module.exports.GMan = GMan;

/* 
 * we use this for the countdown timer before we redirect a logged 
 * in user.  you can disable it 
 * by sending a redirect time of 0
 * */
var GInterval = {
	  intervals: [],
	  setInterval: function() {
		return this.intervals.push(setInterval.apply(null, arguments));
	  },
	  clearIntervals: function(who) {
		who = who - 1;
		if(GInterval.intervals.length === 1) {
			//console.log('clear all intervals',this.intervals)
			GInterval.intervals.map(clearInterval);
			GInterval.intervals = [];
		} else if(who && GInterval.intervals[who]) {
			//console.log('clear intervals',who,this.intervals[who])
			clearInterval(GInterval.intervals[who]);
		} else {
			//console.log('map intervals',this.intervals)
			GInterval.intervals.map(clearInterval);
			GInterval.intervals = [];
		}
	  }
};

module.exports.GInterval = GInterval;

module.exports.showButton = function(inputs) {
	var valid = _.includes(inputs, false);
	//console.log('button', inputs, valid);
	return valid;
}

module.exports.setFormState = function(inputs, valid) {
	var ret = {};
	ret.valid = _.isObject(valid) ? valid : {};
	ret.form = {};
	_.each(inputs, function(v) {
		if(v.type !== 'header') ret.form[v.field] = v._name;
		if(v.required && !ret.valid[v.field]) {
			ret.valid[v.field] = false;
		}
		if(v.attach) {
			ret.form[v.attach.field] = v._name + '_attach';
			if(v.required && !ret.valid[v.attach.field]) {
				ret.valid[v.attach.field] = false;
			}
		}
	});
	return ret;
}

module.exports.Form = React.createClass({
	render: function() {
		var _this = this;
		var form = [];
		// sort out object of form elements and add them to an array
		//console.log(this.props.inputs);
		var sorted_list = _(this.props.inputs).keys().sort().map(function (key) {
			var value = _this.props.inputs[key];
			form.push(container(key, value, _this.props.inputs, _this.props.context));
		}).value();
		
		return form.length === 0 ? (<span />) : (<div>{form}</div>);
	}
});

module.exports.FormInputOnChange = function(event, form) {
    // get the current value
    var change = {
		valid: _.clone(this.state.valid),
	};
	
	var valid = false;
	var parent = false;
	
	// is this attached
	if(event.target.dataset.dependson !== 'false') {
		parent =  form[event.target.dataset.dependson];
		var input = form[event.target.id];
		parent.DOM = document.getElementById(parent._name);
		//console.log(event.target.dataset.dependson);
	} else {
		var input = form[event.target.id];
	}
	
	if(input.required) {	
		if(_.isArray(input.regex)) {
			var rx = new RegExp(input.regex[0],input.regex[1]);
			valid = rx.test(event.target.value);
		} else {
			valid = event.target.value !== '';
		}
		if(valid && parent && parent.type === 'password') {
			if(event.target.value !== '' && event.target.value === parent.DOM.value) {
				valid = true;
			}
		}
		if(valid && parent && parent.type === 'select') {
			if(event.target.value !== '' && parent.DOM.value !== '') {
				valid = true;
			}
		}
		
		change.valid[input.field] = valid;
		
	}
	
	//console.log('change', valid, change);
    this.setState(change);
}


function validate_class(input, context) {
	var valid = context.state.valid;
	if(!input.required) {
		return 'input-group';
	} else {
		if(valid[input.field]) {
			return 'input-group';
		} else {
			return 'input-group has-error';
		}
	}
}


function input(name, options, context) {
	
	if(!_.isObject(options)) {
		return false;
	}
	
	var type = options.type;
	var dependsOn = options.dependsOn ? options.dependsOn : false;
	
	if(type === 'text') {
		return (
			<input type="text" id={options._name}  refs={options._name} className="form-control" data-dependson={dependsOn}  onChange={context.onChange}   />
		);
		
	} else if(type === 'password') {
		// add password field
		var dependsOn = options.dependsOn ? options.dependsOn : false;
		return ( 
			<input type="password" id={options._name} className="form-control" data-dependson={dependsOn}  onChange={context.onChange}  />
		);
		
	} else if(type === 'select') {
		
		var other, opts;
		// build the options list
		if(_.isArray(options.options)) {
			opts = options.options.map(function(op) {
				if(_.isString(op)) {
					op = {
						label:op,
						value:op
					}
				}
				return ( 
					<option key={op.label} value={op.value || op.label}>{op.label}</option>
				);
			});
		}
		var dependsOn = options.dependsOn ? options.dependsOn : false;
		return (
			<select id={options._name} className="form-control" data-dependson={dependsOn}  onChange={context.onChange}  >
				{opts}
			</select>
		);
		
	} 
	
}

function container(name, options, inputs, context) {
	
	if(!_.isObject(options)) {
		return false;
	}
	if(options.attached) {
		return false;
	}
	
	var type = options.type;
	
	if(type === 'header') {
		return (
			<div key={name}>
				<div className="clearfix" ><br /></div>
				<div className="form-group">
					<div className="col-sm-12">
						<p className="form-control-static" dangerouslySetInnerHTML={{__html: options.label || ''}} />
					</div>
				</div>
				<div className="clearfix" ><br /></div>
			</div>
		);	
		
	} else {
		var theinput = input(name, options, context);
		var attached = false;
		if(inputs[name + '_attach']) {
			attached = input(name + '_attach', inputs[name + '_attach'], context);
		}
		
		var clas = validate_class(options, context);

		return (
			<div key={name}>
			<div className={clas}>		
				<span className="input-group-addon"  dangerouslySetInnerHTML={{__html: options.label || ''}} /> 
				{theinput}
				{attached}
			</div>
			<div className="clearfix" ><br /></div>
			</div>
		);
	}
}
