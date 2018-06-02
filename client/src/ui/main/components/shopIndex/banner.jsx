import React from 'react';
import { Link } from  'react-router-dom';
import PropTypes from 'prop-types';
import resources from '../../../../lib/constants/resources';

const Banner =({banner})=> {
    return(
      <div className="banner-inner" >
        <Link to={banner && banner.tag ? `/shop/results?tags=${banner.tag}` : `/shop/results?tags`} >
            <img className="banner-image" src={banner && banner.image ? banner.image.src : resources.IMG_NO_IMG_URL } />
        </Link>
      </div>
    );
}

Banner.propTypes = {
  banner: PropTypes.shape({
    tag: PropTypes.string,
    type: PropTypes.string,
    image: PropTypes.shape({
      name: PropTypes.string,
      src: PropTypes.string
    })
  })
};

export default Banner;


