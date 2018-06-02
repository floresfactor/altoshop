import React from 'react';
import PropTypes from 'prop-types';
import Select from 'antd/lib/select';


const Option = Select.Option;

class SelectCell extends React.Component {
  constructor(props){
    super(props);
    this.onHandleChange = this.onHandleChange.bind(this);
  }
  onHandleChange(value){
    this.props.onSubmit(this.props.id, value);
  }
  render(){
    return(
      <Select size={'large'} defaultValue={this.props.value} onChange={this.onHandleChange}>
        {this.props.options.map(option => {
          return ( 
            <Option  
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
              >
              {option.value}
            </Option> 
            )
        })}
        <Option value={''} >Ninguno</Option>
      </Select>
    )
  }
}

SelectCell.propTypes = {
  options: PropTypes.array,
  value: PropTypes.string,
  id: PropTypes.string,
  onSubmit: PropTypes.func
}

export default SelectCell;