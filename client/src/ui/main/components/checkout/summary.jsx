import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Spin, Col, Row } from 'antd';
import moment from 'moment';
// Components
import OrderItemsSummaryTable from './orderItemsSummaryTable.jsx';
import PartialPaymentsTable from './partialPaymentsTable.jsx';
import DiscountsTable from './discountsTable.jsx';

class Summary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };
    }

    generateOrder() {
        this.setState({ loading: true }, () => {
            this.props.onOrderSubmit().catch(errs => {
                this.setState({ loading: false });
                console.log(errs);
            });
        });
    }

    render() {
        const { order, cartItems, customer, paymentMethod, branch } = this.props;
        const { loading } = this.state;
        const hasDiscounts = false;

        return (
            <Spin spinning={loading} tip="Aplicando pago...">
                <div className="order-summary">
                    <Row>
                        <Col sm={14} xs={24}>
                            <div className="summary-cards">
                                <Card className="summary-card">
                                    <div className="shipment">
                                        {/* <span><strong>Shipment</strong></span> */}
                                        {order.shipment.type == 'pickup' &&
                                            <div>
                                                <div className="subtitle">En sucursal</div>
                                                <div>
                                                    {`${branch.name}: 
                                            ${branch.address.street1 + (branch.address.street2 ?
                                                            ' ' + branch.address.street2 : '')}, 
                                                ${branch.address.city}, ${branch.address.state}`}
                                                </div>
                                                <div>Fecha: {moment(order.shipment.dateTime).format('dddd, D MMMM YYYY, HH:mm')}</div>
                                            </div>}
                                    </div>
                                    <div className="customer">
                                        <span><strong>Cliente</strong></span>
                                        <div>{customer.firstName + ' ' + customer.lastName}</div>
                                        <div>{customer.phone}</div>
                                    </div>
                                    <div className="payment">
                                        <span><strong>Pago</strong></span>
                                        {paymentMethod.type == 'card' &&
                                            <div>
                                                <div className="subtitle">Tarjeta</div>
                                                {(paymentMethod.brand == 'MC' ? 'MasterCard' : 'VISA') + ` terminaciòn ${paymentMethod.last4}`}
                                            </div>}
                                        {paymentMethod.type == 'oxxo_cash' &&
                                            <div>
                                                <div className="subtitle">OXXO Pay</div>
                                            </div>}
                                    </div>
                                </Card>
                            </div>
                        </Col>
                        <Col sm={10} xs={24}>
                            <div className="summary-sider">
                                <OrderItemsSummaryTable orderItems={order.items} loading={false} />
                                <PartialPaymentsTable orderItems={order.items} cartItems={cartItems} loading={false} />
                                {hasDiscounts && <DiscountsTable discounts={order.discounts || []} hideCupon={true} />}
                                <Button onClick={this.generateOrder.bind(this)} type="primary" className="finish-btn" size="large">
                                    Finalizar Pedido
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Spin>
        );
    }
};

Summary.propTypes = {
    order: PropTypes.object.isRequired,
    cartItems: PropTypes.array.isRequired,
    customer: PropTypes.object.isRequired,
    paymentMethod: PropTypes.object.isRequired,
    branch: PropTypes.object,
    onOrderSubmit: PropTypes.func.isRequired
};

export default Summary;