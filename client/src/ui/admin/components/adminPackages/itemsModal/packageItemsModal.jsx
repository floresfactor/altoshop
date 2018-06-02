import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Components
import { Upload, Modal, Icon, notification, Spin, Pagination } from 'antd';
import TransferList from '../../../components/common/transferList';
import TransferOptions from '../../productGroupProductsModal/transferOptions';

import { currencyFormat } from '../../../../../lib/util/formatUtils';
import PagerNames from '../../../../../lib/constants/pagerNames';
import { mapSubCategoriesToChildObjects } from '../../../../../lib/util/mapCategories';
import VariableObjectTypes from '../../../../../lib/constants/variableObjectTypes';

//Actions
import { clearVariableObjectData, getPackage } from '../../../../../actions/variableObjectActions';
import { putPackageItems } from '../../../../../actions/adminPackagesActions';
import { loadProducts, clearProducts } from '../../../../../actions/adminProductsActions';
import { goToPage, setSortBy, setFilterBy, createPager, setItemCount } from '../../../../../actions/pagerActions';
import { loadRecursiveCategories } from '../../../../../actions/recursiveCategoriesActions';


class PackageItemsModal extends Component {
    constructor(props, ctx) {
        super(props, ctx);

        this.pagersPageSize = 10;

        this.state = {
            loading: true,
            allProductTransferItems: [],
            packageItemsTransferItems: [],
            selectedAllProductsKeys: [],
            selectedPackageProductsKeys: []
        };
    }

    //***********************/
    // Component Life Cicle //
    //***********************/

