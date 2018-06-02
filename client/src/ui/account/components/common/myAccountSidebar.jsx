import React from "react";
import PropTypes from 'prop-types';
import { Menu } from 'antd';

import { getMenus, findItemByKey } from '../../../../lib/antd/antdSidebar/helpers';

import WindowDimensions from '../../../common/components/windowDimensions.jsx';

class MyAccountSidebar extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};
        this.menuRef = null;

        this.accountMenu = [
            {
                key: 'myAccount',
                name: 'Mi Cuenta',
                faIcon: 'cogs',
                child: [
                    {
                        key: '/account/my-account',
                        name: 'Cuenta',
                        faIcon: 'address-book-o',
                        menuPath: ['myAccount']
                    },
                    {
                        key: '/account/my-account/orders',
                        name: 'Ordenes',
                        faIcon: 'first-order',
                        menuPath: ['myAccount']
                    }
                ]
            }];
    }

    toggleSiderFold(siderFold) {
        this.setState({ siderFold: !!siderFold }, () => {
            // For some reason, menu stays open, close it
            if (this.menuRef) {
                if(this.menuRef.props.mode == 'vertical')
                    this.menuRef.handleClick();
                else
                    this.forceUpdate();
            }
        });
    }

    render() {
        const { siderFold } = this.state;
        const { location } = this.context.router.route;
        const menuItems = getMenus(this.accountMenu, siderFold);
        const activeItem = findItemByKey(this.accountMenu, location.pathname);

        const props = {
            defaultOpenKeys: siderFold ? [] : ['myAccount'],
            mode: siderFold ? 'vertical' : 'inline'
        };

        if (activeItem) {
            props.defaultOpenKeys = siderFold ? [] : activeItem.menuPath;
            props.selectedKeys = [activeItem.key];
        }

        return (
            <div>
                <WindowDimensions conditions={
                    [{ condition: 'width < 768', trigger: this.toggleSiderFold.bind(this, true) },
                     { condition: 'width >= 768', trigger: this.toggleSiderFold.bind(this, false) }]}
                     triggerOnMount={true} />
                <Menu {...props} ref={ref => this.menuRef = ref} >
                    {menuItems}
                </Menu>
            </div>
        );
    }
};

MyAccountSidebar.propTypes = {
};

MyAccountSidebar.contextTypes = {
    router: PropTypes.object
};

export default MyAccountSidebar;