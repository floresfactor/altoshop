import React from 'react';
import PropTypes from 'prop-types';
import  Select  from 'react-select'; 

class FilterCell extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      selectedOption: null,
      options: [],
      isLoading: false
    }
    this.lengthToSearch = this.props.lengthToSearch ? this.props.lengthToSearch : 3
    this.onInputChange = this.onInputChange.bind(this);
    this.onHandleChange = this.onHandleChange.bind(this);
  }

  onInputChange(selectedOption){
    if(!selectedOption || selectedOption.length  < this.lengthToSearch)
      return this.state.options.value;
    else
      this.setState({isLoading: true});
      this.props.search(selectedOption).finally(()=> this.setState({ isLoading: false}));
  }

  onHandleChange(selectedOption){
    if(selectedOption !== null && selectedOption.value)
      this.props.updatingField( selectedOption );
    this.setState({selectedOption});
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.options && nextProps.options.length){
      let options = this.props.propsToOptions(nextProps.options);
      this.setState({options});
    }
  }

  render(){
    const { selectedOption } = this.state;
    let value = selectedOption ? selectedOption.value : null;
    return(
      <Select
        name="link"
        value={value}
        placeholder={this.props.placeholder}
        noResultsText={this.props.noResultsText}
        isLoading={this.state.isLoading}
        onInputChange={this.onInputChange}
        onChange={this.onHandleChange}
        options={this.state.options}
      />
    );
  }
}

FilterCell.propTypes = {
  name: PropTypes.string,
  noResultsText: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  search: PropTypes.func.isRequired,
  lengthToSearch: PropTypes.number.isRequired,
  updatingField: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  propsToOptions: PropTypes.func.isRequired,
}

export default FilterCell;