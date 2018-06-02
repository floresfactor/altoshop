import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'formsy-react-components';
import { Row, Col, Cascader, Select, Button } from 'antd';
import Input from '../../../admin/components/common/formsyAntInput';

import { ValidationErrors, validationRegexs, masks } from '../../../../lib/validations';

// Components
import FormsyMaskInput from '../../../common/components/formsyMaskInput.jsx';
const Option = Select.Option;



const Customer = ({ customer, onValidSubmit, handleChange}) => {
    customer = customer || {};

    return (
        <div className="customer-block container">
            <h4>Datos personales</h4>
            <Form noValidate className="login-form" layout="vertical" validateOnSubmit={true} onValidSubmit={onValidSubmit}>
                <Row className="fill-element">
                    <Col md={12} sm={24}>
                        <Input name="firstName" label="Nombre:"
                            placeholder="Nombre(s)" value={customer.firstName || ""}
                            validations={{ matchRegexp: validationRegexs.name }}
                            required validationErrors={ValidationErrors} />
                    </Col>
                    <Col md={12} sm={24}>
                        <Input name="lastName" label="Apellidos:"
                            placeholder="Apellidos" value={customer.lastName || ""}
                            validations={{ matchRegexp: validationRegexs.name }}
                            required validationErrors={ValidationErrors} />
                    </Col>
                </Row>
                <Row className="fill-element">
                  <Col md={12} sm={24}>
                    <label className="control-label" data-required="true" htmlFor="genere">
                        Genero: <span className="required-symbol">*</span>
                    </label>
                    <Select style={{ width: '100%' }}  placeholder="Selecciona tu genero" id="genere"  onChange={handleChange}>
                      <Option value="male">Masculino</Option>
                      <Option value="female">Femenino</Option>
                      <Option value="other">Otro</Option>
                    </Select>
                  </Col>
                  <Col md={12} sm={24}>
                      <FormsyMaskInput name="phone" label="Teléfono:" value={customer.phone || ""}
                          mask={masks.MXPhone} placeholder="Phone" validations={{ matchRegexp: validationRegexs.phone }}
                          required validationErrors={{
                              isDefaultRequiredValue: ValidationErrors.required,
                              matchRegexp: ValidationErrors.invalidPhone
                      }} />

                  </Col>
                </Row>
                <Row className="fill-element">
                  <Col md={12} sm={24}>
                    <Input name="state" label="Estado:"
                          placeholder="Estado" value={customer.state || ""}
                          required validationErrors={ValidationErrors} />
                  </Col>
                  <Col md={12} sm={24}>
                    <Input name="city" label="Ciudad:"
                          placeholder="Ciudad" value={customer.city || ""}
                          required validationErrors={ValidationErrors} />
                  </Col>
                </Row>
                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Guardar</Button>
            </Form>
        </div>
    );
};

Customer.propTypes = {
};

export default Customer;
