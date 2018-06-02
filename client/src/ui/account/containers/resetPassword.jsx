import React from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import queryString from 'query-string';

import {changePassword} from '../../../actions/accountActions';

import Brand from '../components/common/brand.jsx';
import Reset from '../components/resetPassword/reset.jsx';

class ResetPassword extends React.Component {
  constructor(props, ctx){
    super(props, ctx);
    
    let query = queryString.parse(props.location.search);

    this.state = {
      resetToken: query.resetToken ? query.resetToken : null,
      showAlert: null,
      changePasswordResponse: null,
      showForm: true
    };

    this.onValidSubmit = this.onValidSubmit.bind(this);
  
  }

  componentWillReceiveProps(nextProps) {
        if( nextProps.recoverAccount){
            this.setState({showAlert: true, changePasswordResponse: nextProps.recoverAccount, showAlert: true })
        }
  }
  
  onValidSubmit(FormData, resetFormFn, invalidateFormFn){
      this.props.reset(FormData).then(()=>{
        console.log("change password response success");  
        if(this.state.resetToken && this.state.changePasswordResponse.type == 'success'){
          this.setState({showForm: true});
          setTimeout(()=>{
            this.props.history.push('/account/login');
          },5000 );
        }
      }).catch(errors =>{
        if(!errors)
                return;
            
            let formErrors = {};

            Object.keys(errors).forEach(key => {
                formErrors[key] = errors[key].message
            });

            invalidateFormFn(formErrors);
      });
  }

  render(){
    return(
      <div className="container">
        <div className="login-block">
          <Brand brandLink='/'/>
          <Reset  resetToken={this.state.resetToken} 
                  changePasswordResponse={this.state.changePasswordResponse} 
                  showAlert={this.state.showAlert}
                  onValidSubmit={this.onValidSubmit}
                  showForm={this.state.showForm}
          />
        </div>
      </div>
    );
  }

}

const mapStateToProps = (state, ownProps) => {
    return {
       recoverAccount: state.recoverAccount
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
      reset: (accountInfo)=>{
        return dispatch(changePassword(accountInfo));
      }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);