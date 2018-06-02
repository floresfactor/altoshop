import React, { Component } from "react";
import { connect } from 'react-redux';
import { Steps } from 'antd';
import { createCustomer } from '../../../actions/customerActions';
import { accountRegister } from '../../../actions/accountActions';
import CheckoutButtons from '../../main/components/checkout/checkoutButtons.jsx';
import Account from '../../main/components/checkout/account.jsx';
import Customer from '../../main/components/checkout/customer.jsx';
import { mapErrors } from '../../../lib/validations';

class RegisterSteps extends Component {
  constructor(props, ctx) {
    super(props, ctx);

    this.customerForm = null;

    this.state = {
        currentStep: 0,
        captcha: null,
        genere:''
    };
    // Checkout steps
    this.steps = [{
        title: 'Datos de seguridad',
        content: () => <Account onValidRegisterSubmit={this.onValidRegisterSubmit.bind(this)}
             captcha={this.state.captcha} getCaptcha={this.getCaptcha.bind(this)} attempts={this.props.attempts}/>
    }, {
        title: 'Datos personales',
        content: () => <Customer onValidSubmit={this.onValidCustomerSubmit.bind(this)} handleChange={this.handleChange.bind(this)}
        />
    }];
}

componentDidMount() {
  // redirects steps
  const { account } = this.props;
  if (account.isComplete) {
    this.props.history.push('/');
  }
}

getCaptcha(key){
  this.setState({captcha: key});
}
 // This method is called by formsy 3rd party, check api at github
onValidRegisterSubmit(formData, resetFormFn, invalidateFormFn) {
  // Login || showErrors
  this.props.register(formData).catch((errors) => {
      if (errors)
          invalidateFormFn(mapErrors(errors));
  });
}

handleChange(value){
  this.setState({genere:value});
}

onValidCustomerSubmit(formData, resetFormFn, invalidateFormFn) {
  formData.genere = this.state.genere;
  this.props.registerCustomer(formData).then(()=>{
    this.props.history.push('/');
  })
  .catch((errors) => {
    if (errors)
        invalidateFormFn(mapErrors(errors));
  });
}

goToPreviousStep() {
  if (this.state.loading)
      return;

  const currentStep = this.state.currentStep - 1;
  this.setState({ currentStep });
}

// Runs just-before going to the next step
// Perform preparations for next step here
goToNextStep() {
  const currentStep = this.state.currentStep + 1;
  this.setState({ currentStep });
}
  render() {
    let { currentStep } = this.state;
    const { account } = this.props;
    const isLoggedIn = account && account.isLoggedIn;

    if (currentStep === 0 && isLoggedIn) {
        this.state.currentStep++;
        currentStep++;
    }
    return (
      <div className="checkout-container">
      <Steps current={currentStep}>
          {this.steps.map(item => <Steps.Step key={item.title} title={item.title} />)}
      </Steps>

      {this.steps[currentStep].content()}

      <CheckoutButtons onPrev={this.goToPreviousStep.bind(this)} onNext={this.goToNextStep.bind(this)}
          isLoggedInAccount={isLoggedIn} currentStep={currentStep} stepCount={this.steps.length} />
  </div>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
      account: state.account,
      customer: state.account.customer,
      attempts: state.attempts
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
      register: (accontInfo) => {
          return dispatch(accountRegister(accontInfo));
      },
      registerCustomer: (customer) => {
          return dispatch(createCustomer(customer));
      },
  };
};
export default connect(mapStateToProps,mapDispatchToProps)(RegisterSteps);
