var React = require('react');
var Text = require('text');

var SnowpiRegister = React.createClass({displayName: "SnowpiRegister",
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	},
	render: function() {
		var securityQuestions = Text.registerSecurityQuestions.map(function(val) {
			var options = val.questions.map(function(op, key) {
				return (
					React.createElement("option", {key: key, value: op}, op)
				);
			});
			return (
				React.createElement("div", {className: "input-group", key: val.name}, 
					React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: val.label || ''}}), 
					React.createElement("select", {ref: val.field + '_select', className: "form-control"}, 
						options
					), 
					React.createElement("input", {type: "text", ref: val.field, placeholder: val.placeholder || Text.home.securityPlaceholder, className: "form-control", valueLink: this.linkState(val.field)})
				)
			);
		}.bind(this));
		
		if(securityQuestions.length === 0) {
			var questions = '';
		} else {
			var questions = (
				React.createElement("div", null, 
				React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
				React.createElement("div", {className: "form-group"}, 
					   
					React.createElement("div", {className: "col-sm-12"}, 
						React.createElement("p", {className: "form-control-static"}, Text.home.securityHeader)
					)
				), 
				React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
				securityQuestions
				)
			);
		}
			return (React.createElement("form", {ref: "signin", className: "signin-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.register, " ", React.createElement(SnowpiMan, null)), 
				showflashmessage, 
					
					React.createElement("div", {className: this.state.username === '' ? "input-group has-error":"input-group"}, 
						
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.username.label), 
						React.createElement("input", {type: "text", ref: "username", className: "form-control", valueLink: this.linkState('username'), id: "Snowpi-username"})
				
					), 
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: (this.state.confirm === '' || this.state.password === '' || this.state.confirm !== this.state.password ) ? 'input-group has-error':'input-group'}, 
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.password.label), 
						React.createElement("input", {type: "password", ref: "password", className: "form-control", valueLink: this.linkState('password'), id: "Snowpi-givepass"})
						
					), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: (this.state.confirm === '' || this.state.password === '' || this.state.confirm !== this.state.password ) ? 'input-group has-error':'input-group'}, 
						React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: Text.home.confirm.label || ''}}), 
						React.createElement("input", {type: "password", ref: "confirm", className: "form-control", valueLink: this.linkState('confirm'), id: "Snowpi-confirm"})
						
					), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: "form-group"}, 
					   
					    React.createElement("div", {className: "col-sm-12"}, 
					      React.createElement("p", {className: "form-control-static"}, Text.home.emailnotice)
					    )
					 ), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: "input-group "}, 
						
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.name), 
						React.createElement("input", {type: "text", ref: "name", className: "form-control", defaultValue: "", id: "Snowpi-name"})
				
					), 
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: "input-group"}, 
						React.createElement("span", {className: "input-group-addon", dangerouslySetInnerHTML: {__html: Text.home.email || ''}}), 
						React.createElement("input", {type: "email", ref: "email", className: "form-control", defaultValue: "", id: "Snowpi-email"})
						
					), 
					
					questions, 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'left'}}, React.createElement(BootstrapButton, {onClick: this.props.register, ref: "registerbutton", "data-loading-text": "Registering...", role: "button", bsStyle: "warning", className: "btn  btn-warning", disabled: (this.state.username === '' || this.state.password === '' || this.state.confirm === '' || this.state.confirm !== this.state.password) ? true : false}, "  ", Text.home.btns.register, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {role: "button", onClick: this.props.showregister, className: "btn btn-default"}, "  ", Text.home.btns.logincurrent, " ")), 
					React.createElement("div", {className: "clearfix"})
			));
			
	}
});

module.exports = SnowpiRegister;
