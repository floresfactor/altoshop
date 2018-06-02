import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Badge } from 'antd';

import { urls } from '../../../../lib/http';
import resources from '../../../../lib/constants/resources';
import EditableCell from '../common/editableCell.jsx';
import InlineInput from '../common/inlineInput.jsx';

// Components
import DescriptionModal from '../common/descriptionModal.jsx';

class ExpandDiscountTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };

        this.tableColumns = [{
            title: 'Producto',
            dataIndex: 'name',
            width: '40%'
        },
        {
            title: 'Precio',
            dataIndex: ''
        },
        {
            title: 'Opciones',
            dataIndex: 'options',
            width: '20%'
        }];
    }

    mapTableDS(discount) {
        const tableDS = [{
            key: discount._id,
            description: this.getPackageDescriptionCell(discount),
            options: this.getPackageOptionsCell(discount)
        }];

        return tableDS;
    }

    getPackageDescriptionCell() {
        return (
            <a>
                <i onClick={this.toggleDescriptionModal.bind(this, true)}>
                    Ver/Editar
                </i>
            </a>
        );
    }

    getPackageOptionsCell(discount) {
        return (
            <div>
                <Badge status="error" />
                <a onClick={() => this.props.onPackageDelete(discount._id)}>Delete</a>
            </div>
        );
    }

    toggleDescriptionModal(show) {
        this.setState({ showDescriptionModal: show });
    }

    submitDescription(htmlDescription) {
        const { _package } = this.props;

        return this.props.onPackageFieldEdit(_package, { description: htmlDescription });
    }

    render() {
        const { discount } = this.props;
        const { showDescriptionModal } = this.state;
        const tableDS = this.mapTableDS(discount);
        //const imgObj = _package.image;

        return (
            <div className="expand-package-row">
                <Table columns={this.tableColumns} dataSource={tableDS} size="small"
                    className="expand-package-row-table" pagination={false} />
                {showDescriptionModal && <DescriptionModal description={discount.description}
                    onDescriptionSubmit={this.submitDescription.bind(this)}
                    closeFn={this.toggleDescriptionModal.bind(this, false)} />}
            </div>
        );
    }
}

ExpandDiscountTable.propTypes = {
    discount: PropTypes.object.isRequired,
    onPackageFieldEdit: PropTypes.func.isRequired,
    onPackageDelete: PropTypes.func.isRequired,
    onValidDiscountFieldEdit: PropTypes.func.isRequired,
    onInvalidDiscountFieldEdit: PropTypes.func.isRequired,
    onDiscountDelete: PropTypes.func.isRequired
};

export default ExpandDiscountTable;