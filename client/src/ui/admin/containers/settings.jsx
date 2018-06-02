import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Tabs, Spin } from 'antd';

import VariableObjectTypes from '../../../lib/constants/variableObjectTypes';
import { getAppSettings, setAppSettings } from '../../../actions/variableObjectActions';

// Components
import SettingsCard from '../components/settings/settingsCard.jsx';

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentWillMount() {
        this.props.getAppSettings();
    }

    onSettingValueSubmit(newSetting) {
        const { appSettings, setAppSettings } = this.props;
        const settingName = Object.keys(newSetting)[0];

        this.setState({ loading: true });

        // Preserve types (coming from forms as string values)
        let newSettingVal;
        switch(typeof appSettings[settingName].value) {
            case 'boolean':
                newSettingVal = typeof newSetting[settingName] === 'boolean' ? newSetting[settingName] : newSetting[settingName] == 'true' ? true : false;
                break;
            case 'number':
                newSettingVal = Number(newSetting[settingName]);
                break;
            default:
                newSettingVal = newSetting[settingName];
        }        

        // Send to server
        setAppSettings(settingName, newSettingVal).finally(() => {
            this.setState({ loading: false });
        });
    }

    render() {
        const { appSettings } = this.props;
        const { loading } = this.state;

        if (!appSettings)
            return null;

        // Build email settings
        const emailSettings = [];
        [{ settingName: 'EMAIL_HOST', displayName: 'Email Host' },
        { settingName: 'EMAIL_PORT', displayName: 'Email Port' },
        { settingName: 'EMAIL_SECURE', displayName: 'Secure Email' },
        { settingName: 'EMAIL_AUTH_USER', displayName: 'Email User' },
        { settingName: 'EMAIL_AUTH_PASS', displayName: 'Email Password' },
        { settingName: 'EMAIL_DEFAULT_TO', displayName: 'Default "to" field' },
        { settingName: 'EMAIL_DEFAULT_SUBJECT', displayName: 'Default "subject" field' },
        { settingName: 'EMAIL_DEFAULT_TEXT', displayName: 'Default email text' }].forEach(sett => {
            if (appSettings[sett.settingName])
                emailSettings.push({
                    name: sett.settingName,
                    displayName: sett.displayName,
                    values: appSettings[sett.settingName].values,
                    value: appSettings[sett.settingName].value,
                    readonly: appSettings[sett.settingName].readonly
                });
        });

        // Build language settings
        const langSettings = [];
        [{ settingName: 'DATE_LOCALE', displayName: 'Locale' },
        { settingName: 'DATETIME_FORMAT', displayName: 'Date&Time Format' },
        { settingName: 'LANGUAGE', displayName: 'App Language' }].forEach(sett => {
            if (appSettings[sett.settingName])
                langSettings.push({
                    name: sett.settingName,
                    displayName: sett.displayName,
                    values: appSettings[sett.settingName].values,
                    value: appSettings[sett.settingName].value,
                    readonly: appSettings[sett.settingName].readonly
                });
        });

        // Build payment settings
        const paymentSettings = [{ name: 'Payment_Provider', displayName: 'Payment Provider', values: ['Conekta'], value: 'Conekta' }];
        [{ settingName: 'CONEKTA_API_KEY', displayName: 'Conekta API Server Key' },
        { settingName: 'CURRENCY', displayName: 'Payment Currency' }].forEach(sett => {
            if (appSettings[sett.settingName])
                paymentSettings.push({
                    name: sett.settingName,
                    displayName: sett.displayName,
                    values: appSettings[sett.settingName].values,
                    value: appSettings[sett.settingName].value,
                    readonly: appSettings[sett.settingName].readonly
                });
        });

        return (
            <div className="settings-container">
                <Spin spinning={loading || false}>
                    <Tabs defaultActiveKey="1">
                        <Tabs.TabPane tab={<span><i className="fa fa-fw fa-envelope-o" /> Email</span>} key="1" className="settings-tab">
                            <SettingsCard settings={emailSettings} title="Mailing Credentials"
                                onSettingValidSubmit={this.onSettingValueSubmit.bind(this)} />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<span><i className="fa fa-fw fa-language" />Ubicación</span>} key="2" className="settings-tab">
                            <SettingsCard settings={langSettings} title="Language Options"
                                onSettingValidSubmit={this.onSettingValueSubmit.bind(this)} />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<span><i className="fa fa-fw fa-money" />Pagos</span>} key="3" className="settings-tab">
                            <SettingsCard settings={paymentSettings} title="Payment Options"
                                onSettingValidSubmit={this.onSettingValueSubmit.bind(this)} />
                        </Tabs.TabPane>
                    </Tabs>
                </Spin>
            </div>
        );
    }
}

Settings.propTypes = {
    appSettings: PropTypes.object,
    getAppSettings: PropTypes.func.isRequired,
    setAppSettings: PropTypes.func.isRequired
};


const mapStateToProps = (state) => {
    return {
        appSettings: state.variableObject && state.variableObject.variableObjectType == VariableObjectTypes.APP_SETTINGS
            ? state.variableObject.appSettings : null
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getAppSettings: () => {
            dispatch(getAppSettings(false));
        },
        setAppSettings: (settingName, settingVal) => {
            return dispatch(setAppSettings(settingName, settingVal, false));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);