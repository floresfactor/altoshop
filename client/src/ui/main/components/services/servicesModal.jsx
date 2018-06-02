import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Collapse } from 'antd';


const { Panel } = Collapse;

const ServicesModal = ({visible, onCancel, quiz })=>{
 return(<Modal
    title={<img src='/public/img/kopayshop.png' alt="logo-negro " className="service-modal-logo" />}
    footer={null}
    visible={visible}
    onCancel={onCancel}
    width={620}
  >
  <div className="service-modal-collapse" >
    <Collapse bordered={false}>
      {quiz.map(qa =>{
        return(
          <Panel key={qa.question} header={<h3 className="service-question-modal">{qa.question}</h3>}>
            {qa.answer}
            {qa.videoSrc && 
              <iframe 
                width="100%" 
                height="315" 
                src={qa.videoSrc} 
                frameBorder="0" 
                allowFullScreen="" 
                style={ {pointerEvents: 'auto'}}/>}
          </Panel>);
        })}
    </Collapse>
    </div>
  </Modal>);
};

ServicesModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  quiz: PropTypes.arrayOf(PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.node.isRequired ,
    videoSrc: PropTypes.string
  })).isRequired
};

export default ServicesModal;