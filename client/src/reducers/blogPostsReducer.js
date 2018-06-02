import initialState from '../store/initialState';
import actionTypes from '../actions/actionTypes';

export default function BlogPostsReducer(state = initialState.blogPosts, action ){
  switch(action.type){
    case actionTypes.LOAD_BLOG_POSTS_SUCCESS:
      return action.posts;
    default:
      return state;
  }
};