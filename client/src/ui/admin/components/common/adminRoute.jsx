import React from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

const AdminRoute = ({component: Component, ...otherProps}) => {
    // Account is valid if:
    // Is an admin, it has a sessionID and a valid session expiration date
    const isValidAdmin = otherProps.account && otherProps.account.isAdmin;

    return (
        <Route {...otherProps} 
            render={(props) => {
                // Set isAdminRoute in route state
                props.location.state = Object.assign({}, props.location.state, { isAdminRoute: true });

                return isValidAdmin ? (
                    <Component {...props} />
                ) : (
                    <Redirect to={{ 
                            pathname: '/account/login', 
                            state: { from: props.location } 
                        }}/>
                );
            }} />
    );
};

AdminRoute.propTypes = {
    component: PropTypes.func.isRequired,
    location: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
    return {
        account: state.account
    };
};

export default connect(mapStateToProps)(AdminRoute);