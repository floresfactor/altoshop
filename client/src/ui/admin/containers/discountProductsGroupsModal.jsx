//@ts-check
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Spin, Transfer, Pagination } from 'antd';

import { currencyFormat } from '../../../lib/util/formatUtils';
import PagerNames from '../../../lib/constants/pagerNames';
import { mapSubCategoriesToChildObjects } from '../../../lib/util/mapCategories';

// Actions
import { addProductsToDiscount, addProductGroupsToDiscount, deleteProduct } from '../../../actions/adminDiscountsActions';
import { getDiscount, clearVariableObjectData } from '../../../actions/variableObjectActions';
import { loadProductGroups, addProductsToProductGroup, removeProductsFromProductGroup } from '../../../actions/adminProductGroupsActions';
import { loadProducts, clearProducts } from '../../../actions/adminProductsActions';
import { loadRecursiveCategories } from '../../../actions/recursiveCategoriesActions';
import {
    createPager,
    setFilterBy,
    goToPage,
    setItemCount
} from '../../../actions/pagerActions';

// Components
import TransferOptions from '../components/productGroupProductsModal/transferOptions.jsx';

class DiscountProductsGroupsModal extends Component {
    constructor(props) {
        super(props);
        this.pagersPageSize = 10;
        this.state = { loading: true };
    }

