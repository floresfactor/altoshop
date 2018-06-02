import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Cascader from '../../../../lib/antd/antdCascader/cascader.jsx';

class CategoryCell extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    setComponentRefs(ref) {
        this.cascaderRef = ref;
        this.cascaderInputRef = ref.refs.input.refs.input;
    }

    // Renders the display of Cascader dropdown
    displayRender(selectedLabelsArr, selectedItemsArr) {
        if (selectedItemsArr && selectedItemsArr.length)
            return <div>{selectedLabelsArr.pop()}</div>;
        else
            return <div></div>;
    }

    onItemClick(clickedCategoryID, dontClose) {
        // Close cascader:
        if (!dontClose && this.cascaderInputRef) {
            // Delay click: it's NOT under react internal cycle and causes problems otherwise
            setTimeout(() => this.cascaderInputRef.click(), 100);
        }

        this.props.onCategoryChange(this.props.product, { category: clickedCategoryID });
    }

    render() {
        const { product, categoryOptions } = this.props;

        // Get the full categoryPath value from producct
        const value = product.category && product.category.path &&
            [...product.category.path, product.category._id];

        return (
            <Cascader options={categoryOptions}
                onChange={(categoryPath) =>
                    this.onItemClick(categoryPath[categoryPath.length - 1], true)}
                onItemClick={({ value: clickedCategoryID }) =>
                    this.onItemClick(clickedCategoryID, false)}
                placeholder={"All categories"}
                expandTrigger={'hover'}
                displayRender={this.displayRender}
                value={value || []}
                allowClear={false}
                ref={(ref) => { if(ref)this.setComponentRefs(ref); }}
                size="small" />
        );
    }
}

CategoryCell.propTypes = {
    categoryOptions: PropTypes.array.isRequired,
    product: PropTypes.object.isRequired,
    onCategoryChange: PropTypes.func.isRequired
};

export default CategoryCell;