import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import onClickOutside from 'react-onclickoutside';
import { CSSTransitionGroup } from 'react-transition-group';
import classnames from 'classnames';
import { Button } from 'antd';

import {
    loadShoppingCartItems,
    addOrUpdateShoppingCartItems,
    removeShoppingCartItem
} from '../../../actions/shoppingCartItemsActions';
import { showShoppingCart } from '../../../actions/UIFlagsActions';
import UIFlagsPropNames from '../../../lib/constants/UIFlags';

// Components
import CartItems from '../components/shoppingCart/cartItems.jsx';

class ShoppingCart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        // About to show cart, reload data from server
        if (this.props.showingCart === false && nextProps.showingCart === true) {
            this.setState({ loading: true }, () => {
                this.props.loadShoppingCartItems().then(() => {
                    this.setState({ loading: false });
                });
            });
        }
    }

    handleClickOutside(evt) {
        // Return if clicking cart-icon || Not currently showing the cart
        if ($(evt.target).parents('div.shopping-cart-icon').length || !this.props.showingCart)
            return;

        // Clicking on quantity dropdown
        if (evt.target.className.indexOf('ant-select-dropdown-menu-item') != -1)
            return;

        this.props.showShoppingCart(false);
    }

    onCheckoutClick() {
        const { loading } = this.state;
        const { cartItems } = this.props;

        if (loading)
            return;

        if (cartItems && cartItems.length) {
            this.props.history.push({
                pathname: '/checkout'
            });
        }

        this.props.showShoppingCart(false);
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
        const { cartItems, showingCart } = this.props;
        const loading = this.state.loading !== undefined ? this.state.loading : true;
        const emptyCart = !cartItems.length;
        const btnClass = classnames({
            'checkout-btn': true,
            'empty-cart-btn': emptyCart
        });

        return (
            <CSSTransitionGroup transitionName={{ enter: 'enter', leave: 'leave' }} transitionEnterTimeout={400} transitionLeaveTimeout={400} transitionEnter={true}>
                {showingCart &&
                    <div className="shopping-cart-container">
                        {!emptyCart &&
                            <div className="middle-container">
                                <CartItems cartItems={cartItems}
                                  loading={loading}
                                  onItemQuantityChange={this.onItemQuantityChange.bind(this)}
                                  onItemRemove={this.onItemRemove.bind(this)}
                                  environment={this.props.width}
                                />
                            </div>
                        }
                        {emptyCart &&
                            <div className="empty-cart">
                                <p><i className="fa fa-frown-o fa-lg" /></p>
                                El carrito esta vacío
                            </div>
                        }
                        <Button type="primary" className={btnClass} disabled={loading} onClick={this.onCheckoutClick.bind(this)}>
                            {!emptyCart ? 'Finalizar compra' : 'Seguir comprando'}
                        </Button>
                    </div>
                }
            </CSSTransitionGroup>
        );
    }
}

ShoppingCart.propTypes = {
};

const mapStateToProps = (state, ownProps) => {
    return {
        cartItems: state.shoppingCartItems,
        showingCart: state.UIFlags[UIFlagsPropNames.showShoppingCart],
        width: state.environment.width
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        showShoppingCart: (show) => {
            return dispatch(showShoppingCart(show));
        },
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

export default connect(mapStateToProps, mapDispatchToProps)(onClickOutside(ShoppingCart));
