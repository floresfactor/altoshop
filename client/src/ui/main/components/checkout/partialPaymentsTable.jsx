import React from 'react';
import PropTypes from 'prop-types';

import { currencyFormat } from '../../../../lib/util/formatUtils';

const PartialPaymentsTable = ({ orderItems, cartItems }) => {
    const itemsWithPendingCharges = orderItems.filter(i => i.charges[0].pct < 1);

    if (!itemsWithPendingCharges.length)
        return null;

    const totalPending = itemsWithPendingCharges.map(i => {
        return ((i.discountPrice || i.price) * i.quantity) - i.charges[0].amount;
    }).reduce((a, b) => a + b);

    return (
        <div className="partial-payments-table">
            <table className="table table-responsive table-condensed table-hover table-stripped">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Restante</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsWithPendingCharges.map((i, idx) => {
                        const cartItem = cartItems.find(ci => ci.itemID == i.itemID);
                        return (
                            <tr key={idx}>
                                <td>{cartItem.parentDisplayName} ({cartItem.item.name})</td>
                                <td>{currencyFormat(((i.discountPrice || i.price) * i.quantity) - i.charges[0].amount)}</td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td>Pendiente:</td>
                        <td>{currencyFormat(totalPending)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

PartialPaymentsTable.propTypes = {
    orderItems: PropTypes.array.isRequired,
    cartItems: PropTypes.array.isRequired
};

export default PartialPaymentsTable;
