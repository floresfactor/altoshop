import React, { Component } from "react";
import PropTypes from 'prop-types';

import { Form, Input, Checkbox } from 'formsy-react-components';

import { ValidationErrors } from '../../../lib/validations';

const include = (array,find) =>{
      return array.indexOf(find) >= 0
};
const accountForm = ({ account, setAccountFormRef })=>{
  return(
    <Form layout="vertical" validateOnSubmit={true} validatePristine={false} ref={(ref) => setAccountFormRef(ref)}>
      <Input name="email" placeholder="email" value={account.email || ''} required validations="isEmail"  
             validationErrors={ValidationErrors} ></Input>
      <Checkbox name="admin" value={include(account.roles, 'admin')} 
                label="admin" />
    </Form>  
  );
};
accountForm.PropTypes = {
  account: PropTypes.object.isRequired,
  setAccountFormRef: PropTypes.func.isRequired
}

export default accountForm;