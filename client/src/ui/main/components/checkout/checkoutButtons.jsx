import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

const CheckoutButtons = ({ onPrev, onNext, currentStep, stepCount }) => {
    return (
        <div className="checkout-buttons">
            {
                (currentStep > 0 || currentStep > 1)
                &&
                // <i className="fa fa-3x fa-arrow-circle-left" onClick={onPrev} />
                <Button type="primary" onClick={onPrev}>Atrás</Button>
            }
            {
                (currentStep > 0 && currentStep + 1 < stepCount)
                &&
                // <i className="fa fa-3x fa-arrow-circle-right" onClick={onNext} />
                <Button type="primary" onClick={onNext}>Siguiente</Button>
            }
        </div>
    );
};

CheckoutButtons.propTypes = {
    onPrev: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    currentStep: PropTypes.number.isRequired,
    stepCount: PropTypes.number.isRequired
};

export default CheckoutButtons;
