import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Radio, Slider } from 'antd';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class PaymentOptions extends React.Component {
    constructor(props) {
        super(props);

        this.allowedPartialPaymentPercentagePerItem = .20;

        this.state = {
            paymentType: props.item.charges[0].pct == 1 ? 'full' : 'partial',
            useSliderVal: false,
            marks: {
                [+(this.allowedPartialPaymentPercentagePerItem * 100)]: [this.allowedPartialPaymentPercentagePerItem * 100] + '%',
                100: '100%'
            }
        };
    }

    onRadioClick(evt) {
        const isFull = evt.target.value == 'full';

        if (isFull)
            this.setChargePct(100);
        else
            this.setChargePct(20);// forces 20% discount

        this.setState({ paymentType: evt.target.value });
    }

    onSliderChange(val) {
        this.setState({ sliderVal: val, useSliderVal: true });
    }

    setChargePct(val) {
        this.props.onChargePctChange(this.props.item, val / 100);
        this.setState({ useSliderVal: false });
    }

    render() {
        const { item } = this.props;
        const { paymentType, sliderVal, useSliderVal, marks } = this.state;
        const chargePct = item.charges[0].pct * 100;
        return (
            <div>
                {this.props.width < 993 ? (<div style={{ textAlign:'center' }}>Tipo de pago</div>) : null}
                <RadioGroup value={paymentType} size="small" onChange={this.onRadioClick.bind(this)}>
                    <RadioButton value="full">{this.props.width < 993 ? 'Contado': 'Pago al contado' }</RadioButton>
                    <RadioButton value="partial">{this.props.width < 993 ? 'Parcial 20%': 'Pago parcial (20%)' }</RadioButton>
                </RadioGroup>

                {/*paymentType === 'partial' &&
                    <div>
                        <Slider onAfterChange={this.setChargePct.bind(this)} onChange={this.onSliderChange.bind(this)}
                                min={this.allowedPartialPaymentPercentagePerItem * 100} max={100} marks={marks}
                                value={useSliderVal ? sliderVal: chargePct} tipFormatter={(val) => `${val}%`}  />
                        <div><span><strong>Anticipo: </strong></span>{`${Number(chargePct).toFixed(0)}%`}</div>
                    </div>*/}
            </div>
        );
    }
}

PaymentOptions.propTypes = {
    item: PropTypes.object.isRequired,
    onChargePctChange: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired
};

const mapStateToProps = (state) => {
  return {
    width: state.environment.width
  };
};

export default connect(mapStateToProps, null)(PaymentOptions);
