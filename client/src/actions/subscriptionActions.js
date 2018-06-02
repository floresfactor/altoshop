import axios from 'axios';
import actionTypes from './actionTypes';
import { urls } from '../lib/http';

const addSubscriptionSuccess = (subscription)=>{
  return { type: actionTypes.ADD_SUBSCRIPTION_SUCCESS, subscription }
}

export function addSubscription(email){
  return (dispatch, getState) =>{
    const customer = getState().customer;
    return axios.post(urls.apiSusbscriptionURL(),
      { subscription: { 
          email: email,
          customerFirstName: customer.firstName,
          customerLastName: customer.lastName,
          customerID: customer._id
        }
      }
    ).then( res =>{
      const { subscription } = res.data;
      return dispatch(addSubscriptionSuccess(subscription));
    }).catch(err=>{
        return Promise.reject(err);
      })
  }
}