import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import ProductImages from './productImages.jsx';
import ProductTitle from './productTitle.jsx';
import ProductTags from './productTags.jsx';
import ProductDescription from './productDescription.jsx';
import BuyComponents from './buyComponents.jsx';

class ProductView extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }
    
    render() {
        const { product, onAddToCart } = this.props;

        return (
            <div className="product-row">
                <ProductImages images={product.images} />
                <div className="product-information">
                    <ProductTitle product={product} />
                    <ProductTags product={product} />
                    <ProductDescription product={product} />
                    <BuyComponents product={product} onAddToCart={onAddToCart} />
                </div>
            </div>
        );
    }
}

ProductView.propTypes = {
    product: PropTypes.object.isRequired,
    onAddToCart: PropTypes.func.isRequired
};

export default ProductView;