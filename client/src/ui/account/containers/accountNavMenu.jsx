import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, Icon, Dropdown } from 'antd';

import { accountLogout } from '../../../actions/accountActions';

class AccountNavMenu extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);
  }

  logOut() {
    // Sign out and redirect to index
    this.props.logout();
    this.context.router.history.push('/');
  }

  render() {
    const { account } = this.props;

    const isAdmin = account && account.isAdmin;
    const isLoggedIn = account && account.isLoggedIn;

    if (isLoggedIn) {
      return (
        <Dropdown
          trigger={['click']}
          overlay={
            <Menu>
              {isAdmin && (
                <Menu.Item key="admin-link">
                  <Link to="/admin">Administración</Link>
                </Menu.Item>
              )}
              <Menu.Item key="account-dashboard">
                <Link to="/account/my-account">Mi cuenta</Link>
              </Menu.Item>
              <Menu.Item key="account-logout">
                <a onClick={this.logOut.bind(this)}>Cerrar sesión</a>
              </Menu.Item>
            </Menu>
          }
        >
          <div className="account-dropdown nav-item">
            <Icon type="user" />
            <div className="my-account">
              MI CUENTA <Icon type="caret-down" />
              <div className="email">{account.email}</div>
            </div>
          </div>
        </Dropdown>
      );
    } else {
      return (
        <div className="account-nav-menu nav-item">
          <Link to="/account/login">
            <Icon type="user-add" />
            <span className="my-account"> INGRESA </span>
          </Link>
        </div>
      );
    }
  }
}

AccountNavMenu.propTypes = {
  account: PropTypes.object
};

AccountNavMenu.contextTypes = {
  router: PropTypes.object
};

const mapStateToProps = (state, ownProps) => {
  return {
    account: state.account
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    logout: () => {
      dispatch(accountLogout());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountNavMenu);
