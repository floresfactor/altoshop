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
import { loadProducts } from '../../../actions/adminProductsActions';
import { loadDiscounts, addDiscount, patchDiscount } from '../../../actions/adminDiscountsActions';        
import { createPager,
         setFilterBy,
         setSortBy,
         goToPage } from '../../../actions/pagerActions';

// Components
import EditableCell from '../components/common/editableCell.jsx';
import InlineInput from '../components/common/inlineInput.jsx';
import ExpandDiscountTable from '../components/adminDiscounts/expandDiscountTable.jsx';
import CategoryCell from '../components/common/categoryCell.jsx';
import TableOptions from '../components/common/tableOptions.jsx';
import CategoryColumnHeader from '../components/common/categoryColumnHeader.jsx';
import EnabledColumnHeader from '../components/adminProductGroups/enabledColumnHeader.jsx';
import DiscountProductsGroupsModal from './discountProductsGroupsModal';

class AdminDiscounts extends Component {
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
        const loadPromises = [this.props.loadDiscounts(), this.props.loadProductGroups(), this.props.loadProducts()];
        Promise.all(loadPromises).then(() => {
            this.setState({ loading: false });
        });
    }

    componentWillReceiveProps(nextProps) {
        const { pager } = nextProps;
        let tableDS = this.state.tableDS || [];
        let categoryOptions = this.state.categoryOptions || [];

        if(nextProps.discounts !== this.props.discounts) {
            if(nextProps.discounts) {
                let discounts = [...nextProps.discounts];
                
                tableDS = discounts.map(ds => {
                    return {
                        key: ds._id,
                        name: this.getDiscountNameCell(ds),
                        //category: this.getProductGroupCategoryCell(ds, this.state.categoryOptions || categoryOptions),
                        enabled: this.getDiscountEnabledCell(ds),
                        validUntil: this.getDiscountValidUntilCell(ds),
                        amount: this.getDiscountAmountCell(ds),
                        //claimType: this.getDiscountClaimTypeCell(ds),
                        code: this.getDiscountCodeCell(ds),
                        products: this.getDiscountProductsCell(ds)
                    };             
                });
            }
        }

        if(nextProps.productGroups !== this.props.productGroups) {
            if(nextProps.productGroups) {
   
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
        const { discounts } = this.state;
        const { pager } = this.props;
        const filterBy = pager && pager.filterBy;

        return [{
            title: 'Nombre',
            dataIndex: 'name',
            width: '35%'
        },
        /*
        {
            title: 'Tipo',
            dataIndex: 'claimType',
            width: '10%'
        },
        */
        {
            title: 'Codigo',
            dataIndex: 'code',
            width: '10%'
        },
        {
            title: 'Porcentaje',
            dataIndex: 'amount',
            width: '10%'
        },
        {
            title: 'Habilitado',
            dataIndex: 'enabled',
            width: '15%'
        },
        {
            title: 'Expira',
            dataIndex: 'validUntil',
            width: '15%'
        },
        {
            title: 'Productos',
            dataIndex: 'products',
            width: '15%'
        }
        /*,
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
        }, 
        {
            title: 'Productos',
            dataIndex: 'products',
            width: '15%'
        }*/];
    }

    getDiscountNameCell(discount) {
        const title = (
            <a>{discount.name}</a>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps= {{
                    onValidSubmit: this.onValidDiscountFieldSubmit.bind(this, discount), 
                    onInvalidSubmit: this.onInvalidDiscountFieldSubmit.bind(this, discount),
                    inputType: "text",
                    name: "name", 
                    value: discount.name, 
                    required: true
                }} />
        );
    }

    getDiscountEnabledCell(discount) {
        return (<Switch checkedChildren="Si" unCheckedChildren="No" className="inventariable-switch"
            checked={!!discount.enabled}
            onChange={(val) => this.onValidDiscountFieldSubmit(discount, { enabled: val })} />
        );
    }

    getDiscountValidUntilCell(discount) {
        const title = (
            <a>{moment(discount.validUntil).format("DD MMMM YYYY")}</a>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps={{
                    onValidSubmit: this.onValidDiscountFieldSubmit.bind(this, discount),
                    onInvalidSubmit: this.onInvalidDiscountFieldSubmit.bind(this, discount),
                    inputType: "date",
                    name: "validUntil",
                    value: moment(discount.validUntil),
                    format: date => moment(date).format("DD MMMM YYYY"),
                    required: true
                }} />
        ); 
    }

    getDiscountAmountCell(discount) {
        const title = (
            <a>{discount.amount}</a>
        );
        
        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps={{
                    onValidSubmit: this.onValidDiscountFieldSubmit.bind(this, discount),
                    onInvalidSubmit: this.onInvalidDiscountFieldSubmit.bind(this, discount),
                    inputType: "text",
                    name: "amount",
                    value: discount.amount,                
                    required: true
                }} />
        );
    }

    getDiscountCodeCell(discount) {
        const title = (
            <a>{discount.code}</a>
        );
        
        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps={{
                    onValidSubmit: this.onValidDiscountFieldSubmit.bind(this, discount),
                    onInvalidSubmit: this.onInvalidDiscountFieldSubmit.bind(this, discount),
                    inputType: "text",
                    name: "code",
                    value: discount.code,                
                    required: false
                }} />
        );
    }

    getDiscountClaimTypeCell(discount) {
        const title = (
            <a>{discount.claimType}</a>
        );


    }

    getDiscountProductsCell(discount) {
        return (
            <a>
                <i onClick={() => 
                    {this.setState({ showProductsModal: true, productsModalDiscountID: discount._id });}}>
                    Ver/Editar
                </i>
            </a>
        );
    }

    expandDiscountRow(tableRecord) {
        const discount = this.props.discounts.find(ds => ds._id == tableRecord.key);

        return discount ?
            (<ExpandDiscountTable discount={discount}                
                onValidDiscountFieldEdit={this.onValidDiscountFieldSubmit.bind(this)}
                onInvalidDiscountFieldEdit={this.onInvalidDiscountFieldSubmit.bind(this)}
                onDiscountDelete={this.onDiscountDelete.bind(this)} />) 
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
    onInvalidDiscountFieldSubmit(productGroup, changedField, resetFn, updateInputsWithErrorFn, errorArr) {
        notification.error({ message: errorArr[0] || 'Invalid input' });
    }

    onValidDiscountFieldSubmit(discount, changedField, resetFn, updateInputsWithErrorFn, closeInputFn) {
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
            return this.props.updateProductGroupCategory(discount._id, changedField.category).catch(errorHandler).finally(() => {
                this.setState({ loading: false });
            });
        } else { // All other fields by category changes
            const changedDiscount = Object.assign({}, discount, changedField);

            return this.props.patchDiscount(discount, changedDiscount).catch(errorHandler).finally(() => {
                this.setState({ loading: false });
            });
        }
    }

    onDiscountDelete(discount) {
        this.setState({ loading: true });

    }

    onDiscountAdd(discount) {
        this.setState({ loading: true, sortInfo: { field: 'createdAt', order:-1} });

        const clearOptions = [this.props.goToPage(1), 
            this.props.setFilterBy({}), 
            this.props.setSortBy({createdAt: -1})
        ];

        Promise.all(clearOptions).then(() => {
            return this.props.addDiscount(discount).then(() => {
                notification.success({ message: 'Ok' });
                return this.props.loadDiscounts();
            }).catch(() => {
                notification.error({ message: 'There was an error adding the discount' });
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
            this.props.loadDiscounts().finally(() => {
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
                    this.props.loadDiscounts().finally(() => {
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
            this.props.loadDiscounts().finally(() => {
                this.setState({ loading: false });
            });
        });
    }

    render() {
        const { pager, recursiveCategories } = this.props;
        const { tableDS, loading, sortInfo, showProductsModal, productsModalDiscountID } = this.state;
        const tableColumns = this.getTableColumns();

        //const newProductGroupCategoryID = recursiveCategories && recursiveCategories[0] && recursiveCategories[0]._id || '';

        return (
            <div className="admin-discounts-container">
                <TableOptions sortInfo={sortInfo} loading={loading} itemType="discount"
                       onSortChange={this.onSortingChange.bind(this)}
                       filterBy={pager && pager.filterBy} 
                       onFilterChange={this.onFilterChange.bind(this)} 
                       addItemFn={this.onDiscountAdd.bind(this)} 
                       //newItemCategoryID={newProductGroupCategoryID} 
                       />
                <Table loading={loading} columns={tableColumns} dataSource={tableDS} className="discounts-table" 
                       expandedRowRender={this.expandDiscountRow.bind(this)} onChange={this.onSortingChange.bind(this)}                       
                       pagination={{
                           current: pager.currentPage,
                           total: pager.itemCount,
                           pageSize: pager.pageSize
                       }} />
                       {showProductsModal && <DiscountProductsGroupsModal discountID={productsModalDiscountID}
                                                closeFn={this.toggleProductsModal.bind(this, false)} />}                
            </div>
        );
    }
}

AdminDiscounts.propTypes = {
    loadDiscounts: PropTypes.func.isRequired,
    addDiscount: PropTypes.func.isRequired,
    patchDiscount: PropTypes.func.isRequired,
    loadProducts: PropTypes.func.isRequired,
    loadProductGroups: PropTypes.func.isRequired,
    goToPage: PropTypes.func.isRequired,
    setSortBy: PropTypes.func.isRequired,
    setFilterBy: PropTypes.func.isRequired,
    createPager: PropTypes.func.isRequired,
    pager: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
    return {
        products: state.adminProducts,
        productGroups: state.adminProductGroups,
        discounts: state.adminDiscounts,
        pager: state.pagers && state.pagers[PagerNames.ADMIN_DISCOUNTS] || {}
    };
};

const mapDispatchToProps = (dispatch) => {
    return {        
        loadDiscounts: () => {
            return dispatch(loadDiscounts(PagerNames.ADMIN_DISCOUNTS, false))
        },
        addDiscount: (discount) => {
            return dispatch(addDiscount(discount, PagerNames.ADMIN_DISCOUNTS, false));
        },
        patchDiscount: (originalDiscount, modifiedDiscount) => {
            return dispatch(patchDiscount(originalDiscount, modifiedDiscount, false));
        },
        loadProductGroups: () => {
            return dispatch(loadProductGroups(PagerNames.ADMIN_PRODUCT_GROUPS, false));
        },
        loadProducts: () => {
            return dispatch(loadProducts(PagerNames.ADMIN_PRODUCTS, false));
        },
        goToPage: (page) => {
            return dispatch(goToPage(PagerNames.ADMIN_DISCOUNTS, page));
        },
        setSortBy: (sortBy) => {
            return dispatch(setSortBy(PagerNames.ADMIN_DISCOUNTS, sortBy));
        },
        setFilterBy: (filterBy) => {
            return dispatch(setFilterBy(PagerNames.ADMIN_DISCOUNTS, filterBy));
        },        
        createPager: (currentPage, pageSize, itemCount, sortBy, filterBy) => {
            return dispatch(createPager(PagerNames.ADMIN_DISCOUNTS, currentPage, pageSize, itemCount, sortBy, filterBy));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminDiscounts);