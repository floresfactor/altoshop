import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Switch, Checkbox } from 'antd';
import classnames from 'classnames';

class EnabledColumnHeader extends Component {
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
                filterActive: nextProps.filterBy.enabled !== undefined && nextProps.filterBy.enabled !== null
            });
        }
    }

    toggleDropdown(show) {
        this.setState({ dropdownVisible: show });
    }

    toggleCheckbox(evt) {
        const { onFilterChange, filterBy } = this.props;
        const filterActive = !!evt.target.checked;

        const filterEnabledPGs = filterBy && filterBy.enabled == true ? true : false;        
        
        if(filterActive) {
            onFilterChange({
                enabled: filterEnabledPGs
            });
        } else {
            onFilterChange({
                enabled: null
            });
        }

        this.setState({ filterActive });
    }

    getDropdownContent() {
        const { onFilterChange, filterBy } = this.props;
        const { filterActive } = this.state;

        const filterEnabledPGs = filterActive &&
            filterBy && filterBy.enabled == true ? true : false;

        return (
            <div className="enabled-filter-dropdown-inner">
                <Checkbox onChange={this.toggleCheckbox.bind(this)} checked={filterActive}>
                    &nbsp; Filtrar Activos: &nbsp;
                </Checkbox>
                <Switch checkedChildren="Si" unCheckedChildren="No"
                    disabled={!filterActive} checked={filterEnabledPGs === true}
                    onChange={(checked) => onFilterChange({ enabled: checked })}/>
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
            <div className="enabled-column-header">
                <div className="title">
                    Activo &nbsp;
                </div>
                <Popover visible={dropdownVisible} onVisibleChange={this.toggleDropdown.bind(this)}
                    overlayClassName="enabled-filter-dropdown"
                    content={this.getDropdownContent()} 
                    trigger="click" 
                    placement="bottomRight">
                    <i className={toggleIconClassName} />
                </Popover>
            </div>
        );
    }
}

EnabledColumnHeader.propTypes = {
    filterBy: PropTypes.object,
    onFilterChange: PropTypes.func.isRequired,
};

export default EnabledColumnHeader;
