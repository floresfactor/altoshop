import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { InputNumber, Button, Col } from 'antd';
import classnames from 'classnames';

import PurchaseInfo from './purchaseInfo.jsx';

class BuyComponents extends Component {
    constructor(props) {
        super(props);
        const { product } = props;

        this.state = {
            quantity: (product.inventariable && product.stock <= 0) ? 0 : 1
        };
    }

    onQuantityChange(value) {
        const { product } = this.props;

        // Allow blank when writing in input
        if (value === '')
            return;

        value = parseInt(this.validateInputValue(value));

        this.setState({
            quantity: value,
            overStock: product.inventariable ? product.stock < (value) : false
        });
    }

    validateInputValue(value) {
        const { product } = this.props;

        value = value !== undefined ? value.toString().replace(/[^0-9]/, '') : undefined;

        if (value == undefined || isNaN(value))
            value = 1;

        if (product.inventariable) {
            value = value > product.stock ? product.stock : value;
        } else {
            value = value <= 99 ? value : 99;
        }

        return value;
    }

    onAddToCart() {
        const { product } = this.props;
        const { quantity } = this.state;

        if (product.inventariable && quantity > product.stock) {
            this.setState({ overStock: true })
        } else {
            this.props.onAddToCart(product, quantity);
        }
    }

    render() {
        const { product } = this.props;
        const { overStock, quantity } = this.state;

        const inputNumberClass = classnames({
            'quantity-input': true,
            'invalid': !!overStock
        });

        return (
            <div>
                <PurchaseInfo product={product} />
                <div className="buy-components">
                    <div className="add-to-cart">
                        <InputNumber className={inputNumberClass} min={0} step={1} value={quantity}
                            onChange={this.onQuantityChange.bind(this)} />
                        <Button className="add-to-cart-btn" type="primary" onClick={this.onAddToCart.bind(this)} disabled={!quantity || quantity <= 0}>
                            Agregar al carrito
                        </Button>
                    </div>

                    {/* Todo: This is not working */}
                    {overStock && <span className="error-span">Superaste el nùmero de stock disponible</span>}
                </div>
                <Col offset={12} span={12}>
                    <img className="payment-methods" src="/public/img/payments.png" />
                </Col>
            </div>
        );
    }
}

BuyComponents.propTypes = {
    product: PropTypes.object.isRequired,
    onAddToCart: PropTypes.func.isRequired
};

export default BuyComponents;
