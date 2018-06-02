import React from "react";
import { Link } from 'react-router-dom';
import { Menu, Modal } from 'antd';

const { Item } = Menu;
const services = [
  { name: 'DEPILACIÓN LÁSER',
    link: '/servicios#depilacion'
  },
  { name: 'TRATAMIENTO ANTIEDAD',
    link: '/servicios#antiedad'
  },
  { name: 'ELIMINACIÓN DE VÁRICES Y VENAS FACIALES',
    link: '/servicios#varices'
  },
  { name: 'ENDERMOLOGIE',
    link: '/servicios#endermologie'
  },
  { name: 'THERMASHAPE',
    link: '/servicios#therma'
  },
  { name: 'VELASHAPE',
    link: '/servicios#vela',
  },
  {
    name: 'VIBRABODY',
    link: '/servicios#vibra'
  }
];

class ServiceIndex extends React.Component {
  render(){
    return(
      <Modal
        title={<div className="image-index" >
                <img src='/public/img/kopayshop.png' alt="logo" className="img-responsive" />
              </div>}
        wrapClassName="align-left-modal"
        visible={this.props.visible}
        footer={null}
        onCancel={this.props.onClickLink}
      >
        <div className="service-index" >
          <Menu mode="vertical">
            {services.map(service => {
              return(
                <Item key={service.name}>
                  <div className='service-index-element'  >
                    <Link to={service.link} onClick={this.props.onClickLink} >{service.name}</Link>
                    <div className="black-line"></div>
                  </div>
                </Item>
              );
            })}
          </Menu>
        </div>
      </Modal>
    );
  }
}
export default ServiceIndex;