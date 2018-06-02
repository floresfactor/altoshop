import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Menu, Icon, Dropdown } from 'antd';

import { urls } from '../../../../lib/http';

const MenuItems = ({ mode, onTitleClick }) => {
  return (
    <Menu mode={mode}>
      <Menu.Item>
        <Link to="/">INICIO</Link>
      </Menu.Item>
      <Menu.Item>
        <Link to="/nosotros">NOSOTROS</Link>
      </Menu.Item>
      <Menu.SubMenu
        title={
          <div id="header-servicios">
            <Link to="/servicios">SERVICIOS</Link>
          </div>
        }
      >
        <Menu.Item>
          <Link to="/servicios#depilacion">DEPILACIÓN</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/servicios#antiedad">ANTIEDAD</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/servicios#varices">
            ELIMINACIÓN DE VÁRICES Y VENAS FACIALES
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/servicios#endermologie">ENDERMOLOGIE</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/servicios#therma">THERMASHAPE</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/servicios#vela">VELA SHAPE</Link>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item>
        <Link to="/suscursales">SUSCURSALES</Link>
      </Menu.Item>
      <Menu.Item>
        <Link to="/shop">TIENDA</Link>
      </Menu.Item>
      <Menu.Item>
        <a href={`${urls.blogURL}`}>BLOG</a>
      </Menu.Item>
      <Menu.Item>
        <Link to="/contacto">CONTACTO</Link>
      </Menu.Item>
    </Menu>
  );
};

class NavMenu extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);

    this.onTitleClick = this.onTitleClick.bind(this);
  }
  onTitleClick(key, event) {
    this.props.history.push('/servicios');
  }
  render() {
    const { customer, history, cartItemsCount } = this.props;

    return (
      <div className="nav-menu">
        <Dropdown className="asdasd" overlay={<MenuItems mode="vertical" />}>
          <div className="burger nav-item">
            <Icon className="burger" type="bars" />
          </div>
        </Dropdown>
        <div className="menu-lg">
          <MenuItems mode="horizontal" onTitleClick={this.onTitleClick} />
        </div>
      </div>
    );
  }
}

NavMenu.propTypes = {};

export default withRouter(NavMenu);
