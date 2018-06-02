import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Card, Carousel, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import resources from '../../../../lib/constants/resources';
import { currencyFormat } from '../../../../lib/util/formatUtils';

import { getRandomProducts } from '../../../../actions/displayItemsActions';

class RandCarousel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: []
        };
    }

    componentWillMount() {
        const options = {
            count: 15,
            filterBy: {
                name: "^Paquete",
                enabled: true
            }
        };
        this.props.getRandomProducts(options).then(products => {
            this.setState({ products });
        });
    }

    getSlidesToShowByAntCols(size) {
        switch (size) {
            case 'xs':
                return 2;
            case 'sm':
                return 4;
            case 'md':
                return 4;
            case 'lg':
                return 6;
            default: {
                // No Size specified
                const width = $(window).width();
                if (width < 768)
                    return this.getSlidesToShowByAntCols('xs');
                else if (width >= 768 && width < 992)
                    return this.getSlidesToShowByAntCols('sm');
                else if (width >= 992 && width < 1200)
                    return this.getSlidesToShowByAntCols('md');
                else
                    return this.getSlidesToShowByAntCols('lg');
            }
        }
    }

    getProductBlocks() {
        const { products } = this.state;
        if (products && products.length) {
            return products.map((prod, i) => {
                const imgObj = prod.item && prod.item.image
                const productPrices = prod.itemType == 'productGroup' ? prod.item.products.map(p => p.price) : null;
                return (
                    <div className="prod-card" key={i}>
                        <Link to={{ pathname: `/products/${prod.itemSku}` }}>
                            <Card>
                                <img src={imgObj ? imgObj.src : resources.IMG_NO_IMG_URL} className="img-responsive" alt="prod-image" />
                                <div className="prod-card-name">{prod.item.name}</div>
                                <div className="prod-card-price">{
                                    prod.itemType == 'product' ?
                                        currencyFormat(prod.item.price)
                                        : // productGroup
                                        currencyFormat(Math.min.apply(null, productPrices))
                                        + " - " +
                                        currencyFormat(Math.max.apply(null, productPrices))
                                }</div>
                            </Card>
                        </Link>
                    </div>
                );
            });
        } else {
            return [];
        }
    }

    render() {
        const productBlocks = this.getProductBlocks();
        const slidesToShowByAntCols = this.getSlidesToShowByAntCols();
        const slides = (productBlocks.length >= slidesToShowByAntCols) ? slidesToShowByAntCols : productBlocks.length;

        // See more carousel settings in https://github.com/akiran/react-slick used by ant carousel
        const settings = {
            autoplay: true,
            speed: 3000,
            autoplaySpeed: 4000,
            slidesToShow: slides,
            slidesToScroll: slides
        };

        return (
            productBlocks.length
                ? <div className="index-carousel">
                    <div className="divider-break">
                        <h4>Paquetes</h4>
                    </div>
                    <Carousel {...settings}>
                        {productBlocks}
                    </Carousel>
                </div>
                :
                null
        );
    }
}

RandCarousel.propTypes = {
    products: PropTypes.arrayOf(PropTypes.object)
};

const mapStateToProps = (state, ownProps) => {
    return {
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getRandomProducts: (options) => {
            return dispatch(getRandomProducts(options));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RandCarousel);