import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { mapSubCategoriesToChildObjects } from '../../../../lib/util/mapCategories';

// React components
import Cascader from '../../../../lib/antd/antdCascader/cascader.jsx';

class CategoryCascader extends Component {
    constructor(props) {
        super(props)
        this.cascaderInputRef = null;
        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.recursiveCategories && nextProps.recursiveCategories.length) {
            const cascaderOptions = nextProps.recursiveCategories.map(c => {
                return {
                    value: c._id,
                    label: c.name,
                    path: [c._id],
                    children: c.subCategories.map(sc => mapSubCategoriesToChildObjects(sc))
                };
            });       
            
            this.setState({ cascaderOptions });
        }
    }

    onCascaderItemClick(clickedItem) {
        const { onCascaderChange } = this.props;

        // Close cascader:
        if (this.cascaderInputRef) {
            // Delay click: it's NOT under react internal cycle and causes problems otherwise
            setTimeout(() => this.cascaderInputRef.click(), 100);
        }

        onCascaderChange(clickedItem.path);
    }

    cascaderDisplayRender(selectedLabelsArr, selectedItemsArr) {
        if (selectedItemsArr && selectedItemsArr.length)
            return <div>{selectedLabelsArr.pop()}</div>;
        else
            return <div />;
    }

    setComponentRefs(ref) {
        this.cascaderInputRef = ref.refs.input.refs.input;
    }

    render() {
        const { onCascaderChange, selectedCategoryPath } = this.props;
        const { cascaderOptions } = this.state;
        
        return (
            <Cascader options={cascaderOptions}
                ref={(ref) => { if (ref) this.setComponentRefs(ref); }}
                onChange={onCascaderChange}
                onItemClick={this.onCascaderItemClick.bind(this)}
                placeholder={"Todos los servicios"}
                expandTrigger={'hover'}
                value={selectedCategoryPath}
                displayRender={this.cascaderDisplayRender.bind(this)}
                size="small" />
        )
    }
}

CategoryCascader.propTypes = {
    selectedCategoryPath: PropTypes.array,
    onCascaderChange: PropTypes.func.isRequired,
    recursiveCategories: PropTypes.array.isRequired
}

export default CategoryCascader