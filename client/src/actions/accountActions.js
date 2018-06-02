import Axios from "axios";
import {
  persistor
} from "../store/configureStore";

import actionTypes from "../actions/actionTypes";
import {
  setCustomerFromAccount,
  setCustomerOnStore
} from "../actions/customerActions";
import {
  loadShoppingCartItems
} from "../actions/shoppingCartItemsActions";
import {
  beginAjaxCall,
  endAjaxCall
} from "../actions/ajaxStatusActions";
import {
  urls
} from "../lib/http";
import {
  containsValidationErrors,
  mapErrors
} from "../lib/validations";
import {
  toastrError
} from "../lib/toastrMessages";

import {
  setToken
} from "../lib/util/configAuth";



export const signSuccess = (payload) => {
  const {
    token,
    isAdmin,
    isComplete,
    email,
    customer
  } = payload;
  //localStorage.setItem('token', token);
  setToken(token);
  return {
    type: actionTypes.ACCOUNT_LOGIN_SUCCESS,
    token,
    isAdmin,
    isComplete,
    email,
    customer
  };
};

export const signWithGoogle = (response) => {
  return (dispatch) => {
    dispatch(beginAjaxCall("accountGoogle"));
    return Axios.post('http://localhost:3005/auth/google', {
      "access_token": response.accessToken
    }).then((response) => {
      dispatch(signSuccess(response.data));
      dispatch(endAjaxCall("accountGoogle"));

    }).catch((error) => {
      dispatch(endAjaxCall("accountGoogle"));
      return console.log(error);
    });
  };
};

export const signWithFacebook = (response) => {
  return (dispatch) => {
    dispatch(beginAjaxCall("accountFacebook"));
    return Axios.post('http://localhost:3005/auth/facebook', {
      "access_token": response.accessToken
    }).then((response) => {
      dispatch(signSuccess(response.data));
      dispatch(endAjaxCall("accountFacebook"));
    }).catch((error) => {
      dispatch(endAjaxCall("accountFacebook"));
      return console.log(error);
    });
  };
};


const onLoadAccountsSuccess = accountsList => {
  return {
    type: actionTypes.LOAD_ACCOUNTS_SUCCESS,
    accountsList
  };
};

const onToggleAdminAccountSuccess = toggledAccount => {
  return {
    type: actionTypes.TOGGLE_ADMIN_ACCOUNT_SUCCESS,
    toggledAccount
  };
};

const onRecoveryAccountSuccess = recoverAccount => {
  return {
    type: actionTypes.RECOVERY_ACCOUNT_SUCCESS,
    recoverAccount: recoverAccount
  };
};

const onChangePasswordSuccess = changePassword => {
  return {
    type: actionTypes.CHANGE_PASSWORD_SUCCESS,
    changePassword: changePassword
  };
};

const attemptsLimit = (limit) => {
  return{
    type: actionTypes.ATTEMPTS_FAIL,
    limit,
  };
};

const attemptsLimitFull = (limit) => {
  return{
    type: actionTypes.ATTEMPTS_FAIL_FULL,
    limit,
  };
};

export function accountLogin(accountInfo) {
  /*let captcha = '';
  if (accountInfo.captcha) {
    captcha = accountInfo.captcha;
  }
  */
  return (dispatch) => {

    // Set ajax calls state
    dispatch(beginAjaxCall("accountLogin"));
    return Axios.post(`${urls.accountsLoginURL}`, {
      email: accountInfo.email,
      password: accountInfo.password,
      //captcha: captcha
    })
      .then(response => {
        const account = response.data;

        dispatch(signSuccess(account));

        // Get account customer on state if we hadn't already
        dispatch(setCustomerFromAccount(account)).then(() => {
          // Reload customer shopping cart
          dispatch(loadShoppingCartItems());
        });

        return Promise.resolve();
      })
      .catch(errorResponse => {
        console.log(errorResponse);
        if(errorResponse.response.status === 401 ){
          dispatch(attemptsLimit(6));
        }
        if(errorResponse.response.status === 429){
          dispatch(attemptsLimitFull(6)); // ip block
        }
        if(errorResponse.request){
          console.log("somthing bad happen in the server"); //testing handle errors
        }
        if (containsValidationErrors(errorResponse))
          return Promise.reject(errorResponse.response.data.errors);
        else {
          toastrError(errorResponse);
          return Promise.reject();
        }
      })
      .finally(() => {
        dispatch(endAjaxCall("accountLogin"));
      });
  };
}

