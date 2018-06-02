import { combineReducers } from 'redux';

// Reducers
import AdminProductGroupsReducer from './adminProductGroupsReducer';
import AdminDiscountsReducer from './adminDiscountsReducer';
import AjaxStatusReducer from './ajaxStatusReducer';
import NavbarReducer from './navbarReducer';
import SidebarReducer from './sidebarReducer';
import AdminOrdersReducer from './adminOrdersReducer';
import CustomerOrdersReducer from './customerOrdersReducer';
import AccountReducer from './accountReducer';
import RecoverAccountReducer from './recoverAccountReducer';
import AccountsReducer from './accountsReducer';
import CustomerReducer  from './customerReducer';
import AdminCustomersReducer from './adminCustomersReducer';
import PagersReducer from './pagersReducer';
import RecursiveCategoriesReducer from './recursiveCategoriesReducer';
import displayItemsReducer from './displayItemsReducer';
import AdminProductsReducer from './adminProductsReducer';
import UICategorySelectionsReducer from './UICategorySelectionsReducer';
import UIFlagsReducer from './UIFlagsReducer';
import ShoppingCartItemsReducer from './shoppingCartItemsReducer';
import PackageReducer from './packagesReducer';
import UICascaderInputReducer from './UICascaderInputReducer';
import BlogPostsReducer from './blogPostsReducer';
import BannersReducer from './bannersReducer';
import AdminProductGroupsTagsReducer from './adminProductGroupTagsReducer';
import DisplayItemsCategoryReducer from './displayItemsCategoryReducer';
import subscriptionsReducer from './subscriptionsReducer';
import Attempts from './attemptsReducer';
import EnvironmentReducer from './environmentReducer';
// See what this is for on reducer file
import VariableObjectReducer from './variableObjectReducer';
import AdminSliderItemsReducer from './adminSliderItemsReducer';

export default combineReducers({
    navComponents: NavbarReducer,
    sidebarComponent: SidebarReducer,
    ajaxCallsInProgress: AjaxStatusReducer,
    adminProductGroups: AdminProductGroupsReducer,
    adminDiscounts: AdminDiscountsReducer,
    adminOrders: AdminOrdersReducer,
    customerOrders: CustomerOrdersReducer,
    account: AccountReducer,
    attempts: Attempts,
    recoverAccount: RecoverAccountReducer,
    accounts: AccountsReducer,
    customers: AdminCustomersReducer,
    customer: CustomerReducer,
    packages: PackageReducer,
    pagers: PagersReducer,
    recursiveCategories: RecursiveCategoriesReducer,
    displayItems: displayItemsReducer,
    adminProducts: AdminProductsReducer,
    shoppingCartItems: ShoppingCartItemsReducer,
    variableObject: VariableObjectReducer,
    environment: EnvironmentReducer,
    UICategorySelections: UICategorySelectionsReducer,
    UIFlags: UIFlagsReducer,
    UICascaderInput: UICascaderInputReducer,
    sliderItems: AdminSliderItemsReducer,
    blogPosts: BlogPostsReducer,
    banners: BannersReducer,
    productGroupTags: AdminProductGroupsTagsReducer,
    displayItemsCategory: DisplayItemsCategoryReducer,
    subscription: subscriptionsReducer
});
