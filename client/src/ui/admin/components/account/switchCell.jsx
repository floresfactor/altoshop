import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'antd';

class SwitchCell extends React.Component {
    constructor(props, context){
        super(props);
        this.onChangeSwitch = this.onChangeSwitch.bind(this);

    }
    onChangeSwitch(checked){
        this.props.onChangeSwitch(checked, this.props._id)
    }

    render(){

        return (
            <span>
                <Switch checkedChildren={this.props.checkedChildren}
                    unCheckedChildren={this.props.unCheckedChildren}
                    defaultChecked={this.props.defaultChecked}
                    onChange={this.props.onChangeSwitch}
                />
            </span>
        );
    } 
};

SwitchCell.propTypes = {
    _id:             PropTypes.string.isRequired, 
    checkedChildren: PropTypes.node,
    unCheckedChildren: PropTypes.node,
    defaultChecked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
};

export default SwitchCell;