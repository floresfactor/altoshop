import React from "react";
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import $ from 'jquery'

import { showShoppingCart } from '../../../actions/UIFlagsActions';
import UIFlagsPropNames from '../../../lib/constants/UIFlags';

// Components
import AccountNavMenu from '../../account/containers/accountNavMenu.jsx';
import CategorySearchCascader from '../../main/containers/categorySearchCascader.jsx';
import CartIcon from '../../main/components/shoppingCart/cartIcon.jsx';
import NavMenu from './header/navMenu';

import { Row, Col, Menu, Dropdown, Icon } from 'antd';

class Header extends React.Component {
    constructor(props, ctx) {
        super(props, ctx);
        this.state = {
            cascadeShowClass: ""
        }
    }

    onCartIconClick(evt) {
        this.props.showShoppingCart(!!!this.props.showingShoppingCart);
    }

    showCascader() {
        this.setState({ cascadeShowClass: this.state.cascadeShowClass ? "" : "-mobil-show" });
        if (this.state.cascadeShowClass) {
            $('#banner-cover').css({ position: "unset", top: "unset" });
        } else {
            $('#banner-cover').css({ position: "relative", top: "28px" });
        }
    }

    render() {
        const { navComponents, location, history, customer } = this.props;
        const { cascadeShowClass } = this.state;

        const cartItemsCount = customer && customer.cartItems && customer.cartItems.length;

        const hideExtraNavComponents = location.pathname.indexOf('/admin') === 0 ||
            location.pathname.indexOf('/account/') === 0;



        return (
            <div id="header">
                <Row id="navbar">
                    <a className="logo" onClick={() => history.push({ pathname: '/', search: '', state: { origin: 'navbar' } })}>
                        <img src="/public/img/kopayshop.png"
                            alt="Logo Kopay" />
                    </a>
                    {!hideExtraNavComponents && <div className={"search-bar" + cascadeShowClass}><CategorySearchCascader /></div>}
                    {!hideExtraNavComponents && <div className={"nav-item search-button" + cascadeShowClass}>
                        <Icon type="search" onClick={this.showCascader.bind(this)} />
                    </div>}
                    <NavMenu />
                    <AccountNavMenu />
                    {!hideExtraNavComponents &&
                        <div className="nav-item">
                            <CartIcon onClick={this.onCartIconClick.bind(this)} cartItemsCount={cartItemsCount || 0} />
                        </div>}
                </Row>
            </div >
        );
    }
};

Header.propTypes = {
    navComponents: PropTypes.shape({
        right: PropTypes.shape({
            Component: PropTypes.func,
            componentData: PropTypes.object,
        }),
        left: PropTypes.shape({
            Component: PropTypes.func,
            componentData: PropTypes.object,
        })
    }).isRequired,
    customer: PropTypes.object.isRequired,
    showingShoppingCart: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
    return {
        navComponents: state.navComponents,
        customer: state.customer,
        showingShoppingCart: state.UIFlags[UIFlagsPropNames.showShoppingCart]
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        showShoppingCart: (show) => {
            return dispatch(showShoppingCart(show));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);

