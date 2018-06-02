import UIFlags from '../lib/constants/UIFlags';
/*
import {
  isLogin,
  getToken
} from '../lib/util/configAuth';
*/
export default {
  ajaxCallsInProgress: [],
  packages: [],
  navComponents: null,
  adminProductGroups: [],
  adminDiscounts: [],
  adminOrders: [],
  customerOrders: [],
  accounts: [],
  recoverAccount: null,
  sidebarComponent: null,
  account: {
    isLoggedIn: false,
    token: null,
    isAdmin: false,
    customer: null,
    isComplete: false,
    email: null
  },
  attempts: {
    count: 0,
    limit: 1,
    customExpiresAt: null
  },
  customers: [],
  customer: {},
  pagers: {},
  recursiveCategories: [],
  displayItems: [],
  displayItemsCategory: [],
  adminProducts: [],
  shoppingCartItems: [],
  // See what this is for in the reducer
  variableObject: {},
  // **************************
  // Something as:
  // UICategorySelections = { selectedCategoryPath: ['categoryId1', ... ,'categoryIdN'],
  //                          categoryPathObjects: [categoryObj1, ... categoryObjN] }
  environment: {
    height: 0,
    width: 0
  },
  UICategorySelections: {},
  UIFlags: {
    [UIFlags.showShoppingCart]: false
  },
  UICascaderInput: {
    search: ''
  },
  sliderItems: [],
  blogPosts: [],
  banners: [],
  productGroupTags: [],
  subscription: {}
};
