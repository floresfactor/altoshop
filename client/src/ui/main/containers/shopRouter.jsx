import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ShopIndex from './shopIndex';
import DisplayItemsIndex from './displayItemsIndex';

class ShopRouter extends React.Component {
  render(){
    return(
      <div>
        <Switch>
          <Route exact path="/shop" component={ShopIndex}/>
          <Route path="/shop/results" component={DisplayItemsIndex}/>
        </Switch>
      </div>
    )
  }
}

export default ShopRouter;