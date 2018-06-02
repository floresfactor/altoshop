import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    loadShoppingCartItems,
    addOrUpdateShoppingCartItems,
    removeShoppingCartItem
} from '../../../actions/shoppingCartItemsActions';

import OrderItemsSummaryTable from '../components/checkout/orderItemsSummaryTable.jsx';
import ItemCard from '../components/checkout/itemCard.jsx';
import PartialPaymentsTable from '../components/checkout/partialPaymentsTable.jsx';
import DiscountsTable from '../components/checkout/discountsTable.jsx';

import { Col, Row } from 'antd';

class CheckoutOrderItems extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    onItemQuantityChange(updatedItem) {
        this.setState({ loading: true });
        this.props.addOrUpdateShoppingCartItems([updatedItem], false).then(() => {
            this.setState({ loading: false });
        });
    }

    onItemRemove(cartItem_id) {
        if (cartItem_id) {
            this.setState({ loading: true });
            return this.props.removeShoppingCartItem(cartItem_id, true).then(() => {
                this.setState({ loading: false });
            });
        }
    }

    render() {
        const { cartItems, orderItems, onOrderItemChargePctChange, order, onDiscountApply } = this.props;
        const { loading } = this.state;

        return (
            <div className="order-items-container">
                <Row>
                    <Col className="order-products-col" sm={16} xs={24}>
                        <div className="order-products-block">
                            {cartItems.map((cartItem, idx) => {
                                // OrderItems are mapped from cartItems so this shoudn't ever be undefined
                                const orderItem = orderItems.find(oi => oi.itemID == cartItem.itemID);

                                return (<ItemCard cartItem={cartItem} orderItem={orderItem} key={idx}
                                    onItemQuantityChange={this.onItemQuantityChange.bind(this)}
                                    onItemRemove={this.onItemRemove.bind(this)}
                                    onItemChargePctChange={onOrderItemChargePctChange} />);
                            })}
                        </div>
                    </Col>
                    <Col sm={8} xs={24}>
                        <div className="order-summary-sider">
                            <OrderItemsSummaryTable orderItems={orderItems} loading={loading} />
                            <PartialPaymentsTable orderItems={orderItems} cartItems={cartItems} loading={loading} />
                            <DiscountsTable discounts={order.discounts || []} applyDiscountFn={onDiscountApply} />
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

CheckoutOrderItems.propTypes = {
    cartItems: PropTypes.array.isRequired,
    orderItems: PropTypes.array.isRequired,
    onOrderItemChargePctChange: PropTypes.func.isRequired,
    order: PropTypes.object.isRequired,
    onDiscountApply: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    return {
        cartItems: state.shoppingCartItems
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadShoppingCartItems: () => {
            return dispatch(loadShoppingCartItems());
        },
        addOrUpdateShoppingCartItems: (cartItems, showLoading) => {
            return dispatch(addOrUpdateShoppingCartItems(cartItems, showLoading));
        },
        removeShoppingCartItem: (cartItem_id, showLoading) => {
            return dispatch(removeShoppingCartItem(cartItem_id, showLoading));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutOrderItems);