import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Steps } from 'antd';
import moment from 'moment';
import _ from 'underscore';
// Actions
import { beginAjaxCall, endAjaxCall } from '../../../actions/ajaxStatusActions';
import { createOrder } from '../../../actions/customerOrdersActions';
import { getAllBranches } from '../../../actions/branchActions';
import { getDiscountByCode } from '../../../actions/variableObjectActions';
import {
    loadCustomerPaymentMethods,
    addCustomerPaymentMethod,
    createCustomerOnExternal
} from '../../../actions/customerActions';

import { mapErrors } from '../../../lib/validations';

// React components
import CheckoutButtons from '../components/checkout/checkoutButtons.jsx';
import CheckoutOrderItems from './checkoutOrderItems.jsx';
import Payment from '../components/checkout/payment.jsx';
import Shipment from '../components/checkout/shipment.jsx';
import Summary from '../components/checkout/summary.jsx';
import ServiceData from '../components/checkout/serviceData.jsx';

class Checkout extends Component {
    constructor(props, ctx) {
        super(props, ctx);


        this.state = {
            currentStep: 0,
            order: {},
            handleView: false,
        };

        // Checkout steps
        this.steps = [
        {
            title: 'Datos de Servicio',
            content: () => <ServiceData onHandleCustomerData={this.onHandleCustomerData.bind(this)} onValidSubmit={this.onServiceDataSubmit.bind(this)} onHandleServiceData={this.onHandleServiceData.bind(this)} changeView={this.state.handleView} />
        },
        {
            title: 'Productos',
            content: () => <CheckoutOrderItems orderItems={this.state.order.items || []} order={this.state.order}
                onOrderItemChargePctChange={this.onOrderItemChargePctChange.bind(this)}
                onDiscountApply={this.onDiscountCodeSubmitApply.bind(this)} />
        }, {
            title: 'Pago',
            content: () => <Payment setSelectedPaymentMethod={this.setSelectedPaymentMethod.bind(this)} showMissingError={this.state.showPaymentMethodError}
                addCardPaymentMethod={this.addCardPaymentMethod.bind(this)} selectedPaymentMethodID={this.state.selectedPaymentMethod && this.state.selectedPaymentMethod._id}
                availablePaymentMethods={this.props.customer ? this.props.customer.paymentMethods || [] : []}
                selectedPaymentType={this.state.order.payments && this.state.order.payments[0].type || 'card'}
                cardErrorMessage={this.state.cardErrorMessage} clearCardErrorMessage={this.clearCardErrorMessage.bind(this)} />
        }, {
            title: 'Cita',
            content: () => <Shipment branches={this.state.branches || []} onBranchSelect={this.onBranchSelect.bind(this)}
                selectedBranch={this.state.selectedBranch} showShipmentBranchError={this.state.showShipmentBranchError}
                onChangeDatePicker={this.onChangeDatePicker.bind(this)} showShipmentDateTimeError={this.state.showShipmentDateTimeError}
                showDatePicker={this.state.showDatePicker} datePickerValue={this.state.datePickerValue} timePickerValue={this.state.timePickerValue}
                onChangeTimePicker={this.onChangeTimePicker.bind(this)} onOpenChangeDatePicker={this.onOpenChangeDatePicker.bind(this)}
                showTimePicker={this.state.showTimePicker} />
        }, {
            title: 'Confirmar',
            content: () => <Summary order={this.state.order} onOrderSubmit={this.placeOrder.bind(this)}
                customer={this.props.customer} branch={this.state.selectedBranch}
                paymentMethod={this.state.selectedPaymentMethod} cartItems={this.props.shoppingCartItems} />
        }];
    }

    componentWillMount() {
        const { shoppingCartItems } = this.props;
        // Redirect if no items to checkout
        if (!shoppingCartItems || !shoppingCartItems.length) {
            this.props.history.push({
                pathname: '/'
            });
        }
    }

    componentDidMount() {
        this.mapCartItemsToOrderItems(this.props.shoppingCartItems || []);
    }

