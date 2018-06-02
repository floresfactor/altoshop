import React from 'react';
import PropTypes from 'prop-types';

const CustomerInfoTable = ({ customer }) => {
    return (
        <div className="order-details-table">
            <table>
                <tbody>
                    <tr>
                        <td>Nombre:</td>
                        <td>{`${customer.firstName} ${customer.lastName}`}</td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td>{customer.email}</td>
                    </tr>
                    <tr>
                        <td>Teléfono:</td>
                        <td>{customer.phone}</td>
                    </tr>
                    <tr>
                        <td>Cuenta registrada:</td>
                        <td>{customer.account ? 'Si' : 'No'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

CustomerInfoTable.propTypes = {
    customer: PropTypes.object.isRequired
};

export default CustomerInfoTable;