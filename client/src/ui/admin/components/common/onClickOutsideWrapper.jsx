import React from "react";
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';

class OnClickOutsideWrapper extends React.Component {
    handleClickOutside(evt) {
        this.props.handleClickOutside(evt);
    }

    render() {
        return (
            <div className="outside-click-delimiter">
                {this.props.children}
            </div>
        )
    }
}

OnClickOutsideWrapper.propTypes = {
    handleClickOutside: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
};

export default onClickOutside(OnClickOutsideWrapper);