import React from 'react';
import PropTypes from 'prop-types';
import { Collapse, Tabs } from 'antd';

// Components
import AddCardForm from '../checkout/addCardForm.jsx';
import CustomerCards from '../checkout/customerCards.jsx';
import OxxoStub from '../common/oxxoStub.jsx';

class Payment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabActiveKey: props.selectedPaymentType || 'card'
        };
    }

    onCollapseChange(collapseActiveKeysArr) {
        this.setState({ collapseActiveKeysArr });
    }

    onTabsChange(tabActiveKey) {
        if(tabActiveKey == 'oxxo_cash')
            this.props.setSelectedPaymentMethod({ type: 'oxxo_cash' });
        else if (tabActiveKey == 'card')
            this.props.setSelectedPaymentMethod({ }); // clear

        this.setState({ tabActiveKey });
    }

    render() {
        const { availablePaymentMethods,
                selectedPaymentMethodID,
                addCardPaymentMethod,
                setSelectedPaymentMethod,
                cardErrorMessage,
                clearCardErrorMessage,
                showMissingError } = this.props;

        const { collapseActiveKeysArr, tabActiveKey } = this.state;

        return (
            <div className="payment-block container">
                <Tabs activeKey={tabActiveKey} size="small" onChange={this.onTabsChange.bind(this)}>
                    <Tabs.TabPane tab={<span><i className="fa fa-fw fa-credit-card"/>Card</span>} key="card">
                        <Collapse bordered={false} activeKey={collapseActiveKeysArr || (availablePaymentMethods.length ? ['1'] : ['2'])} onChange={this.onCollapseChange.bind(this)}>
                            <Collapse.Panel header="Tarjetas de crédito y débito" key="1">
                                <CustomerCards availablePaymentMethods={availablePaymentMethods}
                                    selectedPaymentMethodID={selectedPaymentMethodID} setSelectedPaymentMethod={setSelectedPaymentMethod} />
                            </Collapse.Panel>
                            <Collapse.Panel header="Agregar una tarjeta" key="2">
                                <AddCardForm addPaymentMethod={addCardPaymentMethod}
                                    cardErrorMessage={cardErrorMessage} clearCardErrorMessage={clearCardErrorMessage} />
                            </Collapse.Panel>
                        </Collapse>
                        {showMissingError && !selectedPaymentMethodID && <div className="error-span">Seleccionar / Agregar un método de pago</div>}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<span><i className="fa icon-oxxo"/>PAY</span>} key="oxxo_cash">
                        <div className="oxxo-payment">
                            <p>Se gerarà una referencia de pago con la que podràs acudir a cualquier tienda oxxo a cubrir el monto de tu orden: </p>
                            <OxxoStub reference={'XXXX-XXXX-XXXX-XX'} total={0} />
                        </div>
                    </Tabs.TabPane>
                </Tabs>                
            </div>
        );
    }
}

Payment.propTypes = {
    availablePaymentMethods: PropTypes.array.isRequired,
    addCardPaymentMethod: PropTypes.func.isRequired,
    setSelectedPaymentMethod: PropTypes.func.isRequired,
    cardErrorMessage: PropTypes.string,
    clearCardErrorMessage: PropTypes.func.isRequired,
    selectedPaymentMethodID: PropTypes.string,
    showMissingError: PropTypes.bool
};

export default Payment;