import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

const VideoModal = ({visible, videoSrc, onClose }) =>{
  return(
      <Modal
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={1200}
      >
      <iframe src={videoSrc} width="95%" height="500px" frameBorder="0"></iframe>
      </Modal>
  );
}
VideoModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  videoSrc: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
}
export default VideoModal;