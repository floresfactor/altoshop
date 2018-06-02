import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Cascader from '../../../../lib/antd/antdCascader/cascader.jsx';

class CategoryFilterDropdown extends Component {
    constructor(props) {
        super(props);
    }

    setComponentRefs(ref) {
        this.cascaderRef = ref;
        this.cascaderInputRef = ref.refs.input.refs.input;
    }
    
    cascaderDisplayRender(selectedLabelsArr, selectedItemsArr) {
        if (selectedItemsArr && selectedItemsArr.length)
            return <div>{selectedLabelsArr.pop()}</div>;
        else
            return <div></div>;
    }

    onCascaderItemClick({children: childrenObjCategories, label, path: categoryPath, value: clickedCategoryID, dontClose}) {
        const { onFilterChange } = this.props;

        // Close cascader:
        if (!dontClose && this.cascaderInputRef) {
            // Delay click: it's NOT under react internal cycle and causes problems otherwise
            setTimeout(() => this.cascaderInputRef.click(), 100);
        }

        onFilterChange(clickedCategoryID, categoryPath);
    }

    render() {
        const { categoryOptions, filterCategoryPath } = this.props;

        return (
            <div className="category-filter-dropdown-inner">
                <label>Filtrar por: &nbsp;</label>
                <Cascader options={categoryOptions}
                      onChange={(categoryPath) =>
                        this.onCascaderItemClick({path: categoryPath, value: categoryPath[categoryPath.length - 1], dontClose: true})}
                      onItemClick={this.onCascaderItemClick.bind(this)}
                      placeholder={"Category..."}
                      expandTrigger={'hover'}                      
                      displayRender={this.cascaderDisplayRender.bind(this)}
                      value={filterCategoryPath || []}
                      allowClear={true}
                      ref={(ref) => { if(ref)this.setComponentRefs(ref); }}
                      size="small" />
            </div>
        );
    }
}

CategoryFilterDropdown.propTypes = {
    categoryOptions: PropTypes.array.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    filterCategoryPath: PropTypes.array.isRequired
};

export default CategoryFilterDropdown;