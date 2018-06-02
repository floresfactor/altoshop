import React from "react";

// See more on site.less
// needed to write styles here in order screen not to flash
// on the initial moment less/css has not being loaded yet
const loadingStyle = {
      display: 'flex',
      position: 'fixed',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '10000',
      top: '0',
      width: '100%',
      height: '100%',
      backgroundColor: '#FFFFFF',
};

const Loading = () => {
  return (
    <div className="spinner-container spinner-container-lg" style={loadingStyle}>
      <div className="spinner" />
    </div>
  );
};

export default Loading;