    componentWillMount() {
        const loadPromises = [
            this.props.getPackage(this.props.packageID),
            this.props.clearAdminProducts(),
            this.props.loadRecursiveCategories(),
        ];

        Promise.all(loadPromises).then(() => {
            const { _package } = this.props;
            const packageItems = _package.packageItems;
            const itemCount = packageItems ? packageItems.length : 0;
            const defaultFilterBy = {
                _id: {
                    $nin: packageItems ? packageItems.map(p => p.product._id) : []
                }
            };

            const pagerPromises = [
                this.props.createPager(PagerNames.ADMIN_PACKAGES_MODAL_ALL_PRODUCTS, 1, this.pagersPageSize, 0, null, defaultFilterBy),
                this.props.createPager(PagerNames.ADMIN_PACKAGES_MODAL_PACKAGE_ITEMS, 1, this.pagersPageSize, itemCount)
            ];

            Promise.all(pagerPromises).then(() => {
                this.setState({ loading: false, dataIsReady: true });
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        let { _package, packageItemsPager, allProductsServerPager } = nextProps;
        let { categoryOptions, allProductTransferItems, packageItemsTransferItems } = this.state;

        // Once data is being initialized, we need to rebuild it if anything of this happens:
        // - AdminProducts data changed        
        // - Any client-side pager changed
        if (this.state.dataIsReady &&
            (nextProps.allProducts !== this.props.allProducts)) {
            allProductTransferItems = this.buildAllProductItems(nextProps.allProducts);
        }

        if (this.props.packageItemsPager != packageItemsPager || _package !== this.props._package) {
            const { pageSize, currentPage } = packageItemsPager;

            const packageProducts = this.getCurrentPagePackageItems(_package, { pageSize, currentPage });
            packageItemsTransferItems = this.buildPackageProductsItems(packageProducts);

            // Any package Change?
            if (this.state.dataIsReady && _package !== this.props._package) {
                //Check PackageItems pager currentPage if needs change
                const pager = this.props.packageItemsPager;
                if (_package.packageItems.length <= (pager.currentPage - 1) * pager.pageSize) {
                    this.props.goToPage(pager, pager.currentPage - 1);
                }

                this.props.setItemCount(packageItemsPager, _package.packageItems.length);
            }
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
        if (this.state.categoryOptions != categoryOptions ||
            this.state.allProductTransferItems != allProductTransferItems ||
            this.state.packageItemsTransferItems != packageItemsTransferItems) {

            this.setState({ categoryOptions, allProductTransferItems, packageItemsTransferItems });
        }
    }

    componentWillUnmount() {
        this.props.clearVariableObjectData();
    }

    // *******************************
    // ****    Misc. Functions    ****
    // *******************************

    getCurrentPagePackageItems(_package, pager) {
        const { pageSize, currentPage } = pager;
        return (_package && _package.packageItems && _package.packageItems.length) ?
            _package.packageItems.slice(
                currentPage > 1 ? ((currentPage - 1) * pageSize) : 0
            ).filter((key, idx) => {
                return idx < pageSize;
            }).map(item => {
                return item.product;
            }) : [];
    }

    updateAllProductsPagerFilterBy(pager, _package) {
        const newFilterBy = Object.assign({}, pager.filterBy,
            { _id: { $nin: _package.packageItems.map(p => p.product._id) } }
        );

        return this.props.setFilterBy(pager, newFilterBy)
    }

    // *******************************
    // **** component renderings ****
    // *******************************

    getCheckbox(checked) {
        const className = "ant-checkbox" + (checked ? " ant-checkbox-checked" : '');
        return (
            <label className="ant-checkbox-wrapper">
                <span className={className}>
                    <input type="checkbox" className="ant-checkbox-input" checked={checked} />
                    <span className="ant-checkbox-inner">
                    </span>
                </span>
            </label>
        );
    };

    getAllProductsHeader() {
        const { selectedAllProductsKeys: keys } = this.state;
        const { allProducts } = this.props;

        return (
            <div className="package-items-modal-custom-header">
                <label className="ant-checkbox-wrapper">
                    <span className="ant-checkbox">
                        <input type="checkbox" className="ant-checkbox-input" checked={keys.length >= allProducts.length && keys.length != 0} value="on" onChange={this.onAllProductsHeaderCheckboxChange.bind(this)} />
                        <span className="ant-checkbox-inner">
                        </span>
                    </span>
                </label>
                <span className="ant-transfer-list-header-selected">
                    <span>
                    </span>
                    <span className="ant-transfer-list-header-title">
                        <div className="transfer-column-title">
                            <span>&nbsp; {keys.length ? keys.length + '/' + allProducts.length : null}</span>
                            <span className="title">Todos los productos</span>
                        </div>
                    </span>
                </span>
            </div>
        );
    }

    getPackageItemsHeader() {
        const { selectedPackageProductsKeys: keys } = this.state;
        const { _package, packageItemsPager } = this.props;
        const packageProducts = this.getCurrentPagePackageItems(_package, packageItemsPager);
        return (
            <div className="package-items-modal-custom-header">
                <label className="ant-checkbox-wrapper">
                    <span className="ant-checkbox">
                        <input type="checkbox" className="ant-checkbox-input" checked={keys.length >= packageProducts.length && keys.length != 0} value="on" onChange={this.onPackageItemsHeaderCheckboxChange.bind(this)} />
                        <span className="ant-checkbox-inner">
                        </span>
                    </span>
                </label>
                <span className="ant-transfer-list-header-selected">
                    <span>
                    </span>
                    <span className="ant-transfer-list-header-title">
                        <div className="transfer-column-title">
                            <span>&nbsp;{keys.length ? keys.length + '/' + packageProducts.length : null}</span>
                            <span className="title">Productos en el paquete</span>
                        </div>
                    </span>
                </span>
            </div>
        );
    }

    getAllProductsPagination() {
        const { allProductsServerPager: pager } = this.props;
        const { allProductTransferItems } = this.state;

        return ((pager && allProductTransferItems && allProductTransferItems.length) ?
            <Pagination className="left-column-pager"
                onChange={this.onAllProductsPaginationChange.bind(this)}
                size="small"
                current={pager.currentPage}
                defaultCurrent={pager.currentPage}
                total={pager.itemCount} />
            : null);
    }

    getPackageItemsPagination() {
        const { packageItemsPager: pager } = this.props;
        const { packageItemsTransferItems } = this.state;

        return ((pager && packageItemsTransferItems && packageItemsTransferItems.length) ?
            <Pagination className="right-column-pager"
                onChange={this.onPackageItemsPaginationChange.bind(this)}
                size="small"
                current={pager.currentPage}
                defaultCurrent={pager.currentPage}
                total={pager.itemCount} />
            : null);
    }

    buildAllProductItems(products, selectedKeys = this.state.selectedAllProductsKeys) {
        return (products && products.length) ? products.map((product, i) => {
            const item = product.name + ' / ' +
                product.category.name + ' / ' +
                currencyFormat(product.price);
            const checked = !!selectedKeys.find(key => key === product._id);
            return {
                key: i,
                value: product._id,
                title: item,
                item: <span>
                    {this.getCheckbox(checked)}
                    <span>
                        <span className="transfer-product-item">{item}</span>
                    </span>
                </span>
            };
        }) : [];
    }

    buildPackageProductsItems(products, selectedKeys = this.state.selectedPackageProductsKeys) {
        return (products && products.length) ? products.map((product, i) => {
            const item = product.name + ' / ' +
                product.category.name + ' / ' +
                currencyFormat(product.price);
            const checked = !!selectedKeys.find(key => key === product._id);
            return {
                key: i,
                value: product._id,
                title: item,
                item: <span>
                    {this.getCheckbox(checked)}
                    <span>
                        <span className="transfer-product-item">{item}</span>
                    </span>
                </span>
            };
        }) : [];
    }

    // ***********************************************
    // ***            Event Handlers               ***
    // ***********************************************

    onAllProductsFilterChange(filter) {
        const { allProductsServerPager, _package } = this.props;
        let filterBy = allProductsServerPager.filterBy;
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
        // Clear selected products when filter change
        this.setState({ loading: true, filterBy: newFilterBy, selectedAllProductsKeys: [] });
        this.props.setFilterBy(allProductsServerPager, newFilterBy).then(() => {
            // Clear the products if no filtering is active
            if (!(Object.keys(newFilterBy).length > 1)) {
                this.props.clearAdminProducts();
                this.setState({ loading: false });
            } else { // Fetch filtered data
                this.props.loadAllProducts().finally(() => {
                    this.setState({ loading: false });
                });
            }
        });
    }

    onAllProductsHeaderCheckboxChange(evt) {
        const { checked } = evt.target;
        const { allProducts } = this.props;
        const keys = checked ? allProducts.map(p => p._id) : [];
        const allProductTransferItems = this.buildAllProductItems(allProducts, keys);
        this.setState({ allProductTransferItems, selectedAllProductsKeys: keys });
    }

    onPackageItemsHeaderCheckboxChange(evt) {
        const { checked } = evt.target;
        const { _package } = this.props;

        const products = this.getCurrentPagePackageItems(_package, this.props.packageItemsPager);
        const keys = checked ? products.map(p => p._id) : [];
        const packageItemsTransferItems = this.buildAllProductItems(products, keys);

        this.setState({ packageItemsTransferItems, selectedPackageProductsKeys: keys });
    }

    onAllProductsPaginationChange(newPage) {
        const { allProductsServerPager: pager, loadAllProducts, goToPage } = this.props;

        this.setState({ loading: true, selectedAllProductsKeys: [] });
        goToPage(pager, newPage).then(() => {
            loadAllProducts(pager.pagerName, false).then(() => {
                this.setState({ loading: false });
            });
        });
    }

    onPackageItemsPaginationChange(newPage) {
        const { packageItemsPager: pager, goToPage } = this.props;
        this.setState({ selectedPackageProductsKeys: [] });
        goToPage(pager, newPage);
    }

    onAllProductsClick(value, item) {
        let { selectedAllProductsKeys: selectedKeys } = this.state;
        let { allProducts } = this.props;
        let newKeys = null;
        const isKey = selectedKeys.find(key => {
            return key === value;
        });

        if (!isKey)
            newKeys = [...selectedKeys, value];
        else
            newKeys = selectedKeys.filter(key => key !== value);

        const allProductTransferItems = this.buildAllProductItems(allProducts, newKeys);

        this.setState({ selectedAllProductsKeys: newKeys, allProductTransferItems });
    }

    onPackageProductsClick(value, item) {
        let { selectedPackageProductsKeys: selectedKeys } = this.state;
        const { _package } = this.props;
        const products = this.getCurrentPagePackageItems(_package, this.props.packageItemsPager);
        let newKeys = null;
        const isKey = selectedKeys.find(key => {
            return key === value;
        });

        if (!isKey)
            newKeys = [...selectedKeys, value];
        else
            newKeys = selectedKeys.filter(key => key !== value);

        const packageItemsTransferItems = this.buildAllProductItems(products, newKeys);

        this.setState({ selectedPackageProductsKeys: newKeys, packageItemsTransferItems });
    }

    // ***********************************************
    // **** Document submission to server methods ****
    // ***********************************************

    onAddProducts() {
        const { selectedAllProductsKeys } = this.state;
        const { packageID, _package } = this.props;

        const newPackageItems = selectedAllProductsKeys.map(key => {
            return {
                product: key,
                quantity: 1
            };
        });
        const packageItems = _package.packageItems.map(item => {
            return {
                product: item.product._id,
                quantity: item.quantity
            };
        });

        this.setState({ loading: true, selectedAllProductsKeys: [], selectedPackageProductsKeys: [] });

        this.putPackageItems(packageID, [...packageItems, ...newPackageItems]);
    }

    onRemoveProducts() {
        const { selectedPackageProductsKeys } = this.state;
        const { packageID, _package, packageItemsPager: pager } = this.props;

        const packageItems = _package.packageItems.filter(item => {
            return !selectedPackageProductsKeys.find(key => key == item.product._id);
        }).map(item => {
            return {
                product: item.product._id,
                quantity: item.quantity
            };
        });

        this.setState({ loading: true, selectedPackageProductsKeys: [], selectedAllProductsKeys: [] });

        this.putPackageItems(packageID, [...packageItems]);
    }

    onPackageItemChange() {
        // Not implemented yet!
    }

    putPackageItems(packageID, packageItems) {
        this.props.putPackageItems(packageID, packageItems).then(() => {
            const { allProductsServerPager, _package } = this.props;

            return this.updateAllProductsPagerFilterBy(allProductsServerPager, _package).then(() => {
                return Object.keys(allProductsServerPager.filterBy).length > 1 && this.props.loadAllProducts();
            });
        }).catch(errs => {
            if (errs && typeof errs != "object")
                errs = { err: { message: errs } };

            for (let key in errs)
                notification.error(errs[key]);
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    // ***********************************************
    // ****          Component Rendering          ****
    // ***********************************************

    render() {
        const { onCancel, allProductsServerPager, _package } = this.props;

        const { loading, categoryOptions, allProductTransferItems, packageItemsTransferItems,
            selectedAllProductsKeys, selectedPackageProductsKeys } = this.state;

        const modalTitle = _package.name;

        return (
            <Modal visible={true} onCancel={onCancel} footer={false}
                title={modalTitle} width="75vw"
                wrapClassName="package-items-modal">
                <Spin spinning={loading}>
                    <div className="package-items-modal-body">
                        <div className="transfer-options-container">
                            <TransferOptions setAllProductsFilterFn={this.onAllProductsFilterChange.bind(this)}
                                filterBy={allProductsServerPager && allProductsServerPager.filterBy}
                                categoryOptions={categoryOptions || []}
                            />
                        </div>
                        <div className="transfer-container">
                            <div className="transfer ant-transfer">
                                <TransferList items={allProductTransferItems}
                                    onItemClick={this.onAllProductsClick.bind(this)}
                                    footer={this.getAllProductsPagination()}
                                    header={this.getAllProductsHeader()}
                                />
                                <div className="ant-transfer-operation">
                                    <button onClick={this.onRemoveProducts.bind(this)} disabled={!selectedPackageProductsKeys.length} type="button" className="ant-btn ant-btn-primary ant-btn-sm">
                                        Remover
                                    </button>
                                    <button onClick={this.onAddProducts.bind(this)} disabled={!selectedAllProductsKeys.length} type="button" className="ant-btn ant-btn-primary ant-btn-sm">
                                        <span>
                                            Agregar  <i className="anticon anticon-right"></i>
                                        </span>
                                    </button>
                                </div>
                                <TransferList items={packageItemsTransferItems}
                                    onItemClick={this.onPackageProductsClick.bind(this)}
                                    footer={this.getPackageItemsPagination()}
                                    header={this.getPackageItemsHeader()}
                                />
                            </div>
                        </div>
                    </div>
                </Spin>
            </Modal>
        );
    }
}

PackageItemsModal.propTypes = {
    onCancel: PropTypes.func.isRequired,
    packageID: PropTypes.string.isRequired,
    clearVariableObjectData: PropTypes.func.isRequired,
    loadAllProducts: PropTypes.func.isRequired,
    loadRecursiveCategories: PropTypes.func.isRequired,
    goToPage: PropTypes.func.isRequired,
    setSortBy: PropTypes.func.isRequired,
    setFilterBy: PropTypes.func.isRequired,
    createPager: PropTypes.func.isRequired,
    setItemCount: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
    return {
        _package: state.variableObject,
        allProducts: state.adminProducts,
        recursiveCategories: state.recursiveCategories,
        allProductsServerPager: state.pagers && state.pagers[PagerNames.ADMIN_PACKAGES_MODAL_ALL_PRODUCTS] || {},
        packageItemsPager: state.pagers && state.pagers[PagerNames.ADMIN_PACKAGES_MODAL_PACKAGE_ITEMS] || {}
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        clearVariableObjectData: () => {
            dispatch(clearVariableObjectData());
        },
        clearAdminProducts: () => {
            dispatch(clearProducts());
        },
        getPackage: (packageID) => {
            dispatch(getPackage(packageID, false));
        },
        putPackageItems: (packageID, packageItems) => {
            return dispatch(putPackageItems(packageID, packageItems, false));
        },
        loadAllProducts: () => {
            return dispatch(loadProducts(PagerNames.ADMIN_PACKAGES_MODAL_ALL_PRODUCTS, false));
        },
        goToPage: (pager, page) => {
            return dispatch(goToPage(pager, page));
        },
        setSortBy: (pager, sortBy) => {
            return dispatch(setSortBy(pager, sortBy));
        },
        setFilterBy: (pager, filterBy) => {
            return dispatch(setFilterBy(pager, filterBy));
        },
        createPager: (pager, currentPage, pageSize, itemCount, sortBy, filterBy) => {
            return dispatch(createPager(pager, currentPage, pageSize, itemCount, sortBy, filterBy));
        },
        setItemCount: (pager, itemCount) => {
            return dispatch(setItemCount(pager, itemCount));
        },
        loadRecursiveCategories: () => {
            return dispatch(loadRecursiveCategories());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PackageItemsModal);