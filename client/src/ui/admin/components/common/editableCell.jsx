import React, { Component } from "react";
import PropTypes from 'prop-types';

// Components
import OnClickOutsideWrapper from './onClickOutsideWrapper.jsx';

class EditableCell extends Component {
    constructor(props, ctx) {
        super(props, ctx);

        this.state = {
            showingEditComponent: props.showingEditComponent || false            
        };
    }

    showEditComponent(show, evt) {
        this.props.onEditChange && this.props.onEditChange(show);
        this.setState({ showingEditComponent: show });
    }

    render() {
        let { showingEditComponent } = this.state;
        showingEditComponent = this.props.showingEditComponent || showingEditComponent;
        
        const { editComponent: Component, 
                displayComponent, editComponentProps,
                className } = this.props;

        return (
            <div className={`editable-cell ${className ? className : ''}`}>
                {!showingEditComponent && 
                    <div className="display-component" onClick={this.showEditComponent.bind(this, true)}>
                        {displayComponent}
                    </div>
                }

                {showingEditComponent && 
                    <OnClickOutsideWrapper handleClickOutside={this.showEditComponent.bind(this, false)}>
                        <Component {...editComponentProps} 
                                    hideComponent={this.showEditComponent.bind(this, false)} />
                    </OnClickOutsideWrapper>
                }
            </div>
        );
    }
}

EditableCell.propTypes = {
    editComponent: PropTypes.func,
    displayComponent: PropTypes.node,
    editComponentProps: PropTypes.object,
    showingEditComponent: PropTypes.bool,
    className: PropTypes.string,
    onEditChange: PropTypes.func
};

export default EditableCell;