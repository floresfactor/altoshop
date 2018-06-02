import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import { loadBanners }  from '../../../actions/bannersActions';
import Banner from '../components/shopIndex/banner';
import PromProductGrid from './promProductGrid';
//import ProductAreas from './productAreas';
import CategoriesGrid from './categoriesGrid';

class ShopIndex extends React.Component {
  constructor(props){
    super(props);
    this.getBanner = this.getBanner.bind(this);
    this.state= {
      banners: []
    }
  }
  componentWillMount(){
    this.props.loadBanners();
  }
  componentWillReceiveProps(nextProps){
    this.setState(
      { banners: nextProps.banners } 
    )
  }
  getBanner(type){
    if(this.props.banners && this.props.banners.length > 0){
      return this.props.banners.find(banner =>  banner.type === type );
    }
  }
  render(){
    return (
      <div className="shop-index-container">
        <Row className="banner-primary">
          <Banner
            banner={this.getBanner('primary')}
          />
        </Row>
        <Row className="promo">
          <Col className="prom-productgrid-wrapper" lg={24} md={24} sm={24} xs={24}>
            <PromProductGrid/>
          </Col>
        </Row>
        <Row className="promo-categories">
          <Col className="prom-areas-wrapper" span={24}>
            <CategoriesGrid/>
          </Col>
        </Row>
        <Row className="complement-a">
          <Col className="complement-inner-left" lg={12} sm={12} md={12} xs={24}>
            <Banner
              banner={this.getBanner('complement1')}
            />
          </Col>
          <Col className="complement-inner-right" lg={12} sm={12} md={12} xs={24}>
          <Banner
              banner={this.getBanner('complement2')}
            />
          </Col>
        </Row>
        <Row className="banner-secondary">
          <Banner
            banner={this.getBanner('secondary')}
          />
        </Row>
        <Row className="complement-b">
          <Col className="complement-inner-left" lg={12} sm={12} md={12} xs={24}>
            <Banner
              banner={this.getBanner('complement3')}
            />
          </Col>
          <Col className="complement-inner-right" lg={12} sm={12} md={12} xs={24}>
            <Banner
              banner={this.getBanner('complement4')}
            />
          </Col>
        </Row>
      </div>
    );  
  }
}

ShopIndex.propTypes = {
  loadBanners: PropTypes.func.isRequired,
  banners: PropTypes.array.isRequired
}

const mapStateToProps = state =>{
  return {
    banners: state.banners
  }
}

const mapDispatchToProps = (dispatch) =>{
  return{
    loadBanners: banners =>{
      return dispatch(loadBanners(banners));
    }
  };
}

export default connect(mapStateToProps,mapDispatchToProps)(ShopIndex);