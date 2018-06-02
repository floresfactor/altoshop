import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AllProductsOptions from './allProductsOptions.jsx';

class TransferOptions extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { setAllProductsFilterFn, filterBy, categoryOptions } = this.props;

        return (
            <div className="transfer-options-container">
                <AllProductsOptions onFilterChange={setAllProductsFilterFn} 
                    filterBy={filterBy} 
                    categoryOptions={categoryOptions} />
                <div className="middle-separator" />
                <div className="list-options">
                    <div className="right-list-options"> 
                        {/* Empty for now */}
                    </div>
                </div>
            </div>
        );
    }
}

TransferOptions.propTypes = {
    setAllProductsFilterFn: PropTypes.func.isRequired,
    filterBy: PropTypes.object,
    categoryOptions: PropTypes.array.isRequired
};

export default TransferOptions;