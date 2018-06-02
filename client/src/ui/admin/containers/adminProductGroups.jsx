import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, notification, Switch } from 'antd';

import PagerNames from '../../../lib/constants/pagerNames';
import { mapSubCategoriesToChildObjects } from '../../../lib/util/mapCategories';

// Actions
import { loadRecursiveCategories } from '../../../actions/recursiveCategoriesActions';
import { loadProductGroups, 
         addProductGroup,
         patchProductGroup, 
         deleteProductGroup,
         updateProductGroupCategory, 
         addProductGroupImage, 
         deleteProductGroupImage } from '../../../actions/adminProductGroupsActions';
import { createPager,
         setFilterBy,
         setSortBy,
         goToPage } from '../../../actions/pagerActions';
import { searchProductGroupTags } from '../../../actions/adminProductGroupsActions';

// Components
import EditableCell from '../components/common/editableCell.jsx';
import InlineInput from '../components/common/inlineInput.jsx';
import ExpandProductGroupTable from '../components/adminProductGroups/expandProductGroupTable.jsx';
import CategoryCell from '../components/common/categoryCell.jsx';
import TableOptions from '../components/common/tableOptions.jsx';
import CategoryColumnHeader from '../components/common/categoryColumnHeader.jsx';
import EnabledColumnHeader from '../components/adminProductGroups/enabledColumnHeader.jsx';
import ProductGroupProductsModal from './productGroupProductsModal.jsx';

class AdminProductGroups extends Component {
    constructor(props) {
        super(props);

        const defaultSorting = { createdAt: -1 };

        // Page: 1
        // PageSize: 15
        // ItemCount: 0
        // SortBy: defaultSorting
        props.createPager(1, 15, 0, defaultSorting);

        this.state = {
            loading: true,
            sortInfo: {
                field: Object.keys(defaultSorting)[0],
                order: defaultSorting[Object.keys(defaultSorting)[0]]
            }
        };        
    }
    
    // *********************************
    // **** React lifecycle methods ****
    // *********************************

    componentWillMount() {
        const loadPromises = [this.props.loadProductGroups(), this.props.loadRecursiveCategories()];
        Promise.all(loadPromises).then(() => {
            this.setState({ loading: false });
        });
    }

    componentWillReceiveProps(nextProps) {
        const { pager } = nextProps;
        let tableDS = this.state.tableDS || [];
        let categoryOptions = this.state.categoryOptions || [];

        if (nextProps.recursiveCategories && 
            (nextProps.recursiveCategories != this.props.recursiveCategories || !this.state.categoryOptions)) {
            if(nextProps.recursiveCategories)
                categoryOptions = nextProps.recursiveCategories.map(c => {
                    return {
                        value: c._id,
                        label: c.name,
                        path: [c._id],
                        children: c.subCategories.map(sc => mapSubCategoriesToChildObjects(sc))
                    };
                });
        }

        if(nextProps.productGroups !== this.props.productGroups) {
            if(nextProps.productGroups) {
                // Do we have active filtering? Filters are refreshed on server when changed,
                // but if an item is changed when filters are active, we need to filter in client here
                let productGroups = [...nextProps.productGroups];
                if(pager && Object.keys(pager.filterBy).length) {
                    let nameFilterRegex = pager.filterBy.name && new RegExp(pager.filterBy.name, 'i');

                    // Filter productGroups
                    productGroups = productGroups.filter(p => {
                        let include = true;

                        if(pager.filterBy.name)
                            include = nameFilterRegex.test(p.name);
                        if(pager.filterBy.category)
                            include = include && p.category._id == pager.filterBy.category;
                        if(pager.filterBy.enabled !== undefined && pager.filterBy.enabled !== null)
                            include = include && p.enabled === pager.filterBy.enabled;

                        return include;
                    });
                }

                tableDS = productGroups.map(pg => {
                    return {
                        key: pg._id,
                        name: this.getProductGroupNameCell(pg),
                        category: this.getProductGroupCategoryCell(pg, this.state.categoryOptions || categoryOptions),
                        enabled: this.getProductGroupEnabledCell(pg),
                        products: this.getProductGroupProductsCell(pg)
                    };             
                });      
            }      
        }

        if(tableDS != this.state.tableDS || categoryOptions != this.state.categoryOptions)
            this.setState({ tableDS, categoryOptions });
    }

