var React = require('react');
//var Text = JSON.parse(require('text'));
var Common = require('../common.js');
var ReactBootstrap = require('react-bootstrap');
var BootstrapButton = ReactBootstrap.Button;
var yes = 'yes', no = 'no';
//var yes = true, no = false;

var ResetPassword = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return this.setFormState();
	}, 
	componentWillReceiveProps: function() {
		this.setState(this.setFormState(this.state.valid));
	},
	setFormState: function(valid) {
		var ret = Common.setFormState(Text.reset, valid);
		ret.name = 'reset';
		return ret;
	},
	handleSubmit: function(e) {
		e.preventDefault();
		if(Common.showButton(this.state.valid) === false) {
			this.resetemail();
		}
	},
	onChange: function(e) {
		Common.FormInputOnChange.call(this, e, Text.reset);
	},
	render: function() {
			return (<form  ref='signin'  className="signin-form"  onSubmit={this.handleSubmit} >
				<h2>{Text.home.reset} <Common.GMan /></h2>
				{this.props.flash}
					
					<Common.Form inputs={Text.reset} context={this} />
					
					<div className="clearfix" ><br /></div>
					
					<div className="col-xs-6 "  ><BootstrapButton role="button" onClick={this.resetemail} ref="resetbutton" bsStyle='info' disabled={Common.showButton(this.state.valid)}  data-loading-text="Checking..." >  {Text.btns.resetemail} </BootstrapButton></div> 
					
					<div className="col-xs-6 " style={{textAlign:'right'}} ><BootstrapButton onClick={this.props.changeReset}  bsStyle='default'>  {Text.btns.logincurrent} </BootstrapButton></div> 
					<div className="clearfix" ></div>
			</form>);
			
	},
	resetemail: function() {
		/* validation occurs as input is received 
		 * this method should only be avialable if
		 * all validation is already met so just run
		 * */
		var mydata = {reset:'yes'};
		console.log(this.state.form);
		_.each(this.state.form, function(v,k) {
				var el = document.getElementById(v);
				mydata[k] = el.value;
		},this);
		mydata[isKey] = isMe;
		var btn = $(this.refs.resetbutton.getDOMNode())
		btn.button('loading')
		$.ajax({
			url: Text.resetemail,
			dataType: 'json',
			method: 'post',
			data: mydata,
			success: function(data) {	
				function message() {
					data.message = 'Success';
				}
				/* flash messages are shown with response : yes
				 * */	
				this.props.context.setState({response:yes,data:data,resetform:no,resetcode:yes});
				
			}.bind(this),
			
			error: function(xhr, status, err) {
				console.log(this.props.url, status, err.toString());
				this.props.context.setState({response:yes,resetform:no,data: {status:status,err:err.toString()} });
			}.bind(this)
		
		/* always reset our buttons
		* */	
		}).always(function () {
			
			btn.button('reset');
		});
		
	}
});

module.exports = ResetPassword;
