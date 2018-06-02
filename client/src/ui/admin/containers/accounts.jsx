import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { autoSize } from '../../../lib/adazzleGrid/helpers';
import { Table } from 'antd';
import SwitchCell from './switchCell';

import { loadAccounts, toggleAdminAccount } from '../../../actions/accountActions';
// import _ from 'underscore';


class Accounts extends Component {
  constructor(props, ctx) {
    super(props, ctx);

    this.reactDataGridRef = null;

    this.tableColumns = [
      { title: "Email", dataIndex: "email" },
      { title: "Roles", dataIndex: "roles" },
      {
        title: "Admin?",
        key: "action",
        render: (text, record) => {
          return (<SwitchCell checkedChildren={"si"}
            unCheckedChildren={"no"}
            defaultChecked={record.admin}
            accountId={record.key}
            onChangeSwitch={this.onChangeSwitch}
          />);
        }
      }
    ];

    this.state = {
      rows: []
    };
    this.onChangeSwitch = this.onChangeSwitch.bind(this);

  }

  // *****************
  // ****  React  ****
  // *****************
  //componentWillMount() {
  //}

  componentDidMount() {
    this.props.loadAccounts();
    autoSize(this.reactDataGridRef);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.accounts && nextProps.accounts.length) {
      const rows = nextProps.accounts.map(account => {
        return {
          key: account._id,
          email: account.email,
          roles: account.isAdmin ? 'Admin' : 'User',
          admin: account.isAdmin
        };
      });
      this.setState({ rows });
    }
  }

  onChangeSwitch(checked, id) {
    const account = this.state.rows.map(account => {
      if (account.key == id)
        return account;
    });
    if (account.isAdmin != checked)
      this.props.toggleAdminAccount(id);
  }

  render() {

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h2>Cuentas</h2>
            <Table
                columns = {this.tableColumns}
                dataSource={this.state.rows}
            />
          </div>
        </div>
      </div>
  );
  }
}

Accounts.propTypes = {
  accounts: PropTypes.array.isRequired,
  loadAccounts: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    accounts: state.accounts,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadAccounts: () => {
      return dispatch(loadAccounts());
    },
    toggleAdminAccount: (accountId) => {
      return dispatch(toggleAdminAccount(accountId));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Accounts);
