import React from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import DisplayItemColumn from './displayItemColumn.jsx';

const DisplayItemGrid = ({ displayItems }) => {
    return (
        <Row className="display-item-grid">
            {displayItems && displayItems.map((dp, i) => {
                return <DisplayItemColumn key={i} displayItem={dp} />
            })}
        </Row>
    );
};

DisplayItemGrid.propTypes = {
    displayItems: PropTypes.arrayOf(PropTypes.object)
};

export default DisplayItemGrid;