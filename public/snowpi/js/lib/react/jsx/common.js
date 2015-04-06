var React = require('react');
var Text = JSON.parse(require('text'));
var _ = require('lodash');

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
		if(v.required) {
			ret.valid[v.field] = false;
		}
		if(v.attach) {
			ret.form[v.attach.field] = v._name + '_attach';
			if(v.required) {
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
		var sorted_list = _(this.props.inputs).keys().sort().map(function (key) {
			var value = _this.props.inputs[key];
			form.push(input(key,value,_this.props.context));
		}).value();
		
		return form.length === 0 ? (<span />) : (<div>{form}</div>);
	}
});

module.exports.FormInputOnChange = function(event, form) {
    // get the current value
    var change = {
		valid: _.clone(this.state.valid),
		//form: _.clone(this.state.form)
	};
	
	var valid = false;
	var parent = false;
	
	// is this attached
	if(event.target.dataset.dependson !== 'false') {
		parent =  form[event.target.dataset.dependson];
		var input = parent.attach;
		input.required = parent.required;
		parent.DOM = document.getElementById(parent._name);
		//console.log(event.target.dataset.dependson);
	} else {
		var input = form[event.target.id];
	}
	
	//console.log('onChange',  event.target.id, input, form , event.target.dataset);
	// set the state value
	//change.form[input.field] = event.target.value;
	
	// if required run tests
	if(input.required) {	
		if(_.isArray(input.regex)) {
			var rx = new RegExp(input.regex[0],input.regex[1]);
			valid = rx.test(event.target.value);
		} else {
			valid = event.target.value !== '';
		}
		if(valid && parent && parent.type === 'password') {
			if(event.target.value === '' || event.target.value !== parent.DOM.value) {
				valid = false;
			} else {
				valid = true;
			}
		}
		if(valid && parent && parent.type === 'select') {
			if(event.target.value === '' || parent.DOM.value === '') {
				valid = false;
			} else {
				valid = true;
			}
		}
		if(valid) {
			change.valid[input.field] = true;
		} else {
			change.valid[input.field] = false;
		}
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
		var clas = validate_class(options, context);
		var div = (
			<div key={name}>
			<div className={clas}>		
				<span className="input-group-addon"  dangerouslySetInnerHTML={{__html: options.label || ''}} /> 
				<input type="text" id={options._name}  refs={options._name} className="form-control" data-dependson={dependsOn}  onChange={context.onChange}   />
			</div>
			<div className="clearfix" ><br /></div>
			</div>
		);
		
		return div;
		
	} else if(type === 'password') {
		/* confirm password if requested */
		var cfm;
		if(_.isObject(options.attach) && options.attach.label && options.attach.field) {
			options.attach.required = options.required;
			var class2 = validate_class(options.attach, context);
			var dependsOn = options.attach.dependsOn ? options.attach.dependsOn : false;
			var cfm = (
				<div key={name}>
				<div className={class2}>		
					<span className="input-group-addon"  dangerouslySetInnerHTML={{__html: options.attach.label || ''}} /> 
					<input type="password" id={options._name + '_attach'} className="form-control" data-dependson={dependsOn}  data-parent={options._name}  onChange={context.onChange}    />
				</div>
				<div className="clearfix" ><br /></div>
				</div>
			);
		}
		// add password field
		var clas = validate_class(options, context);
		var dependsOn = options.dependsOn ? options.dependsOn : false;
		var div = (
			<div key={name}>
			<div className={clas}>
				<span className="input-group-addon"  dangerouslySetInnerHTML={{__html: options.label || ''}} /> 
				<input type="password" id={options._name} className="form-control" data-dependson={dependsOn}  onChange={context.onChange}  />
				
			</div>
			<div className="clearfix" ><br /></div>
			{cfm}
			</div>
		);
		
		return (div);
		
	} else if(type === 'select') {
		
		var other, opts;
		// check any validation
		var clas = validate_class(options, context);
		
		// show a text box in the same div for alternate values or question/answer format 
		if(_.isObject(options.attach)) {
			options.attach.required = options.required;
			clas = validate_class(options.attach, context);
			var dependsOn2 = options.attach.dependsOn ? options.attach.dependsOn : false;
			other = (<input type="text" id={options._name + '_attach'} placeholder={options.attach.placeholder} className="form-control"   data-parent={options._name} data-dependson={dependsOn2}  onChange={context.onChange}  />);
		}
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
		var div = (
			<div  key={name}>
				<div className={clas}>
					<span className="input-group-addon"  dangerouslySetInnerHTML={{__html: options.label || ''}} /> 
					<select id={options._name} className="form-control" data-dependson={dependsOn}  onChange={context.onChange}  >
						{opts}
					</select>
					{other}
				</div>
			</div>
		);
		
		return div;
		
	} else if(type === 'header') {
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
	}
	
}
