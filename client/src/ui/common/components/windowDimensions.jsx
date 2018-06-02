import React, { Component } from 'react';
import PropTypes from 'prop-types';

// This components calls the received trigger function when a condition is met
class WindowDimensions extends Component {
    constructor(props) {
        super(props);     
        // This component renders potentially thousends of times
        // so state is not actually managed in this.state in order
        // to enhance performance by short-cutting react's logic
        this.state = {};        
        this.conditionsHistory = { };
        this.updateDimensions = this.updateDimensions.bind(this);
    }

    componentWillMount() {
        if(this.props.triggerOnMount)
            this.updateDimensions();
    }

    componentDidMount() {        
        window.addEventListener("resize", this.updateDimensions);        
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    updateDimensions() {
        const width = $(window).width();
        const height = $(window).height();

        this.props.conditions.forEach(c => {
            const conditionMet = eval(c.condition);

            if(conditionMet && !this.conditionsHistory[c.condition]) {
                c.trigger(width, height);                
            }

            this.conditionsHistory[c.condition] = conditionMet;
        });
    }

    render() {
        return (
            <div id="window-dimensions"></div>
        );
    }
}

WindowDimensions.propTypes = {
    conditions: PropTypes.arrayOf(PropTypes.shape({
        condition: PropTypes.string.isRequired,
        trigger: PropTypes.func.isRequired
    })).isRequired,
    triggerOnMount: PropTypes.bool
};

export default WindowDimensions;