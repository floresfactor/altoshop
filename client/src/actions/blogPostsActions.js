import axios from 'axios';
import queryString from 'query-string';

import actionTypes from './actionTypes';
import { urls } from '../lib/http.js';
import ghostCredentials from '../lib/ghostCredentials';

const loadBlogPostsSuccess = (posts) => {
  return { type: actionTypes.LOAD_BLOG_POSTS_SUCCESS, posts: posts }
};

export function loadBlogPosts(
    //check ghost api docs for a complete list of options
    options = { 
      fields: 'custom_excerpt,title,feature_image,id,url',
      limit: '3'
    }
  ){
  return (dispatch) => {
    axios.get( urls.apiBlogPostsURL(), { params: { ...ghostCredentials, ...options }})
      .then(res => {
        const { posts } = res.data;
        return dispatch(loadBlogPostsSuccess(posts)); 
      }).catch( error => {
        return Promise.reject(error.message || "An error occurred");
      });
  }
};