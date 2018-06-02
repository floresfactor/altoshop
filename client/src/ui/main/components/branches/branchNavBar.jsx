import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Collapse } from 'antd';

class BranchNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.getElements = this.getElements.bind(this);
    this.onChangePanel = this.onChangePanel.bind(this);
    this.onClickLink = this.onClickLink.bind(this);
    this.state = {
      activeKey: ''
    };
  }

  onChangePanel(key){
    console.log('key:',key);
    const activeKey = key.find(e => e == 'suscursales');
    this.setState({ activeKey: activeKey || '' });
  }

  onClickLink(){
    this.setState({activeKey: ''});
  }

  getElements(items){
   return items.map( item =>{
     if(item.child){
      return(
        <Collapse key={`${item.key}-`} bordered={false}>
          <Collapse.Panel key={item.key} showArrow={false} header={item.name}>
            {this.getElements(item.child)}
          </Collapse.Panel>
        </Collapse>
      );
     }else{
      return(
        <Collapse key={`${item.key}_`} bordered={false}>
          <Collapse.Panel 
            key={item.key}
            showArrow={false} 
            disabled 
            header={<Link onClick={this.onClickLink} to={item.key}>{item.name}</Link>} 
          />
        </Collapse>
      );
     }
   });
    
  }
  render() {
    let { activeKey }  = this.state;

    return (
      <div>
        <Collapse activeKey={activeKey} bordered={false} onChange={this.onChangePanel}>
          <Collapse.Panel key="suscursales" showArrow={false} header="SUSCURSALES" style={{backgroundColor: "white !important"}}>
            {this.getElements(this.props.items)}
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}
BranchNavBar.propTypes = {
  items: PropTypes.array.isRequired
}
export default BranchNavBar;