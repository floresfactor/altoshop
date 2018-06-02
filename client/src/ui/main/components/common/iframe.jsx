import React from "react";
import PropTypes from 'prop-types';

const Iframe = (props)=>{
  return(
    <div>
      <iframe {...props} ></iframe>
    </div>
  )
};

export default Iframe;