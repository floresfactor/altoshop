import React from 'react';
import PropTypes from 'prop-types';

import { currencyFormat } from '../../../../lib/util/formatUtils';
import { Col, Row } from 'antd';

const PurchaseInfo = ({ product }) => {
    let discounted = product.discounted;

    function OldPrice() {
        if (discounted){
            return (<div className="old-price">
                ANTES: 
                <span> {currencyFormat(product.originalPrice)}</span>
            </div>);
        } else {
            return null;
        }
    }

    return (
        <Row className="purchase">
            {/* <Col sm={12} xs={24}>
                <img className="payment-methods" src="/public/img/payments.png"/>
            </Col> */}
            <Col span={24} className="price-info">
                <OldPrice />
                <div>
                    PRECIO:
                    <span> {currencyFormat(product.price)}</span>
                </div>
            </Col>
        </Row>
    );
};

PurchaseInfo.propTypes = {
    product: PropTypes.object.isRequired
};

export default PurchaseInfo;