import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Card from 'antd/lib/card';

import resources from '../../../../lib/constants/resources';
import { currencyFormat } from '../../../../lib/util/formatUtils';

const ProdCard = ({prod})=>{
  const imgObj = prod.item && prod.item.image
  const productPrices = prod.itemType == 'productGroup' ? prod.item.products.map(p => p.price) : null;
  return(
    <div className="prod-card">
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
  )
}

ProdCard.propTypes = {
  prod: PropTypes.shape({
    itemType: PropTypes.string.isRequired,
    _id: PropTypes.string.isRequired,
    itemSku: PropTypes.string.isRequired,
    item: PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.object,
      price: PropTypes.number
    })
  })
}

export default ProdCard;