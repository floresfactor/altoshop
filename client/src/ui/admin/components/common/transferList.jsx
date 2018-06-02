import React from 'react';
import PropTypes from 'prop-types';

const TransferList = ({ header: HeaderComponent, footer, items, onItemClick }) => {
    return (
        <div className=' ant-transfer-list ant-transfer-list-with-footer'>
            <div className="ant-transfer-list-header">
                {HeaderComponent}
            </div>
            <div className=' ant-transfer-list-body'>
                <ul className='ant-transfer-list-content'>
                    {items.map((item, idx) => {
                        return (
                            <div className='LazyLoad is-visible' key={item.key || idx}>
                                <li className='ant-transfer-list-content-item'
                                    onClick={() => onItemClick(item.value, item)}
                                    title={item.title}>
                                    {item.item}
                                </li>
                            </div >
                        );
                    })}
                </ul >
            </div >
            <div className=' ant-transfer-list-footer'>
                {footer}
            </div>
        </div >
    );
};

TransferList.propTypes = {
    header: PropTypes.node,
    footer: PropTypes.node,
    items: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        item: PropTypes.node.isRequired,
        value: PropTypes.any
    })).isRequired,
    onItemClick: PropTypes.func.isRequired
};

export default TransferList;