import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { Layout } from 'antd';
import decode from 'jwt-decode';
import { initEnvironment } from '../actions/environmentActions';
import {accountLogout} from '../actions/accountActions';
//import GetDataFromLocalStorage from '../store/getDataFromLocalStorage';
//import RestoreReduxStore from '../store/restoreReduxStore';
import Loadable from './Loadable.js';
// *****************
// Router components
// *****************

// ******************
// ****Components****
// ******************
import AdminRoute from './admin/components/common/adminRoute.jsx';
import Loading from './common/components/loading.jsx';
import Header from './common/containers/header.jsx';
import Sidebar from './common/components/sidebar.jsx';
import FooterComp from './common/components/footerComp.jsx';

// Non-specific app components (login, notFound, about etc.)
import NotFound from './common/components/notFound.jsx';

// Code splitting
const AsyncMainRouter = Loadable({
  loader: () => import('./main/mainRouter.jsx'),
});

const AsyncAdminRouter = Loadable({
  loader: () => import('./admin/adminRouter.jsx'),
});

const AsyncAccountRouter = Loadable({
  loader: () => import('./account/accountRouter.jsx'),
});

const checkAuth = () => {
  const account = JSON.parse(localStorage.getItem('persist:kopay'));
  const token = account && account.account ? JSON.parse(account.account) : null ;
  if (!(token && token.token)){
    return false;
  }

  try {
    // { exp: 12903819203 }
    const { exp } = decode(token.token);

    if (exp < new Date().getTime() / 1000) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
};

class AppIndex extends React.Component {
  componentWillMount(){
    this.props.initEnvironment();
    if (!checkAuth()) {
      this.props.accountLogout();
    }
  }
  render() {
    const { ajaxCallsInProgress } = this.props;
    const showLoading = ajaxCallsInProgress.length > 0;
    const history = createBrowserHistory();

    return (
      <Router history={history}>
        <div>
          {showLoading && <Loading />}
          <div>
            <Route component={Header} />
            <Layout className="main-layout-container">
              <Sidebar />
              <Layout className="content-layout-container">
                <Layout.Content>
                  <Switch>
                    <AdminRoute path="/admin" component={AsyncAdminRouter} />
                    <Route path="/account" component={AsyncAccountRouter} />
                    <Route path="/" component={AsyncMainRouter} />
                    <Route component={NotFound} />
                  </Switch>
                </Layout.Content>
                <Switch>
                  <Route path="/admin" />
                  <Route component={FooterComp} />
                </Switch>
              </Layout>
            </Layout>
          </div>
        </div>
      </Router>
    );
  }
}

AppIndex.propTypes = {
  ajaxCallsInProgress: PropTypes.array.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    ajaxCallsInProgress: state.ajaxCallsInProgress
  };
};



export default connect(mapStateToProps, {initEnvironment, accountLogout})(AppIndex);
