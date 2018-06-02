import React from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Layout } from 'antd';

class Sidebar extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const { sidebarComponent: Component } = this.props;

        return (
            <div id="app-sidebar">
                {Component &&
                    <Layout.Sider className="sidebar-container">
                        <Component />
                    </Layout.Sider>}
            </div>
        );
    }
};

Sidebar.propTypes = {
    sidebarComponent: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    return {
        sidebarComponent: state.sidebarComponent,
    };
};

// Use withRouter to make this component re-render with route changes
export default withRouter(connect(mapStateToProps)(Sidebar));