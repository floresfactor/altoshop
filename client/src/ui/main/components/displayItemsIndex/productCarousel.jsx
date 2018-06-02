import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Carousel } from 'react-bootstrap';
import { Card } from 'antd';
import PropTypes from 'prop-types';

import { urls } from '../../../../lib/http';
import resources from '../../../../lib/constants/resources';
import tags from '../../../../lib/constants/tags';
import { getProductsByTag } from '../../../../actions/productsActions';

class ProductCarousel extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        this.props.getProductsByTag([tags.$$SYSTEM_CAROUSEL]).then(products => {
            this.setState({ products });
        });
    }

    getProductBlocks() {
        if (this.state.products) {
            const products = [...this.state.products];

            const arrayOfProductArray = [];
            while (products.length)
                arrayOfProductArray.push(products.splice(0, 6));

            return arrayOfProductArray.map((pArray, i) =>
                <div key={i}>
                    {pArray.map((p, i) => {
                        const imgObj = p.images.find(img => img.src);
                        return (
                            <div key={i} className="col-xs-2">
                                <div className="carousel-image-inner-container">
                                    <img src={imgObj ? imgObj.src : resources.IMG_NO_IMG_URL} className="img-responsive" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return [];
        }
    }

    render() {
        const productBlocks = this.getProductBlocks();

        return (
            productBlocks.length
                ?
                <div className="product-carousel-container">
                    <h4>Lo màs vendido</h4>
                    <Card className="carousel-card">
                        <Carousel indicators={true} controls={false}>
                            {productBlocks.map((block, i) =>
                                <Carousel.Item key={i}>
                                    {block}
                                </Carousel.Item>
                            )}
                        </Carousel>
                    </Card>
                </div>
                :
                null
        );
    }
}

ProductCarousel.propTypes = {
    product: PropTypes.arrayOf(PropTypes.object)
};

const mapStateToProps = (state, ownProps) => {
    return {
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getProductsByTag: (tagArray) => {
            return dispatch(getProductsByTag(tagArray));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductCarousel);