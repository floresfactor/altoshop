import axios from 'axios';
import actionTypes from './actionTypes';
import { urls } from '../lib/http';
import { toastrError } from '../lib/toastrMessages';
import { diff } from "jsondiffpatch";

const loadBannerSuccess = (banners) =>{
  return { type: actionTypes.LOAD_BANNERS_SUCCESS, banners: banners }
}

const addBannerSuccess = (banner)=>{
  return { type: actionTypes.ADD_ADMIN_BANNER_SUCCESS, banner }
}

const addBannerImageSucess = (bannerID, image)=>{
  return { type: actionTypes.ADD_ADMIN_BANNER_IMAGE_SUCCESS, bannerID: bannerID, image: image }
}

const deleteBannerImageSuccess = (banner)=>{
  return { type: actionTypes.DELETE_ADMIN_BANNER_IMAGE_SUCCESS, banner: banner }
}
const deleteBannerSuccess = (bannerID)=>{
  return { type: actionTypes.DELETE_ADMIN_BANNER_SUCCESS, bannerID }
}
const patchBannerSuccess = (banner)=>{
  return { type: actionTypes.PATCH_ADMIN_BANNER_SUCCESS, banner: banner }
}

export function loadBanners(){
  return dispatch =>{
    return axios.get(urls.apiAdminBannersURL()).
      then(res =>{
        const { banners } = res.data;
        return dispatch(loadBannerSuccess(banners));
     }).catch(error => {
        toastrError(error);
     });
  }
};

export function addBanner(banner){
  return (dispatch) =>{
    return axios.post(urls.apiAdminBannersURL(),banner).
      then((response)=>{
        const { banner } = response.data;
        dispatch(addBannerSuccess(banner));
      })
      .catch((error)=>{
        toastrError(error);
      });
  }
}

export function addBannerImage(bannerID,formData){
  return dispatch =>{
    return axios.post(urls.apiAdminBannersURL(bannerID) + '/image', formData)
      .then((response)=>{
        const { image } = response.data;
        dispatch(addBannerImageSucess(bannerID, image));
        return Promise.resolve();
    }).catch(error=>{
        toastrError(error);
        return Promise.reject(error);
    });
  }
};
export function patchBanner(oldBanner, newBanner){
  return dispatch =>{
    const patch = diff(oldBanner, newBanner);
    if(!patch)
      return Promise.resolve(oldBanner);
    
    return axios.patch(urls.apiAdminBannersURL(oldBanner._id),{ patch })
      .then( response =>{
        const { banner } = response.data;
        dispatch(patchBannerSuccess(banner));
        return Promise.resolve(banner);
      })
      .catch(error =>{
        return Promise.reject(error);  
      });
  }
}

export function deleteBanner(bannerID){
  return dispatch => {
    return axios.delete(urls.apiAdminBannersURL(bannerID))
      .then( response => {
        dispatch(deleteBannerSuccess(bannerID));
      }).catch( error => {
        toastrError(error);
      });
  }
}

export function deleteBannerImage(bannerID){
  return dispatch=>{
    return axios.delete(urls.apiAdminBannersURL(bannerID) + '/image')
      .then(response =>{
        const { banner } = response.data;
        dispatch(deleteBannerImageSuccess(banner));
        return Promise.resolve();
      }).catch(error=>{
        //toastrError(error);
        return Promise.reject(error);
      });
  }
}