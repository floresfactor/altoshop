import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

import { currencyFormat } from '../../../../lib/util/formatUtils';

const ItemsTable = ({ orderItems }) => {
    const itemsDataSource = orderItems && orderItems.length ? orderItems.map(i => {
        return {
            itemID: i.itemID,
            type: i.type,
            subtotal: currencyFormat(i.price * i.quantity),
            discount: currencyFormat( ((i.price * i.quantity) - (i.discountPrice || i.price) * i.quantity) ),
            total: currencyFormat((i.discountPrice || i.price) * i.quantity),
            quantity: i.quantity,
            name: i.item.name,
            sku: i.item.sku
        };
    }) : [];

    return (
        <Table bordered pagination={false}
            rowKey="itemID" className="items-table"
            columns={[
                {
                    key: 'sku',
                    title: 'SKU',
                    dataIndex: 'sku',
                    width: '20%'
                },
                {
                    key: 'name',
                    title: 'Producto',
                    dataIndex: 'name',
                    width: '30%'
                },                
                {
                    key: 'quantity',
                    title: 'Cantidad',
                    dataIndex: 'quantity',
                    width: '8%'
                },
                {
                    key: 'subtotal',
                    title: 'Subtotal',
                    dataIndex: 'subtotal',
                    width: '12%'
                },
                {
                    key: 'discount',
                    title: 'Descuento',
                    dataIndex: 'discount',
                    width: '15%'
                },
                {
                    key: 'total',
                    title: 'Total',
                    dataIndex: 'total',
                    width: '15%'
                }
            ]}
            dataSource={itemsDataSource}
            size={"small"} />
    );
};

ItemsTable.propTypes = {
    orderItems: PropTypes.array.isRequired
};

export default ItemsTable;