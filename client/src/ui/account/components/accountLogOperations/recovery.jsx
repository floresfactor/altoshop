import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'formsy-react-components';
import { Link, withRouter } from 'react-router-dom';
import { Alert, Icon, Button } from 'antd';
import { ValidationErrors } from '../../../../lib/validations';
import Input from '../../../admin/components/common/formsyAntInput';

let Recovery = ({onValidSubmit, history, recoverAccount, showAlert, limit, count})=>{
      return(
        <div>
            <div className="divider-break">
                <h5>Recuperar contraseña</h5>
            </div>
            { showAlert &&
                <Alert message={recoverAccount.message} type={recoverAccount.type} showIcon/> }
            <br/>
            <Form noValidate
                  className="login-form"
                  layout="vertical"
                  validateOnSubmit={true}
                  onValidSubmit={onValidSubmit}>
              <Input  name="email"
                      placeholder="Correo"
                      value=""
                      validations="isEmail"
                      required
                      validationErrors={ValidationErrors}
                      addonBefore={<Icon type="mail" />} />
                      <Button type="primary" htmlType="submit" disabled={count >= limit ? true : false}>Enviar contraseña</Button>
            </Form>
            {count >= 3 ? <Alert
              message={count >= limit ? "Error" : "Warning"}
              description={count === limit ? "You try to reset you password many times, please try again after 30 min" : "You try to login many times"}
              type={count >= limit ? "error" : "warning"}
              showIcon
              />: null
            }
            <div className="divider-break">
                <h5>¿Recibiste tu contraseña?</h5>
            </div>

            <div className="text-center">
                <Link to={{ pathname: "/account/login", state: { from: history.location } }}>
                    Iniciar sesión <i className="fa fa-sign-in fa-fw" />
                </Link>
            </div>
        </div>
    );
};

Recovery.propTypes = {
    onValidSubmit: PropTypes.func.isRequired,
    recoverAccount: PropTypes.object,
    showAlert: PropTypes.bool.isRequired
};

export default withRouter(Recovery);
