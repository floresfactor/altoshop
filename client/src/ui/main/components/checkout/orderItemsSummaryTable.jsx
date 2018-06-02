import React from 'react';
import PropTypes from 'prop-types';
import { currencyFormat } from '../../../../lib/util/formatUtils';

const OrderItemsSummaryTable = ({orderItems, loading}) => {
    let totalItems, subTotal, totalDiscountAmount, total, downPayment;

    if(!loading && orderItems) {
        totalItems = orderItems.map(i => i.quantity).reduce((a, b) => a + b);

        subTotal = orderItems.map(i => i.quantity * i.price).reduce((a, b) => a + b);

        totalDiscountAmount = subTotal - orderItems.map(i => (i.discountPrice || i.price) * i.quantity).reduce((a, b) => a + b);

        total = orderItems.map(i => i.quantity * i.price).reduce((a, b) => a + b) - totalDiscountAmount;
        
        downPayment = orderItems.map(i => Number(i.charges[0].amount)).reduce((a, b) => a + b);
    }
    //This table is very confuse when client select a partial payment.
    return (
        <div className="order-items-summary-table">            
            <table className="table table-responsive table-condensed table-hover table-stripped">
                <thead>
                    <tr><th colSpan="2">Tu orden</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Total de artículos: </td>
                        <td>{loading || !orderItems ? 'loading...': totalItems}</td>
                    </tr>
                    <tr>
                        <td>Subtotal: </td>
                        <td>{loading || !orderItems ? 'loading...': currencyFormat(subTotal)}</td>
                    </tr>
                    {(totalDiscountAmount > Number.EPSILON) &&
                        <tr>
                            <td>Descuentos: </td>
                            <td>{loading || !orderItems ? 'loading...': '-' + currencyFormat(totalDiscountAmount)}</td>
                        </tr>}
                    <tr>
                        <td>Total: </td>
                        <td>{loading || !orderItems ? 'loading...': currencyFormat(total)}</td>
                    </tr>
                    {Math.abs(total - downPayment) > Number.EPSILON && /* i.e. total != downPayment*/
                        <tr>
                            <td>Primer pago : </td>
                            <td>{loading || !orderItems ? 'loading...' : currencyFormat(downPayment)}</td>
                        </tr>}
                </tbody>
            </table>
        </div>
    );
};

OrderItemsSummaryTable.propTypes = {
    orderItems: PropTypes.array,
    loading: PropTypes.bool.isRequired
};

export default OrderItemsSummaryTable;