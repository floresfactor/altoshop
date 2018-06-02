import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ProdCard from './common/prodCard';
//lib components
import { Link } from 'react-router-dom';
import Button from 'antd/lib/button';
import InfiniteScroll from 'react-infinite-scroll-component';
//actions
import { loadDisplayItemsWithOutPager,
         removeDisplayItems } from '../../../actions/displayItemsActions';

class PromProductGrid extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      scrollThreshold: 99,
      showButton: true,
      currentPage: 1
    }
    this.onClickButton = this.onClickButton.bind(this);
    this.getNextDisplayItems = this.getNextDisplayItems.bind(this);
    this.changePage = this.changePage.bind(this);
  }

  componentDidMount(){
    this.props.loadDisplayItems({sortBy: {counterView: -1}}).then(()=>{
      this.changePage();
    });
  }

  componentWillUnmount(){
    this.props.removeDisplayItems();
  }

  onClickButton(){
    this.props.loadDisplayItems({sortBy: {counterView: -1}, currentPage: this.state.currentPage })
      .then(()=>{
        this.changePage();
      });
    this.setState({scrollThreshold: 0.43, showButton: false});
  }

  getNextDisplayItems(){
    this.props.loadDisplayItems({sortBy: {counterView: -1}, currentPage: this.state.currentPage })
      .then(()=>{
        this.changePage();
      });
  }

  changePage(){
      this.setState((prevState, props)=>{
        return { currentPage: prevState.currentPage + 1 }
      });
  }

  render(){
    const { scrollThreshold, showButton } = this.state;
    return(
      <div className="prom-productgrid">
        <InfiniteScroll className="prom-productgrid-scroll"
          next={this.getNextDisplayItems}
          scrollThreshold={scrollThreshold}
          hasMore={true}
          dataLength={this.props.displayItems.length}
        >
          {this.props.displayItems.map((prod)=>{
            return <ProdCard key={prod._id} prod={prod}/>
          })}
        </InfiniteScroll>
        { showButton &&
          <Button style={{ width: "100%"}} type="dashed" onClick={this.onClickButton} >
            Ver mas...
          </Button>}
      </div>
    );
  }
}

PromProductGrid.propTypes ={
  displayItems: PropTypes.array.isRequired,
  loadDisplayItems: PropTypes.func.isRequired
}

const mapStateToProps = (state)=>{
  return {
    displayItems: state.displayItems
  }
}

const mapDispatchToProps = (dispatch) =>{
  return {
    loadDisplayItems: (options) => {
      return dispatch(loadDisplayItemsWithOutPager(options));
    },
    removeDisplayItems: () =>{
      return dispatch(removeDisplayItems());
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(PromProductGrid);