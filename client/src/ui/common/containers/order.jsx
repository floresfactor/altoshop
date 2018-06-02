import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Tabs, Card } from 'antd';

import VariableObjectTypes from '../../../lib/constants/variableObjectTypes';

// Actions
import { clearVariableObjectData } from '../../../actions/variableObjectActions';

// Components
import ItemsTable from '../components/order/itemsTable.jsx';
import SummaryTable from '../components/order/summaryTable.jsx';
import CustomerInfoTable from '../components/order/customerInfoTable.jsx';
import PaymentDetailsTable from '../components/order/paymentDetailsTable.jsx';
import DiscountsTable from '../components/order/discountsTable.jsx';

// Todo:
// Include shipment information on a tab here

class Order extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        const redirectFn = () => {
            this.props.history.goBack();
        };

        const { id: matchOrderID } = this.props.match.params;

        if(matchOrderID) {
            const { loadOrderFn } = this.props;

            loadOrderFn(matchOrderID).catch(() => {
                // Redirect
                redirectFn();
            });
        } else {
            // Redirect
            redirectFn();
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.order)
            this.forceUpdate();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !!nextState.order;
    }

    componentWillUnmount() {
        this.props.clearVariableObjectData();
    }

    render() {
        const { order } = this.props;

        if(!order) {
            return (
                <div>
                    Procesando... {/* <-- This should actually never show cuz we are loading the order and showing loading spin*/}
                </div>
            );
        } else { // Order is ready
            return (
                <div className="order-details-container">
                    <div>
                        <Card style={{ marginBottom: '25px' }} className="order-summary" title="Resumen de orden">
                            <SummaryTable order={order} />
                        </Card>
                    </div>
                    <div>
                        <Card className="order-details" title="Detalles">
                            <Tabs defaultActiveKey="1" size="small">
                                <Tabs.TabPane tab={<span><i className="fa fa-fw fa-address-card-o" />Cliente</span>} key="1">
                                    <CustomerInfoTable customer={order.customer} />
                                </Tabs.TabPane>
                                <Tabs.TabPane tab={<span><i className="fa fa-fw fa-money" />Pagos <i>({order.payments.length})</i></span>} key="2">
                                    {order.payments.map((payment, idx) => <PaymentDetailsTable payment={payment} order={order} key={idx} />)}
                                </Tabs.TabPane>
                                <Tabs.TabPane tab={<span><i className="fa fa-fw fa-shopping-basket" />Articulos</span>} key="3">
                                    <ItemsTable orderItems={order.items} />
                                </Tabs.TabPane>
                                {order.discounts.length && 
                                    <Tabs.TabPane tab={<span><i className="fa fa-fw fa-handshake-o" />Descuentos</span>} key="4">
                                        <DiscountsTable discounts={order.discounts} />
                                    </Tabs.TabPane>}
                                <Tabs.TabPane className="order-details-table" tab={<span><i className="fa fa-fw fa-info" />Otros</span>} key="5">
                                    <div style={{ textAlign: 'center' }}>(Opciones no disponibles)</div>
                                </Tabs.TabPane>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            );
        }
    }
}

Order.propTypes = {
    match: PropTypes.object.isRequired, 
    history: PropTypes.object.isRequired,    
    order: PropTypes.object,
    clearVariableObjectData: PropTypes.func.isRequired,
    loadOrderFn: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {
        order: ownProps.isAdmin ? 
            (state.variableObject.variableObjectType === VariableObjectTypes.ADMIN_ORDER && state.variableObject || null) :
            (state.variableObject.variableObjectType === VariableObjectTypes.CUSTOMER_ORDER && state.variableObject || null)
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearVariableObjectData: () => {
            dispatch(clearVariableObjectData());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Order);