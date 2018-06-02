import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

import CategoryFilterDropdown from '../common/categoryFilterDropdown.jsx';

class AllProductsOptions extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onCategoryFilterChange(categoryID, categoryPath) {
        const { onFilterChange } = this.props;
        onFilterChange({category: categoryID});
        this.setState({ selectedCategoryPath: categoryPath });
    }

    onSearchChange(evt) {
        this.setState({ searchText: evt.target.value });
    }

    onSearch(value) {
        const { onFilterChange } = this.props;

        const search = value && value.length >= 3 ? value : null;
        onFilterChange({ name_or_sku: search });
    }

    onSearchClearClick() {
        const { onFilterChange } = this.props;

        onFilterChange({ name: null });
        this.setState({ searchText: ''});        
    }

    render() {
        const { categoryOptions, filterBy } = this.props;
        const { selectedCategoryPath, searchText } = this.state;

        const addonAfter = filterBy && filterBy.name ?
            <i className="fa fa-times fa-fw" onClick={this.onSearchClearClick.bind(this)} /> : null;

        return (
            <div className="all-products-options list-options">
                <div className="search-input-container">
                    <Input.Search value={searchText} onChange={this.onSearchChange.bind(this)}
                        placeholder="Nombre/sku" className="search-input" size="small"
                        addonAfter={addonAfter}
                        onSearch={this.onSearch.bind(this)} />
                </div>
                <div className="category-filter-container">
                    <CategoryFilterDropdown categoryOptions={categoryOptions}
                        filterCategoryPath={selectedCategoryPath || []}
                        onFilterChange={this.onCategoryFilterChange.bind(this)} />
                </div>
            </div>
        );
    }
}

AllProductsOptions.propTypes = {
    filterBy: PropTypes.object,
    onFilterChange: PropTypes.func.isRequired,
    categoryOptions: PropTypes.array.isRequired
};

export default AllProductsOptions;