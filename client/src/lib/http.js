import Axios from 'axios';

// Logout accounts on redirections from server per auth errors
import { store } from '../store/configureStore';
import { accountLogout } from '../actions/accountActions';
import getDomain from '../lib/util/getDomain';

const apiRootURL = process.env.KOPAY_SERVER_ADDRESS || 'http://localhost:3005/';

const kopayURLBlog = process.env.KOPAY_URL || process.env.GHOST_SERVER_ADDRESS || 'http://localhost:2368';

export const urls = {
  apiRootURL: apiRootURL,
  apiSysImagesBasePathURL: apiRootURL + 'img/sys/',
  apiProductGroupsURL: apiRootURL + 'api/productGroups',
  apiAccountsURL: apiRootURL + 'api/accounts',
  accountsURL: apiRootURL + 'account',
  accountsLoginURL: apiRootURL + 'account/login',
  accountsSignWithGoogle: apiRootURL + 'auth/google',
  accountsLogoutURL: apiRootURL + 'account/logout',
  accountsRegisterURL: apiRootURL + 'account/register',
  accountCustomer: apiRootURL + 'account/customer',
  accountResetPassword: apiRootURL + 'account/resetPassword',
  recoveAccountByEmail: apiRootURL + 'account/recoveAccountByEmail',
  apiAdminAccountsURL: apiRootURL + 'api/admin/account',
  apiCustomerURL: apiRootURL + 'api/customers',
  apiContactURL: apiRootURL + 'api/contact',
  apiAdminAccountToggleAdmin(accountID) {
    return apiRootURL + 'api/admin/account/' + accountID + '/toggleAdmin';
  },
  accountRecoverAccount(email) {
    return apiRootURL + 'account/' + email + '/recoverAccountByEmail';
  },
  accountsCustomerURL(accountID) {
    return apiRootURL + 'account/' + accountID + '/customer';
  },
  apiCustomerPaymentMethodsURL(customerID) {
    return `${this.apiCustomerURL}/${customerID}/paymentMethods`;
  },
  apiCustomerCartURL(customerID) {
    return `${this.apiCustomerURL}/${customerID}/cartItems`;
  },
  apiOrdersURL(orderID) {
    return this.apiRootURL + 'api/orders' + (orderID ? '/' + orderID : '');
  },
  apiAdminOrdersURL(orderID) {
    return (
      this.apiRootURL + 'api/admin/orders' + (orderID ? '/' + orderID : '')
    );
  },
  apiRecursiveCategoryURL(categoryID) {
    return (
      apiRootURL +
      'api/recursiveCategories' +
      (categoryID ? '/' + categoryID : '')
    );
  },
  apidisplayItemsURL(displayItemSku, categoryID) {
    return (
      apiRootURL +
      'api/displayItems' +
      (displayItemSku ? `/${displayItemSku}` : '') +
      (categoryID ? `/category/${categoryID}` : '')
    );
  },
  apiAdminProductsURL(productID) {
    return (
      apiRootURL + 'api/admin/products' + (productID ? `/${productID}` : '')
    );
  },
  apiAdminProductsImagesURL(productID, imageID) {
    return (
      this.apiAdminProductsURL(productID) +
      '/images' +
      (imageID ? '/' + imageID : '')
    );
  },
  apiAdminPackagesURL(packageID) {
    return (
      apiRootURL + 'api/admin/packages' + (packageID ? `/${packageID}` : '')
    );
  },
  apiAdminPackagesImageURL(packageID) {
    return this.apiAdminPackagesURL(packageID) + '/image';
  },
  apiAdminPackagesItemsURL(packageID) {
    return this.apiAdminPackagesURL(packageID) + '/packageItems';
  },
  apiPackagesURL(packageID) {
    return apiRootURL + 'api/packages' + (packageID ? '/' + packageID : '');
  },
    apiAdminProductGroupsURL(productGroupID) {
    return (
      apiRootURL +
      'api/admin/productGroups' +
      (productGroupID ? `/${productGroupID}` : '')
    );
  },
  apiDiscountsURL(discountID) {
    //{ id, code }
    let x = apiRootURL + 'api/discounts' + (discountID ? `/${discountID}` : '');
    return apiRootURL + 'api/discounts' + (discountID ? `/${discountID}` : '');
  },
  apiBranchesURL(branchID) {
    return `${this.apiRootURL}api/branches` + (branchID ? `/${branchID}` : '');
  },
  apiAppSettingsURL(settingName) {
    return (
      `${this.apiRootURL}api/settings` + (settingName ? `/${settingName}` : '')
    );
  },
  apiAdminSliderItemsURL(sliderItemID) {
    return (
      this.apiRootURL +
      'api/admin/SliderItems' +
      (sliderItemID ? `/${sliderItemID}` : '')
    );
  },
  apiAdminBannersURL(bannerID) {
    return (
      this.apiRootURL + 'api/admin/Pancartas' + (bannerID ? `/${bannerID}` : '')
    );
  },
  apiSusbscriptionURL(id) {
    return `${this.apiRootURL}api/suscribeByEmail${id ? `/${id}` : ``}`;
  },
  //GHOST API
  kopayURL: getDomain(kopayURLBlog),
  blogURL: `${kopayURLBlog}`,
  apiBlogURL: `${kopayURLBlog}/ghost/api/v0.1`,
  apiBlogPostsURL(postID) {
    return `${this.apiBlogURL}/posts` + (postID ? `/${postID}` : '');
  }
};

// Monitor all xhr traffic and intercept redirections from server
export const interceptRedirections = () => {
  Axios.interceptors.response.use(
    response => {
      // Return successfull responses as they are
      return response;
    },
    errorResponse => {
      const statusCode =
        errorResponse.response && errorResponse.response.status;

      // Redirect 302 responses
      if (statusCode && statusCode == 302) {
        const redirectURL =
          errorResponse.response.data && errorResponse.response.data.url;
        const err =
          errorResponse.response.data && errorResponse.response.data.error;

        // Logout accounts when redirectend becaouse a server auth error
        if (
          err &&
          err.errors &&
          (err.errors.sessionExpirationDate || err.errors.sessionID)
        ) {
          store.dispatch(accountLogout()).finally(() => {
            window.location = redirectURL || '/';
          });
        } else {
          window.location = redirectURL || '/';
        }
      } else {
        return Promise.reject(errorResponse);
      }
    }
  );
};
