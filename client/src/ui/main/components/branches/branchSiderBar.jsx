import React from 'react';
import { Menu, Layout } from 'antd';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { getMenus, findItemByKey } from '../../../../lib/antd/antdSidebar/helpers';

import WindowDimensions from '../../../common/components/windowDimensions';

const bgImage = '../../../../public/img/menuSucursalesBg.jpg'

const sideBarBg = {
  backgroundImage: `url(${bgImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}

class BranchSideBar extends React.Component {
  constructor(props, context){
    super(props, context);
    
    this.state = {
      openKeys: [],
      rootSubKeys: []
    };
    this.menuRef = null;
  }
  onOpenChange(openKeys){
    const latestOpenKey = openKeys.find( key => this.state.openKeys.indexOf(key) === -1);
    if (this.state.rootSubKeys.indexOf(latestOpenKey) === -1) {
      this.setState({ openKeys });
    } else {
      this.setState({
        openKeys: latestOpenKey ? [latestOpenKey] : [],
      });
    }
  }
  componentDidMount(){
    const rootSubKeys = this.props.items.map( item => {
        return item.key
    });
    this.setState({rootSubKeys});
  }
  render(){
    const { openKeys } = this.state;
    const { siderFold } = true;
    const { location } = this.context.router.route;
    const menuItems = getMenus(this.props.items, siderFold);
    const activeItem = findItemByKey(this.props.items, location.pathname);

    const props = {
      mode: 'inline'
    };
    if (activeItem) {
      props.defaultOpenKeys = activeItem.menuPathv;
      props.selectedKeys = [activeItem.key];
    }
{/* */}
    return(
      <div style={{ height: '100%'}}>
          <Menu className="menu-sidebar" 
            openKeys={openKeys}
            {...props} 
            ref={ref => this.menuRef = ref} 
            style={sideBarBg} 
     onOpenChange={this.onOpenChange.bind(this)} >
              {menuItems}
          </Menu>
          <div></div>
      </div>
    );
  }
}
BranchSideBar.propTypes = {
  items: PropTypes.array
};

BranchSideBar.contextTypes = {
    router: PropTypes.object
};

export default withRouter(BranchSideBar);