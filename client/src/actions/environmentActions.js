import actionTypes from '../actions/actionTypes';

export const windowResize = (height, width) => ({
  type: actionTypes.WINDOW_RESIZE,
  height,
  width,
});

export const initEnvironment = () => (dispatch) => {
  dispatch(windowResize(window.innerHeight, window.innerWidth));

  window.onresize = () => {
    dispatch(windowResize(window.innerHeight, window.innerWidth));
  };
};
