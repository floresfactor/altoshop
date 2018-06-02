import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, notification } from 'antd';

import PagerNames from '../../../lib/constants/pagerNames';
import { currencyFormat } from '../../../lib/util/formatUtils';
import { mapSubCategoriesToChildObjects } from '../../../lib/util/mapCategories';

// Actions
import { loadRecursiveCategories } from '../../../actions/recursiveCategoriesActions';
import { loadProducts, 
         addProduct,
         patchProduct, 
         deleteProduct,
         updateProductCategory, 
         addProductImage, 
         deleteProductImage } from '../../../actions/adminProductsActions';
import { createPager,
         setFilterBy,
         setSortBy,
         goToPage } from '../../../actions/pagerActions';

// Components
import EditableCell from '../components/common/editableCell.jsx';
import InlineInput from '../components/common/inlineInput.jsx';
import InventariableCell from '../components/adminProducts/inventariableCell.jsx';
import ExpandProductTable from '../components/adminProducts/expandProductTable.jsx';
import CategoryCell from '../components/common/categoryCell.jsx';
import TableOptions from '../components/common/tableOptions.jsx';
import CategoryColumnHeader from '../components/common/categoryColumnHeader.jsx';
import InventariableColumnHeader from '../components/adminProducts/inventariableColumnHeader.jsx';

class AdminProducts extends Component {
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
        const loadPromises = [this.props.loadProducts(), this.props.loadRecursiveCategories()];
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

