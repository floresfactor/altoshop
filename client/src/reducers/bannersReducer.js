import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function BannersReducer(state = initialState.banners, action ){
  switch(action.type){
    case actionTypes.LOAD_BANNERS_SUCCESS:
      return action.banners;
    case actionTypes.ADD_ADMIN_BANNER_SUCCESS:
      return [...state, action.banner]
    case actionTypes.ADD_ADMIN_BANNER_IMAGE_SUCCESS:{
      return state.map((banner)=>{
        if(banner._id !== action.bannerID)
          return banner;
        return Object.assign({},banner,{ image: { ...action.image } } );
      });
    }
    case actionTypes.PATCH_ADMIN_BANNER_SUCCESS: {
      return state.map( banner =>{
        if(banner._id !== action.banner._id)
          return banner;
        return Object.assign({},action.banner);
      });
    }
    case actionTypes.DELETE_ADMIN_BANNER_IMAGE_SUCCESS:{
      return state.map(banner =>{
        if(banner._id != action.banner._id)
          return banner
        return Object.assign({},action.banner);
      });
    }
    case actionTypes.DELETE_ADMIN_BANNER_SUCCESS:{
      return state.filter( banner => banner._id != action.bannerID );
    }
    default:
      return state;
  }
};