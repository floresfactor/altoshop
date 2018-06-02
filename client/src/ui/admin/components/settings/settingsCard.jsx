import React from 'react';
import { Card, Input, Select } from 'antd';
import PropTypes from 'prop-types';

// Components
import InlineInput from '../../components/common/inlineInput.jsx';
import EditableCell from '../../components/common/editableCell.jsx';

const SettingsCard = ({ title, settings, onSettingValidSubmit }) => {
    return (
        <div className="settings-card">
            <Card title={title} bordered={false} >
                <div className="shadowed-well">
                    {settings.map((sett, idx) => {
                        return (
                            <div className="form-element-vertical" key={idx}>
                                <label htmlFor={sett.name}>{sett.displayName}</label>
                                {sett.readonly && <Input value={sett.value} readOnly={true} />}
                                {!sett.readonly && !sett.values &&
                                    <EditableCell displayComponent={<Input value={sett.value} readOnly={true} />} editComponent={InlineInput}
                                        editComponentProps={{
                                            onValidSubmit: onSettingValidSubmit,
                                            onInvalidSubmit: () => {},
                                            inputType: "text",
                                            name: sett.name,
                                            value: sett.value,
                                            required: true,
                                            tooltipPlacement: "top"
                                        }} />}
                                {!sett.readonly && sett.values &&
                                    <Select value={sett.value.toString()} onChange={val => onSettingValidSubmit({[sett.name]: val})}>
                                        {sett.values.map((val, valIdx) =>
                                            <Select.Option key={valIdx} value={val.toString()}>{val.toString()}</Select.Option>)}
                                    </Select>}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

SettingsCard.propTypes = {
    title: PropTypes.string.isRequired,
    settings: PropTypes.array.isRequired,
    onSettingValidSubmit: PropTypes.func.isRequired
};

export default SettingsCard;