    componentWillMount() {
        const { discountID } = this.props;

        const loadPromises = [
            this.props.getDiscount(discountID),
            this.props.clearAdminProducts(),
            this.props.loadRecursiveCategories(),
            this.props.loadProductGroups(),
        ];

        Promise.all(loadPromises).then(() => {
            const { discount } = this.props;
            const rightPagerItemCount = discount.items && discount.items.length || 0;

            // We need 3 pagers:
            // allProductsServerPager === ADMIN_PRODUCT_GROUP_MODAL_ALL_PRODUCTS -> For filtering and bringing product items from server
            // allProductsOwnPager === ADMIN_PRODUCT_GROUP_MODAL_OWN_ALL_PRODUCTS -> For client-side pagination on product items
            // productGroupProductsOwnPager === ADMIN_PRODUCT_GROUP_MODAL_OWN_PRODUCTS -> For client-side pagination on productGroup.products items
            const pagerPromises = [
                this.props.createPager(PagerNames.ADMIN_PRODUCT_GROUP_MODAL_ALL_PRODUCTS, 1, 100, 0),
                this.props.createPager(PagerNames.ADMIN_PRODUCT_GROUP_MODAL_OWN_ALL_PRODUCTS, 1, this.pagersPageSize, 0),
                this.props.createPager(PagerNames.ADMIN_PRODUCT_GROUPS, 1, 100, 0),
                this.props.createPager(PagerNames.ADMIN_PRODUCT_GROUP_MODAL_OWN_PRODUCTS, 1, this.pagersPageSize, rightPagerItemCount)
            ];

            Promise.all(pagerPromises).then(() => {
                this.setState({
                    loading: false,
                    dataIsReady: true,
                    ...this.setOrGetTransferData({ returnState: true })
                });
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        let categoryOptions = this.state.categoryOptions;
        let allItemsDS = this.state.allItemsDS;
        let R_Col_Keys_paginated = this.state.R_Col_Keys_paginated;

        // Once data is being initialized, we need to rebuild it if anything of this happens:
        // - AdminProducts data changed
        // - ProductGroup changed
        // - Any client-side pager changed
        if (this.state.dataIsReady &&
            (nextProps.allProducts !== this.props.allProducts ||
                nextProps.productGroup !== this.props.productGroup ||
                nextProps.allProductsOwnPager !== this.props.allProductsOwnPager ||
                nextProps.productGroupProductsOwnPager !== this.props.productGroupProductsOwnPager)) {
            const transferData = this.setOrGetTransferData({ returnState: true, props: nextProps });
            allItemsDS = transferData.allItemsDS;
            R_Col_Keys_paginated = transferData.R_Col_Keys_paginated;
        }

        // Update categories options
        if (!this.state.categoryOptions || nextProps.recursiveCategories != this.props.recursiveCategories) {
            if (nextProps.recursiveCategories) {
                categoryOptions = nextProps.recursiveCategories.map(c => {
                    return {
                        value: c._id,
                        label: c.name,
                        path: [c._id],
                        children: c.subCategories.map(sc => mapSubCategoriesToChildObjects(sc))
                    };
                });
            }
        }

        // Anything changed? Set the state again
        if (this.state.categoryOptions != categoryOptions || this.state.allItemsDS != allItemsDS) {
            this.setState({
                categoryOptions,
                allItemsDS,
                R_Col_Keys_paginated
            });
        }
    }

    componentWillUnmount() {
        this.props.clearVariableObjectData();
    }

    // Returns the array of items used as data sorce for Transfer component
    // Transfer component must receive an array of items containing both left and right column items.
    // Also, it must receive an array containing the keys of items that won't be showing on left to show on right column
    //
    // i.e.:
    //      allItemsDS (all items) = [obj1, obj2, obj3, obj4]
    //      L_Col_items (data-on-the-left, items) = [obj1, obj2, obj3]
    //      R_Col_keys  (data-on-the-right, keys) = [keyOfObj_4]
    //      R_Col_items (data-on-the-right, items) = [obj4]
    //
    //      So, left column will show obj1, obj2, obj3 and right column will show obj4
    //
    // 'returnState' argument indicates if this method should set the state or return it
    //     (return the state is used for when in react mounting phase)
    setOrGetTransferData({ returnState, props }) {
        const { allProducts,
            allProductsOwnPager,
            productGroupProductsOwnPager,
            productGroup,
            productGroups,
            discount } = (props || this.props);
        // Items that will be excluded from left column and showed on right column
        const discountProductGroups = discount.productGroups || [];
        const productGroupProducts = discount.products || [];
        const discountItems = discount.items || [];

        let tags = [...new Set([].concat(...productGroups.map(productGroup => productGroup.tags)))]
        this.setState({
            categoryOptions: tags.map(tag => ({
                value: tag,
                label: tag,
                path: [tag],
            }))
        })
        const R_Col_keys_all = discountProductGroups.map(p => p._id);
        /*
        let productsWithDiscountIds;
        let productsWithDiscount = [];
        if(allItemsDS.length >=1){
          if(nextProps.discount.products){
          productsWithDiscountIds = nextProps.discount.products.map(product=>product._id);
          allItemsDS.map( ds => {
            productsWithDiscountIds.forEach(id => {
              if(id == ds.key){
                productsWithDiscount.push(ds);
              }
            });
          });
          this.setState({productsWithDiscount});
          }


        }*/
        // Set pagers for right column items
        // Todo: We are not actually suppose to modify things like this..
        // There are actions for this, but it creates an inifinite
        // loop between this method and componentWillReceiveProps. Check.
        productGroupProductsOwnPager.itemCount = R_Col_keys_all.length;
        productGroupProductsOwnPager.currentPage = productGroupProductsOwnPager.currentPage > 1 &&
            (R_Col_keys_all.length <= ((productGroupProductsOwnPager.currentPage - 1) * productGroupProductsOwnPager.pageSize)) ?
            productGroupProductsOwnPager.currentPage - 1 : (productGroupProductsOwnPager.currentPage || 0);

        // Paginate right column item keys
        //  as:
        // R_Col_keys_paginated = R_Col_keys_all
        //          .skip(pager.currentPage > 0 ? (pager.currentPage - 1 * pager.pageSize) : 0)
        //          .take(pager.pageSize);
        const R_Col_Keys_paginated = R_Col_keys_all
            .slice(productGroupProductsOwnPager.currentPage > 1 ? ((productGroupProductsOwnPager.currentPage - 1) * productGroupProductsOwnPager.pageSize) : 0)
            .filter((key, idx) => idx < productGroupProductsOwnPager.pageSize);

        // Now we need the right colum ITEMS, filter them using the KEYS we already have
        const R_Col_Items_Paginated = discountProductGroups.filter(p => R_Col_Keys_paginated.find(p2 => p2 === p._id) !== undefined)
            .map(p => this.mapProductToTransferItem(p));

        // From all products, filter the ones that are NOT in the right column
        const L_Col_items_all = productGroups.filter(p => R_Col_keys_all.find(key => key === p._id) === undefined);

        // Set pagers for left column items
        allProductsOwnPager.itemCount = L_Col_items_all.length;
        allProductsOwnPager.currentPage = allProductsOwnPager.currentPage > 1 &&
            (L_Col_items_all.itemCount <= ((allProductsOwnPager.currentPage - 1) * allProductsOwnPager.pageSize)) ?
            allProductsOwnPager.currentPage - 1 : (allProductsOwnPager.currentPage || 1);

        const L_Col_items_paginated = L_Col_items_all
            .slice(allProductsOwnPager.currentPage > 1 ? ((allProductsOwnPager.currentPage - 1) * allProductsOwnPager.pageSize) : 0)
            .filter((key, idx) => idx < allProductsOwnPager.pageSize)
            .map(p => this.mapProductToTransferItem(p));

        // All items for transfer components (must contain ALL items both in right and left columns for the shit to work)
        const allItemsDS = [...L_Col_items_paginated, ...R_Col_Items_Paginated];

        const newState = {
            allItemsDS,
            R_Col_Keys_paginated
        };

        if (returnState)
            return newState;
        else
            this.setState(newState);
    }

    mapProductToTransferItem(product) {
        return {
            key: product._id,
            name: product.name,
            category: product.category && product.category.name,
            price: currencyFormat(product.price)
        };
    }

    onTransferSelectChange(sourceSelectedKeys, targetSelectedKeys) {
        this.setState({ sourceSelectedKeys, targetSelectedKeys });
    }

    onItemTransfer(newRightColumnKeys, direction, movedKeys) {
        const { discountID, allProductsOwnPager } = this.props;

        // Adding to productGroup.products
        if (direction === 'right') {
            this.setState({ loading: true }, () => {
                this.props.goToPage(allProductsOwnPager, 1);
                this.props.addProductGroupsToDiscount(discountID, movedKeys).finally(() => {
                    this.setState({ loading: false });
                });
            });
        } else if (direction === 'left') { // Removing from productGroup.products
            this.setState({ loading: true }, () => {
                this.props.deleteProduct(discountID, movedKeys).finally(() => {
                    this.setState({ loading: false });
                });
            });
        }
    }

    renderProductTransferItem(productTransferItem) {
        const productItemStr = `${productTransferItem.name} / ${productTransferItem.category} / ${productTransferItem.price}`;

        const labelTitle = (
            <span className="transfer-product-item">
                {productItemStr}
            </span>
        );

        return {
            label: labelTitle, // for displayed item
            value: productItemStr // The 'tooltip'
        };
    }

    getNotFoundContent() {
        return (
            <div className="emtpy-transfer">
                Sin productos
            </div>
        );
    }

    // 1. Determine which transfer column the footer is fot
    // 2. Return appropiate footer for the right / left column
    getTransferFooter({ dataSource }) {
        // No elements on column => no footer
        if (!dataSource || !dataSource[0] || !dataSource[0].key)
            return null;

        // Products on right column (productGroup.products)
        const { R_Col_Keys_paginated } = this.state;

        // Is footer for right column
        if (R_Col_Keys_paginated.find(key => key === dataSource[0].key)) {
            return this.getRightColumnTransferFooter();
        } else { // Is footer for left column
            return this.getLeftColumnTransferFooter();
        }
    }

    // Returns the right transfer footer (pagination component)
    // Right side transfer items are productGroup.products
    getRightColumnTransferFooter() {
        const { productGroupProductsOwnPager, goToPage } = this.props;

        return (
            <Pagination size="small" className="right-column-pager"
                current={productGroupProductsOwnPager.currentPage}
                total={productGroupProductsOwnPager.itemCount}
                pageSize={productGroupProductsOwnPager.pageSize}
                onChange={(newPage) => {
                    // Simulate some thinking and change page
                    this.setState({ targetSelectedKeys: [], loading: true }, () => {
                        setTimeout(() => {
                            goToPage(productGroupProductsOwnPager, newPage).then(() => {
                                this.setState({ loading: false });
                            });
                        }, 500);
                    });
                }} />
        );
    }

    // Returns the right transfer footer (pagination component)
    // Right side transfer items are filteredProducts (adminProducts === this.props.allProducts)
    getLeftColumnTransferFooter() {
        const { allProductsOwnPager, goToPage } = this.props;

        return (
            <Pagination size="small" className="left-column-pager"
                current={allProductsOwnPager.currentPage}
                total={allProductsOwnPager.itemCount}
                pageSize={allProductsOwnPager.pageSize}
                onChange={(newPage) => {
                    // Simulate some thinking and change page
                    this.setState({ sourceSelectedKeys: [], loading: true }, () => {
                        setTimeout(() => {
                            goToPage(allProductsOwnPager, newPage).then(() => {
                                this.setState({ loading: false });
                            });
                        }, 500);
                    });
                }} />
        );
    }

    // filter is something as:
    // { field: value }
    // where field -> filterProp
    // OR { field: null } if we want to clear the filter for
    // the received fields
    onAllProductsFilterChange(filter) {
        const { allProductsServerPager, productGroups } = this.props;
        const filterBy = allProductsServerPager.filterBy || {};
        let newFilterBy;

        const filterProp = Object.keys(filter)[0];
        const value = filter[filterProp];
        const isNullFilter = value === null || value === undefined;

        // Is not null, set the filter
        if (!isNullFilter) {
            newFilterBy = Object.assign({}, filterBy, { [filterProp]: value });
        } else { // is null, clear the filter
            newFilterBy = Object.assign({}, filterBy);
            delete newFilterBy[filterProp];
        }

        this.setState({ loading: true, filterBy: newFilterBy, sourceSelectedKeys: [] });
        this.props.setFilterBy(allProductsServerPager, newFilterBy).then(() => {
            // Clear the products if no filtering is active
            if (!Object.keys(newFilterBy).length) {
                this.props.clearAdminProducts();
                this.setState({ loading: false });
            } else { // Fetch filtered data
                this.props.loadProductGroups().finally(() => {
                    this.props.goToPage(productGroups, 1);
                    this.setState({ loading: false });
                });
            }
        });
    }

    render() {
        const { closeFn, allProductsServerPager } = this.props;
        let { loading,
            allItemsDS,
            R_Col_Keys_paginated,
            categoryOptions,
            dataIsReady,
            sourceSelectedKeys,
            targetSelectedKeys,
            productsWithDiscount,
          } = this.state;

        // Don't try to display data just yet
        if (!dataIsReady) {
            allItemsDS = [];
            R_Col_Keys_paginated = [];
        }

        sourceSelectedKeys = sourceSelectedKeys || [];
        targetSelectedKeys = targetSelectedKeys || [];

        const leftColumnTitle = (
            <div className="transfer-column-title">
                {sourceSelectedKeys.length ?
                    <span>{sourceSelectedKeys.length}/{allItemsDS.length - R_Col_Keys_paginated.length}</span>
                    :
                    <span>&nbsp;</span>
                }
                <span className="title">Todos los productos</span>
            </div>
        );

        const rightColumnTitle = (
            <div className="transfer-column-title">
                {targetSelectedKeys.length ?
                    <span>{targetSelectedKeys.length}/{R_Col_Keys_paginated.length}</span>
                    :
                    <span>&nbsp;</span>
                }
                <span className="title">Productos/Grupos</span>
            </div>
        );

        return (
            <Modal title="Descuento"
                visible={true}
                onCancel={closeFn}
                maskClosable={true}
                footer={null}
                width="75vw"
                wrapClassName="product-group-products-modal">
                <Spin spinning={loading}>
                    <div className="product-group-products-modal-body">
                        <TransferOptions setAllProductsFilterFn={this.onAllProductsFilterChange.bind(this)}
                            filterBy={allProductsServerPager && allProductsServerPager.filterBy}
                            categoryOptions={categoryOptions || []} />
                        <div className="transfer-container">
                            <Transfer rowKey={transferItem => transferItem.key}
                                selectedKeys={[...sourceSelectedKeys, ...targetSelectedKeys]}
                                className="transfer"
                                dataSource={allItemsDS}
                                targetKeys={R_Col_Keys_paginated}
                                titles={[leftColumnTitle, rightColumnTitle]}
                                onChange={this.onItemTransfer.bind(this)}
                                onSelectChange={this.onTransferSelectChange.bind(this)}
                                render={this.renderProductTransferItem}
                                footer={this.getTransferFooter.bind(this)}
                                operations={['Agregar', 'Remover']}
                                notFoundContent={this.getNotFoundContent()} />
                        </div>
                    </div>
                </Spin>
            </Modal>
        );
    }
}

DiscountProductsGroupsModal.propTypes = {
    closeFn: PropTypes.func.isRequired,
    discountID: PropTypes.string.isRequired,
    // productGroupID: PropTypes.string.isRequired,
    clearAdminProducts: PropTypes.func.isRequired,
    allProducts: PropTypes.array.isRequired,
    goToPage: PropTypes.func.isRequired,
    setFilterBy: PropTypes.func.isRequired,
    createPager: PropTypes.func.isRequired,
    allProductsServerPager: PropTypes.object,
    allProductsOwnPager: PropTypes.object,
    productGroupProductsOwnPager: PropTypes.object,
    loadAllProducts: PropTypes.func.isRequired,
    loadRecursiveCategories: PropTypes.func.isRequired,
    recursiveCategories: PropTypes.array.isRequired,
    removeProductsFromProductGroup: PropTypes.func.isRequired,
    addProductsToDiscount: PropTypes.func.isRequired,
    addProductGroupsToDiscount: PropTypes.func.isRequired,
    deleteProduct: PropTypes.func.isRequired,
    loadProductGroups: PropTypes.func.isRequired,
    addProductsToProductGroup: PropTypes.func.isRequired,
    getDiscount: PropTypes.func.isRequired,
    productGroup: PropTypes.object.isRequired,
    clearVariableObjectData: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    return {
        allProducts: state.adminProducts || [],
        allProductsServerPager: state.pagers && state.pagers[PagerNames.ADMIN_PRODUCT_GROUP_MODAL_ALL_PRODUCTS],
        allProductsOwnPager: state.pagers && state.pagers[PagerNames.ADMIN_PRODUCT_GROUP_MODAL_OWN_ALL_PRODUCTS],
        productGroupProductsOwnPager: state.pagers && state.pagers[PagerNames.ADMIN_PRODUCT_GROUP_MODAL_OWN_PRODUCTS],
        recursiveCategories: state.recursiveCategories,
        discount: state.variableObject,
        productGroup: state.variableObject,
        productGroups: state.adminProductGroups,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearAdminProducts: () => {
            dispatch(clearProducts());
        },
        loadAllProducts: () => {
            return dispatch(loadProducts(PagerNames.ADMIN_PRODUCT_GROUP_MODAL_ALL_PRODUCTS, false));
        },
        getDiscount: (discountID) => {
            return dispatch(getDiscount(discountID, false));
        },
        removeProductsFromProductGroup: (productGroupID, productIDsArr) => {
            return dispatch(removeProductsFromProductGroup(productGroupID, productIDsArr, false));
        },
        addProductsToDiscount: (discountID, productIDsArr) => {
            return dispatch(addProductsToDiscount(discountID, productIDsArr, false));
        },
        addProductGroupsToDiscount: (discountID, productIDsArr) => {
            return dispatch(addProductGroupsToDiscount(discountID, productIDsArr, false));
        },
        deleteProduct: (discountID, productIDsArr) => {
            return dispatch(deleteProduct(discountID, productIDsArr, false));
        },
        loadProductGroups: () => {
            return dispatch(loadProductGroups(PagerNames.ADMIN_PRODUCT_GROUPS, false));  
        },
        addProductsToProductGroup: (productGroupID, productIDsArr) => {
            return dispatch(addProductsToProductGroup(productGroupID, productIDsArr, false));
        },
        goToPage: (pager, page) => {
            return dispatch(goToPage(pager, page));
        },
        setFilterBy: (pager, filterBy) => {
            return dispatch(setFilterBy(pager, filterBy));
        },
        createPager: (pager, currentPage, pageSize, itemCount) => {
            return dispatch(createPager(pager, currentPage, pageSize, itemCount, null, null));
        },
        setItemCount: (pager, itemCount) => {
            return dispatch(setItemCount(pager, itemCount));
        },
        loadRecursiveCategories: () => {
            return dispatch(loadRecursiveCategories());
        },
        clearVariableObjectData: () => {
            dispatch(clearVariableObjectData());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DiscountProductsGroupsModal);
