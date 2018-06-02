import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { accountLogin, accountRegister, recoverAccount } from '../../../actions/accountActions';

// Components
import Login from '../components/accountLogOperations/login.jsx';
import Register from '../components/accountLogOperations/register.jsx';
import Recovery from '../components/accountLogOperations/recovery.jsx';
import Brand from '../components/common/brand.jsx';

class AccountLogOperations extends Component {
    constructor(props, ctx) {
        super(props, ctx);

        // This is used to redirect on successfull login/register
        const comingFromPath = props.location.state && props.location.state.from ?
            props.location.state.from.pathname || '/' : '/';

        this.state = {
            comingFromPath,
            showAlert: false,
            recoverAccount: null,
            captcha: null,
        };

        this.getDispatcherFn = this.getDispatcherFn.bind(this);
    }

    componentWillReceiveProps(nextProps, nextState){
        if( nextProps.recoverAccount){
            this.setState({showAlert: true, recoverAccount: nextProps.recoverAccount });
        }
        if(nextProps.account.isLoggedIn){
            if (!nextProps.account.isComplete) {
                this.props.history.push('/account/customer');
            }
            this.props.history.push('/');
        }
    }

    componentWillMount() {
        // User is already logged in? -> redirect to main page
        if (this.props.account && this.props.account.isLoggedIn) {
        this.props.history.push('/');
        return;
        }
    }
    componentWillUnmount(){
        this.setState({ showAlert: false, recoverAccount: null });
    }

    getCaptcha(key){
   	    this.setState({captcha: key});
    }

    onValidSubmit(formData, resetFormFn, invalidateFormFn) {
        const dispatcherFn = this.getDispatcherFn();
        // console.log(formData);
        // Login and redirect to intended path, or show errors
        dispatcherFn(formData).then(() => {
            if(this.props.location.pathname !== '/account/recovery'){
                this.props.history.push(this.state.comingFromPath);
            }
        }).catch((errors) => {
            if(!errors)
                return;

            let formErrors = {};

            Object.keys(errors).forEach(key => {
                formErrors[key] = errors[key].message;
            });

            invalidateFormFn(formErrors);
        });
    }

    getDispatcherFn(){
        let path = this.props.match.path;
        switch (true){
                case /login/.test(path) :
                    return this.props.login;
                case /register/.test(path) :
                    return this.props.register;
                case  /recovery/.test(path) :
                    return this.props.recover;
                default:
                    ()=>{console.log();};
        }
    }

    render() {
      const { count, limit } = this.props.attempts;
        return (
            <div className="container">
                <div className="login-block">
                    <Brand brandLink="/" />

                    <Switch>
                        <Route path="/account/login" render={() => (
                            <Login onValidSubmit={this.onValidSubmit.bind(this)} captcha={this.state.captcha} getCaptcha={this.getCaptcha.bind(this)} limit={limit} count={count} />
                        )}/>
                        <Route path="/account/register" render={()=>(
                            <Register onValidSubmit={this.onValidSubmit.bind(this)} captcha={this.state.captcha} getCaptcha={this.getCaptcha.bind(this)} limit={limit} count={count}/>
                        )}/>
                        <Route path="/account/recovery" render={()=>(
                            <Recovery recoverAccount={this.state.recoverAccount} showAlert={this.state.showAlert} onValidSubmit={this.onValidSubmit.bind(this)} limit={limit} count={count}/>
                        )}/>

                    </Switch>
                </div>
            </div>
        );
    }
}

AccountLogOperations.propTypes = {
    account: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
    return {
        account: state.account,
        recoverAccount: state.recoverAccount,
        attempts: state.attempts
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        login: (accontInfo) => {
            return dispatch(accountLogin(accontInfo));
        },
        register: (accontInfo) => {
            return dispatch(accountRegister(accontInfo));
        },
        recover: (accontInfo) =>{
            return dispatch(recoverAccount(accontInfo));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountLogOperations);
