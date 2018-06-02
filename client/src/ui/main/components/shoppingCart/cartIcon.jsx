import React from 'react';
import PropTypes from 'prop-types';
// import { Badge } from 'antd';
import { Badge } from 'react-bootstrap';
import { Icon } from 'antd';

const CartIcon = ({ onClick, cartItemsCount }) => {
    return (
        <div className="shopping-cart-icon" onClick={onClick}>
            <Icon type="shopping-cart" />
            <div className="badge-div">
                <Badge>{cartItemsCount || 0}</Badge>
            </div>
        </div>
    );
};

CartIcon.propTypes = {
    onClick: PropTypes.func.isRequired,
    cartItemsCount: PropTypes.number
};

export default CartIcon;