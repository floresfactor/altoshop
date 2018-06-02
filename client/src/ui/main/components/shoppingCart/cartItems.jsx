import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-id-swiper';

import { currencyFormat } from '../../../../lib/util/formatUtils';
import { urls } from '../../../../lib/http';
import resources from '../../../../lib/constants/resources';

// Components
import CartItemQuantiy from '../../components/common/cartItemQuantity.jsx';
class CartItems extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onQuantityChange(cartItem, value) {
        if (cartItem.quantity != value)
            this.props.onItemQuantityChange(Object.assign({}, cartItem, { quantity: value }));
    }

    onItemRemove(cartItem) {
        this.props.onItemRemove(cartItem._id).then(() => {
            // Somewhy I couldn't do this other way..
            setTimeout(() => {
                const el = $('.cart-items .ant-tabs-tab').first();
                if (el.length)
                    el.click();
            }, 200);
        });
    }

    //onTabClick(tabNumber) {
     //   this.setState({ activeTab: tabNumber });
    //}

    render() {
        const { cartItems } = this.props;
        const params = {
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          },
          spaceBetween: 30,
          slidesPerView: cartItems.length >= 2 ? (this.props.environment < 993 ? 1 : 2) : 1,
        };
        if (!cartItems)
            return null;

        return (
            <div className="cart-items">
                <Swiper {...params}>
                    {cartItems.map((cartItem, index) => {
                        let imgObj = cartItem.item.images.find(i => i.src);
                        imgObj = imgObj ? imgObj : (cartItem.parent ? cartItem.parent.parent.image : undefined);
                        const parent = (cartItem.parentDisplayName ? " (" + cartItem.parentDisplayName + ")" : '')
                        return (
                                <div className="item-tab" key={index}>
                                    <img src={imgObj ? imgObj.src : resources.IMG_NO_IMG_URL} />
                                    <div className="product-info">
                                        <div className="title">
                                            <div className="label label-warning remove-label" onClick={this.onItemRemove.bind(this, cartItem)}>Remover</div>
                                            <div>{cartItem.item.name}</div>
                                            <div>{parent}</div>
                                        </div>
                                        <div className="product-options">
                                            <span className="price">
                                                <div>Precio</div>
                                                <div className="divider-break" />
                                                <div>{currencyFormat(cartItem.item.price)}</div>
                                            </span>
                                            <span className="quantity">
                                                <div>Cantidad</div>
                                                <div className="divider-break" />
                                                <CartItemQuantiy onChange={this.onQuantityChange.bind(this, cartItem)} cartItem={cartItem} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                        );
                    })}
                </Swiper>
            </div>
        );
    }
}

CartItems.propTypes = {
    cartItems: PropTypes.array,
    loading: PropTypes.bool.isRequired,
    onItemQuantityChange: PropTypes.func.isRequired,
    onItemRemove: PropTypes.func.isRequired
};

export default CartItems;
