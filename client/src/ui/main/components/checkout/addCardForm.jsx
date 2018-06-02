import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select } from 'formsy-react-components';
import Input from '../../../admin/components/common/formsyAntInput';
import { Button, Row, Col } from 'antd';

import { ValidationErrors, validationRegexs, masks } from '../../../../lib/validations';

// Components
import FormsyMaskInput from '../../../common/components/formsyMaskInput.jsx';

class AddCardForm extends React.Component {
    constructor(props) {
        super(props);

        this.paymentFormRef = null;

        // Build month/year options for card form
        let expMonthOptions = [],
            expYearOptions = [];

        for (let i = 1; i <= 12; i++) {
            const v = i.toString().length == 1 ? '0' + i : i;
            expMonthOptions.push({ label: v, value: i });
        }

        for (let i = (new Date()).getFullYear(); i <= (new Date()).getFullYear() + 10; i++)
            expYearOptions.push({ label: i, value: i })

        this.state = {
            expMonthOptions, expYearOptions
        };
    }

    render() {
        const { addPaymentMethod, cardErrorMessage, clearCardErrorMessage } = this.props;
        const { expMonthOptions, expYearOptions } = this.state;

        return (
            <Form noValidate layout="vertical" validateOnSubmit={true}
                onValidSubmit={addPaymentMethod} ref={(ref) => { if (ref && ref.refs) this.paymentFormRef = ref.refs.formsy; }}
                className="add-card-form" onChange={clearCardErrorMessage}>
                <Row className="fill-element">
                    <Col lg={8}>
                        <Input name="name" label="Nombre de la tarjeta:" value={""}
                            validations={{ matchRegexp: validationRegexs.name }}
                            required validationErrors={ValidationErrors} />
                    </Col>
                    <Col lg={8}>
                        <FormsyMaskInput name="number" label="Número de tarjeta:" value={""}
                            mask={masks.card} validations={{ matchRegexp: validationRegexs.card }}
                            required validationErrors={{
                                isDefaultRequiredValue: ValidationErrors.required,
                                matchRegexp: ValidationErrors.invalidCard
                            }} />
                    </Col>
                    <Col lg={8}>
                        <label className="card-exp-label">Fecha de expiración: *</label>
                        <div className="exp-card">
                            <Select name="expMonth" className="ant-select"
                                value={(new Date()).getMonth() + 1} required options={expMonthOptions}
                                validationErrors={ValidationErrors} />
                            <Select name="expYear" className="ant-select"
                                value={(new Date()).getFullYear()} required options={expYearOptions}
                                validationErrors={ValidationErrors} />
                            <FormsyMaskInput name="cvc" label="cvc:" value={""} maskChar={""}
                                mask={masks.cvc} validations={{ matchRegexp: validationRegexs.cvc }}
                                required validationErrors={{
                                    isDefaultRequiredValue: ValidationErrors.required,
                                    matchRegexp: ValidationErrors.invalidCVC
                                }} />
                        </div>
                    </Col>
                    {cardErrorMessage && this.paymentFormRef && this.paymentFormRef.isChanged() && <div className="card-error">
                        <span> {cardErrorMessage} </span>
                    </div>}
                </Row>
                <Button type="primary" htmlType="submit">Agregar</Button>
            </Form>
        );
    }
};

AddCardForm.propTypes = {
    addPaymentMethod: PropTypes.func.isRequired,
    cardErrorMessage: PropTypes.string,
    clearCardErrorMessage: PropTypes.func.isRequired
};

export default AddCardForm;