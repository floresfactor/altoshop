import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'antd';

// Components
import EditableCell from '../common/editableCell.jsx';
import InlineInput from '../common/inlineInput.jsx';

class InventariableCell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editingStock: false
        };
    }

    onStockEditChange(editing) {
        this.setState({ editingStock: editing });
    }

    render() {
        const { product, onValidEdit, onInvalidEdit } = this.props;
        const { editingStock } = this.state;

        const title = (            
            <a>{product.stock}</a>
        );

        const required = !!product.inventariable;
    
        return (
            <div className="inventariable-cell">
                <Switch checkedChildren="Si" unCheckedChildren="No" className="inventariable-switch"
                        checked={!!product.inventariable} onChange={(val) => onValidEdit({ inventariable: val })} />
                {product.inventariable &&
                    <div className="stock-options">
                        {!editingStock && <span>Stock:&nbsp;</span>}
                        <EditableCell displayComponent={title} editComponent={InlineInput}
                            onEditChange={this.onStockEditChange.bind(this)}
                            editComponentProps={{
                                onValidSubmit: onValidEdit, 
                                onInvalidSubmit: onInvalidEdit,
                                inputType: "unsg-int",                    
                                name: "stock", 
                                value: product.stock, 
                                required }} />
                    </div>}
            </div>

        );
    }
}

InventariableCell.propTypes = {
    product: PropTypes.object.isRequired,
    onValidEdit: PropTypes.func.isRequired,
    onInvalidEdit: PropTypes.func.isRequired
};

export default InventariableCell;