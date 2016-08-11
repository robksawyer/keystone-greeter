var React = require('react');
var Text = require('text');

var SnowpiResetPassword = React.createClass({displayName: "SnowpiResetPassword",
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	},
	render: function() {
			return (React.createElement("form", {ref: "signin", className: "signin-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.reset, " ", React.createElement(SnowpiMan, null)), 
				showflashmessage, 
					
					React.createElement("div", {className: this.state.username === '' ? 'input-group has-error':'input-group'}, 
						
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.resetemail), 
						React.createElement("input", {type: "text", ref: "resetemail", className: "form-control", valueLink: this.linkState('resetemail'), id: "Snowpi-resetemail"})
				
					), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 "}, React.createElement(BootstrapButton, {role: "button", onClick: this.resetemail, ref: "resetbutton", bsStyle: "info", disabled: (this.state.email === '' ) ? true : false, "data-loading-text": "Checking..."}, "  ", Text.home.btns.resetpass, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {onClick: this.props.changeReset, bsStyle: "default"}, "  ", Text.home.btns.logincurrent, " ")), 
					React.createElement("div", {className: "clearfix"})
			));
			
	},
	resetemail: function() {
		/* validation occurs as input is received 
		 * this method should only be avialable if
		 * all validation is already met so just run
		 * */
		var mydata = {reset:'yes'};
		this.setState({response:no});
		mydata.email = this.refs.resetemail.getDOMNode().value.trim()
		mydata[isKey] = isMe;
		var btn = $(this.refs.resetbutton.getDOMNode())
		btn.button('loading')
		$.ajax({
			url: '/greeter-reset-password',
			dataType: 'json',
			method: 'post',
			data: mydata,
			success: function(data) {
							
				function message() {
					data.message = 'Success';
				}
				/* flash messages are shown with response : yes
				 * */	
				this.setState({response:yes,data:data,resetform:no});
				
			}.bind(this),
			
			error: function(xhr, status, err) {
				console.log(this.props.url, status, err.toString());
				this.setState({response:yes,resetform:no,data: {status:status,err:err.toString()} });
			}.bind(this)
		
		/* always reset our buttons
		* */	
		}).always(function () {
			
			btn.button('reset');
		});
		
	}
});

modules.export = SnowpiResetPassword;
