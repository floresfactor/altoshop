import React from 'react';
import PropTypes from 'prop-types';

import { currencyFormat } from '../../../../lib/util/formatUtils';

const DiscountsTable = ({ discounts }) => {
    return (
        <div className="order-details-table">
            {discounts.map((d, idx) => {
                return (
                    <table key={idx}>
                        <thead>
                            <tr>
                                <th colSpan="2">{d.name}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Claim Type:</td>
                                <td>{d.claimType.toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td>Application Type:</td>
                                <td>{d.applicationType == 'totalSale' ? '% of total sale' : 'Not implemented'}</td>
                            </tr>
                            <tr>
                                <td>Code:</td>
                                <td>{d.code.toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td>Amount:</td>
                                <td>{(d.amountType == 'percentage' ? d.amount + '%' : 'Not implemented')}</td>
                            </tr>
                            <tr>
                                <td>Valid Until:</td>
                                <td>{moment(d.validUntil).format('DD MMMM YYYY - hh:mma')}</td>
                            </tr>
                        </tbody>
                    </table>
                );
            })}
        </div>
    );
};

DiscountsTable.propTypes = {
    discounts: PropTypes.array.isRequired
};

export default DiscountsTable;