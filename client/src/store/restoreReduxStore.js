import { store } from './configureStore';
import { accountLogin } from '../actions/accountActions';
import { setCustomerOnStore } from '../actions/customerActions';

export default function RestoreReduxStore(storedStore) {
  const account = storedStore && storedStore.account;

  if (storedStore) {
    // Restore customer
    store.dispatch(setCustomerOnStore(storedStore.customer || {}));

    // Restore account
    if (account && !account.isGuest) {
      store.dispatch(accountLogin(account));
    } else {
      //store.dispatch(setGuestAccount(account));
    }
  } else { // Nothing to store -> Set guest account by default
    //store.dispatch(setGuestAccount(account || {}));
  }
}