        if(nextProps.products !== this.props.products) {
            if(nextProps.products) {
                // Do we have active filtering? Filters are refreshed on server when changed,
                // but if an item is changed when filters are active, we need to filter in client here
                let products = [...nextProps.products];

                if(pager && Object.keys(pager.filterBy).length) {
                    let nameFilterRegex = pager.filterBy.name && new RegExp(pager.filterBy.name, 'i');

                    // Filter products
                    products = products.filter(p => {
                        let include = true;

                        if(pager.filterBy.name)
                            include = nameFilterRegex.test(p.name);
                        if(pager.filterBy.inventariable !== undefined && pager.filterBy.inventariable !== null)
                            include = include && p.inventariable === pager.filterBy.inventariable;
                        if(pager.filterBy.category)
                            include = include && p.category._id == pager.filterBy.category;

                        return include;
                    });
                }

                tableDS = products.map(p => {
                    return {
                        key: p._id,
                        sku: p.sku,
                        name: this.getProductNameCell(p),
                        category: this.getProductCategoryCell(p, this.state.categoryOptions || categoryOptions),
                        price: this.getProductPriceCell(p),
                        inventariable: this.getProductInvantariableCell(p)
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
        const { categoryOptions, sortInfo } = this.state;
        const { pager } = this.props;
        const filterBy = pager && pager.filterBy;

        return [{
            title: 'Nombre',
            dataIndex: 'name',
            width: '40%'
        },
        {
            title: <CategoryColumnHeader categoryOptions={categoryOptions || []} 
                        filterBy={filterBy}
                        onFilterChange={this.onFilterChange.bind(this)} />,
            dataIndex: 'category',
            width: '20%'
        },
        {
            title: 'Precio',
            dataIndex: 'price',
            width: '10%',
            sorter: true,
            sortOrder: (sortInfo && sortInfo.field == 'price') ? sortInfo.order == -1 ? 'descend' : 'ascend' : null
        }, {
            title: <InventariableColumnHeader onFilterChange={this.onFilterChange.bind(this)} filterBy={filterBy} />,
            dataIndex: 'inventariable',
            width: '15%'
        }];
    }

    getProductNameCell(product) {
        const title = (
            <a>{product.name}</a>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps= {{
                    onValidSubmit: this.onValidProductFieldSubmit.bind(this, product), 
                    onInvalidSubmit: this.onInvalidProductFieldSubmit.bind(this, product),
                    inputType: "text",
                    name: "name", 
                    value: product.name, 
                    required: true
                }} />
        );
    }

    getProductCategoryCell(product, categoryOptions) {
        return(
            <CategoryCell product={product} 
                onCategoryChange={this.onValidProductFieldSubmit.bind(this)} 
                categoryOptions={categoryOptions} />
        );
    }

    getProductPriceCell(product) {
        const title = (            
            <a>{currencyFormat(product.price)}</a>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps= {{
                    onValidSubmit: this.onValidProductFieldSubmit.bind(this, product), 
                    onInvalidSubmit: this.onInvalidProductFieldSubmit.bind(this, product),
                    inputType: "unsg-int",                    
                    name: "price", 
                    value: product.price, 
                    required: true
                }} />
        );
    }

    getProductInvantariableCell(product) {
        return (
            <InventariableCell product={product}
                onValidEdit={this.onValidProductFieldSubmit.bind(this, product)}
                onInvalidEdit={this.onInvalidProductFieldSubmit.bind(this, product)} />
        );
    }

    expandProductRow(tableRecod) {
        const product = this.props.products.find(p => p._id == tableRecod.key);

        return product ? 
            (<ExpandProductTable product={product}
                postImageAction={this.props.addProductImage}
                deleteImageAction={this.props.deleteProductImage}
                onValidProductFieldEdit={this.onValidProductFieldSubmit.bind(this)}
                onInvalidProductFieldEdit={this.onInvalidProductFieldSubmit.bind(this)}
                onProductDelete={this.onProductDelete.bind(this)} />) 
            : null;
    }

    // ***********************************************
    // **** Document submission to server methods ****
    // ***********************************************

    onInvalidProductFieldSubmit(product, changedField, resetFn, updateInputsWithErrorFn, errorArr) {
        notification.error({ message: errorArr[0] || 'Invalid input' });
    }

    onValidProductFieldSubmit(product, changedField, resetFn, updateInputsWithErrorFn, closeInputFn) {        
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
            return this.props.updateProductCategory(product._id, changedField.category).catch(errorHandler).finally(() => {
                this.setState({ loading: false });
            });
        } else { // All other fields but category changes
            const changedProduct = Object.assign({}, product, changedField);

            return this.props.patchProduct(product, changedProduct).catch(errorHandler).finally(() => {
                this.setState({ loading: false });
            });
        }
    }

    onProductDelete(product) {
        this.setState({ loading: true });

        this.props.deleteProduct(product._id).then(() => {
            notification.success({ message: 'Ok'});
            return this.props.loadProducts();
        }).catch(() => {
            notification.error({ message: 'There was an error removing the product' });
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    onProductAdd(product) {
        this.setState({ loading: true, sortInfo: { field: 'createdAt', order: -1 } });

        const clearOptions = [this.props.goToPage(1), 
            this.props.setFilterBy({}), 
            this.props.setSortBy({createdAt: -1})
        ];

        Promise.all(clearOptions).then(() => {
            return this.props.addProduct(product).then(() => {
                notification.success({ message: 'Ok' });
                return this.props.loadProducts();
            }).catch(() => {
                notification.error({ message: 'There was an error adding the product' });
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
            this.props.loadProducts().finally(() => {
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

        // Only currently supporting sorting for price column and createdAt field
        switch(field) {
            case 'price': {
                this.setState({ loading: true });
                this.props.setSortBy({ price: order }).then(() => {
                    this.props.loadProducts().finally(() => {
                        this.setState({ loading: false });
                    });
                });
                break;
            }
            // CreatedAt OR if no sorting then sort by default (createdAt: -1)
            case 'createdAt':            
            case undefined: {
                this.setState({ loading: true });
                this.props.setSortBy({ createdAt: order }).then(() => {
                    this.props.loadProducts().finally(() => {
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
            this.props.loadProducts().finally(() => {
                this.setState({ loading: false });
            });
        });
    }

    render() {
        const { pager, recursiveCategories } = this.props;
        const { tableDS, loading, sortInfo } = this.state;
        const tableColumns = this.getTableColumns();

        const newProductCategoryID = recursiveCategories && recursiveCategories[0] && recursiveCategories[0]._id || '';

        return (
            <div className="admin-products-container">
                <TableOptions sortInfo={sortInfo} loading={loading} itemType="product"
                       onSortChange={this.onSortingChange.bind(this)}
                       filterBy={pager && pager.filterBy} 
                       onFilterChange={this.onFilterChange.bind(this)} 
                       addItemFn={this.onProductAdd.bind(this)} 
                       newItemCategoryID={newProductCategoryID} />
                <Table loading={loading} columns={tableColumns} dataSource={tableDS} className="products-table" 
                       expandedRowRender={this.expandProductRow.bind(this)} onChange={this.onSortingChange.bind(this)}                       
                       pagination={{
                           current: pager.currentPage,
                           total: pager.itemCount,
                           pageSize: pager.pageSize
                       }} />
            </div>
        );
    }
}

AdminProducts.propTypes = {
    products: PropTypes.array.isRequired,
    loadProducts: PropTypes.func.isRequired,
    loadRecursiveCategories: PropTypes.func.isRequired,
    addProductImage: PropTypes.func.isRequired,
    deleteProductImage: PropTypes.func.isRequired,
    recursiveCategories: PropTypes.array.isRequired,
    goToPage: PropTypes.func.isRequired,
    setSortBy: PropTypes.func.isRequired,
    setFilterBy: PropTypes.func.isRequired,
    createPager: PropTypes.func.isRequired,
    pager: PropTypes.object.isRequired,
    patchProduct: PropTypes.func.isRequired,
    updateProductCategory: PropTypes.func.isRequired,
    deleteProduct: PropTypes.func.isRequired,
    addProduct: PropTypes.func.isRequired
};


const mapStateToProps = (state) => {
    return {
        products: state.adminProducts,
        recursiveCategories: state.recursiveCategories,
        pager: state.pagers && state.pagers[PagerNames.ADMIN_PRODUCTS] || {}
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadProducts: () => {
            return dispatch(loadProducts(PagerNames.ADMIN_PRODUCTS, false));
        },
        addProduct: (product) => {
            return dispatch(addProduct(product, PagerNames.ADMIN_PRODUCTS, false));
        },
        patchProduct: (originalProduct, modifiedProduct) => {
            return dispatch(patchProduct(originalProduct, modifiedProduct, false));
        },
        updateProductCategory: (productID, newCategoryID) => {
            return dispatch(updateProductCategory(productID, newCategoryID, false));
        },    
        deleteProduct: (productID) => {
            return dispatch(deleteProduct(productID, false));
        },            
        addProductImage: (productID, formData) => {
            return dispatch(addProductImage(productID, formData, false));
        },
        deleteProductImage: (productID, imageID) => {
            return dispatch(deleteProductImage(productID, imageID, false));
        },
        loadRecursiveCategories: () => {
            return dispatch(loadRecursiveCategories());
        },
        goToPage: (page) => {
            return dispatch(goToPage(PagerNames.ADMIN_PRODUCTS, page));
        },
        setSortBy: (sortBy) => {
            return dispatch(setSortBy(PagerNames.ADMIN_PRODUCTS, sortBy));
        },
        setFilterBy: (filterBy) => {
            return dispatch(setFilterBy(PagerNames.ADMIN_PRODUCTS, filterBy));
        },        
        createPager: (currentPage, pageSize, itemCount, sortBy, filterBy) => {
            return dispatch(createPager(PagerNames.ADMIN_PRODUCTS, currentPage, pageSize, itemCount, sortBy, filterBy));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminProducts);