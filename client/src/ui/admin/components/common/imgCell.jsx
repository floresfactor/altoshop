import React from 'react';
import PropTypes from 'prop-types';
import ImageModal from '../common/imagesModal.jsx';
import resources from '../../../../lib/constants/resources';

class ImgCell extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      showModal: false
    }
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  onClickImage(){
    this.setState({ showModal: true });
  }

  onCloseModal(){
    this.setState({ showModal: false })
  }

  render(){
  let images = this.props.image ? [this.props.image] : [];
  return(<div>
    <div className="mini-img-container">
      <img 
        onClick={ ()=> this.onClickImage() }
        src={this.props.image ? this.props.image.src : resources.IMG_NO_IMG_URL} 
      />
    </div>
    { this.state.showModal &&
      <ImageModal
        id= {this.props.id}
        images={images}
        imageWidth={this.props.imageWidth}
        imageHeight={this.props.imageHeight}
        imageSize={this.props.imageSize}
        imageMinWidth={this.props.imageMinWidth}
        imageMinHeight={this.props.imageMinHeight}
        onClose = { this.onCloseModal }
        onPostImage = { formData => this.props.onAddImage(this.props.id, formData) }
        onDeleteImage = { img => this.props.onDeleteImage(this.props.id) }
        imagesLimit = { 1 }
      /> }
  </div>)
  }
}

ImgCell.prototypes = {
  id: PropTypes.string.isRequired,
  image: PropTypes.object.isRequired,
  onAddImage: PropTypes.func.isRequired,
  onDeleteImage: PropTypes.func.isRequired,
  imageHeight: PropTypes.number,
  imageWidth: PropTypes.number,
  imageSize: PropTypes.number,
  imageMinHeight: PropTypes.number,
  imageMinWidth: PropTypes.number,
}

export default ImgCell;