export const logout = () => ({ type: actionTypes.ACCOUNT_LOGOUT_SUCCESS });
export const accountLogout = () => dispatch => {
  // Empty local storage
  persistor.purge();
  dispatch(logout());
};

export function accountRegister(accountInfo) {
  return (dispatch, getState) => {
    // Set ajax calls state
    console.log(accountInfo);
    dispatch(beginAjaxCall("accountRegister"));
    return Axios.post(`${urls.accountsRegisterURL}`, {
      email: accountInfo.email,
      password: accountInfo.password,
      captcha: accountInfo.captcha,
    })
      .then(response => {
        const account = response.data;

        dispatch(signSuccess(account));
        dispatch(attemptsLimit(10));
        dispatch(setCustomerFromAccount(account)).then(() => {
          // Reload customer shopping cart
          dispatch(loadShoppingCartItems());
        });

        return Promise.resolve();
      })
      .catch(errorResponse => {
        if(errorResponse.response.status === 429){
          dispatch(attemptsLimitFull(10));
        } else if(errorResponse.request){
          console.log("something bad happen in the server"); //testing handle errors
        }
        if (containsValidationErrors(errorResponse))
          return Promise.reject(errorResponse.response.data.errors);
        else {
          toastrError(errorResponse);
          return Promise.reject();
        }
      })
      .finally(() => {
        dispatch(endAjaxCall("accountRegister"));
      });
  };
}

export function loadAccounts() {
  return (dispatch, getState) => {
    dispatch(beginAjaxCall("loadAccounts"));
    return Axios.get(`${urls.apiAdminAccountsURL}`, {})
      .then(response => {
        const accounts = response.data;
        return dispatch(onLoadAccountsSuccess(accounts));
      })
      .catch(error => {
        toastrError(error);
      })
      .finally(() => {
        dispatch(endAjaxCall("loadAccounts"));
      });
  };
}

export function toggleAdminAccount(accountId) {
  return (dispatch, getState) => {
    return Axios.post(`${urls.apiAdminAccountToggleAdmin(accountId)}`, {})
      .then(response => {
        const account = response.data;
        return dispatch(onToggleAdminAccountSuccess(account));
      })
      .catch(error => {
        toastrError(error);
      })
      .finally(() => { });
  };
}

export function recoverAccount(accountInfo) {
  return dispatch => {
    return Axios.post(urls.recoveAccountByEmail, {
      email: accountInfo.email
    })
      .then(response => {
        const message = response.data;
        dispatch(attemptsLimit(10));
        return dispatch(onRecoveryAccountSuccess(message));
      })
      .catch(error => {
        if(error.response.status === 429){
          dispatch(attemptsLimitFull(10));
        } else if(error.request){
          console.log("somthing bad happen in the server"); //testing handle errors
        }
        toastrError(error);
      });
  };
}

export function changePassword(accountInfo) {
  return dispatch => {
    dispatch(beginAjaxCall("changePassword"));
    return Axios.post(`${urls.accountResetPassword}`, {
      newPassword: accountInfo.newPassword,
      token: accountInfo.resetToken
    })
      .then(response => {
        //const message = response.data;
        dispatch(signSuccess(response.data));
        return dispatch(onChangePasswordSuccess("Password Change success!"));
      })
      .catch(error => {
        toastrError(error);
      })
      .finally(() => {
        dispatch(endAjaxCall("changePassword"));
      });
  };
}
// Used to update either account password or email
export function changeField(fieldName, fieldValue, showLoading = true) {
    return(dispatch, getState) => {
        const account = getState().account;

        if(!account)
            return;

        if(showLoading)
            dispatch(beginAjaxCall('changeField'));

        return Axios.put(`${urls.accountsURL}/${account._id}/email`, { value: fieldValue }).then(response => {
            const account = response.data;
            dispatch(accountLogin(account, false));
        }).catch(err => {
            toastrError(err);
        }).finally(() => {
            if(showLoading)
                dispatch(beginAjaxCall('changeField'));
        });
    };
}
