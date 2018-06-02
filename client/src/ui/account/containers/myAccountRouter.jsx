import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import PagerNames from '../../../lib/constants/pagerNames';

// Actions
import { setSidebarComponent } from '../../../actions/sidebarActions';
import { loadCustomerOrders } from '../../../actions/customerOrdersActions';
import { getCustomerOrder } from '../../../actions/variableObjectActions';

// Components
import NotFound from '../../common/components/notFound.jsx';
import MyAccountSidebar from '../components/common/myAccountSidebar.jsx';
import Orders from '../../common/containers/orders.jsx';
import Order from '../../common/containers/order.jsx';
import MyAccount from '../../account/containers/myAccount.jsx';

class MyAccountRouter extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        const { account, history } = this.props;

        if(!account.isLoggedIn) {
            history.push('/account/login');
            return;
        }else{
            if (!account.isComplete) {
                this.props.history.push('/account/customer');
                return;
            }
            //history.push('/');
            this.props.setSidebar(true);
        }

    }

    componentWillUnmount() {
        this.props.setSidebar(false);
    }

    render() {
        const { loadCustomerOrders, getCustomerOrder } = this.props;

        return (
            <div>
                <Switch>
                    <Route exact path="/account/my-account" component={MyAccount} />
                    <Route exact path="/account/my-account/orders"
                        render={(rRouterProps) => {
                            return (<Orders loadOrdersFn={loadCustomerOrders}
                                        pagerName={PagerNames.CUSTOMER_ORDERS_TABLE}
                                        {...rRouterProps} />
                            );}}  />
                    <Route exact path="/account/my-account/orders/:id"
                        render={(rRouterProps) => {
                            return (<Order loadOrderFn={getCustomerOrder}
                                        {...rRouterProps} />
                            );}}  />
                    <Route component={NotFound} />
                </Switch>
            </div>
        );
    }
}

MyAccountRouter.propTypes = {
    setSidebar: PropTypes.func.isRequired,
    account: PropTypes.object,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    loadCustomerOrders: PropTypes.func.isRequired,
    getCustomerOrder: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    return {
        account: state.account
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setSidebar: (set) => {
            dispatch(setSidebarComponent(set ? MyAccountSidebar : null));
        },
        loadCustomerOrders: () => {
            return dispatch(loadCustomerOrders(PagerNames.CUSTOMER_ORDERS_TABLE, false));
        },
        getCustomerOrder: (orderID) => {
            return dispatch(getCustomerOrder(orderID));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyAccountRouter);