    componentWillReceiveProps(nextProps) {
        const shoppingCartItems = nextProps.shoppingCartItems || [];

        // Go to main if there are no shopping cart items to generate order for
        if (!shoppingCartItems.length) {
            this.props.history.push({
                pathname: '/'
            });

            return;
        }

        this.mapCartItemsToOrderItems(shoppingCartItems);
    }

    goToPreviousStep() {
        if (this.state.loading)
            return;

        const currentStep = this.state.currentStep - 1;
        this.setState({ currentStep });
    }

    // Perform validations for current step and step-advance cancellation here,
    // Call goToNextStep() to continue sequence if everything is OK
    checkCurrentStep() {
        const showPaymentMethodError = false;
        const showShipmentBranchError = false;

        switch (this.steps[this.state.currentStep].title) {
            case 'Pago': {
                const { createCustomerOnExternal, customer } = this.props;
                const { order: { payments } } = this.state;
                const payment = payments && payments[0];

                const isValid = payment && payment.type &&
                    (payment.type != 'card' || (payment.type == 'card' && payment.paymentMethod));

                if (!isValid) {
                    this.setState({ showPaymentMethodError: true });
                    return;
                } else {
                    const promise = payment.type != 'oxxo_cash' ? Promise.resolve()
                        : new Promise((resolve, reject) => {
                            createCustomerOnExternal(customer).then(() => resolve()).catch(() => reject());
                        });

                    return promise.then(() => {
                        this.goToNextStep();
                    });
                }
            }
            case 'Cita': {
                if (!(this.state.order.shipment && this.state.order.shipment.branch)) {
                    this.setState({ showShipmentBranchError: true });
                    return;
                }
                if (!(this.state.order.shipment && this.state.order.shipment.dateTime)) {
                    this.setState({ showShipmentDateTimeError: true });
                    return;
                }
                this.goToNextStep();
                break;
            }
            default: {
                this.goToNextStep();
            }
        }

        this.setState({ showPaymentMethodError, showShipmentBranchError });
    }

    // Runs just-before going to the next step
    // Perform preparations for next step here
    goToNextStep() {
        const currentStep = this.state.currentStep + 1;

        switch (this.steps[currentStep].title) {
            case 'Pago': {
                this.props.loadCustomerPaymentMethods();
                break;
            }
            case 'Cita': {
                this.props.getAllBranches().then(branches => {
                    this.setState({ currentStep, branches });
                });

                return;
            }
        }

        this.setState({ currentStep });
    }

