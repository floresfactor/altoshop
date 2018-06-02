import React from 'react';
import { Route, Switch } from 'react-router-dom';

// Components

import Loadable from '../Loadable';

const AsyncNotFoundRouter = Loadable({
  loader: () => import('../common/components/notFound.jsx'),
});
const AsyncAccountLogOperationsRouter = Loadable({
  loader: () => import('./containers/accountLogOperations.jsx'),
});
const AsyncResetPasswordRouter = Loadable({
  loader: () => import('./containers/resetPassword.jsx'),
});

const AsyncMyAccountRouter = Loadable({
  loader: () => import('./containers/myAccountRouter.jsx'),
});

const AsyncMyAccountSteps = Loadable({
  loader: () => import('./containers/registerSteps.jsx'),
});

class AccountRouter extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Switch>
                    <Route exact path="/account/login" component={AsyncAccountLogOperationsRouter} />
                    <Route exact path="/account/register" component={AsyncAccountLogOperationsRouter} />
                    <Route exact path="/account/recovery" component={AsyncAccountLogOperationsRouter} />
                    <Route exact path="/account/resetPassword" component={AsyncResetPasswordRouter} />
                    <Route path="/account/my-account" component={AsyncMyAccountRouter} />
                    <Route exact path="/account/customer" component={AsyncMyAccountSteps} />
                    <Route component={AsyncNotFoundRouter} />
                </Switch>
            </div>
        );
    }
}

export default AccountRouter;
