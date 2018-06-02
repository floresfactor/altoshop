import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover } from 'antd';
import classnames from 'classnames';

// Components
import Cascader from '../../../../lib/antd/antdCascader/cascader.jsx';
import CategoryFilterDropdown from './categoryFilterDropdown.jsx';

class CategoryColumnHeader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dropdownVisible: false,
            filterCategoryPath: []
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.filterBy && nextProps.filterBy !== this.props.filterBy && !nextProps.filterBy.category) {
            this.setState({ filterCategoryPath: []});
        }
    }

    toggleDropdown(show, ...args) {
        this.setState({ dropdownVisible: show });
    }

    onFilterChange(categoryID, categoryPath) {
        this.props.onFilterChange({ category: categoryID || null });
        this.setState({ filterCategoryPath: categoryPath });
    }   

    getDropdownContent() {
        const { categoryOptions } = this.props;
        const { filterCategoryPath } = this.state;

        return (
            <CategoryFilterDropdown categoryOptions={categoryOptions} 
                filterCategoryPath={filterCategoryPath} 
                onFilterChange={this.onFilterChange.bind(this)} />
        );
    }

    render() {
        const { dropdownVisible } = this.state;
        const toggleIconClassName = classnames({
            'fa fa-fw fa-filter': true,
            'active': false
        });

        return (
            <div className="category-column-header">
                Categoría &nbsp;
                <Popover visible={dropdownVisible} onVisibleChange={this.toggleDropdown.bind(this)}
                    overlayClassName="category-filter-dropdown"
                    content={this.getDropdownContent()} 
                    trigger="click" 
                    placement="bottom">
                    <i className={toggleIconClassName} />
                </Popover>
            </div>
        );
    }
}

CategoryColumnHeader.propTypes = {
    filterBy: PropTypes.object,
    onFilterChange: PropTypes.func.isRequired,
    categoryOptions: PropTypes.array.isRequired
};

export default CategoryColumnHeader;