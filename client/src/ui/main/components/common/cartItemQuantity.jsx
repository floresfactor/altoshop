import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select, InputNumber } from 'antd';

class CartItemQuantiy extends Component {
    constructor(props) {
        super(props);
        this.state = {
            quantity: props.cartItem.quantity
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.cartItem !== this.props.cartItem)
            this.setState({ quantity: nextProps.cartItem.quantity, updating: false });
    }

    getSelectOptions(cartItem) {        
        const opts = [];

        for (let i = 1; ((!cartItem.item.inventariable || i <= cartItem.item.stock) && i <= 10); i++) {
            const val = i.toString();
            opts.push(<Select.Option value={val} key={i}>{val == 10 ? '+10' : val}</Select.Option>);
        }

        return opts;
    }

    onSelectChange(value) {
        this.setState({ quantity: value });

        if(value != 10)
            this.props.onChange(value);
    }

    onInputChange(value) {
        // Allow blank when writing in input
        if(value === '')
            return;
        // Get validated quantity
        value = this.validateInputValue(value);
        this.setState({ quantity: value }, () => {
            if(value < 10)
                this.updateQuantity();
        });
    }

    onInputFocus() {
        this.setState({ onInput: true });        
    }

    onInputBlur(evt) {
        const value = this.validateInputValue(evt.target.value);
        this.setState({ quantity: value, onInput: false });

        if(value < 10)
            this.props.onChange(value);
    }
    
    validateInputValue(value) {
        const { cartItem } = this.props;

        value = value !== undefined ? value.toString().replace(/[^0-9]/, '') : undefined;

        if (value == undefined || isNaN(value))
            value = cartItem.quantity;

        if(cartItem.item.inventariable) {
            value = value > cartItem.item.stock ? cartItem.item.stock : value;
        } else {
            value = value <= 99 ? value : 99;
        }

        return value;
    }

    updateQuantity() {
        const { quantity } = this.state;
        
        this.setState({ updating: true });
        this.props.onChange(quantity);
    }

    render() {
        const { cartItem } = this.props;
        const { quantity: stateQuantity, onInput, updating } = this.state;

        const value = stateQuantity.toString();
        const options = value < 10 && !onInput ? this.getSelectOptions(cartItem) : null;
        const overStock = cartItem.item.inventariable && cartItem.quantity > cartItem.item.stock;

        return (
            <div>
                {options ?
                    <Select value={value} onChange={this.onSelectChange.bind(this)} className="quantity-select" dropdownClassName="cart-items-select">
                        {options}
                    </Select>
                :
                    <div>           
                        {/* Number input */}
                        <InputNumber min={0} value={value} step={1} className="quantity-input" onFocus={this.onInputFocus.bind(this)}
                            onChange={this.onInputChange.bind(this)} onBlur={this.onInputBlur.bind(this)} />
                        
                        {/* Update button */}
                        {stateQuantity != cartItem.quantity && !updating && <div><button onClick={this.updateQuantity.bind(this)} className="btn btn-default btn-xs update-btn">Update</button></div>}
                    </div>}
                {overStock && <div><span className="error-span">Superaste el nùmero de stock disponible</span></div>}
            </div>
        );
    }
}

CartItemQuantiy.propTypes = {
    onChange: PropTypes.func.isRequired,
    cartItem: PropTypes.object.isRequired
};

export default CartItemQuantiy;