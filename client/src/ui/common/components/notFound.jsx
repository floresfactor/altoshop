import React from "react";

const NotFound = () => {
    return (
        <div className="not-found">
            <i className="fa fa-3x fa-exclamation-triangle" />
            <div className="title">
                <p>
                    <span>404 UPS!</span>
                </p>
                <p>
                    <span>La página que estas buscando no fue encontrada</span>
                </p>
                <a href="/" className="not-fnd-btn-back">VOLVER</a>
            </div>
        </div>
    );
};

export default NotFound;