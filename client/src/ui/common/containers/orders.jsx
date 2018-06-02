import React, { Component } from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, Input, Popover } from 'antd';

import { currencyFormat } from '../../../lib/util/formatUtils';

// Actions
import { goToPage, setSortBy, setFilterBy, createPager } from '../../../actions/pagerActions';

class Orders extends Component {
    constructor(props, ctx) {
        super(props, ctx);

        this.ordersTableRef = null;
        this.customerSearchInputRef = null;

        this.state = {
            ordersDataSource: [],
            loading: true
        };

        props.createPager(1, 15, 0, { createdAt: -1 }, {});
    }

    componentWillMount() {
        const { loadOrdersFn } = this.props;        

        loadOrdersFn().then(() => {
            this.setState({ loading: false });
        });
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.orders && nextProps.orders.length) {            
            // Map order props to column items
            let ordersDataSource = nextProps.orders.map(o => {
                const paidPayments = o.payments.filter(p => (p. status && p.status.toUpperCase()) == 'PAID');
                const paidAmount = paidPayments.length && paidPayments.map(p => p.amount).reduce((a,b) => a+b) || 0;

                return {
                    orderID: o._id,
                    createdAtInfo: {
                        displayDate: moment(o.createdAt).format('DD MMMM YYYY - hh:mma'),
                        date: moment(o.createdAt)
                    },
                    customerName: o.customer && o.customer._id ? 
                        `${o.customer.firstName} ${o.customer.lastName}` : 'UNKNOWN',
                    status: o.status,                        
                    payedAmount: currencyFormat(paidAmount),
                    total: currencyFormat(o.total)
                };
            });

            // Filter column items?
            if(this.state.customerFilter) {
                const reg = new RegExp(this.state.customerFilter, 'gi');
                ordersDataSource = ordersDataSource.map(o => {
                    const match = o.customerName.match(reg);
                    if (!match)
                        return null;

                    return {
                        ...o,
                        customerName: (
                            <span>
                                {o.customerName.split(reg).map((text, i) => (
                                    i > 0 ? [<span style={{ color: '#f50' }}>{match[0]}</span>, text] : text
                                ))}
                            </span>
                        ),
                    };
                }).filter(o => !!o);
            }

            // Set column items on state
            this.setState({ ordersDataSource });
        }
    }

    getTableColumns() {
        const { isAdmin } = this.props;
        const { isCustomerSearchPopoverVisible, customerFilter } = this.state;
        
        const sortInfo = this.state.sortInfo || {};

        return [
            {
                key: 'date',
                title: 'Fecha',
                dataIndex: 'createdAtInfo.displayDate',                                
                sorter: (a,b) => _.get(a, 'createdAtInfo.date').diff(_.get(b, 'createdAtInfo.date')),
                sortOrder: sortInfo.order
            },
            {
                key: 'customerName',
                title: isAdmin ? (
                    <div className="customer-column-header">
                        Cliente&nbsp;
                        <Popover overlayClassName="customer-column-header"
                            visible={isCustomerSearchPopoverVisible}
                            onVisibleChange={this.toggleCustomerSearchPopoverVisible.bind(this)}
                            content={
                                <div className="customer-search-container">
                                    <Input className="search-input" size="small" value={this.state.customerFilter || ""}
                                        ref={ref => this.customerSearchInputRef = ref}
                                        onChange={(evt) => {
                                            this.setState({ customerFilter: evt.target.value })
                                        }} />
                                    <button onClick={this.filterCustomer.bind(this)} className="btn btn-primary btn-sm">
                                        Buscar
                                    </button>
                                </div>
                            }
                            trigger="click" placement="bottom" >
                            <i onClick={this.toggleCustomerSearchPopoverVisible.bind(this, true)} 
                                className="fa fa-fw fa-search customer-search-toggle" />
                        </Popover>
                        {customerFilter && 
                            <a className="show-all-button" onClick={this.filterCustomer.bind(this, true)}>Mostrar todos</a>}
                    </div>
                ) : <div className="customer-column-header">Cliente&nbsp;</div>,
                dataIndex: 'customerName'                
            },
            {
                key: 'status',
                title: 'Estatus',
                dataIndex: 'status',                
            },
            {
                key: 'payedAmount',
                title: '$ Monto pagado',
                dataIndex: 'payedAmount'                
            },
            {
                key: 'total',
                title: 'Total de la orden',
                dataIndex: 'total'                
            }
        ];
    }

    handleTableChange(pagination, filtersNotUsedHere, sorter) {
        const { loadOrdersFn } = this.props;

        let refresh = false;

        // Pagination changed?
        if(this.props.pager.currentPage != pagination.current) {
            this.props.goToPage(pagination.current);
            refresh = true;
        }
        
        // Sorting changed?
        const createdAtSort = sorter.columnKey == "date" && sorter.order == "descend" ? -1 : 1;
        if(sorter.columnKey && this.props.pager.sortBy.createdAt !== createdAtSort) {
            this.props.setSortBy({createdAt: createdAtSort});
            refresh = true;
        }

        // Refresh from server?
        if(refresh) {
            this.setState({ loading: true, sortInfo: sorter }, () => {
                loadOrdersFn().then(() => {
                    this.setState({ loading: false });
                });
            });            
        } else { // Just refresh sorter icon on table
            this.setState({ sortInfo: sorter });
        }
    }

    onRowClick(record, index, event) {
        const { location } = this.props;
        this.props.history.push(`${location.pathname}/${record.orderID}`);        
    }

    toggleCustomerSearchPopoverVisible(visible) {
        this.setState({isCustomerSearchPopoverVisible: visible}, () => {
            if(visible && this.customerSearchInputRef)
                this.customerSearchInputRef.focus();
        });
    }

    filterCustomer(clear) {
        clear = typeof clear === 'boolean' && clear;
        const customerFilter = !clear && this.state.customerFilter ? this.state.customerFilter : null;
        
        // Hide search popover
        this.toggleCustomerSearchPopoverVisible(false);

        // Get filter, if any
        const filterObj = (clear || !customerFilter) ? {} : { customer: customerFilter };
        
        // Should we filter/clear data?
        if(this.props.pager.filterBy.customer != filterObj.customer) {
            const { loadOrdersFn } = this.props;

            this.props.setFilterBy(filterObj);

            this.setState({ loading: true, customerFilter }, () => {
                // Column filtering is done in server and shown on componentWillReceiveProps
                loadOrdersFn().then(() => {
                    this.setState({ loading: false });
                });
            });
        }
    }

    render() {
        const { ordersDataSource, loading } = this.state;
        const pager = this.props.pager || {};

        return (
            <div>
                <div className="orders-container">           
                    <h2>Orders</h2>         
                    <Table bordered rowKey="orderID"           
                           ref={(ref) => this.ordersTableRef = ref}
                           columns={this.getTableColumns()}
                           dataSource={ordersDataSource}
                           size={"small"}
                           onRowClick={this.onRowClick.bind(this)}
                           onChange={this.handleTableChange.bind(this)}
                           loading={loading}
                           pagination={{
                               defaultPageSize: 15,
                               pageSize: pager.pageSize,
                               total: pager.itemCount,
                               current: pager.currentPage,
                               size: 'small',
                               showTotal: (total, range) => { 
                                   return <span>Mostrando {`${range[0]} a ${range[1]} de `}<strong>{total}</strong> ordenes</span>;
                               }
                           }} />
                </div>
            </div>
        );
    }
}

Orders.propTypes = {
    history: PropTypes.object.isRequired,
    orders: PropTypes.array.isRequired,
    pager: PropTypes.object,
    goToPage: PropTypes.func.isRequired,
    setSortBy: PropTypes.func.isRequired,
    setFilterBy: PropTypes.func.isRequired,
    createPager: PropTypes.func.isRequired,
    loadOrdersFn: PropTypes.func.isRequired,
    pagerName: PropTypes.string.isRequired,
    isAdmin: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => {
    return {
        orders: ownProps.isAdmin ? state.adminOrders : state.customerOrders, // <-- This is bad...
        pager: state.pagers[ownProps.pagerName],
        account: state.account
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        goToPage: (page) => {
            dispatch(goToPage(ownProps.pagerName, page));
        },
        setSortBy: (sortBy) => {
            dispatch(setSortBy(ownProps.pagerName, sortBy));
        },
        setFilterBy: (filterBy) => {
            dispatch(setFilterBy(ownProps.pagerName, filterBy));
        },        
        createPager: (currentPage, pageSize, itemCount, sortBy, filterBy) => {
            dispatch(createPager(ownProps.pagerName, currentPage, pageSize, itemCount, sortBy, filterBy));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Orders);