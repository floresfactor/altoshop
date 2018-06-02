import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Radio } from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class TableOptions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchText: props.filterBy && props.filterBy.name || ''
        };
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
        this.setState({ searchText: '' });
    }

    onAddBtnClick() {
        const { itemType, newItemCategoryID } = this.props;

        let newItem;

        switch (itemType) {
            case 'product': {
                // Create an 'empty' product to add to server
                newItem = {
                    name: 'NUEVO PRODUCTO',
                    inventariable: false,
                    stock: 0,
                    category: newItemCategoryID,
                    description: '* NUEVO *',
                    price: 1
                }
            } break;
            case 'package': {
                // Create an 'empty' product to add to server
                newItem = {
                    name: 'NUEVO PAQUETE',
                    expirationDate: moment().startOf('day').subtract(1, "days"),
                    stock: 0,
                    description: '* NUEVO *',
                    price: 1
                };
                break;
            }
            case 'productGroup': {
                newItem = {
                    name: 'NUEVO GRUPO DE PRODUCTOS',
                    category: newItemCategoryID,
                    description: '* NUEVO *'
                };
                break;
            }
            case 'discount': {
                newItem = {
                    name: 'NUEVO DESCUENTO/CUPON',
                    claimType: 'none',
                    applicationType: 'totalSale',
                    code: 'DSCNTO001',                    
                    amount: 10,
                    validUntil: new Date(2025, 1, 1, 1, 0, 0, 0)
                };
                break;
            }
        }

        this.props.addItemFn(newItem);
    }

    render() {
        const { searchText } = this.state;
        const { sortInfo: { field, order }, onSortChange, filterBy, loading } = this.props;
        const filterActive = filterBy && filterBy.name;

        const addonAfter = filterActive ?
            <i className="fa fa-times fa-fw" onClick={this.onSearchClearClick.bind(this)} /> : null;

        return (
            <div className="table-options">
                <div className="name-search">
                    <Input.Search value={searchText} onChange={this.onSearchChange.bind(this)}
                        placeholder="Busqueda por nombre/Sku" className="search-input" size="small"
                        addonAfter={addonAfter} disabled={loading}
                        onSearch={this.onSearch.bind(this)} />
                </div>
                <div className="date-order">
                    <span className="label-span">Creation Date:</span>
                    <RadioGroup value={field == 'createdAt' ? order.toString() : null}
                        disabled={loading}
                        size="small" className="option-radios"
                        onChange={(evt) => {
                            const val = evt.target.value;
                            onSortChange(null, null, { field: 'createdAt', order: Number(val) });
                        }}>
                        <RadioButton value="1">ASC</RadioButton>
                        <RadioButton value="-1">DESC</RadioButton>
                    </RadioGroup>
                </div>
                <div className="option-btns">
                    <Button type="default" className="add-btn" onClick={this.onAddBtnClick.bind(this)} disabled={loading} >
                        Agregar
                    </Button>
                </div>
            </div>
        );
    }
}

TableOptions.propTypes = {
    sortInfo: PropTypes.shape({
        field: PropTypes.string.isRequired,
        order: PropTypes.number.isRequired
    }).isRequired,
    itemType: PropTypes.oneOf(['product', 'productGroup', 'package', 'discount']),
    onSortChange: PropTypes.func.isRequired,
    filterBy: PropTypes.object,
    onFilterChange: PropTypes.func.isRequired,
    addItemFn: PropTypes.func.isRequired,
    newItemCategoryID: PropTypes.string,
    loading: PropTypes.bool.isRequired
};

export default TableOptions;