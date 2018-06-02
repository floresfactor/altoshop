import React from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Brand = ({brandLink}) => {
    return (
        <div className="login-brand">
            <Link to={brandLink}>
                <img src="/public/img/kopayshop.png" />
            </Link>
        </div>
    );
};

Brand.propTypes = {
    brandLink: PropTypes.string.isRequired
};

export default Brand;