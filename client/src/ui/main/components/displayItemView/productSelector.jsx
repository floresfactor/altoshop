import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class ProductSelector extends Component {
    constructor(props) {
        super(props);

        const { products, selectProductFn } = props;

        if (products.length <= 1)
            selectProductFn(products[0]);

        this.state = {
            products: []
        };
    }

    sortProducts(products, selectProductFn) {
        products.forEach(prod => {
            let num = prod.name.match(/[0-9]+/g);
            num = num ? Number(num[0]) : 99999;
            prod.numValue = num;
            if (num == 6) selectProductFn(prod);
        });

        let buffer = null;

        for (let d = 1; d < products.length; ++d) {
            for (let i = 0; i < (products.length - d); ++i) {
                if (products[i].numValue > products[i + 1].numValue) {
                    buffer = products[i];
                    products[i] = products[i + 1];
                    products[i + 1] = buffer;
                }
            }
        }

        this.setState({ products });
    }

    componentWillMount() {
        const { products, selectProductFn } = this.props;
        this.sortProducts(products, selectProductFn);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.products != nextProps.products) { // may be unesesary
            this.sortProducts(nextProps.products, this.props.selectProductFn);
        }
    }

    render() {
        const { selectedProductID, selectProductFn } = this.props;
        const { products } = this.state;
        let listGroupClass = 'list-group-item';

        return (
            <div className="product-list">
                {products.map((product, idx) =>
                    <a className={listGroupClass + (product._id === selectedProductID ? ' active' : '')} key={idx}
                        onClick={() => selectProductFn(product)}>
                        {product.name}
                    </a>
                )}
            </div>
        );
    }
}

ProductSelector.propTypes = {
    products: PropTypes.array.isRequired,
    selectedProductID: PropTypes.string,
    selectProductFn: PropTypes.func.isRequired
};

export default ProductSelector;