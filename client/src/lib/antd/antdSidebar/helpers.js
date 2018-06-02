import React from "react";
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

// Finds an item on the menu by its key
export const findItemByKey = (arr, key) => {
    if (arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].key === key)
                return arr[i];

            let item = findItemByKey(arr[i].child, key);
            if (item) return item;
        }
    }
};

// Renders menu jsx from a menu array definition
export const getMenus = function (menuArray, siderFold) {
    const topMenus = menuArray.map(item => item.key);

    const getMenusRec = (arr, siderFold) => {
        return arr.map(item => {
            if (item.child) {
                return (
                    <Menu.SubMenu key={item.key} title={<span>{item.faIcon && <i className={`fa fa-${item.faIcon} fa-fw`} />} {siderFold && topMenus.indexOf(item.key) >= 0 ? '' : item.name} </span>}>
                        {getMenusRec(item.child, siderFold)}
                    </Menu.SubMenu>
                );
            } else {
                return (
                    <Menu.Item key={item.key}>
                        <Link to={item.key}>
                            {item.faIcon && <i className={`fa fa-${item.faIcon} fa-fw`} />} {siderFold && topMenus.indexOf(item.key) >= 0 ? '' : item.name}
                        </Link>
                    </Menu.Item>
                );
            }
        });
    };

    return getMenusRec(menuArray, siderFold);
};