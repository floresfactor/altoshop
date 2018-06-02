import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Col, Button } from 'antd';

import { currencyFormat } from '../../../../lib/util/formatUtils';
import { urls } from '../../../../lib/http';
import resources from '../../../../lib/constants/resources';

const DisplayItemColumn = withRouter(({ displayItem, history }) => {
    const productPrices = displayItem.itemType == 'productGroup' ? displayItem.item.products.map(p => p.price) : null;
    const imgObj = displayItem.itemType == 'product' ? displayItem.item.images.find(i => i.src) : displayItem.item.image;
    const comingFrom = history.location.pathname + history.location.search;

    return (
        <Col lg={4} md={6} sm={6} xs={12} className="display-item-column">
            <div className="display-item-column-content">
                <Link to={{ pathname: `/products/${displayItem.itemSku}`, state: { comingFrom } }}>
                    <div className="display-item-image">
                        <img src={imgObj ? imgObj.src : resources.IMG_NO_IMG_URL} />
                    </div>
                </Link>
                <div className="display-item-title">{displayItem.item.name}</div>
                <div className="display-item-price">
                    {displayItem.itemType == 'product' ?
                        <div>{currencyFormat(displayItem.item.price)}</div>
                        : // productGroup
                        <div>
                            {currencyFormat(Math.min.apply(null, productPrices))}
                            &nbsp;-&nbsp;
                                {currencyFormat(Math.max.apply(null, productPrices))}
                        </div>}
                </div>
                <div className="ant-btn"><Link to={{ pathname: `/products/${displayItem.itemSku}`, state: { comingFrom } }}>Ver</Link></div>
            </div>
        </Col>
    );
});

DisplayItemColumn.propTypes = {
    displayItem: PropTypes.object.isRequired
};

export default DisplayItemColumn;