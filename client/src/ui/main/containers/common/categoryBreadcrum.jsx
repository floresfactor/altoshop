import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router';
import arrayTreeFilter from 'array-tree-filter';

class CategoryBreadcrumb extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }    

    shouldComponentUpdate(nextProps, nextState) {
        // Don't re-render if blocking on initial category selections
        return !!!this.props.blockOnInitial;
    }

    render() {
        const { selectedCategoryPathObjects, noCategoryNode: Component } = this.props;

        return (
            <div>
                <div className="divider-break">
                    {selectedCategoryPathObjects.length
                        ?
                        <h5>
                            <Breadcrumb className="selected-category-breadcrumb" separator="">
                                {selectedCategoryPathObjects.map((category, i) => {
                                    return (
                                        <Breadcrumb.Item key={i}>
                                            {i > 0 && <i className="fa fa-fw fa-angle-double-right" />}
                                            <a onClick={() => this.props.onCategoryItemClick(category)}>
                                                {category.name}
                                            </a>
                                        </Breadcrumb.Item>
                                    );
                                })}
                            </Breadcrumb>
                        </h5>
                        :
                        Component ? Component : null
                    }
                </div>
            </div>
        );
    }
};

CategoryBreadcrumb.propTypes = {
    selectedCategoryPathObjects: PropTypes.arrayOf(PropTypes.object),
    noCategoryNode: PropTypes.node,
    blockOnInitial: PropTypes.bool,
    onCategoryItemClick: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    return {
        selectedCategoryPathObjects: state.UICategorySelections.categoryPathObjects || []
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoryBreadcrumb);