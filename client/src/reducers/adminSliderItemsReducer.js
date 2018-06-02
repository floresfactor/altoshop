import actionTypes from '../actions/actionTypes';
import initialState from '../store/initialState';

export default function AdminSliderItemsReducer(state = initialState.sliderItems, action){
  switch (action.type){
    case actionTypes.LOAD_ADMIN_SLIDER_ITEMS_SUCCESS:
      return action.sliderItems;
    case actionTypes.ADD_ADMIN_SLIDER_ITEM_SUCCESS:
      return [...state, action.sliderItem]
    case actionTypes.ADD_ADMIN_SLIDER_ITEM_IMAGE_SUCCESS:{
      return state.map((item)=>{
        if(item._id !== action.sliderItemID)
          return item;
        return Object.assign({},item,{ image: { ...action.image } } );
      });
    }
    case actionTypes.PATCH_ADMIN_SLIDER_ITEM_SUCCESS:{
      return state.map( item =>{
        if(item._id !== action.sliderItem._id)
          return item;
        return Object.assign({},action.sliderItem);
      });
    }
    case actionTypes.DELETE_ADMIN_SLIDER_ITEM_SUCCESS: 
      return state.filter( item => item._id != action.sliderItemID );
    case actionTypes.DELETE_ADMIN_SLIDER_ITEM_IMAGE_SUCCESS:{
      return state.map(item =>{
        if(item._id != action.sliderItem._id)
          return item
        return Object.assign({},action.sliderItem);
      });
    }
    default:
      return state;
  }
}