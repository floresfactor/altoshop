import React from 'react';
import { Form } from 'formsy-react-components';
import { Row, Col, Button, Icon } from 'antd';
import Input from '../../../admin/components/common/formsyAntInput';

import { ValidationErrors, validationRegexs, masks } from '../../../../lib/validations';

// Components
import FormsyMaskInput from '../../../common/components/formsyMaskInput.jsx';

const ServiceData = ({ onHandleCustomerData, onHandleServiceData, changeView, onValidSubmit }) => (
  <div>
    <Row className="account-block">
        <Col sm={11} xs={24}>
            <div className="personal">
                Usar datos de mi cuenta
              <Button type="primary" onClick={onHandleCustomerData} style={{width:'100%'}}>Mis Datos</Button>
            </div>
        </Col>

        <Col sm={11} xs={24}>
            <div className="extern">
              Modificar datos del envio
              <Button type="primary" onClick={onHandleServiceData} style={{width:'100%'}}>{changeView ? "Atras" : "Modificar"}</Button>
            </div>
        </Col>

    </Row>
    {changeView ?
      (
    <Row className="fill-element">
        <div className="customer-block container">
          <h4>Datos personales</h4>
          <Form noValidate className="login-form" layout="vertical" validateOnSubmit={true} onValidSubmit={onValidSubmit}>
              <Row className="fill-element">
                  <Col md={12} sm={24}>
                      <Input name="firstName" label="Nombre:"
                          placeholder="Nombre(s)" value=""
                          validations={{ matchRegexp: validationRegexs.name }}
                          required validationErrors={ValidationErrors} />
                  </Col>
                  <Col md={12} sm={24}>
                      <Input name="lastName" label="Apellidos:"
                          placeholder="Apellidos" value=""
                          validations={{ matchRegexp: validationRegexs.name }}
                          required validationErrors={ValidationErrors} />
                  </Col>
              </Row>
              <Row className="fill-element">
                <Col md={12} sm={24}>
                <Input name="email" label="Emal:" placeholder="Correo" value="" validations="isEmail" required validationErrors={ValidationErrors}
                addonBefore={<Icon type="mail" />} />
                </Col>
                <Col md={12} sm={24}>
                    <FormsyMaskInput name="phone" label="Teléfono:" value= ""
                        mask={masks.MXPhone} placeholder="Phone" validations={{ matchRegexp: validationRegexs.phone }}
                        required validationErrors={{
                            isDefaultRequiredValue: ValidationErrors.required,
                            matchRegexp: ValidationErrors.invalidPhone
                    }} />
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Guardar</Button>
          </Form>
      </div>
    </Row>)
    : null}
  </div>
);

export default ServiceData;
