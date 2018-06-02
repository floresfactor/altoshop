import React from 'react';
import PropTypes from 'prop-types';
import { Input, Spin, Button } from 'antd';

class DiscountsTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
    }

    onDiscountCodeInputChange(evt) {
        this.setState({ discountCode: evt.target.value, showCodeError: false });
    }

    applyDiscount() {
        const { applyDiscountFn } = this.props;
        const { discountCode } = this.state;

        this.setState({ loading: true });
        applyDiscountFn(discountCode).then(() => {
            // Clear
            this.setState({ discountCode: '' });
        }).catch((errs) => {
            this.setState({ showCodeError: true });
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    render() {
        const { discounts, hideCupon } = this.props;
        const { discountCode, showCodeError, loading } = this.state;

        return (
            <div className="item-summary-table">
                <table className="table table-responsive table-condensed table-hover table-stripped">
                    <thead>
                        <tr><th colSpan="2">Descuentos <i style={{ fontWeight: 'normal' }}>({discounts.length})</i></th></tr>
                    </thead>
                    <tbody>
                        {discounts.length ? discounts.map((d, idx) => {
                            return (
                                <tr key={idx}>
                                    <td colSpan="2">{d.name}</td>
                                </tr>
                            );
                        }) : null}
                        {!hideCupon &&
                            <tr>
                                <td>
                                    <Input value={discountCode} className="cupon-input"
                                        onChange={this.onDiscountCodeInputChange.bind(this)}
                                        onPressEnter={() => { if (!this.state.loading) this.applyDiscount(); }} />
                                    {showCodeError && <span className="error-span">cupon Invalido/Expirado</span>}
                                </td>
                                <td>
                                    <Spin spinning={loading}>
                                        <Button type="primary" size="small" onClick={this.applyDiscount.bind(this)}>
                                            Aplicar Cupòn
                                        </Button>
                                    </Spin>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

DiscountsTable.propTypes = {
    hideCupon: PropTypes.bool,
    discounts: PropTypes.array.isRequired,
    applyDiscountFn: PropTypes.func
};

export default DiscountsTable;