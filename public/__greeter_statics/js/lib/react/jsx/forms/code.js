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
		var ret = Common.setFormState(Text.resetcode, valid);
		ret.name = 'reset';
		ret.resetcode = document.getElementById('G__resetcode__G').value;
		return ret;
	},
	handleSubmit: function(e) {
		e.preventDefault();
		if(this.state.valid) {
			this.resetemail();
		}
	},
	onChange: function(e) {
		Common.FormInputOnChange.call(this, e, Text.resetcode);
	},
	render: function() {
			return (<form  ref='resetcode'  className="code-form"  onSubmit={this.handleSubmit} >
				<h2>{Text.home.resetcode} <Common.GMan /></h2>
				{this.props.flash}
					
					<Common.Form inputs={Text.resetcode} context={this} />
					
					<div className="clearfix" ><br /></div>
					
					<div className="col-xs-6 "  ><BootstrapButton role="button" onClick={this.resetemail} ref="resetbutton" bsStyle='info' disabled={Common.showButton(this.state.valid)}  data-loading-text="Checking..." >  {Text.btns.resetcode} </BootstrapButton></div> 
					
					<div className="col-xs-6 " style={{textAlign:'right'}} ><BootstrapButton onClick={this.props.changeReset}  bsStyle='default'>  {Text.btns.logincurrent} </BootstrapButton></div> 
					<div className="clearfix" ></div>
			</form>);
			
	},
	resetemail: function() {
		/* validation occurs as input is received 
		 * this method should only be avialable if
		 * all validation is already met so just run
		 * */
		var mydata = {code:'yes'};
		_.each(this.state.form, function(v,k) {
			if(v.type !== 'header') {
				var el = document.getElementById(v);
				mydata[k] = el.value;
			}
			if(v.attach) {
				var elA = document.getElementById(v + '_attach');
				mydata[v.attach.field] = elA.value;	
			}
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
				this.props.context.setState({response:yes,data:data,resetcode:no});
				
			}.bind(this),
			
			error: function(xhr, status, err) {
				console.log(this.props.url, status, err.toString());
				this.props.context.setState({response:yes,resetform:yes,resetcode:no,data: {status:status,err:err.toString()} });
			}.bind(this)
		
		/* always reset our buttons
		* */	
		}).always(function () {
			btn.button('reset');
		});
		
	}
});

module.exports = ResetPassword;
