import React from 'react';
import PropTypes from 'prop-types';

const ProductTitle = ({ product }) => {
    return (
        <div className="product-title">
            <h4>{product.name}</h4>
        </div>
    );
};

ProductTitle.propTypes = {
    product: PropTypes.object.isRequired
};

export default ProductTitle;