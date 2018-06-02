import React from 'react';
import PropTypes from 'prop-types';

import { currencyFormat } from '../../../../lib/util/formatUtils';

const SummaryTable = ({ order }) => {
    const paidPayments = order.payments.filter(p => (p. status && p.status.toUpperCase()) == 'PAID');
    const paidAmount = paidPayments.length && paidPayments.map(p => p.amount).reduce((a,b) => a+b) || 0;
    const pedingAmount = order.total - paidAmount;
    
    return (
        <div className="order-summary-table">
            <table>
                <tbody>
                    <tr>
                        <td>Cliente:</td>
                        <td>{`${order.customer.firstName} ${order.customer.lastName}`}</td>
                    </tr>
                    <tr>
                        <td>Total:</td>
                        <td>
                            <strong>{`${currencyFormat(order.total)} ${order.currency} `}</strong>
                            {(pedingAmount > 1 ? `(${currencyFormat(pedingAmount)} PENDING)` : 'PAID')}
                        </td>
                    </tr>
                    <tr>
                        <td>Fecha:</td>
                        <td>{moment(order.createdAt).format('DD MMMM YYYY - hh:mma')}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

SummaryTable.propTypes = {
    order: PropTypes.object.isRequired
};

export default SummaryTable;