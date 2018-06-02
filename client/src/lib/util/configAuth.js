import axios from 'axios';

export function setToken(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = token;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

export function getToken() {
  const token = localStorage.token;
  return token;
}

export function isLogin() {
  return !!getToken();
}
