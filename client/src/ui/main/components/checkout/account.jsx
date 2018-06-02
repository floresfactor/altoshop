import React, { PropTypes } from 'react';
import { Col, Row } from 'antd';

// Components
import Register from '../../../account/components/accountLogOperations/register.jsx';

const Account = ({ onValidRegisterSubmit, captcha, getCaptcha, attempts }) => {
    return (
        <Row className="account-block">
            <Col sm={24} xs={24}>
                <div className="login">
                    <Register onValidSubmit={onValidRegisterSubmit} captcha={captcha} getCaptcha={getCaptcha} count={attempts.count} limit={attempts.limit}/>
                </div>
            </Col>
        </Row>
    );
};

Account.propTypes = {
  onValidRegisterSubmit: PropTypes.func.isRequired,
};

export default Account;
