import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import { HOC } from 'formsy-react';
import classnames from 'classnames';
import { Input, Button, Tooltip, DatePicker } from 'antd';

// Components
class FormsyAntInlineInput extends React.Component {
    constructor(props) {
        super(props);

        this.inputRef = null;

        this.state = {
            isValidDate: true
        };
    }

    componentDidMount() {
        // Focus and move cursor to the end of the string
        if (this.inputRef) {
            this.inputRef.focus();
            let temp = this.inputRef.refs.input.value;
            this.inputRef.refs.input.value = '';
            this.inputRef.refs.input.value = temp;
        }
    }

    setValue(value) {
        this.props.setValue(value);
    }

    onChange(inpuType, e) {
        const value = (inpuType === "date") ? e : e.target.value;
        let valid = true;

        switch (inpuType) {
            case "date": {
                this.setValue(value);
                this.setState({ isValidDate: value ? true : false });
                return;
            }
            case "int":
            case "integer": {
                valid = this.numberTest(value, "int");
                break;
            }
            case "unsg-int":
            case "unsigned-integer":
            case "unsigned-int": {
                valid = this.numberTest(value, "unsg_int");
                break;
            }
            case "numeric":
            case "number": {
                valid = this.numberTest(value);
                break;
            }
            case "unsg-number":
            case "unsigned-number": {
                valid = this.numberTest(value, "unsg_numb");
                break;
            }
        }

        valid && this.setValue(value);
    }

    numberTest(value, type) {
        //Falta agregar e+ e-
        const regxs = {
            number: /^-?((0|[1-9][0-9]*)(\.[0-9]*)?)?$/,
            int: /^-?(0|[1-9][0-9]*)?$/,
            unsg_int: /^(0|[1-9][0-9]*)$/,
            unsg_numb: /^(0|[1-9][0-9]*)(\.[0-9]*)?$/
        };

        let reg = regxs[type] || regxs["number"];
        return ((!isNaN(value) || value === '-') && reg.test(value)) || value === '';
    }

    render() {
        const { submit, format } = this.props;
        const isValid = this.props.isValid();
        const inputType = (this.props.inputType || "").toLowerCase();

        // Build props related to this component
        const thisProps = {
            onChange: this.onChange.bind(this, inputType),
            value: this.props.getValue(),
            className: classnames({
                'antd-input-has-error': !isValid
            })
        };

        // Get antInputProps
        let antInputProps = {};
        ({
            maxLength: antInputProps.maxLength,
            size: antInputProps.size,
            disabled: antInputProps.disabled,
            prefix: antInputProps.prefix,
            suffix: antInputProps.suffix,
            onPressEnter: antInputProps.onPressEnter,
            autosize: antInputProps.autosize
        } = this.props);

        switch (inputType) {
            case "textarea": {
                return (
                    <div className="text-area">
                        <Input type="textarea" {...thisProps} {...antInputProps} ref={(ref) => this.inputRef = ref} />
                        <Button style={{ width: "100%" }} type="primary" size="small" htmlType="submit" className="login-form-button">Ok</Button>
                    </div>
                );
            }
            case "date": {
                const { isValidDate } = this.state;
                const dateIconProps = isValidDate ?
                    { className: "fa fa-fw fa-check", style: { color: 'white', cursor: 'pointer' } } :
                    { className: "fa fa-fw fa-times", style: { color: 'red', cursor: 'not-allowed' } };

                const dateIcon = <i onClick={submit} {...dateIconProps} />;

                return (
                    <div className={"date-picker" + " " + classnames({ 'date-picker-has-error': !isValidDate })}>
                        <DatePicker format={'DD MMMM YYYY'} {...thisProps} onOpenChange={(open) => {
                            if (open) {
                                setTimeout(() => {
                                    $('.ant-calendar-picker-container').addClass('ignore-react-onclickoutside');
                                }, 500);
                            }
                        }} />
                        <Button style={{ verticalAlign: 'unset' }} type="primary" className="login-form-button" disabled={!isValidDate} htmlType="submit">{dateIcon}</Button>
                    </div>
                );
            }
            default: {
                const { hideTooltip, tooltipPlacement } = this.props;
                const title = thisProps.value ? (format ? format(thisProps.value) : thisProps.value) : "Input a value";                

                if (!antInputProps.suffix) {
                    antInputProps.suffix = isValid ?
                        <i className="fa fa-fw fa-check" style={{ color: 'green', cursor: 'pointer' }} onClick={submit} /> :
                        <i className="fa fa-fw fa-times" style={{ color: 'red', cursor: 'not-allowed' }} onClick={submit} />;
                }

                return (
                    !hideTooltip ?
                    <Tooltip trigger={['focus']} title={title} placement={tooltipPlacement || 'topLeft'} overlayClassName="cell-input">
                        <Input {...thisProps} {...antInputProps} ref={(ref) => this.inputRef = ref} />
                    </Tooltip>
                    :
                    <Input {...thisProps} {...antInputProps} ref={(ref) => this.inputRef = ref} />                    
                );
            }
        }
    }
}

FormsyAntInlineInput.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
        PropTypes.number,
        momentPropTypes.momentObj
    ]),
    name: PropTypes.string.isRequired,
    inputType: PropTypes.string,
    format: PropTypes.func,
    submit: PropTypes.func,
    // Provided by formsy HOC
    setValue: PropTypes.func.isRequired,
    getValue: PropTypes.func.isRequired,
    isValid: PropTypes.func.isRequired,
    hideTooltip: PropTypes.bool,
    tooltipPlacement: PropTypes.string
};

export default HOC(FormsyAntInlineInput);