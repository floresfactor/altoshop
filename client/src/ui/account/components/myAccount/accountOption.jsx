import React from 'react';
import PropTypes from 'prop-types';

import InlineInput from '../../../admin/components/common/inlineInput.jsx';

class AccountOption extends React.Component {
    constructor(props) {
        super(props);
        this.state = {showingEdit: false};
    }

    toggleEdit() {
        let { showingEdit } = this.state;
        const { value } = this.props;

        showingEdit = !showingEdit;
        let editValue;

        if (showingEdit)
            editValue = value;
        else
            editValue = null;

        this.setState({ showingEdit, editValue });
    }

    onEditSubmit(changedField) {
        const { onValueChangePromise } = this.props;

        onValueChangePromise(changedField).then(() => {
            this.setState({ showingEdit: false });
        });
    }

    render() {
        const { text, value, fieldName, fieldRequired } = this.props;
        const { showingEdit, editValue } = this.state;

        const children = (
            showingEdit ?
               (<div className="row-content">
                    <InlineInput onValidSubmit={this.onEditSubmit.bind(this)}
                        inputType="text"
                        name={fieldName}
                        value={editValue}
                        hideTooltip={true}
                        required={fieldRequired} />
                    <button className="ant-btn" onClick={this.toggleEdit.bind(this)}>
                        Cancelar
                    </button>
                </div>)
                :
                (<div className="row-content">
                    <div>
                        <strong>{text}</strong>
                        <div>{value}</div>
                    </div>
                    <button className="ant-btn" onClick={this.toggleEdit.bind(this)}>
                        Editar
                    </button>
                </div>)
        );

        return (
            <div className="account-option-row">
                {children}
            </div>
        );
    }
}

AccountOption.propTypes = {
    text: PropTypes.string.isRequired,
    value: PropTypes.string,
    fieldName: PropTypes.string,
    fieldRequired: PropTypes.bool,
    onValueChangePromise: PropTypes.func.isRequired
};

export default AccountOption;