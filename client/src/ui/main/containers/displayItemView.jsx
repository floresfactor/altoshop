import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';

import axios from 'axios';
import { urls } from '../../../lib/http';

import VariableObjectTypes from '../../../lib/constants/variableObjectTypes';
import QueryParams from '../../../lib/constants/queryParams';
import { getDisplayItem, clearVariableObjectData } from '../../../actions/variableObjectActions';
import { setUICategorySelections } from '../../../actions/UICategorySelectionActions';
import { addOrUpdateShoppingCartItems } from '../../../actions/shoppingCartItemsActions';

// Components
import CategoryBreadcrumb from '../containers/common/categoryBreadcrum.jsx';
import ProductGroupView from '../components/displayItemView/productGroupView.jsx';
import ProductView from '../components/displayItemView/productView.jsx';

class DisplayItemView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            comingFrom: props.location.state && props.location.state.comingFrom || null
        };
    }

    componentWillMount() {
        const { sku: displayItemSku } = (this.props.match && this.props.match.params);
        if (displayItemSku) {
            this.props.getDisplayItem(displayItemSku).then(() =>{
                //incremente by 1 view of diplayitem
                return axios.post(urls.apidisplayItemsURL(displayItemSku) +'/views').then(data=>{
                   // console.log(data);
                });
            })
            .catch(errs => {
                this.goBack(); // Todo: log errs?
            });
        } else {
            this.goBack();
        }
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.displayItem !== this.props.displayItem) {
            if (nextProps.displayItem) {
                this.props.setUICategorySelections({
                    selectedCategoryPath: [
                        ...nextProps.displayItem.category.path,
                        nextProps.displayItem.category._id
                    ]
                });

                if (nextProps.displayItem.itemType === 'product')
                    this.setState({ selectedItem: nextProps.displayItem.item });
            }
        }
    }

    componentDidUpdate(){
       // console.log(this.props.displayItem._id);
    }
    componentWillUnmount() {
        this.props.clearVariableObjectData();
    }

    goBack() {
        this.props.history.push(this.state.comingFrom || '/');
    }

    onBreadcrumbCategoryClick(category) {
        if (category) {
            const urlParams = queryString.stringify({
                [QueryParams.categoryID]: category ? category._id || undefined : undefined
            });

            this.props.history.push({
                pathname: '/',
                search: urlParams
            });
        } else {
            this.goBack();
        }
    }

    onAddToCart(product, quantity, parent) {
      const { account } = this.props;
        const cartItem = {
            itemID: product._id,
            quantity,
            type: 'product'
        };

        parent && (cartItem.parent = parent);

        if(account.isLoggedIn){
          if(account.isComplete){
            this.props.addOrUpdateShoppingCartItems(cartItem);
          }
          this.props.history.push('/account/customer');
        }else{
            this.props.history.push('/account/login');
        }

    }

    render() {
        const { displayItem } = this.props;

        return !displayItem ? null :
            (
                <div className="display-item-view-container">
                    <div className="category-breadcrumb">
                        <CategoryBreadcrumb noCategoryNode={null}
                            blockOnInitial={true}
                            onCategoryItemClick={this.onBreadcrumbCategoryClick.bind(this)} />
                    </div>

                    {displayItem.itemType === 'product' &&
                        <ProductView product={displayItem.item} onAddToCart={this.onAddToCart.bind(this)} />}
                    {displayItem.itemType === 'productGroup' &&
                        <ProductGroupView productGroup={displayItem.item} onAddToCart={this.onAddToCart.bind(this)} />}
                </div>
            );
    }
}

DisplayItemView.propTypes = {
    getDisplayItem: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    displayItem: PropTypes.shape({
        category: PropTypes.object.isRequired,
        itemType: PropTypes.string.isRequired,
        item: PropTypes.object.isRequired,
        _id: PropTypes.string.isRequired
    }),
    setUICategorySelections: PropTypes.func.isRequired,
    addOrUpdateShoppingCartItems: PropTypes.func.isRequired,
    clearVariableObjectData: PropTypes.func.isRequired,
    account: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
    return {
        displayItem: (state.variableObject &&
            state.variableObject.variableObjectType === VariableObjectTypes.DISPLAY_ITEM)
            ? state.variableObject : null,
        account: state.account,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getDisplayItem: (displayItemID) => {
            return dispatch(getDisplayItem(displayItemID));
        },
        clearVariableObjectData: () => {
            dispatch(clearVariableObjectData());
        },
        setUICategorySelections: (UIObj) => {
            dispatch(setUICategorySelections(UIObj));
        },
        addOrUpdateShoppingCartItems: (cartItem) => {
            return dispatch(addOrUpdateShoppingCartItems([cartItem]));
        }
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DisplayItemView));
