import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, Switch, notification, LocaleProvider } from "antd";
import locales from 'antd/lib/locale-provider/es_ES';

// Utils
import { currencyFormat, formatNumber } from '../../../lib/util/formatUtils';
import PagerNames from '../../../lib/constants/pagerNames';

// Components
import EditableCell from '../components/common/editableCell.jsx';
import InlineInput from '../components/common/inlineInput.jsx';
import TableOptions from '../components/common/tableOptions.jsx';
import ExpandPackageTable from '../components/adminPackages/expandPackageTable';
import PackageItemsModal from '../components/adminPackages/itemsModal/packageItemsModal';

// Actions
import { loadPackages, patchPackage, uploadImage, deleteImage, putPackageItems, addPackage, deletePackage } from '../../../actions/adminPackagesActions';
import { loadProducts } from '../../../actions/adminProductsActions';
import { goToPage, setSortBy, setFilterBy, createPager } from '../../../actions/pagerActions';

class adminPackages extends Component {
    constructor(props, ctx) {
        super(props, ctx);

        const defaultSorting = { createdAt: -1 };

        // Page: 1
        // PageSize: 15
        // ItemCount: 0
        // SortBy: defaultSorting
        props.createPager(1, 15, 0, defaultSorting);

        this.state = {
            //New
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
        const loadPromises = [this.props.loadPackages()];
        Promise.all(loadPromises).then(() => {
            this.setState({ loading: false });
        });
    }

    componentWillReceiveProps(nextProps) {
        const { pager } = nextProps;
        let tableDS = this.state.tableDS || [];

        if (nextProps.packages !== this.props.packages) {
            if (nextProps.packages) {
                // Do we have active filtering? Filters are refreshed on server when changed,
                // but if an item is changed when filters are active, we need to filter in client here
                let packages = [...nextProps.packages];

                if (pager && pager.filterBy && Object.keys(pager.filterBy).length) {
                    let nameFilterRegex = pager.filterBy.name && new RegExp(pager.filterBy.name, 'i');

                    // Filter packages
                    packages = packages.filter(p => {
                        let include = true;

                        if (pager.filterBy.name)
                            include = nameFilterRegex.test(p.name);

                        return include;
                    });
                }

                tableDS = packages.map(p => {
                    return {
                        key: p._id,
                        sku: p.sku,
                        name: this.getPackageNameCell(p),
                        expirationDate: this.getExpirationDateCell(p),
                        price: this.getPackagePriceCell(p),
                        stock: this.getPackageStockCell(p),
                        enabled: this.getPackageEnabledCell(p),
                        products: this.getPackageItemsCell(p)
                    };
                });

                this.setState({ tableDS });
            }
        }
    }

    shouldComponentUpdate() {
        return !!this.props.pager;
    }

    // *******************************
    // **** Table cells rendering ****
    // *******************************

    getTableColumns() {
        const { sortInfo } = this.state;
        const { pager } = this.props;
        const filterBy = pager && pager.filterBy;

        return [{
            title: 'Name',
            dataIndex: 'name',
            width: '40%'
        }, {
            title: 'Active',
            dataIndex: 'enabled'
        }, {
            title: 'Expiration Date',
            dataIndex: 'expirationDate'
        }, {
            title: 'Price',
            dataIndex: 'price',
            sorter: true,
            sortOrder: (sortInfo && sortInfo.field == 'price') ? sortInfo.order == -1 ? 'descend' : 'ascend' : null
        }, {
            title: 'Stock',
            dataIndex: 'stock'
        }, {
            title: 'Productos',
            dataIndex: 'products'
        }];
    }

    getPackageNameCell(_package) {
        const title = (
            <a>{_package.name}</a>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps={{
                    onValidSubmit: this.onValidPackageFieldSubmit.bind(this, _package),
                    onInvalidSubmit: this.onInvalidPackageFieldSubmit.bind(this, _package),
                    inputType: "text",
                    name: "name",
                    value: _package.name,
                    required: true
                }} />
        );
    }

    getPackageEnabledCell(_package) {
        return (
            <Switch onChange={this.activeSwitchOnChange.bind(this, _package)}
                checked={_package.enabled && !!_package.packageItems.length} checkedChildren={"Si"} unCheckedChildren={"No"} />
        );
    }

    getExpirationDateCell(_package) {
        const title = (
            <a>{moment(_package.expirationDate).format("DD MMMM YYYY")}</a>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps={{
                    onValidSubmit: this.onValidPackageFieldSubmit.bind(this, _package),
                    onInvalidSubmit: this.onInvalidPackageFieldSubmit.bind(this, _package),
                    inputType: "date",
                    name: "expirationDate",
                    value: moment(_package.expirationDate),
                    format: date => moment(date).format("DD MMMM YYYY"),
                    required: true
                }} />
        );
    }

    getPackagePriceCell(_package) {
        const title = (
            <a>{currencyFormat(_package.price)}</a>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps={{
                    onValidSubmit: this.onValidPackageFieldSubmit.bind(this, _package),
                    onInvalidSubmit: this.onInvalidPackageFieldSubmit.bind(this, _package),
                    inputType: "unsg-int",
                    name: "price",
                    value: _package.price,
                    maxLength: 5,
                    required: true
                }} />
        );
    }

    getPackageItemsCell(_package) {
        return (
            <div>
                <div>productos: {_package.packageItems.length}</div>
                <a>
                    <i onClick={this.toggleItemsModal.bind(this, true, _package._id)}>
                        Ver/Editar
                    </i>
                </a>
            </div>
        );
    }

    getPackageStockCell(_package) {
        const title = (
            <span>Stock: <a>{formatNumber(_package.stock)}</a></span>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps={{
                    onValidSubmit: this.onValidPackageFieldSubmit.bind(this, _package),
                    onInvalidSubmit: this.onInvalidPackageFieldSubmit.bind(this, _package),
                    inputType: "unsg-int",
                    name: "stock",
                    maxLength: 4,
                    format: stock => formatNumber(stock),
                    value: _package.stock,
                    required: true
                }} />
        );
    }

    expandPackageRow(tableRecod) {
        const _package = this.props.packages.find(p => p._id == tableRecod.key);

        return _package ?
            (<ExpandPackageTable _package={_package}
                postImageAction={this.props.uploadImage}
                deleteImageAction={this.props.deleteImage}
                onPackageFieldEdit={this.onValidPackageFieldSubmit.bind(this)}
                onPackageDelete={this.onPackageDelete.bind(this)} />)
            : null;
    }

    // ***********************************************
    // ****              functions                ****
    // ***********************************************

    toggleItemsModal(show, packageID) {
        this.setState({ showItemsModal: show, selectedPackageID: packageID });
    }

    // ***********************************************
    // **** Document submission to server methods ****
    // ***********************************************

    onInvalidPackageFieldSubmit(_package, changedField, resetFn, updateInputsWithErrorFn, errorArr) {
        notification.error({ message: errorArr[0] || 'Invalid input' });
    }

    onValidPackageFieldSubmit(_package, changedField, resetFn, updateInputsWithErrorFn, closeInputFn) {
        closeInputFn && closeInputFn();
        return new Promise((resolve) => {
            this.setState({ loading: true }, () => {
                const changedPackage = Object.assign({}, _package, changedField);

                return this.props.patchPackage(_package, changedPackage).catch(this.errorHandler).finally(() => {
                    resolve();
                    this.setState({ loading: false });
                });
            });
        });
    }

    activeSwitchOnChange(_package, enabled) {
        this.setState({ loading: true }, () => {
            const changedPackage = Object.assign({}, _package, { enabled });

            return this.props.patchPackage(_package, changedPackage).catch(this.errorHandler).finally(() => {
                this.setState({ loading: false });
            });
        });
    }

    onPackageAdd(_package) {
        this.setState({ loading: true, sortInfo: { field: 'createdAt', order: -1 } });

        const clearOptions = [this.props.goToPage(1),
        this.props.setFilterBy({}),
        this.props.setSortBy({ createdAt: -1 })
        ];

        Promise.all(clearOptions).then(() => {
            return this.props.addPackage(_package).then(() => {
                notification.success({ message: 'Paquete agregado!' });
                return this.props.loadPackages();
            }).catch(errors => {// Posible errors.message miss
                for (let err in errors) {
                    notification.error(errors[err]);
                }
            });
        }).finally(() => {
            this.setState({ loading: false });
        });
    }

    onPackageDelete(packageID) {
        this.setState({ loading: true }, () => {
            this.props.deletePackage(packageID).then(() => {
                notification.success({ message: 'Paquete borrado!' });
            }).catch(err => {
                notification.error(err);
            }).finally(() => {
                this.setState({ loading: false });
            });
        });
    }

    // ***********************************************
    // ***             UI Notification             ***
    // ***********************************************

    errorHandler(errs) {
        let errMsj;
        if (errs) {
            const err = Object.keys(errs)[0];

            errMsj = err && errs[err].message || 'There was an error';
        } else {
            errMsj = 'There was an error';
        }

        notification.error({ message: errMsj });
    }

    // ***********************************************
    // ***   Table filtering/sorting/pagination    ***
    // ***********************************************

    onPaginationChange(page) {
        this.setState({ loading: true });
        this.props.goToPage(page).then(() => {
            this.props.loadPackages().finally(() => {
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
        if (pagerInfo && pagerInfo.current != pager.currentPage) {
            this.onPaginationChange(pagerInfo.current);
            return;
        }

        // We are not supposed to ever receive something here
        if (filterInfoDoNotUse && Object.keys(filterInfoDoNotUse).length)
            return;

        let { field, order } = sortInfo;
        order = (order == 'ascend' || order == 1) ? 1 : -1;

        // Only currently supporting sorting for price column and createdAt field
        switch (field) {
            case 'price': {
                this.setState({ loading: true });
                this.props.setSortBy({ price: order }).then(() => {
                    this.props.loadPackages().finally(() => {
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
                    this.props.loadPackages().finally(() => {
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
        if (value !== undefined && value !== null) {
            newFilterBy = Object.assign({}, filterBy, { [filterProp]: value });
        } else { // is null, clear the filter
            newFilterBy = Object.assign({}, filterBy);
            delete newFilterBy[filterProp];
        }

        this.setState({ loading: true, filterBy: newFilterBy });
        this.props.setFilterBy(newFilterBy).then(() => {
            this.props.loadPackages().finally(() => {
                this.setState({ loading: false });
            });
        });
    }

    render() {
        const { pager } = this.props;
        const { tableDS, loading, sortInfo, showItemsModal, selectedPackageID } = this.state;
        const tableColumns = this.getTableColumns();



        return (
            <LocaleProvider locale={locales}>
                <div className="admin-packages-container">
                    <TableOptions sortInfo={sortInfo} loading={loading} itemType="package"
                        onSortChange={this.onSortingChange.bind(this)}
                        filterBy={pager && pager.filterBy}
                        onFilterChange={this.onFilterChange.bind(this)}
                        addItemFn={this.onPackageAdd.bind(this)} />
                    <Table loading={loading} columns={tableColumns} dataSource={tableDS} className="packages-table"
                        expandedRowRender={this.expandPackageRow.bind(this)} onChange={this.onSortingChange.bind(this)}
                        pagination={{
                            current: pager.currentPage,
                            total: pager.itemCount,
                            pageSize: pager.pageSize
                        }} />
                    {showItemsModal && <PackageItemsModal
                        packageID={selectedPackageID}
                        onCancel={this.toggleItemsModal.bind(this, false, null)} />}                    
                </div>
            </LocaleProvider>
        );
    }
}



adminPackages.propTypes = {
    loadPackages: PropTypes.func.isRequired,
    deletePackage: PropTypes.func.isRequired,
    patchPackage: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired,
    deleteImage: PropTypes.func.isRequired,
    putPackageItems: PropTypes.func.isRequired,
    loadProducts: PropTypes.func.isRequired,
    addPackage: PropTypes.func.isRequired,
    pager: PropTypes.object,
    goToPage: PropTypes.func.isRequired,
    setSortBy: PropTypes.func.isRequired,
    setFilterBy: PropTypes.func.isRequired,
    createPager: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
    return {
        packages: state.packages,
        products: state.products,
        pager: state.pagers && state.pagers[PagerNames.ADMIN_PACKAGES] || {}
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadPackages: () => {
            return dispatch(loadPackages(PagerNames.ADMIN_PACKAGES, false));
        },
        deletePackage: (packageID) => {
            return dispatch(deletePackage(packageID, false));
        },
        patchPackage: (originalPackage, modifiedPackage) => {
            return dispatch(patchPackage(originalPackage, modifiedPackage, false));
        },
        uploadImage: (pack, formData) => {
            return dispatch(uploadImage(pack, formData, false));
        },
        deleteImage: (packageID) => {
            return dispatch(deleteImage(packageID, false));
        },
        putPackageItems: (packageID, packageItems) => {
            return dispatch(putPackageItems(packageID, packageItems, false));
        },
        loadProducts: () => {
            return dispatch(loadProducts(PagerNames.ADMIN_PRODUCTS, false));
        },
        addPackage: (newPackage) => {
            return dispatch(addPackage(newPackage, PagerNames.ADMIN_PACKAGES, false));
        },
        goToPage: (page) => {
            return dispatch(goToPage(PagerNames.ADMIN_PACKAGES, page));
        },
        setSortBy: (sortBy) => {
            return dispatch(setSortBy(PagerNames.ADMIN_PACKAGES, sortBy));
        },
        setFilterBy: (filterBy) => {
            return dispatch(setFilterBy(PagerNames.ADMIN_PACKAGES, filterBy));
        },
        createPager: (currentPage, pageSize, itemCount, sortBy, filterBy) => {
            return dispatch(createPager(PagerNames.ADMIN_PACKAGES, currentPage, pageSize, itemCount, sortBy, filterBy));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(adminPackages);