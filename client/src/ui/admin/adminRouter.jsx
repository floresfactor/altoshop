import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import PagerNames from '../../lib/constants/pagerNames';

// Actions
import { setSidebarComponent } from '../../actions/sidebarActions';
import { loadAdminOrders } from '../../actions/adminOrdersActions';
import { getAdminOrder } from '../../actions/variableObjectActions';

// Components
import NotFound from '../common/components/notFound.jsx';
import AdminSidebar from './components/common/adminSidebar.jsx';

// ******************
// *** Containers ***
// ******************
import Settings from './containers/settings.jsx';
import AdminProducts from './containers/adminProducts.jsx';
import AdminProductGroups from './containers/adminProductGroups.jsx';
import AdminDiscounts from './containers/adminDiscounts.jsx';
import AdminPackages from './containers/adminPackages.jsx';
import Orders from '../common/containers/orders.jsx';
import Accounts from './containers/accounts.jsx';
import Order from '../common/containers/order.jsx';
import AdminSlider from './containers/adminSlider.jsx';
import adminShopIndex from './containers/adminShopIndex.jsx';

class AdminRouter extends Component {
    componentWillMount() {
        this.props.setSidebar(true);
    }

    componentWillUnmount() {
        this.props.setSidebar(false);
    }

    render() {
        const { loadAdminOrders, getAdminOrder } = this.props;

        return (
            <div>
                <Switch>
                    <Route exact path="/admin" component={Settings} />
                    <Route exact path="/admin/shop" component={adminShopIndex} />
                    <Route exact path="/admin/products" component={AdminProducts} />
                    <Route exact path="/admin/product-groups" component={AdminProductGroups} />
                    <Route exact path="/admin/product-discounts" component={AdminDiscounts} />
                    <Route exact path="/admin/accounts" component={Accounts} />
                    <Route exact path="/admin/packages" component={AdminPackages} />
                    <Route exact path="/admin/orders"
                        render={(rRouterProps) => {
                            return (<Orders loadOrdersFn={loadAdminOrders}
                                pagerName={PagerNames.ADMIN_ORDERS_TABLE}
                                isAdmin={true}
                                {...rRouterProps} />
                            );
                        }} />
                    <Route path="/admin/orders/:id"
                        render={(rRouterProps) => {
                            return (<Order loadOrderFn={getAdminOrder}
                                isAdmin={true}
                                {...rRouterProps} />
                            );
                        }} />
                    <Route exact path="/admin/slider" component={AdminSlider}/>
                    <Route component={NotFound} />
                </Switch>
            </div>
        );
    }
}

AdminRouter.propTypes = {
    setSidebar: PropTypes.func.isRequired,
    loadAdminOrders: PropTypes.func.isRequired,
    getAdminOrder: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    return {
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setSidebar: (set) => {
            dispatch(setSidebarComponent(set ? AdminSidebar : null));
        },
        loadAdminOrders: () => {
            return dispatch(loadAdminOrders(PagerNames.ADMIN_ORDERS_TABLE, false));
        },
        getAdminOrder: (orderID) => {
            return dispatch(getAdminOrder(orderID));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminRouter);