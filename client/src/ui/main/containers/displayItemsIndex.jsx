import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Spin, Pagination } from 'antd';
import queryString from 'query-string';
import { Row, Col, Layout } from 'antd';

import PagersNames from '../../../lib/constants/pagerNames';
import QueryParams from '../../../lib/constants/queryParams';

// Actions
import { loadCategoryDisplayItems, loadDisplayItems } from '../../../actions/displayItemsActions';
import { beginAjaxCall, endAjaxCall } from '../../../actions/ajaxStatusActions';
import { getCategory } from '../../../actions/recursiveCategoriesActions';
import { goToPage, setSortBy, setFilterBy, createPager, updatePager, removePager } from '../../../actions/pagerActions';
import { setUICategorySelections } from '../../../actions/UICategorySelectionActions';
import { setSearch } from '../../../actions/UICascaderInputActions';

// Components
import WindowDimensions from '../../common/components/windowDimensions.jsx';
import CategoryBreadcrum from './common/categoryBreadcrum.jsx';
//import ProductCarousel from '../components/displayItemsIndex/productCarousel.jsx';
import RandCarousel from '../components/displayItemsIndex/randCarousel.jsx';
import DisplayItemGrid from '../components/displayItemsIndex/displayItemGrid.jsx';

class DisplayItemsIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            URLStateRecovered: false
        };
    }

    componentWillMount() {
        const { location, beginAjaxCall, endAjaxCall } = this.props;

        beginAjaxCall();
        this.setStateFromURL(location).then(() => {
            this.setState({ URLStateRecovered: true });
            endAjaxCall();
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.URLStateRecovered) {
            const { selectedCategoryPath, UICascaderInput, pager, setFilterBy } = this.props;

            // History changed externally: restore accordingly
            if (nextProps.location.state && nextProps.location.state.origin /* && OR? nextProps.location.sate.origin != 'thisComponent' */) {
                this.onLocationExternalChange(nextProps.location);
                return;
            }

            // Selected category changed
            if (nextProps.selectedCategoryPath !== selectedCategoryPath) {
                this.setState({ loading: true });
                this.props.goToPage(1).then(() => {
                    this.fetchdisplayItems(nextProps.selectedCategoryPath).then(() => {
                        this.setState({ loading: false });
                    });
                });
            }

            // Search criteria changed
            if (nextProps.UICascaderInput !== UICascaderInput) {
                if (nextProps.UICascaderInput.search != pager.filterBy.name) {
                    this.onSearchFilterChange(nextProps.UICascaderInput.search);
                }
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // Don'r re-render when loading data
        if (this.state.loading === true && nextState.loading !== false)
            return false;
        else if (!nextState.URLStateRecovered)
            return false;
        else
            return true;
    }

    componentDidUpdate(prevProps, prevState) {
        const { selectedCategoryPath, pager, location } = this.props;

        const URLParams = queryString.parse(location.search);
        const { [QueryParams.categoryID]: URLselectedCategoryID,
            [QueryParams.page]: URLcurrentPage,
            [QueryParams.searchFilter]: URLNameFilter,
            [QueryParams.tagsFilter]: URLTagFilter } = URLParams;

        const selectedCategoryID = selectedCategoryPath && selectedCategoryPath.length ?
            selectedCategoryPath.slice(-1)[0] : undefined;

        if (URLselectedCategoryID !== selectedCategoryID || URLcurrentPage != pager.currentPage || pager.filterBy.name != URLNameFilter || pager.filterBY.tags != URLTagFilter) {
            // Route doesn't show 1st page
            if (!URLcurrentPage && pager.currentPage == 1 && URLselectedCategoryID == selectedCategoryID && pager.filterBy.name == URLNameFilter && pager.filterBy.tags == URLTagFilter)
                return;

            this.props.history.push({
                search: this.getURLParamsString(selectedCategoryID, pager.currentPage, pager.filterBy.name, pager.filterBy.tags)
            });
        }
    }

    componentWillUnmount() {
        this.props.removePager();
    }

    setStateFromURL(location) {
        const { pager, goToPage, setFilterBy, createPager, setSearch } = this.props;

        const URLParams = queryString.parse(location.search);
        const { [QueryParams.categoryID]: selectedCategoryID,
            [QueryParams.page]: currentPage,
            [QueryParams.searchFilter]: nameFilterText,
            [QueryParams.tagsFilter]: tagsFilter} = URLParams;

        // Set cascaderInput search text on redux store
        setSearch(nameFilterText || null);
        
        const pagerSet = new Promise((resolve) => {
            if (pager) {
                Promise.all([goToPage(currentPage || 1), nameFilterText ? setFilterBy({ name: nameFilterText, tags: tagsFilter}) : Promise.resolve()])
                    .then(() => resolve());
            } else {
                const pageSize = this.getPageSizeByAntCols();
                const filterBy = Object.assign({},nameFilterText && { name: nameFilterText }, tagsFilter && { tags: tagsFilter });
                createPager(currentPage || 1, pageSize, 0, { createdAt: -1 }, filterBy ? filterBy : null)
                    .then(() => resolve());
            }
        });

        const selectedCategorySet = new Promise((resolve) => {
            if (selectedCategoryID) {
                this.props.getCategory(selectedCategoryID).then(category => {
                    this.props.setUICategorySelections({
                        selectedCategoryPath: [...category.path, category._id]
                    }).then(() => resolve());
                });
            } else { // Dispatch a change to unselect category
                return this.props.setUICategorySelections({
                    selectedCategoryPath: null
                }).then(() => resolve());
            }
        });

        return Promise.all([
            pagerSet,
            selectedCategorySet
        ]).then(() => {
            return this.fetchdisplayItems();
        });
    }

    onPagerChange(newPageNumber) {
        this.setState({ loading: true });
        this.props.goToPage(newPageNumber).then(() => {
            this.fetchdisplayItems().then(() => {
                this.setState({ loading: false });
            });
        });
    }

    onCategoryChange(category) {
        const { selectedCategoryPath } = this.props;

        if (category !== null && selectedCategoryPath && selectedCategoryPath.length
            && category._id != selectedCategoryPath.slice(-1)[0]) {
            this.props.setUICategorySelections({
                selectedCategoryPath: [...category.path, category._id]
            });
        } else if (category === null) { // Unselect category
            this.props.setUICategorySelections({
                selectedCategoryPath: null
            });
        }
    }

    onLocationExternalChange(location) {
        this.setState({ loading: true }, () => {
            this.setState({ URLStateRecovered: false }, () => {
                this.props.setFilterBy({});
                this.setStateFromURL(location).then(() => {
                    this.setState({ URLStateRecovered: true, loading: false });
                    this.props.history.push({ state: Object.assign({}, location.state, { origin: null }) });
                });
            });
        });
    }

    onSearchFilterChange(newSearch) {
        const { pager, setFilterBy } = this.props;

        const newFilterBy = Object.assign(pager.filterBy, { name: newSearch });

        if (!newSearch)
            delete newFilterBy.name;

        this.setState({ loading: true });
        setFilterBy(newFilterBy).then(() => {
            this.fetchdisplayItems().then(() => {
                this.setState({ loading: false });
            });
        });
    }

    getURLParamsString(selectedCategoryID, currentPage, nameFilterText, tagsFilter) {
        const params = queryString.stringify({
            [QueryParams.categoryID]: selectedCategoryID || undefined,
            [QueryParams.page]: currentPage != 1 ? currentPage || undefined : undefined,
            [QueryParams.searchFilter]: nameFilterText || undefined,
            [QueryParams.tagsFilter]: tagsFilter || undefined
        });

        return params;
    }

    fetchdisplayItems(selectedCategoryPath) {
        selectedCategoryPath = selectedCategoryPath || this.props.selectedCategoryPath;

        if (selectedCategoryPath && selectedCategoryPath.length) {
            return this.props.loadCategorydisplayItems(selectedCategoryPath.slice(-1)[0]);
        } else {
            return this.props.loadDisplayItems();
        }
    }

    onScreenWidthChange(size) {
        const { pager } = this.props;
        const newPageSize = this.getPageSizeByAntCols(size);
        const currentFirstItem = ((pager.currentPage - 1) * pager.pageSize) + 1;
        const newCurrentPage = Math.floor(((currentFirstItem - 1) / newPageSize) + 1);

        this.setState({ loading: true });
        this.props.updatePager(newCurrentPage, newPageSize, pager.itemCount, pager.sortBy, pager.filterBy).then(() => {
            this.fetchdisplayItems().then(() => {
                this.setState({ loading: false });
            });
        });
    }

    getPageSizeByAntCols(size) {
        switch (size) {
            case 'xs':
                return 12;
            case 'sm':
                return 16;
            case 'md':
                return 16;
            case 'lg':
                return 24;
            default: {
                // No Size specified
                const width = $(window).width();
                if (width < 768)
                    return this.getPageSizeByAntCols('xs');
                else if (width >= 768 && width < 992)
                    return this.getPageSizeByAntCols('sm');
                else if (width >= 992 && width < 1200)
                    return this.getPageSizeByAntCols('md');
                else
                    return this.getPageSizeByAntCols('lg');
            }
        }
    }

    render() {
        if (!this.state.URLStateRecovered)
            return null;

        const { displayItems, pager } = this.props;
        const { loading } = this.state;

        return (
            <Layout.Content className="product-index-container">
                <Spin spinning={!!loading}>
                    {/*<RandCarousel />*/}
                    <CategoryBreadcrum noCategoryNode={<h4>Lo màs reciente</h4>} onCategoryItemClick={this.onCategoryChange.bind(this)} />
                    <DisplayItemGrid displayItems={displayItems} />
                    <Pagination defaultPageSize={12} className="text-center"
                        pageSize={Number(pager.pageSize)}
                        total={Number(pager.itemCount)}
                        current={Number(pager.currentPage)}
                        onChange={this.onPagerChange.bind(this)} />
                </Spin>
            </Layout.Content>
        );
    }
}

DisplayItemsIndex.propTypes = {
    selectedCategoryPath: PropTypes.arrayOf(PropTypes.string),
    beginAjaxCall: PropTypes.func.isRequired,
    endAjaxCall: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    pager: PropTypes.object,
    goToPage: PropTypes.func.isRequired,
    setFilterBy: PropTypes.func.isRequired,
    createPager: PropTypes.func.isRequired,
    updatePager: PropTypes.func.isRequired,
    removePager: PropTypes.func.isRequired,
    getCategory: PropTypes.func.isRequired,
    setUICategorySelections: PropTypes.func.isRequired,
    loadCategorydisplayItems: PropTypes.func.isRequired,
    loadDisplayItems: PropTypes.func.isRequired,
    displayItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    UICascaderInput: PropTypes.object.isRequired,
    setSearch: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    return {
        displayItems: state.displayItems,
        pager: state.pagers[PagersNames.PRODUCTS_INDEX_GRID],
        selectedCategoryPath: state.UICategorySelections.selectedCategoryPath,
        UICascaderInput: state.UICascaderInput
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadCategorydisplayItems: (categoryID) => {
            return dispatch(loadCategoryDisplayItems(categoryID, PagersNames.PRODUCTS_INDEX_GRID));
        },
        loadDisplayItems: () => {
            return dispatch(loadDisplayItems(PagersNames.PRODUCTS_INDEX_GRID));
        },
        createPager: (currentPage, pageSize, itemCount, sortBy, filterBy) => {
            return dispatch(createPager(PagersNames.PRODUCTS_INDEX_GRID, currentPage, pageSize, itemCount, sortBy, filterBy));
        },
        goToPage: (page) => {
            return dispatch(goToPage(PagersNames.PRODUCTS_INDEX_GRID, page));
        },
        updatePager: (currentPage, pageSize, itemCount, sortBy, filterBy) => {
            return dispatch(updatePager(PagersNames.PRODUCTS_INDEX_GRID, currentPage, pageSize, itemCount, sortBy, filterBy));
        },
        removePager: () => {
            return dispatch(removePager(PagersNames.PRODUCTS_INDEX_GRID));
        },
        setSortBy: (sortObj) => {
            return dispatch(setSortBy(PagersNames.PRODUCTS_INDEX_GRID, sortObj));
        },
        setFilterBy: (filterObj) => {
            return dispatch(setFilterBy(PagersNames.PRODUCTS_INDEX_GRID, filterObj));
        },
        setUICategorySelections: (UIObj) => {
            return dispatch(setUICategorySelections(UIObj));
        },
        getCategory: (categoryID) => {
            return dispatch(getCategory(categoryID));
        },
        beginAjaxCall: () => {
            dispatch(beginAjaxCall('DisplayItemsIndex - restoring URL state'));
        },
        endAjaxCall: () => {
            dispatch(endAjaxCall('DisplayItemsIndex - restoring URL state'));
        },
        setSearch: (searchVal) => {
            dispatch(setSearch(searchVal));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DisplayItemsIndex);