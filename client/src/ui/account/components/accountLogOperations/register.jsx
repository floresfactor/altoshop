import React from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Form } from 'formsy-react-components';
import { Link, withRouter } from 'react-router-dom';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import Captcha from 'react-gcaptcha';
import { Spin, Alert, Button, Icon } from 'antd';
import { signWithGoogle, signWithFacebook } from '../../../../actions/accountActions';
import Input from '../../../admin/components/common/formsyAntInput';
import { ValidationErrors } from '../../../../lib/validations';

const error = () => (<Spin tip="Loading...">
  <Alert
    message="Register fail"
    description="Somthing bad happen, try again"
    type="danger"
  />
</Spin>);

const loading = () => {
  console.log('loading....');
};



const loaded = function () {
  console.log('recaptchaLoaded');
};

const Register = ({ onValidSubmit, history, captcha, getCaptcha, signWithFacebook, signWithGoogle, limit, count }) => {
  return (
    <div>
      <div className="divider-break">
        <h5>Crear cuenta</h5>
      </div>
      <GoogleLogin
        clientId="446883172264-a2i5rnimhhu80alombfg2ck0eenhlun0.apps.googleusercontent.com"
        onSuccess={signWithGoogle}
        onFailure={error}
        className="g-login-button"
        responseType="token"
        onRequest={loading}
          >
        <span>Registrate con Google</span>
        <Icon type="google-plus" />
      </GoogleLogin>
      <div className="divider-break">
        <h5>Or</h5>
      </div>
      <FacebookLogin
        appId="1599862790110391"
        autoLoad={false}
        fields="name,email,picture"
        callback={signWithFacebook}
        cssClass="fb-login-button"
        textButton="Registrate con Facebook"
      />
      <div className="divider-break">
        <h5>Or</h5>
      </div>
      <Form noValidate className="login-form" layout="vertical" validateOnSubmit={true} onValidSubmit={onValidSubmit}>
        <Input name="email" placeholder="Correo" value="" validations="isEmail" required validationErrors={ValidationErrors}
          addonBefore={<Icon type="mail" />} />
        <Input type="password" name="password" placeholder="Contraseña" value=""
          addonBefore={<Icon type="lock" />}
          required validations={"minLength:8"}
          validationErrors={{
            isDefaultRequiredValue: ValidationErrors.required,
            minLength: ValidationErrors.minLength('Password', 8)
          }} />
        <Input type="password" name="repeated_password" placeholder="Repetir contraseña" value=""
          addonBefore={<Icon type="lock" />}
          required validations={"equalsField:password"}
          validationErrors={{
            isDefaultRequiredValue: ValidationErrors.required,
            equalsField: ValidationErrors.passwordsDontMatch
          }} />
  <Input type="hidden" name="captcha" value={captcha} required/>
          <Captcha
            sitekey = "6LfTQVoUAAAAAJlirAm2MYj_bH-_r8YS1s9sg7Ff"
            onloadCallback={loaded}
            verifyCallback={getCaptcha}
          />
          <Button type="primary" htmlType="submit" disabled={count >= limit ? true : false}>Regístrate</Button>
      </Form>
        {count >= 3 ? <Alert
          message={count >= limit ? "Error" : "Warning"}
          description={count >= limit ? "You try to login many times, please try again after 20 min" : "You try to login many times"}
          type={count >= limit ? "error" : "warning"}
          showIcon
        />: null}
        <div className="divider-break">
          <h5>¿Ya tienes cuenta?</h5>
        </div>
        <div className="text-center">
          <Link to={{ pathname: "/account/login", state: { from: history.location } }}>
              Iniciar Sesión<i className="fa fa-sign-in fa-fw" />
          </Link>
        </div>
        <div className="divider-break">
          <h5>¿Olvidaste tu contraseña?</h5>
        </div>
        <div className="text-center">
          <Link to={{ pathname: "/account/recovery", state: { from: history.location } }} className="ant-btn">
            Recuperar contraseña
          </Link>
      </div>
    </div>
  );
};

Register.propTypes = {
  onValidSubmit: PropTypes.func.isRequired
};

export default withRouter(connect(null, { signWithFacebook, signWithGoogle })(Register));
