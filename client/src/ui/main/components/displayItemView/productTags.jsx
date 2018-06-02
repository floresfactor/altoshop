import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';

import SystemTags from '../../../../lib/constants/tags';

const ProductTags = ({ product }) => {
    const tags = product.tags && product.tags.filter(tag => !SystemTags[tag]) || [];

    return (
        <div className="product-tags">
            {tags.length ? tags.map((tag, idx) => <Tag key={idx}>{tag}</Tag>) : null}
            <div className="divider-break" />
        </div>
    );
};

ProductTags.propTypes = {
    product: PropTypes.object.isRequired
};

export default ProductTags;