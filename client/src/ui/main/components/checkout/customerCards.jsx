import React from 'react';
import PropTypes from 'prop-types';
import { Card, Radio } from 'antd';
import classnames from 'classnames';

const CustomerCards = ({ availablePaymentMethods, selectedPaymentMethodID, setSelectedPaymentMethod }) => {
    return (
        <div className="cards-container">
            {availablePaymentMethods.map((pm, i) => {
                const ccType = pm.brand.toUpperCase() === 'VISA' ? 'VISA' :
                    pm.brand.toUpperCase() === 'MC' ? 'MASTER' : 'OTHER';
                    
                const faClass = classnames({
                    'fa fa-fw': true,
                    'fa-cc-visa': ccType === 'VISA',
                    'fa-cc-mastercard': ccType === 'MASTER',
                    'fa-credit-card': ccType === 'OTHER',
                });

                return (
                    <Card key={i} onClick={() => setSelectedPaymentMethod(availablePaymentMethods[i])}>
                        <div>
                            <Radio checked={pm._id === selectedPaymentMethodID}>
                                <i className={faClass} /> Terminación <strong> {pm.last4}</strong>
                            </Radio>
                        </div>
                        <div>
                            Nombre: <i className="grey-ind">{pm.name}</i>
                        </div>
                        <div>
                            Exp: <i className="grey-ind">{pm.expMonth}/{pm.expYear}</i>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

CustomerCards.propTypes = {
    availablePaymentMethods: PropTypes.array.isRequired,
    setSelectedPaymentMethod: PropTypes.func.isRequired,
    selectedPaymentMethodID: PropTypes.string
};

export default CustomerCards;