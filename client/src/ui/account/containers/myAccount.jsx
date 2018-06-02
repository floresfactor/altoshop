import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import { Link } from 'react-router-dom';

import { createCustomer, relateCustomerToAccount, updateCustomer } from '../../../actions/customerActions';
import { changeField } from '../../../actions/accountActions';

// Components
import AccountOption from '../components/myAccount/accountOption.jsx';

class MyAccount extends Component {
    constructor(props) {
        super(props);
    }

    onCustomerFieldChange(field, value) {
        const { account, customer, createCustomer, updateCustomer, relateCustomerToAccount } = this.props;

        if(!customer || !customer._id) {
            return createCustomer({ [field]: value });
        }

        const updatedCustomer = Object.assign({}, customer, { [field]: value });

        if(!account.customer) {
            return relateCustomerToAccount(customer).then(() => {
                return updateCustomer(updatedCustomer);
            });
        } else {
            return updateCustomer(updatedCustomer);
        }
    }

    onFieldChange(changedField) {        
        const fieldName = Object.keys(changedField)[0];

        switch(fieldName) {
            case 'firstName':
            case 'lastName':
            case 'customerEmail': {
                return this.onCustomerFieldChange(fieldName, changedField[fieldName]);
            }

            case 'accountEmail': {
                return this.props.changeAccountField('email', changedField[fieldName]);
            }
        }
    }

    render() {
        const { customer, account } = this.props;

        return (
            <div className="my-account-container">
                <Card title="Cliente">
                    <AccountOption text="Nombre:"
                        value={customer && customer.firstName || ''}
                        fieldName="firstName"
                        fieldRequired={true}
                        onValueChangePromise={this.onFieldChange.bind(this)} />
                    <AccountOption text="Apellido:"
                        value={customer && customer.lastName || ''}
                        fieldName="lastName"
                        fieldRequired={true}
                        onValueChangePromise={this.onFieldChange.bind(this)} />
                    <AccountOption text="Email:"
                        value={customer && customer.email || ''}
                        fieldName="customerEmail"
                        fieldRequired={true}
                        onValueChangePromise={this.onFieldChange.bind(this)} />                        
                </Card>                
                <Card title="Cuenta">
                    <AccountOption text="Email:"
                        value={account && account.email}
                        fieldName="accountEmail"
                        fieldRequired={true}
                        onValueChangePromise={this.onFieldChange.bind(this)} />
                    <div className="account-option-row">
                        <div className="row-content">
                            <div>
                                <strong>Contraseña:</strong>
                                <div>***********</div>
                            </div>
                            <Link to={{pathname: "/account/resetPassword"}} className="ant-btn">
                                Editar
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
}

MyAccount.propTypes = {
    account: PropTypes.object.isRequired,
    customer: PropTypes.object,
    createCustomer: PropTypes.func.isRequired,
    updateCustomer: PropTypes.func.isRequired,
    relateCustomerToAccount: PropTypes.func.isRequired,
    changeAccountField: PropTypes.func.isRequired
};

const mapStateToProps = (state) => ({
    account: state.account,
    customer: state.account.customer
});

const mapDispatchToProps = (dispatch) => {
    return {
        createCustomer: (customer) => {
            return dispatch(createCustomer(customer, false));
        },
        updateCustomer: (updatedCustomer) => {
            return dispatch(updateCustomer(updatedCustomer, false));
        },
        relateCustomerToAccount: (customer) => {
            return dispatch(relateCustomerToAccount(customer, false));
        },
        changeAccountField: (fieldName, value) => {
            return dispatch(changeField(fieldName, value, false));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyAccount);

