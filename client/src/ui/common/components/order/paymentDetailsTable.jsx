import React from 'react';
import PropTypes from 'prop-types';

import { currencyFormat } from '../../../../lib/util/formatUtils';

const PaymentDetailsTable = ({ payment, order }) => {
    return (
        <div className="order-details-table">
            <table>
                <thead>
                    <tr>
                        <th colSpan="2">
                            {moment(payment.createdAt).format('DD MMMM YYYY - hh:mma')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Estado del pago:</td>
                        <td>{payment.status && payment.status.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td>Total:</td>
                        <td>{`${currencyFormat(payment.amount)} ${order.currency}`}</td>
                    </tr>
                    <tr>
                        <td className="divider-cell" colSpan="2">Pago</td>
                    </tr>
                    <tr>
                        <td>Tipo:</td>
                        <td>{payment.paymentMethod && payment.paymentMethod.type.toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td>Nombre en la tarjeta:</td>
                        <td>{payment.paymentMethod && payment.paymentMethod.name}</td>
                    </tr>
                    <tr>
                        <td>Numero de tarjeta:</td>
                        <td>{`**** **** **** ${payment.paymentMethod && payment.paymentMethod.last4}`}</td>
                    </tr>
                    <tr>
                        <td>Tipo de tarjeta:</td>
                        <td>{`${payment.paymentMethod && payment.paymentMethod.brand}`}</td>
                    </tr>
                    <tr>
                        <td>Fecha Epx.:</td>
                        <td>{`${payment.paymentMethod && payment.paymentMethod.expMonth}/${payment.paymentMethod && payment.paymentMethod.expYear}`}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

PaymentDetailsTable.propTypes = {
    payment: PropTypes.object.isRequired,
    order: PropTypes.object.isRequired
};

export default PaymentDetailsTable;