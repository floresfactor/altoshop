import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'formsy-react-components';
import { ValidationErrors } from '../../../../lib/validations';
import { Alert, Button, Icon } from 'antd';

import Input from '../../../admin/components/common/formsyAntInput';

let Reset = ({ resetToken, onValidSubmit, changePasswordResponse, showAlert, showForm }) => {

    return (
        <div>
            {showAlert &&
                <Alert message={changePasswordResponse.message} type={changePasswordResponse.type} showIcon />}
            <br />
            {showForm && <Form noValidate
                className="login-form"
                layout="vertical"
                validateOnSubmit={true}
                onValidSubmit={onValidSubmit}>
                <Input name="newPassword"
                    type="password"
                    placeholder="Nueva contraseña"
                    value=""
                    addonBefore={<Icon type="lock" />}
                    required validations={"minLength:8"}
                    validationErrors={{
                        isDefaultRequiredValue: ValidationErrors.required,
                        minLength: ValidationErrors.minLength('Password', 8)
                    }}
                />
                <Input type="password" name="repeated_password" placeholder="Repetir contraseña" value=""
                    addonBefore={<Icon type="lock" />}
                    required validations={"equalsField:newPassword"}
                    validationErrors={{
                        isDefaultRequiredValue: ValidationErrors.required,
                        equalsField: ValidationErrors.passwordsDontMatch
                    }} />
                {resetToken &&
                    <Input name="resetToken"
                        type="hidden"
                        value={resetToken}
                    />
                }
                <Button type="primary" htmlType="submit">Cambiar contraseña</Button>
            </Form>}
        </div>
    );
};
Reset.propTypes = {
    onValidSubmit: PropTypes.func,
    resetToken: PropTypes.string,
    changePassword: PropTypes.object,
    showAlert: PropTypes.bool,
    showForm: PropTypes.bool
};

export default Reset;
