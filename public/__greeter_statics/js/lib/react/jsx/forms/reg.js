var React = require('react');
//var Text = JSON.parse(require('text'));
var Common = require('../common.js');
var GInterval = Common.GInterval;
var _ = require('lodash');
var ReactBootstrap = require('react-bootstrap');
var BootstrapButton = ReactBootstrap.Button;
var yes = 'yes', no = 'no';
//var yes = true, no = false;

var RR = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return this.setFormState();
	},
	componentWillReceiveProps: function() {
		this.setState(this.setFormState(this.state.valid));
	},
	setFormState: function(valid) {
		var ret = Common.setFormState(Text.register, valid);
		ret.name = 'register';
		ret.working =  false;
		return ret;
	},
	handleSubmit: function(e) {
		e.preventDefault();
		if(Common.showButton(this.state.valid) === false) {
			this.register();
		}
	},
	onChange: function(e) {
		Common.FormInputOnChange.call(this, e, Text.register);
	},
	render: function() {
			return (<form  ref='signin'  className="signin-form"   onSubmit={this.handleSubmit}>
				<h2>{Text.home.register} <Common.GMan /></h2>
				{this.props.flash}
					
					<Common.Form inputs={Text.register} context={this} />
					
					<div className="clearfix" ><br /></div>
					
					<div className="col-xs-6 " style={{position: 'relative'}} >
					<Common.Working enabled={!Common.showButton(this.state.valid)} />
					<input type="submit" onClick={this.register} ref="registerbutton" value={Text.btns.register} className='btn btn-warning' disabled={Common.showButton(this.state.valid)} />
				</div> 
					
					<div className="col-xs-6 "   style={{textAlign:'right'}} ><BootstrapButton role="button" onClick={this.props.showregister}  className="btn btn-default">  {Text.btns.logincurrent} </BootstrapButton></div>
					<div className="clearfix" ></div>
			</form>);
	},
	register: function() {
		/* validation occurs as input is received 
		 * this method should only be avialable if
		 * all validation is already met so just run
		 * */
		
		this.setState({
			 working: true
		});
		
		//console.log('form', this.state.form, 'Text', Text.register ); 
		var mydata = { register: 'yes' };
		_.each(this.state.form, function(v,k) {
			if(v.type !== 'header') {
				var el = document.getElementById(v);
				mydata[k] = el.value;
			}
		},this); 
		mydata[isKey] = isMe;
		console.log('mydata', mydata, 'Text', Text.register );
		//var btn = $(this.refs.registerbutton.getDOMNode())
		//btn.button('loading')
		$.ajax({
			url: Text.relay,
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
				/* if we get a redirect check the time and run an interval
				 * this is really just to show React work
				 * */	
				if(typeof data.redirect === 'object' && data.redirect.when>1000) {
					
					data.repeater = data.message; //keep our original message for the repeater
					
					var rrr = 1000
						_self = this.props.context;
					
					SnowpiInterval.redirect = SnowpiInterval.setInterval(function() {
						/* this is really simple
						 * just recaculate the message and let react do the rest
						 * */
						message();
						_self.setState({
							response: yes,
							data: data
						});
					},1000);
					
					/* kill the interval and redirect on the timeout 
					 * */
					GInterval.timeout = setTimeout(function(){
						GInterval.clearIntervals(GInterval.redirect);
						window.location.href = data.redirect.path;
					},data.redirect.when);
					
					message()
				
				} else if(typeof data.redirect === 'object' && data.redirect.path){
					
					window.location.href = data.redirect.path;
				
				}
				
				/* flash messages are shown with response : yes
				 * */	
				this.props.context.setState({
					response: yes,
					data: data
				});
				
			}.bind(this),
			
			error: function(xhr, status, err) {
				console.log(this.props.url, status, err.toString());
				this.props.context.setState({
					response:yes,
					data: {
						status:status,
						err:err.toString()
					}
				});
			}.bind(this)
		
		/* neat little trick to always reset our buttons
		* */	
		}).always(function () {
			
			//btn.button('reset');
		});
		
	},
}); 

module.exports = RR;
