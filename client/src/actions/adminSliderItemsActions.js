import axios from 'axios';
import { diff } from "jsondiffpatch";
import actionTypes from '../actions/actionTypes';
import { beginAjaxCall, endAjaxCall } from '../actions/ajaxStatusActions';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';

const loadSliderItemsSuccess = (sliderItems)=> {
  return { type: actionTypes.LOAD_ADMIN_SLIDER_ITEMS_SUCCESS, sliderItems: sliderItems }
}

const addSliderItemSuccess = (sliderItem)=>{
  return { type: actionTypes.ADD_ADMIN_SLIDER_ITEM_SUCCESS, sliderItem: sliderItem}
}

const addSliderItemImageSucess = (sliderItemID, image)=>{
  return { type: actionTypes.ADD_ADMIN_SLIDER_ITEM_IMAGE_SUCCESS, sliderItemID: sliderItemID, image: image }
}

const patchSliderItemSuccess = (sliderItem)=>{
  return { type: actionTypes.PATCH_ADMIN_SLIDER_ITEM_SUCCESS, sliderItem: sliderItem }
}

const deleteSliderItemSuccess = (sliderItemID)=>{
  return { type: actionTypes.DELETE_ADMIN_SLIDER_ITEM_SUCCESS, sliderItemID: sliderItemID }
}

const deleteSliderItemImageSuccess = (sliderItem) =>{
  return { type: actionTypes.DELETE_ADMIN_SLIDER_ITEM_IMAGE_SUCCESS, sliderItem: sliderItem  }
}

export function loadSliderItems(){
  return dispatch =>{ 
    dispatch(beginAjaxCall('loadSliderItems'));

   return axios.get(urls.apiAdminSliderItemsURL()).then((response)=>{
        const { sliderItems } = response.data;
        dispatch(loadSliderItemsSuccess(sliderItems));
    }).catch((error)=>{
         toastrError(error);
    }).finally(()=>{
        dispatch(endAjaxCall('loadSliderItems'));
    });
  }
}

export function addSliderItem(sliderItem){
  return (dispatch) =>{
    return axios.post(urls.apiAdminSliderItemsURL(),sliderItem).
      then((response)=>{
        const { sliderItem } = response.data;
        dispatch(addSliderItemSuccess(sliderItem));
      })
      .catch((error)=>{
        toastrError(error);
      });
  }
}

export function addSliderItemImage(sliderItemID,formData){
  return dispatch =>{
    return axios.post(urls.apiAdminSliderItemsURL(sliderItemID) + '/image',formData)
      .then((response)=>{
        const { image } = response.data;
        dispatch(addSliderItemImageSucess(sliderItemID, image));
        return Promise.resolve();
    }).catch(error=>{
        toastrError(error);
        return Promise.reject(error);
    });
  }
}

export function patchSliderItem(oldItem, newItem){
  return dispatch =>{
    const patch = diff(oldItem, newItem);
    if(!patch)
      return Promise.resolve(oldItem);
    
    return axios.patch(urls.apiAdminSliderItemsURL(oldItem._id),{ patch })
      .then( response =>{
        const { sliderItem } = response.data;
        dispatch(patchSliderItemSuccess(sliderItem));
        Promise.resolve(sliderItem);
      })
      .catch(error =>{
        Promise.reject(error);  
      });
  }
}

export function deleteSliderItem(sliderItemID){
  return dispatch => {
    return axios.delete(urls.apiAdminSliderItemsURL(sliderItemID))
      .then( response => {
        dispatch(deleteSliderItemSuccess(sliderItemID));
      }).catch( error => {
        toastrError(error);
      });
  }
}

export function deleteSliderItemImage(sliderItemID){
  return dispatch=>{
    return axios.delete(urls.apiAdminSliderItemsURL(sliderItemID) + '/image')
      .then(response =>{
        const { sliderItem } = response.data;
        dispatch(deleteSliderItemImageSuccess(sliderItem));
        return Promise.resolve();
      }).catch(error=>{
        //toastrError(error);
        return Promise.reject(error);
      });
  }
}