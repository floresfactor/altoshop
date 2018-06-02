import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Upload, Modal, Icon, notification } from 'antd';
import esLocale from 'antd/lib/locale-provider/es_ES';

import { urls } from '../../../../lib/http';
import resources from '../../../../lib/constants/resources';

class ImagesModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showingPreviewModal: false,
            fileList: this.mapImagesToFileList(props.images)
        };          
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.images !== this.props.images)
            this.setState({ fileList: this.mapImagesToFileList(nextProps.images) });
    }

    mapImagesToFileList(images) {
        if(images && !Array.isArray(images))
            images = [images];

        return (typeof images !== 'undefined' && images) ? images.map((img, idx) => {
            return {
                uid: -1 * (idx + 1),
                name: img.name,
                status: 'done',
                url: img.src
            };
        }) : [];
    }

    openPreviewModal(file) {
        this.setState({ modalImage: file, showingPreviewModal: true });
    }

    onFileChange({file, fileList}) {
        // Removals are handled by redux props update
        if(file.status == "removed")
            return;
        
        if(file.status == 'error') {
            notification.error({ message: file.error || 'There was an error uploading the file'});      
            fileList.splice(fileList.indexOf(file), 1);
        }

        this.setState({ fileList });
    }

    onImageRemove(file) {
        const img = this.props.images.find(i => i.src == (file.url || file.thumbUrl));

        if(!img) {
            notification.error({ message: 'There was an error removing the image, please refresh the page and try again'});
            return false;
        }

        return this.props.onDeleteImage(img).then(() => {
            notification.success({ message: 'Ok'});    
            return Promise.resolve();
        }).catch(errs => {
            notification.error({ message: (errs && errs.image && errs.image.message) || 'An error occurred'});
            return Promise.reject();
        });
    }

    validateImageSize(image) {
        // Todo: Make this size constraints to come from props
        const width = this.props.imageWidth ? this.props.imageWidth : 500;
        const height = this.props.imageHeight ? this.props.imageHeight : 500;
        const minHeight = this.props.imageMinHeight ? this.props.imageMinHeight : 0;
        const minWidth = this.props.imageMinWidth ? this.props.imageMinWidth : 0;
        
        
        if (!image || image.width > width || image.height > height)
            return  Promise.reject('Image exceeds '+ width + 'x' + height + 'px dimensions')
        if( image.width < minWidth || image.height < minHeight )
            return Promise.reject('Image is below ' + minWidth + 'x' + minHeight + 'px dimensions')
        Promise.resolve();
    }

    validateFileSize(file) {
        // Limit to 600kb
        const size = this.props.imageSize ? this.props.imageSize : 600;
        return ((file.size * .001) > size ) ? Promise.reject('Image is too large, max. allowed: '+ size +'kb') : Promise.resolve();
    }

    customRequestHandler({file, onError, onSuccess /*, onProgress */}) {
        // Validate file type
        if (!file.type.indexOf('image') == 0) {
            generateError('Only image files are allowed');
            return;
        }

        // Generate submission errors
        const generateError = (errs) => {
            setTimeout(() => onError(errs), 500);
        };

        // Post a validated image to server
        const postImgToServer = (file) => {
            // We need to send form encoded file data
            const fd = new FormData();
            fd.append('image', file);

            this.props.onPostImage(fd).then(() => {
                notification.success({ message: 'Ok'});    
                onSuccess();
            }).catch(errs => {
                generateError(errs && errs.image && errs.image.message || 'An error occurred');
            });
        };

        // Process and validate image
        const fr = new FileReader;

        fr.onload = () => {
            const img = new Image;
            img.onload = () => {
                return Promise.all([this.validateFileSize(file), this.validateImageSize(img)]).then(() => {
                    postImgToServer(file);
                }).catch(errs => {
                    generateError(errs);
                });
            };
        
            img.src = fr.result;
        };        

        fr.readAsDataURL(file);
    }

    render() {
        const { showingPreviewModal, fileList, modalImage } = this.state;
        const { onClose, imagesLimit } = this.props;
        
        const firstImg = fileList && fileList.length ? fileList[0] : null;

        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Subir</div>
            </div>
        );

        return (
            <Modal title="Imagenes" visible={true} wrapClassName="images-modal" footer={null} 
                onCancel={onClose} okText="OK" cancelText="Cancel" width="75vw">
                <div className="main-image-container">
                    <img src={(firstImg && (firstImg.url || firstImg.thumbUrl)) ||
                        (resources.IMG_NO_IMG_URL)} />
                </div>
                <div className="clearfix upload-container">
                    <Upload name="image"
                            listType="picture-card"
                            fileList={fileList}
                            multiple={false}
                            showUploadList={true}
                            locale={esLocale.Upload}
                            accept='image/*'
                            customRequest={this.customRequestHandler.bind(this)}
                            onRemove={this.onImageRemove.bind(this)}
                            onPreview={this.openPreviewModal.bind(this)}
                            onChange={this.onFileChange.bind(this)} >
                        {fileList.length < (imagesLimit || 5) ? uploadButton : null}
                    </Upload>

                    {showingPreviewModal && 
                        <Modal visible={true} footer={null} onCancel={() => this.setState({ showingPreviewModal: false })}>
                            <img alt={modalImage.name} style={{ width: '100%' }} 
                                src={modalImage.url || modalImage.thumbUrl} />
                        </Modal>
                    }
                </div>
            </Modal>
        );
    }
}

ImagesModal.propTypes = {
    images: PropTypes.array,
    imageWidth: PropTypes.number,
    imageHeight: PropTypes.number,
    imageMinHeight: PropTypes.number,
    imageMinWidth: PropTypes.number,
    imageSize: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    onPostImage: PropTypes.func.isRequired,
    onDeleteImage: PropTypes.func.isRequired,
    imagesLimit: PropTypes.number
};

export default ImagesModal;