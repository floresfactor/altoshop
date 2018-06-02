import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Components
import OxxoStub from '../common/oxxoStub.jsx';

class OrderCompletedScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        // Go to main if there isn't an order id on router state
        if (!(this.props.location.state && this.props.location.state.order)) {
            this.props.history.push('/');
            return;
        }

        // Get order from router state
        this.setState({ order: this.props.location.state.order });

        // Clear orderID from router state
        this.props.history.push({
            state: Object.assign({}, this.props.location.state, { order: null })
        });
    }

    render() {
        const { order } = this.state;
        
        if(!order)
            return null;
        
        const paymentReference = order.payments[0] && order.payments[0].paymentReference;
        const orderCompletedContentStyle = !paymentReference ? { marginTop: '80px' } : null;

        return (
            <div className="order-completed-screen">
                <div className="order-completed-content" style={orderCompletedContentStyle}>
                    <img src="/public/img/complete-icon.png" className="complete-img" />
                    <h5>
                        Gracias! su orden
                            <strong> #{order._id} </strong>
                        ha sido procesada
                        </h5>
                    <div>En breve recibirà un e-mail de confirmaciòn</div>
                    <div className="go-back">
                        <Link to="/">Regresar  <i className="fa fa-undo fa-fw" /></Link>
                    </div>
                    {paymentReference && 
                        <OxxoStub total={order.total} 
                            reference={paymentReference.replace(/(\d{4}(?!\s))/g, "$1-")}
                            showInstructions={true} />}
                </div>
            </div>
        );
    }
}

OrderCompletedScreen.propTypes = {
};

export default OrderCompletedScreen;