import { getStoredState } from 'redux-persist';

// Restores store data from browser localStorage
export default function restoreStore() {
  return new Promise((resolve, reject) => {
    getStoredState({ keyPrefix: 'kopay:' }, (err, storedStore) => {
      if (!err)
        resolve(storedStore);
      else
        reject(err);
    });
  });
}
