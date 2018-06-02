import React from 'react';
import PropTypes from 'prop-types';

const ProductDescription = ({ product }) => {
    return (
        <div className="product-description" dangerouslySetInnerHTML={{__html: product.description}} />
    );
};

ProductDescription.propTypes = {
    product: PropTypes.object.isRequired
};

export default ProductDescription;