    shouldComponentUpdate() {
        return !!this.props.pager;
    }

    // *******************************
    // **** Table cells rendering ****
    // *******************************

    getTableColumns() {
        const { categoryOptions } = this.state;
        const { pager } = this.props;
        const filterBy = pager && pager.filterBy;

        return [{
            title: 'Nombre',
            dataIndex: 'name',
            width: '55%'
        },
        {
            title: <CategoryColumnHeader categoryOptions={categoryOptions || []} 
                        filterBy={filterBy}
                        onFilterChange={this.onFilterChange.bind(this)} />,
            dataIndex: 'category',
            width: '15%'
        },
        {
            title: <EnabledColumnHeader filterBy={filterBy} onFilterChange={this.onFilterChange.bind(this)} />,
            dataIndex: 'enabled',
            width: '15%'
        }, {
            title: 'Productos',
            dataIndex: 'products',
            width: '15%'
        }];
    }

    getProductGroupNameCell(productGroup) {
        const title = (
            <a>{productGroup.name}</a>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps= {{
                    onValidSubmit: this.onValidProductGroupFieldSubmit.bind(this, productGroup), 
                    onInvalidSubmit: this.onInvalidProductGroupFieldSubmit.bind(this, productGroup),
                    inputType: "text",
                    name: "name", 
                    value: productGroup.name, 
                    required: true
                }} />
        );
    }

    getProductGroupCategoryCell(productGroup, categoryOptions) {
        return(
            <CategoryCell product={productGroup}
                onCategoryChange={this.onValidProductGroupFieldSubmit.bind(this)} 
                categoryOptions={categoryOptions} />
        );
    }

    getProductGroupEnabledCell(productGroup) {
        return (<Switch checkedChildren="Si" unCheckedChildren="No" className="inventariable-switch"
            checked={!!productGroup.enabled}
            onChange={(val) => this.onValidProductGroupFieldSubmit(productGroup, { enabled: val })} />
        );
    }

    getProductGroupProductsCell(productGroup) {
        return (
            <a>
                <i onClick={() => 
                    {this.setState({ showProductsModal: true, productsModalProductGroupID: productGroup._id });}}>
                    Ver/Editar
                </i>
            </a>
        );
    }

    expandProductGroupRow(tableRecod) {
        const productGroup = this.props.productGroups.find(pg => pg._id == tableRecod.key);

        return productGroup ? 
            (<ExpandProductGroupTable productGroup={productGroup}
                postImageAction={this.props.addProductGroupImage}
                deleteImageAction={this.props.deleteProductGroupImage}
                onValidProductGroupFieldEdit={this.onValidProductGroupFieldSubmit.bind(this)}
                onInvalidProductGroupFieldEdit={this.onValidProductGroupFieldSubmit.bind(this)}
                onProductGroupDelete={this.onProductGroupDelete.bind(this)} 
                tagsSuggestions={this.props.productGroupTags}
                searchSuggestions={this.props.searchProductGroupTags}/>) 
            : null;
    }

    // ************************
    // **** Products Modal ****
    // ************************
    
    toggleProductsModal(show) {        
        this.setState({ showProductsModal: show });
    }

    // ***********************************************
    // **** Document submission to server methods ****
    // ***********************************************

    onInvalidProductGroupFieldSubmit(productGroup, changedField, resetFn, updateInputsWithErrorFn, errorArr) {
        notification.error({ message: errorArr[0] || 'Invalid input' });
    }

    onValidProductGroupFieldSubmit(productGroup, changedField, resetFn, updateInputsWithErrorFn, closeInputFn) {        
        closeInputFn && closeInputFn();

        const errorHandler = (errs) => {
            let errMsj;
                if (errs) {
                    const err = Object.keys(errs)[0];

                    errMsj = err && errs[err].message || 'There was an error';
                } else {
                    errMsj = 'There was an error';
                }

                notification.error({ message: errMsj });
        };
        
        this.setState({ loading: true });

        // Category changes are handled aside
        if(changedField && changedField.category) {
            return this.props.updateProductGroupCategory(productGroup._id, changedField.category).catch(errorHandler).finally(() => {
                this.setState({ loading: false });
            });
        } else { // All other fields by category changes
            const changedProductGroup = Object.assign({}, productGroup, changedField);

            return this.props.patchProductGroup(productGroup, changedProductGroup).catch(errorHandler).finally(() => {
                this.setState({ loading: false });
            });
        }
    }

