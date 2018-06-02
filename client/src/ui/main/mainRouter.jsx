import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { loadRecursiveCategories } from '../../actions/recursiveCategoriesActions';
import { loadShoppingCartItems } from '../../actions/shoppingCartItemsActions';
import { beginAjaxCall, endAjaxCall } from '../../actions/ajaxStatusActions';

// ******************
// ****Components****
// ******************
import DisplayItemsIndex from './containers/displayItemsIndex.jsx';
import DisplayItemView from './containers/displayItemView.jsx';
import Checkout from './containers/checkout.jsx';
import ShoppingCart from './containers/shoppingCart.jsx';
import OrderCompletedScreen from './components/common/orderCompletedScreen.jsx';
import NotFound from '../common/components/notFound.jsx';
import SliderHome from './containers/sliderHome.jsx';
import Home from './components/home/home.jsx';
import Nosotros from './components/nosotros/nosotros.jsx';
import Branches from './containers/branches.jsx';
import Contacto from './components/home/contacto.jsx';
import Services from './components/services/services.jsx';
import ShopRouter from './containers/shopRouter.jsx';

class MainRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataReady: false
    };
  }

  componentWillMount() {
    const { beginAjaxCall, endAjaxCall } = this.props;

    beginAjaxCall();
    const loadDataPromises = [
      this.props.loadRecursiveCategories(),
      this.props.loadShoppingCartItems()
    ];
    Promise.all(loadDataPromises).then(() => {
      this.setState({ dataReady: true }, () => {
        endAjaxCall();
      });
    });
  }

  render() {
    if (!this.state.dataReady) return null;

    return (
      <div>
        <Route path="/" component={ShoppingCart} />
        {/*<Route exact path="/shop" component={() => <div id="banner-cover"><img className="img-responsive main-banner" src="/public/img/banner.png" /></div>} />*/}
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/nosotros" component={Nosotros} />
          <Route path="/suscursales" component={Branches} />
          <Route path="/contacto" component={Contacto} />
          <Route path="/servicios" component={Services} />
          <Route path="/shop" component={ShopRouter} />
          <Route path="/products/:sku" component={DisplayItemView} />
          <Route exact path="/checkout" component={Checkout} />
          <Route exact path="/order-success" component={OrderCompletedScreen} />
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {};
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadRecursiveCategories: () => {
      return dispatch(loadRecursiveCategories());
    },
    loadShoppingCartItems: () => {
      return dispatch(loadShoppingCartItems());
    },
    beginAjaxCall: () => {
      dispatch(beginAjaxCall('MainRouter - Loading initial data'));
    },
    endAjaxCall: () => {
      dispatch(endAjaxCall('MainRouter - Loading initial data'));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainRouter);