    onHandleCustomerData(){
      const { order } = this.state;
      const { customer } = this.props;
      order.addressedTo = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone
      };
      this.setState({ order: order });
      this.goToNextStep();
    }
    onHandleServiceData(){
      this.setState({ handleView: !this.state.handleView });
    }
    onServiceDataSubmit(formData, resetFormFn, invalidateFormFn) {
      const { order } = this.state;
      order.addressedTo = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      };
      this.setState({ order: order });
      this.goToNextStep();
    }
    // onSubmitServiceDataForm(){}
    mapCartItemsToOrderItems(cartItems) {
        // Map shoppingCartItems to order items
        const { order } = this.state;

        order.items = cartItems.map(sci => {
            // If the user has selected a charge % already, don't override
            const existingItemInState = order.items && order.items.find(oi => oi.itemID == sci.itemID);
            const existingChargePctInState = existingItemInState && existingItemInState.charges[0].pct;
            const existingItemDiscountPrice = existingItemInState && existingItemInState.discountPrice;

            return {
                itemID: sci.itemID,
                type: sci.type,
                quantity: sci.quantity,
                price: sci.item.price,
                discountPrice: existingItemDiscountPrice || null,
                charges: [{
                    amount: (((existingItemDiscountPrice || sci.item.price) * sci.quantity) * (existingChargePctInState || 1)).toFixed(2),
                    pct: existingChargePctInState || 1
                }]
            };
        });

        this.setState({ order });
    }


    onOrderItemChargePctChange(item, chargePct) {
        if (!(Math.abs(item.charges[0].pct - chargePct) >= (.01 - Number.EPSILON))) // Roundint to 1%, consider EPSILON factor-like
            return;

        item.charges = [{
            amount: (((item.discountPrice || item.price) * item.quantity) * chargePct).toFixed(2),
            pct: chargePct.toFixed(2)
        }];

        this.forceUpdate();
    }

    onDiscountCodeSubmitApply(code) {
        const { getDiscountByCode } = this.props;
        console.log(code);
        return getDiscountByCode(code).then(discount => {
            this.applyDiscountToOrder(discount);
            return Promise.resolve();
        }).catch(errs => {
            return Promise.reject(errs);
        });
    }

    applyDiscountToOrder(discount) {
        const { order } = this.state;
        if (!order.discounts)
            order.discounts = [];

        if (order.discounts.find(d => d._id == discount._id))
            return;
        else
            order.discounts.push(discount);

        switch (discount.applicationType) {
            // Applies for all products on order
            case 'totalSale': {
                switch (discount.amountType) {
                    // Discount a percentage over order total
                    case 'percentage': {
                        const orderTotalDiscountAmountPct =
                            order.discounts.filter(d => d.applicationType == 'totalSale' && d.amountType == 'percentage')
                                .map(d => d.amount).reduce((a, b) => a + b);

                        // Apply discount over each item
                        order.items.forEach(item => {
                            // Set/update discount price
                            item.discountPrice = (item.price - (item.price * (orderTotalDiscountAmountPct * .01))).toFixed(2);

                            // Set/update item charges
                            const itemChargePct = item.charges[0].pct || 1;
                            item.charges = [{
                                amount: (((item.discountPrice || item.price) * item.quantity) * itemChargePct).toFixed(2),
                                pct: itemChargePct
                            }];
                        });

                        this.setState({ order });
                    }
                }
            }
        }
    }

    setSelectedPaymentMethod(paymentMethod) {
        const { order } = this.state;

        const payment = {
            type: paymentMethod.type
        };

        if (paymentMethod.type == 'card')
            payment.paymentMethod = paymentMethod._id;

        order.payments = [payment];
        this.setState({ order, selectedPaymentMethod: paymentMethod });
    }

    // // This method is called by formsy 3rd party, check api at github
    addCardPaymentMethod(formData, resetFormFn) {
        this.props.beginAjaxCall('addPaymentMethod - checkout.jsx');

        const conektaSuccessResponseHandler = (tokenObj) => {
            const paymentMethod = {
                type: 'card',
                last4: formData.number.slice(-4),
                name: formData.name,
                expMonth: formData.expMonth,
                expYear: formData.expYear,
                conektaToken: tokenObj.id
            };

            this.props.addCustomerPaymentMethod(paymentMethod).then(() => {
                resetFormFn();
            });

            this.props.endAjaxCall('addPaymentMethod - checkout.jsx');
        };

        const conektaErrorResponseHandler = (error) => {
            this.setState({ cardErrorMessage: error.message });
            this.props.endAjaxCall('addPaymentMethod - checkout.jsx');
        };

        const conektaTokenParams = {
            card: {
                number: formData.number,
                name: formData.name,
                exp_month: formData.expMonth,
                exp_year: formData.expYear,
                cvc: formData.cvc
            }
        };

        // eslint-disable-next-line no-undef
        Conekta.token.create(conektaTokenParams, conektaSuccessResponseHandler, conektaErrorResponseHandler);
    }

    onBranchSelect(branchID) {
        const { order } = this.state;
        const branch = this.state.branches.find(b => b._id == branchID);
        const branchAddress = Object.assign({}, branch.address);
        delete branchAddress._id;

        order.shipment = {
            type: 'pickup',
            address: branchAddress,
            branch: branchID,
            dateTime: null
        };

        this.setState({ order: order, selectedBranch: branch, showDatePicker: true, timePickerValue: null, datePickerValue: null, showShipmentDateTimeError: null,  showTimePicker: null });
    }

    onChangeDatePicker(date) {
        const { order } = this.state;
        delete order.shipment.dateTime;
        this.setState({ datePickerValue: date, timePickerValue: null, showTimePicker: date ? true : false });
    }

    onChangeTimePicker(time) {
        const { order, datePickerValue } = this.state;
        if (_.contains(_.range(1, 29), time.minutes()) || _.contains(_.range(31, 59), time.minutes()))
            time.minute(0);
        order.shipment.dateTime = moment(datePickerValue.format('YYYY-MM-DD') + 'T' + time.format('HH:mm')).toISOString();
        this.setState({ order: order, timePickerValue: time });
    }

    onOpenChangeDatePicker(status) {
        if (this.state.datePickerValue)
            this.setState({ showTimePicker: this.state.datePickerValue && moment.isMoment(this.state.datePickerValue) ? !status : false });
    }

    clearCardErrorMessage() {
        if (this.state.cardErrorMessage)
            this.setState({ cardErrorMessage: '' });
    }

    placeOrder() {
        const { order } = this.state;
        const { customer } = this.props;
        order.customer = customer && customer._id;

        let orderIsValid = true;

        // Check order items
        orderIsValid = orderIsValid && order.items && order.items.length && !order.items.some(i => {
            return !i.itemID || i.quantity < 1 || i.price <= 0
                || !i.type || i.charges.some(c => c.amount <= 0);
        });

        // Check order customer and shipment
        orderIsValid = orderIsValid && order.customer &&
            order.shipment && order.shipment.type && order.shipment.address;

        // Check order payment data
        orderIsValid = orderIsValid && order.payments &&
            order.payments.length == 1 && order.payments[0].type &&
            (order.payments[0].type != 'card' || (order.payments[0].type == 'card' && order.payments[0].paymentMethod));

        // This is supposed to not happen at all if each component in checkout
        // behaves as expected
        if (!orderIsValid)
            throw new Error('Invalid data in order');

        this.setState({ loading: true });

        // Todo: Do something about conekta possible errors
        return this.props.createOrder(order, false).then((newOrder) => {
            this.props.history.push({
                pathname: '/order-success',
                state: {
                    order: newOrder
                }
            });

            return Promise.resolve(newOrder);
        }).catch(errs => {
            this.setState({ loading: false });
            return Promise.reject(errs);
        });
    }

    render() {
        let { currentStep } = this.state;
        const { account } = this.props;
/*
        const isLoggedIn = account && account.isLoggedIn;

        if (currentStep === 0 && isLoggedIn) {
            this.state.currentStep++;
            currentStep++;
        }
*/
        return (
            <div className="checkout-container">
                <Steps current={currentStep}>
                    {this.steps.map(item => <Steps.Step key={item.title} title={item.title} />)}
                </Steps>

                {this.steps[currentStep].content()}

                <CheckoutButtons onPrev={this.goToPreviousStep.bind(this)} onNext={this.checkCurrentStep.bind(this)}
                    currentStep={currentStep} stepCount={this.steps.length} />
            </div>
        );
    }
}

Checkout.propTypes = {
};

const mapStateToProps = (state, ownProps) => {
    return {
        account: state.account,
        customer: state.customer,
        shoppingCartItems: state.shoppingCartItems
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        loadCustomerPaymentMethods: () => {
            return dispatch(loadCustomerPaymentMethods());
        },
        addCustomerPaymentMethod: (paymentMethod) => {
            return dispatch(addCustomerPaymentMethod(paymentMethod));
        },
        createCustomerOnExternal: (customer) => {
            return dispatch(createCustomerOnExternal(customer));
        },
        createOrder: (order, showLoading) => {
            return dispatch(createOrder(order, showLoading));
        },
        beginAjaxCall: (src) => {
            dispatch(beginAjaxCall(src));
        },
        endAjaxCall: (src) => {
            dispatch(endAjaxCall(src));
        },
        getAllBranches: () => {
            return dispatch(getAllBranches());
        },
        getDiscountByCode: (code) => {
            return dispatch(getDiscountByCode(code, false));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Checkout);
