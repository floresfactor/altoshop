import React from 'react';
import PropTypes from 'prop-types';
import { HOC } from 'formsy-react';
import { Input, Button } from 'antd';
import classnames from 'classnames';

class FormsyAntInlineInput extends React.Component {
    constructor(props) {
        super(props);
    }

    onChange(e) {
        const value = e.target.value;
        this.props.setValue(value);
    }

    render() {
        const { placeholder, addonBefore, type, name, getValue, isValid, isFormSubmitted, getErrorMessage, getErrorMessages, isRequired, label, autosize} = this.props;

        const isValidVal = isValid() || !isFormSubmitted();
        const msg = isFormSubmitted() && (getErrorMessage() || getErrorMessages()[0]);

        const inputProps = {
            placeholder,
            addonBefore,
            type,
            name,
            autosize
        };

        const thisProps = {
            value: getValue(),
            onChange: this.onChange.bind(this),
            className: classnames({
                'antd-input-has-error': !isValidVal
            })
        };

        const ID = (new Date()).getMilliseconds();

        return (
            <div style={{ display: "grid" }}>
                {label && <label htmlFor={ID}>{label + (isRequired() ? " *" : "")}</label>}
                <Input id={ID} {...inputProps} {...thisProps} />
                <div style={{ color: "#f04134" }}>{msg}</div>
            </div>
        );
    }
}

FormsyAntInlineInput.propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.string,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    label: PropTypes.string,
    autosize: PropTypes.object,
    // Provided by formsy HOC
    addonBefore: PropTypes.node,
    setValue: PropTypes.func.isRequired,
    getValue: PropTypes.func.isRequired,
    isRequired: PropTypes.func.isRequired,
    getErrorMessage: PropTypes.func.isRequired,
    getErrorMessages: PropTypes.func.isRequired,
    isValid: PropTypes.func.isRequired
};

export default HOC(FormsyAntInlineInput);