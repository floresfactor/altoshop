import React from 'react';
import PropTypes from 'prop-types';
import ImageGallery from 'react-image-gallery';

const ProductImages = ({ images, setRef }) => {
    const items = images && images.map(img => {
        return {
            name: img.name, 
            original: img.src, 
            thumbnail: img.src
        };
    }) || [];

    return (
        <div className="product-images">
            <ImageGallery
                items={items}
                showIndex={true}
                showPlayButton={false}
                showBullets={true}
                ref={ref => {if(setRef)setRef(ref);}}
                defaultImage="/public/img/no-image.png" />
        </div>
    );
};

ProductImages.propTypes = {
    images: PropTypes.array,
    setRef: PropTypes.func
};

export default ProductImages;