    onProductGroupDelete(productGroup) {
        this.setState({ loading: true });

        this.props.deleteProductGroup(productGroup._id).then(() => {
            notification.success({ message: 'Ok'});
            return this.props.loadProductGroups();
        }).catch(() => {
            notification.error({ message: 'There was an error removing the product group' });
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    onProductGroupAdd(productGroup) {
        this.setState({ loading: true, sortInfo: { field: 'createdAt', order: -1 } });

        const clearOptions = [this.props.goToPage(1), 
            this.props.setFilterBy({}), 
            this.props.setSortBy({createdAt: -1})
        ];

        Promise.all(clearOptions).then(() => {
            return this.props.addProductGroup(productGroup).then(() => {
                notification.success({ message: 'Ok' });
                return this.props.loadProductGroups();
            }).catch(() => {
                notification.error({ message: 'There was an error adding the product group' });
            });
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // ***********************************************
    // ***   Table filtering/sorting/pagination    ***
    // ***********************************************

    onPaginationChange(page) {
        this.setState({ loading: true });
        this.props.goToPage(page).then(() => {
            this.props.loadProductGroups().finally(() => {
                this.setState({ loading: false });
            });
        });
    }

    // <<< This method is connected to antd Table onChange >>>
    //                          BUT:
    // Paging and filtering are NOT controlled by this method    
    // THE FIRST 2 ARGUMENTS SHALL NOT BE USED BY USED BY US (only antd)
    // SortInfo either comes from antd or one of our components
    //
    // Paging is controlled on onPaginationChange method
    // Filtering is controlled by each filtering component
    // defined in the column title of the filed
    onSortingChange(pagerInfo, filterInfoDoNotUse, sortInfo) {
        const { pager } = this.props;

        // Page changed, delegate to appropiate method
        if(pagerInfo && pagerInfo.current != pager.currentPage) {
            this.onPaginationChange(pagerInfo.current);
            return;
        }

        // We are not supposed to ever receive something here
        if(filterInfoDoNotUse && Object.keys(filterInfoDoNotUse).length)
            return;

        let { field, order } = sortInfo;
        order = (order == 'ascend' || order == 1) ? 1 : -1;

        // Only currently supporting sorting for createdAt field
        switch(field) {
            // CreatedAt OR if no sorting then sort by default (createdAt: -1)
            case 'createdAt':            
            case undefined: {
                this.setState({ loading: true });
                this.props.setSortBy({ createdAt: order }).then(() => {
                    this.props.loadProductGroups().finally(() => {
                        this.setState({ loading: false });
                    });
                });
                break;
            }
        }

        sortInfo = {
            field: field || 'createdAt',
            order: order
        };

        this.setState({ sortInfo });
    }

    // filter is something as:
    // { field: value }
    // where field -> filterProp
    // OR { field: null } if we want to clear the filter for
    // the received fields
    onFilterChange(filter) {        
        const { pager } = this.props;
        const filterBy = pager.filterBy || {};
        let newFilterBy;
        
        const filterProp = Object.keys(filter)[0];
        const value = filter[filterProp];

        // Is not null, set the filter
        if(value !== undefined && value !== null) {
            newFilterBy = Object.assign({}, filterBy, { [filterProp]: value });
        } else { // is null, clear the filter
            newFilterBy = Object.assign({}, filterBy);
            delete newFilterBy[filterProp];
        }
        
        this.setState({ loading: true, filterBy: newFilterBy });
        this.props.setFilterBy(newFilterBy).then(() => {
            this.props.loadProductGroups().finally(() => {
                this.setState({ loading: false });
            });
        });
    }

    render() {
        const { pager, recursiveCategories } = this.props;
        const { tableDS, loading, sortInfo, showProductsModal, productsModalProductGroupID } = this.state;
        const tableColumns = this.getTableColumns();

        const newProductGroupCategoryID = recursiveCategories && recursiveCategories[0] && recursiveCategories[0]._id || '';

        return (
            <div className="admin-product-groups-container">
                <TableOptions sortInfo={sortInfo} loading={loading} itemType="productGroup"
                       onSortChange={this.onSortingChange.bind(this)}
                       filterBy={pager && pager.filterBy} 
                       onFilterChange={this.onFilterChange.bind(this)} 
                       addItemFn={this.onProductGroupAdd.bind(this)} 
                       newItemCategoryID={newProductGroupCategoryID} />
                <Table loading={loading} columns={tableColumns} dataSource={tableDS} className="product-groups-table" 
                       expandedRowRender={this.expandProductGroupRow.bind(this)} onChange={this.onSortingChange.bind(this)}                       
                       pagination={{
                           current: pager.currentPage,
                           total: pager.itemCount,
                           pageSize: pager.pageSize
                       }} />
                       {showProductsModal && <ProductGroupProductsModal productGroupID={productsModalProductGroupID}
                                                closeFn={this.toggleProductsModal.bind(this, false)} />}                
            </div>
        );
    }
}

AdminProductGroups.propTypes = {
    productGroups: PropTypes.array.isRequired,
    loadProductGroups: PropTypes.func.isRequired,
    loadRecursiveCategories: PropTypes.func.isRequired,
    addProductGroupImage: PropTypes.func.isRequired,
    deleteProductGroupImage: PropTypes.func.isRequired,
    recursiveCategories: PropTypes.array.isRequired,
    goToPage: PropTypes.func.isRequired,
    setSortBy: PropTypes.func.isRequired,
    setFilterBy: PropTypes.func.isRequired,
    createPager: PropTypes.func.isRequired,
    pager: PropTypes.object.isRequired,
    patchProductGroup: PropTypes.func.isRequired,
    updateProductGroupCategory: PropTypes.func.isRequired,
    deleteProductGroup: PropTypes.func.isRequired,
    addProductGroup: PropTypes.func.isRequired
};


const mapStateToProps = (state) => {
    return {
        productGroups: state.adminProductGroups,
        recursiveCategories: state.recursiveCategories,
        productGroupTags: state.productGroupTags,
        pager: state.pagers && state.pagers[PagerNames.ADMIN_PRODUCT_GROUPS] || {}
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadProductGroups: () => {
            return dispatch(loadProductGroups(PagerNames.ADMIN_PRODUCT_GROUPS, false));
        },
        addProductGroup: (product) => {
            return dispatch(addProductGroup(product, PagerNames.ADMIN_PRODUCT_GROUPS, false));
        },
        patchProductGroup: (originalProduct, modifiedProduct) => {
            return dispatch(patchProductGroup(originalProduct, modifiedProduct, false));
        },
        updateProductGroupCategory: (productID, newCategoryID) => {
            return dispatch(updateProductGroupCategory(productID, newCategoryID, false));
        },    
        deleteProductGroup: (productID) => {
            return dispatch(deleteProductGroup(productID, false));
        },            
        addProductGroupImage: (productID, formData) => {
            return dispatch(addProductGroupImage(productID, formData, false));
        },
        deleteProductGroupImage: (productID, imageID) => {
            return dispatch(deleteProductGroupImage(productID, imageID, false));
        },
        searchProductGroupTags: (search)=>{
            return dispatch(searchProductGroupTags(search));
        },
        loadRecursiveCategories: () => {
            return dispatch(loadRecursiveCategories());
        },
        goToPage: (page) => {
            return dispatch(goToPage(PagerNames.ADMIN_PRODUCT_GROUPS, page));
        },
        setSortBy: (sortBy) => {
            return dispatch(setSortBy(PagerNames.ADMIN_PRODUCT_GROUPS, sortBy));
        },
        setFilterBy: (filterBy) => {
            return dispatch(setFilterBy(PagerNames.ADMIN_PRODUCT_GROUPS, filterBy));
        },        
        createPager: (currentPage, pageSize, itemCount, sortBy, filterBy) => {
            return dispatch(createPager(PagerNames.ADMIN_PRODUCT_GROUPS, currentPage, pageSize, itemCount, sortBy, filterBy));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminProductGroups);