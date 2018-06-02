import React, { PropTypes } from 'react';
import Select from 'react-select';

const SelectInput = ({ name, label, options, loadOptions, value, errors, onChange, refHandle }) => {
    let wrapperClass = (errors && errors.length > 0) ? 'form-group has-error' : 'form-group';
    let i = 0;

    return (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <div className="field">
                {/*Sync options*/}
                {options && <Select name={name} value={value} options={options} onChange={onChange} />}
                {/*Async options*/}
                {loadOptions && <Select.Async name={name} value={value} loadOptions={loadOptions} onChange={onChange} ref={refHandle} />}
                {errors && errors.length > 0 && errors.map(err => <div key={i++}><code>{err}</code></div>)}
            </div>
        </div>
    );
};

SelectInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultOption: PropTypes.string,
    value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
    ]),
    errors: PropTypes.array,
    options: PropTypes.arrayOf(PropTypes.object),
    loadOptions: PropTypes.func,
    refHandle: PropTypes.func
};

export default SelectInput;