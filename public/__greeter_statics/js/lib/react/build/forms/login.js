var React = require('react');
var Text = require('text');

var SnowpiLogin = React.createClass({displayName: "SnowpiLogin",
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		
	},
	handleSubmit: function(e) {
		return e.preventDefault();
	},
	render: function() {
			return (React.createElement("form", {ref: "signin", className: "signin-form", onSubmit: this.handleSubmit}, 
				React.createElement("h2", null, Text.home.login, " ", React.createElement(SnowpiMan, null)), 
				showflashmessage, 
					
					React.createElement("div", {className: this.state.username === '' ? 'input-group has-error':'input-group'}, 
						
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.username), 
						React.createElement("input", {type: "text", ref: "username", className: "form-control", valueLink: this.linkState('username'), id: "Snowpi-username"})
				
					), 
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					React.createElement("div", {className: this.state.password === '' ? 'input-group has-error':'input-group'}, 
						React.createElement("span", {className: "input-group-addon"}, " ", Text.home.password), 
						React.createElement("input", {type: "password", ref: "password", className: "form-control", valueLink: this.linkState('password'), id: "Snowpi-givepass"})
						
					), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-6 "}, React.createElement(BootstrapButton, {role: "button", onClick: this.login, bsStyle: "info", disabled: (this.state.username === '' || this.state.password === '' ) ? true : false}, "  ", Text.home.btns.login, " ")), 
					
					React.createElement("div", {className: "col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {onClick: this.props.showregister, bsStyle: "warning"}, "  ", Text.home.btns.register, " ")), 
					
					React.createElement("div", {className: "clearfix"}, React.createElement("br", null)), 
					
					React.createElement("div", {className: "col-xs-offset-6 col-xs-6 ", style: {textAlign:'right'}}, React.createElement(BootstrapButton, {role: "button", onClick: this.props.changeReset, bsStyle: "default"}, "  ", Text.home.btns.reset, " ")), 
					
					React.createElement("div", {className: "clearfix"})
			));
			
	},
	login: function() {
		/* same as register but less info sent
		 * you could combine them both if you like less code
		 * */
		var mydata = {login:'yes'};
		this.setState({response:no});
		mydata.username = this.refs.username.getDOMNode().value.trim()
		mydata.password = this.refs.password.getDOMNode().value.trim()
		mydata[isKey] = isMe;
		
		$.ajax({
			url: '/greeter-keystone-relay',
			dataType: 'json',
			method: 'post',
			data: mydata,
			success: function(data) {
				function message() {
					var secs = (data.redirect.when - rrr) / 1000;
					rrr+=1000;
					data.message = data.repeater + '<br />You will be redirected to <a href="' + data.redirect.path + '">' + data.redirect.path.substr(1) + '</a>  ';
					data.message+= secs === 0 ? ' now':' in ' + secs + ' seconds.';
				}
				if(typeof data.redirect === 'object' && data.redirect.when>1000) {
					data.repeater = data.message;
					var rrr = 1000
						_self = this;
					GInterval.redirect = GInterval.setInterval(function() {
						message();
						_self.setState({response:yes,data:data});
					},1000);
					console.log(GInterval.intervals)
					GInterval.timeout = setTimeout(function(){
						GInterval.clearIntervals(GInterval.redirect);
						window.location.href = data.redirect.path;
					},data.redirect.when);
					message()
				}
				else if(typeof data.redirect === 'object' && data.redirect.path){
					window.location.href = data.redirect.path;
				}
				
				this.setState({response:yes,data:data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.log(err, status, err.toString());
				this.setState({response:yes,data: {status:status,err:err.toString()} });
			}.bind(this)
		});		
	}
});

module.exports = SnowpiLogin;
