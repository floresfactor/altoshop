import React from 'react';
import PropTypes from 'prop-types';
import { ValidationErrors } from '../../../../lib/validations';
import { Form } from 'formsy-react-components';
import momentPropTypes from 'react-moment-proptypes';

// Components
import FormsyAntInlineInput from './formsyAntInlineInput.jsx';

class InlineInput extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = null;
        this.inputRef = null;
    }

    onErrorSubmit(formData, resetFn, invalidateFn) {
        if(this.props.onInvalidSubmit)
            this.props.onInvalidSubmit(formData, resetFn, invalidateFn, this.inputRef ? this.inputRef.getErrorMessages() : []);
    }

    formSubmit() {
        if (this.formRef) {            
            this.formRef.submit();
        } else {
            throw new Error('formRef missing');
        }
    }

    onValidSubmit(formData, resetFn, updateInputsWithErrorFn) {
        if(formData && this.props.value != formData[this.props.name]) {
            this.props.onValidSubmit(formData, resetFn, updateInputsWithErrorFn, this.props.hideComponent);
        }

        if(this.props.hideComponent)
            this.props.hideComponent();
    }

    processKeyUp(key) {
        if (key.which == 27)
            this.props.hideComponent();
    }

    render() {
        const { value, formClassName, ...otherProps} = this.props;

        return (
            <Form noValidate layout="vertical" validateOnSubmit={true} 
                    onInvalidSubmit={this.onErrorSubmit.bind(this)}
                    onValidSubmit={this.onValidSubmit.bind(this)} 
                    className={formClassName || ""}
                    ref={(ref) => { if (ref) this.formRef = ref.refs.formsy; }}
                    onKeyUp={this.processKeyUp.bind(this)} >
                <FormsyAntInlineInput {...otherProps}
                                      value={value || ""}
                                      validationErrors={ValidationErrors}        
                                      ref={ref => this.inputRef = ref} 
                                      submit={this.formSubmit.bind(this)} />
            </Form>
        );
    }
}

InlineInput.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
        PropTypes.number,
        momentPropTypes.momentObj
    ]),
    name: PropTypes.string.isRequired,
    inputType: PropTypes.string.isRequired,
    format: PropTypes.func,
    onInvalidSubmit: PropTypes.func,
    onValidSubmit: PropTypes.func.isRequired,
    formClassName: PropTypes.string,
    hideComponent: PropTypes.func,
    hideTooltip: PropTypes.bool,
    tooltipPlacement: PropTypes.string
};

export default InlineInput;