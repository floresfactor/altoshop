import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'antd';


// Nobody is using this component
class SwitchCell extends React.Component {
    constructor(props, context){
        super(props);
        this.onChangeSwitch = this.onChangeSwitch.bind(this);

    }
    onChangeSwitch(checked){
        this.props.onChangeSwitch(checked, this.props.accountId);
    }

    render(){

        return (
            <span>
                <Switch
                    checkedChildren={this.props.checkedChildren}
                    unCheckedChildren={this.props.unCheckedChildren}
                    defaultChecked={this.props.defaultChecked}
                    onChange={this.onChangeSwitch}
                />
            </span>
        );
    } 
};

SwitchCell.propTypes = {
    accountId: PropTypes.any.isRequired, 
    checkedChildren: PropTypes.node,
    unCheckedChildren: PropTypes.node,
    defaultChecked: PropTypes.bool.isRequired,
    onChangeSwitch: PropTypes.func.isRequired
};

export default SwitchCell