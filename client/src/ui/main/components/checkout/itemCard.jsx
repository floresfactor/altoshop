import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';

import { currencyFormat } from '../../../../lib/util/formatUtils';
import { urls } from '../../../../lib/http';
import resources from '../../../../lib/constants/resources';

// Components
import CartItemQuantiy from '../common/cartItemQuantity.jsx';
import PaymentOptions from './paymentOptions.jsx';

class ItemCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    onQuantityChange(value) {
        const { cartItem } = this.props;

        if (cartItem.quantity != value)
            this.props.onItemQuantityChange(Object.assign({}, cartItem, { quantity: value }));
    }

    onItemRemove() {
        const { cartItem } = this.props;
        this.props.onItemRemove(cartItem._id);
    }

    render() {
        const { cartItem, orderItem, onItemChargePctChange } = this.props;
        //product image doesn't show, code as cartItems component manage image
        let imgObj = cartItem.item.images.find(i => i.src);
        imgObj = imgObj ? imgObj : (cartItem.parent ? cartItem.parent.parent.image : undefined);
        const cardTitle = (
            <div className="item-title">
                <div>{cartItem.parentDisplayName} ({cartItem.item.name})</div>
                <i className="fa fa-trash-o fa-fw" onClick={this.onItemRemove.bind(this)} />
            </div>
        );

        return (
            <Card className="item-card" title={cardTitle}>
                <div className="product-card-content">
                    <img src={imgObj ? imgObj.src : resources.IMG_NO_IMG_URL} />
                    <div className="price-options">
                        <div className="quantity-price-total-container">
                            <div className="price">
                                <div>Precio</div>
                                <div className="divider-break"></div>
                                <div>{currencyFormat((orderItem.discountPrice || orderItem.price))}</div>
                            </div>
                            <div className="quantity">
                                <div>Cantidad</div>
                                <div className="divider-break"></div>
                                <CartItemQuantiy onChange={this.onQuantityChange.bind(this)} cartItem={cartItem} />
                            </div>
                            <div className="total-payment">
                                <div>Subtotal</div>
                                <div className="divider-break"></div>
                                <div>{currencyFormat((orderItem.discountPrice || orderItem.price) * orderItem.quantity)}</div>
                            </div>
                        </div>
                        <div className="payment-options">
                            <PaymentOptions item={orderItem} onChargePctChange={onItemChargePctChange} />
                        </div>
                    </div>
                </div>
                <div className="charges-text">
                    {orderItem.charges[0].pct != 1 && orderItem.quantity > 1 &&
                        <span>
                            {`Primer pago por ${currencyFormat(orderItem.charges[0].pct * (orderItem.discountPrice || orderItem.price))}/item = `}
                            <strong>{currencyFormat(((orderItem.discountPrice || orderItem.price) * orderItem.quantity) * orderItem.charges[0].pct)}</strong>{` en ${orderItem.quantity} items`}
                            <div>Restante a pagar en sucursal</div>
                        </span>
                    }
                    {orderItem.charges[0].pct != 1 && orderItem.quantity == 1 &&
                        <span>
                            Primer pago por <strong>{currencyFormat(orderItem.charges[0].pct * (orderItem.discountPrice || orderItem.price))}</strong>
                            <div>Restante a pagar en sucursal</div>
                        </span>
                    }
                </div>
            </Card>
        );
    }
};

ItemCard.propTypes = {
    onItemQuantityChange: PropTypes.func.isRequired,
    onItemRemove: PropTypes.func.isRequired,
    cartItem: PropTypes.object.isRequired,
    orderItem: PropTypes.object.isRequired,
    onItemChargePctChange: PropTypes.func.isRequired
};

export default ItemCard;