import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { validationRegexs } from '../../../lib/validations';
import { Form } from 'formsy-react-components';
import { Icon, Input,Button, Spin, notification } from 'antd';

import { addSubscription }  from '../../../actions/subscriptionActions';

class SubscribeEmail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            loading: false
        };
    }

    componentDidMount() {
        notification.config({ placement: "bottomRight" });
    }

    onMailClick() {
        const isEmail = validationRegexs.email;
        const { email } = this.state;
        if (isEmail.test(email))
            this.setState({ loading: true }, () => {
                this.props.subscribeEmail(email).then(() => {
                    this.setState({ loading: false, email: "" }, () => {
                        notification.success({
                            message: 'Gracias por suscribirte!',
                            description: 'Recibiras las ultimas promociones de Kopay en tu correo.',
                            icon: <Icon type="smile" />,
                        });
                    });
                }).catch(err => {
                    this.setState({ loading: false }, () => {
                        notification.error({
                            message: 'Error al registrar el correo.',
                            description: err.message,
                            icon: <Icon type="frown" />,
                        });
                    });
                });
            });
        else
            notification.error({
                message: "Correo inválido.",
                icon: <Icon type="frown" />
            });
    }

    onMailInputChange(e) {
        const email = e.target.value;
        this.setState({ email });
    }

    render() {
        const { email, loading } = this.state;
        const { label } = this.props;

        return (
            <div className="subscribe">
                <div className="mail-label">{label}</div>
                <Spin className="register-loading" spinning={loading}>
                    <Form onValidSubmit={this.onMailClick.bind(this)}>
                        <Input id="subscribe-mail"
                            value={email}
                            onChange={this.onMailInputChange.bind(this)}
                            placeholder="Correo"
                            addonAfter={<Button type="primary" onClick={this.onMailClick.bind(this)}>¡Subscribete!</Button>}
                        />
                    </Form>
                </Spin>

            </div>
        );
    }
}
const mapStateToProps = (state)=>{
    return {
        subscription: state.subscription
    }
}

const mapDispatchToProps = (dispatch)=>{
    return {
        subscribeEmail: (email)=>{
            return dispatch(addSubscription(email))
        }
    }
}

SubscribeEmail.propTypes = {
    label: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(SubscribeEmail);