import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { urls } from '../../../../lib/http';
import resources from '../../../../lib/constants/resources';

// Components
import ProductImages from './productImages.jsx';
import ProductTitle from './productTitle.jsx';
import ProductTags from './productTags.jsx';
import ProductDescription from './productDescription.jsx';
import ProductSelector from './productSelector.jsx';
import BuyComponents from './buyComponents.jsx';


class ProductGroupView extends Component {
    constructor(props) {
        super(props);

        const { productGroup } = this.props;

        this.galleryRef = null;

        let allImages = [productGroup.image || { name: 'not-found', src: resources.IMG_NO_IMG_URL }];

        if (!~location.host.indexOf('kopay'))
            productGroup.products.forEach(p => {
                p.images.forEach(i => allImages.push(i));
            });

        this.state = {
            allImages
        };
    }

    selectProduct(product) {
        this.setState({ selectedProduct: product });

        const { allImages } = this.state;
        const imgIndx = allImages.findIndex(i => i._id && product.images.find(p_image => p_image._id === i._id));

        if (imgIndx != -1 && this.galleryRef)
            this.galleryRef.slideToIndex(imgIndx);
    }

    onAddToCart(product, quantity) {
        const { productGroup } = this.props;
        const parent = {
            type: 'productGroup',
            parent: productGroup
        };

        this.props.onAddToCart(product, quantity, parent);
    }

    render() {
        const { productGroup, onAddToCart } = this.props;
        const { selectedProduct, allImages } = this.state;

        return (
            <div className="product-group-row">
                <ProductImages images={allImages} setRef={(ref) => this.galleryRef = ref} />
                <div className="product-information">
                    <ProductTitle product={productGroup} />
                    <ProductTags product={productGroup} />
                    <ProductDescription product={productGroup} />
                    <ProductSelector products={productGroup.products}
                        selectProductFn={this.selectProduct.bind(this)}
                        selectedProductID={selectedProduct && selectedProduct._id} />
                    {selectedProduct && <BuyComponents product={selectedProduct} onAddToCart={this.onAddToCart.bind(this)} />}
                </div>
            </div>
        );
    }
}

ProductGroupView.propTypes = {
    productGroup: PropTypes.object.isRequired,
    onAddToCart: PropTypes.func.isRequired
};

export default ProductGroupView;