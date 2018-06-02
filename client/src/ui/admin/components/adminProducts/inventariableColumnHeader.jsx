import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Switch, Checkbox } from 'antd';
import classnames from 'classnames';

class InventariableColumnHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownVisible: false,
            filterActive: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.filterBy && nextProps.filterBy !== this.props.filterBy) {
            this.setState({ 
                filterActive: nextProps.filterBy.inventariable !== undefined && nextProps.filterBy.inventariable !== null
            });
        }
    }

    toggleDropdown(show) {
        this.setState({ dropdownVisible: show });
    }

    toggleCheckbox(evt) {
        const { onFilterChange, filterBy } = this.props;
        const filterActive = !!evt.target.checked;

        const filterInventariable = filterBy && filterBy.inventariable == true ? true : false;        
        
        if(filterActive) {
            onFilterChange({
                inventariable: filterInventariable
            });
        } else {
            onFilterChange({
                inventariable: null
            });
        }

        this.setState({ filterActive });
    }

    getDropdownContent() {
        const { onFilterChange, filterBy } = this.props;
        const { filterActive } = this.state;

        const filterInventariable = filterActive &&
            filterBy && filterBy.inventariable == true ? true : false;

        return (
            <div className="inventariable-filter-dropdown-inner">
                <Checkbox onChange={this.toggleCheckbox.bind(this)} checked={filterActive}>
                    &nbsp; Inventariable: &nbsp;
                </Checkbox>
                <Switch checkedChildren="Si" unCheckedChildren="No" disabled={!filterActive} checked={filterInventariable === true}
                    onChange={(checked) => onFilterChange({ inventariable: checked })}/>
            </div>
        );
    }

    render() {
        const { dropdownVisible } = this.state;
        const toggleIconClassName = classnames({
            'fa fa-fw fa-filter': true,
            'active': false
        });

        return (
            <div className="inventariable-column-header">
                <div className="title">
                    Inventariable &nbsp;
                </div>
                <Popover visible={dropdownVisible} onVisibleChange={this.toggleDropdown.bind(this)}
                    overlayClassName="inventariable-filter-dropdown"
                    content={this.getDropdownContent()} 
                    trigger="click" 
                    placement="bottomRight">
                    <i className={toggleIconClassName} />
                </Popover>
            </div>
        );
    }
}

InventariableColumnHeader.propTypes = {
    filterBy: PropTypes.object,
    onFilterChange: PropTypes.func.isRequired,
};

export default InventariableColumnHeader;
