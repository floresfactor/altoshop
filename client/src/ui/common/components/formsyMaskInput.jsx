import React from 'react';
import PropTypes from 'prop-types';
import { HOC } from 'formsy-react';
import InputMask from 'react-input-mask';
import classnames from 'classnames';

class FormsyMaskInput extends React.Component {
    render() {
        const { label, mask, required } = this.props;
        const maskChar = this.props.maskChar !== undefined ? this.props.maskChar : '_';

        const eID = (new Date()).getMilliseconds();

        const showErrors = this.props.isFormSubmitted() && !this.props.isPristine() && !this.props.isValid();

        const classNames = classnames({
            'form-control': true,
            'ant-input': true,
            'antd-input-has-error': showErrors
        })

        return (
            <div className="mask-input-wrap">
                {label &&
                    <label className="control-label" data-required="true" htmlFor={eID}>
                        {label} {required && <span className="required-symbol">*</span>}
                    </label>}
                <InputMask id={eID} mask={mask} className={classNames} maskChar={maskChar}
                    value={this.props.getValue()} onChange={(e) => this.props.setValue(e.target.value)} />
                {showErrors && <span style={{ color: "#f04134" }}>{this.props.getErrorMessage()}</span>}
            </div>
        );
    }
};

FormsyMaskInput.propTypes = {
    mask: PropTypes.string.isRequired,
    label: PropTypes.string,
    required: PropTypes.bool
}

export default HOC(FormsyMaskInput);
