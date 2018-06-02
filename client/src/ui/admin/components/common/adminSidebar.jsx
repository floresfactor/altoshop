import React from "react";
import PropTypes from 'prop-types';
import { Menu } from 'antd';

import { getMenus, findItemByKey } from '../../../../lib/antd/antdSidebar/helpers';

import WindowDimensions from '../../../common/components/windowDimensions.jsx';

class AdminSidebar extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};
        this.menuRef = null;

        this.adminMenu = [
            {
                key: 'admin',
                name: 'Administración',
                faIcon: 'cogs',
                child: [
                    {
                        key: 'general',
                        name: 'General',
                        faIcon: 'address-book-o',
                        child: [
                            { name: 'Tienda', key: '/admin', menuPath: ['admin', 'general'] },
                            { name: 'Cuentas', key: '/admin/accounts', menuPath: ['admin', 'general']},
                            { name: 'Tienda Inicio', key: '/admin/shop', menuPath: ['admin', 'general']}
                        ]
                    },
                    {
                        key: 'orders',
                        name: 'Ordenes',
                        faIcon: 'first-order',
                        child: [
                            { name: 'Ordenes', key: '/admin/orders', menuPath: ['admin', 'orders'] }
                        ]
                    },
                    {
                        key: 'inventory',
                        name: 'Inventario',
                        faIcon: 'product-hunt',
                        child: [
                            { name: 'Productos', key: '/admin/products', menuPath: ['admin', 'inventory'] },
                            { name: 'Grupo de Productos', key: '/admin/product-groups', menuPath: ['admin', 'inventory'] },
                            { name: 'Descuentos', key: '/admin/product-discounts', menuPath: ['admin', 'inventory'] }
                        ]
                    },
                    {
                        key: 'home-page',
                        name: 'Página Inicio',
                        faIcon: 'home',
                         child: [
                             { name: 'Carrusel', key: '/admin/slider', menuPath: ['admin', 'home-page'] }
                         ]
                    }
                    // {
                    //     key: 'promotions',
                    //     name: 'Promociones',
                    //     faIcon: 'star-o',
                    //     child: [
                    //         { name: 'Paquetes', key: '/admin/packages', menuPath: ['admin', 'promotions'] }
                    //     ]
                    // }
                ]
            }];
    }

    toggleSiderFold(siderFold) {
        this.setState({ siderFold: !!siderFold }, () => {
            // For some reason, menu stays open, close it
            if (this.menuRef) {
                if (this.menuRef.props.mode == 'vertical')
                    this.menuRef.handleClick();
                else
                    this.forceUpdate();
            }
        });
    }

    render() {
        const { siderFold } = this.state;
        const { location } = this.context.router.route;
        const menuItems = getMenus(this.adminMenu, siderFold);
        const activeItem = findItemByKey(this.adminMenu, location.pathname);

        const props = {
            defaultOpenKeys: siderFold ? [] : ['admin', 'general'],
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
}

AdminSidebar.propTypes = {
};

AdminSidebar.contextTypes = {
    router: PropTypes.object
};

export default AdminSidebar;
