import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Badge } from 'antd';

import resources from '../../../../lib/constants/resources';

// Components
import DescriptionModal from '../common/descriptionModal.jsx';
import ImagesModal from '../common/imagesModal.jsx';
import EditableCell from '../common/editableCell.jsx';
import InlineInput from '../common/inlineInput.jsx';

class ExpandProductTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };

        this.tableColumns = [{
            title: 'sku',
            dataIndex: 'sku',
            width: '20%'
        },
        {
            title: 'Descripción',
            dataIndex: 'description',
            width: '20%'
        },
        {
            title: 'Opciones',
            dataIndex: 'options',
            width: '20%'
        }];
    }

    mapTableDS(product) {
        const tableDS = [{
            key: product._id,
            sku: this.getSkuCell(product),
            description: this.getProductDescriptionCell(product),
            options: this.getProductOptionsCell(product)
        }];

        return tableDS;
    }

    getSkuCell(product) {
        const title = (
            <a>{product.sku}</a>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps= {{
                    onValidSubmit: (...args) => this.props.onValidProductFieldEdit.apply(null, [product, ...args]), 
                    onInvalidSubmit: (...args) => this.props.onInvalidProductFieldEdit.bind(null, [product, ...args]),
                    inputType: "text",
                    name: "sku",
                    value: product.sku, 
                    required: true
                }} />
        );
    }

    getProductDescriptionCell() {
        return (
            <a>
                <i onClick={this.toggleDescriptionModal.bind(this, true)}>
                    Ver/Editar
                </i>
            </a>
        );
    }

    getProductOptionsCell(product) {
        return (
            <div>
                <Badge status="error" />
                <a onClick={() => this.props.onProductDelete(product)}>Borrar</a>
            </div>
        );
    }

    toggleDescriptionModal(show) {
        this.setState({ showDescriptionModal: show });
    }

    submitDescription(htmlDescription) {
        const { product } = this.props;

        return this.props.onValidProductFieldEdit(product, { description: htmlDescription });
    }

    toggleImagesModal(show) {
        this.setState({ showImagesModal: show });
    }

    render() {
        const { product, postImageAction, deleteImageAction } = this.props;
        const { showDescriptionModal, showImagesModal } = this.state;
        const tableDS = this.mapTableDS(product);
        const imgObj = product.images.find(i => i.src);

        return (
            <div className="expand-product-row">
                <div className="mini-img-container">
                    <img onClick={() => { this.setState({ showImagesModal: true }); }}
                        src={imgObj ? imgObj.src : resources.IMG_NO_IMG_URL} />
                </div>
                <Table columns={this.tableColumns} dataSource={tableDS} size="small"
                    className="expand-product-row-table" pagination={false} />
                {showDescriptionModal && <DescriptionModal description={product.description}
                    onDescriptionSubmit={this.submitDescription.bind(this)}
                    closeFn={this.toggleDescriptionModal.bind(this, false)} />}
                {showImagesModal && <ImagesModal images={product.images}
                    onPostImage={(formData) => postImageAction(product._id, formData)}
                    onDeleteImage={(imageObj) => deleteImageAction(product._id, imageObj._id)}
                    onClose={this.toggleImagesModal.bind(this, false)} />}
            </div>
        );
    }
}

ExpandProductTable.propTypes = {
    product: PropTypes.object.isRequired,
    postImageAction: PropTypes.func.isRequired,
    deleteImageAction: PropTypes.func.isRequired,
    onValidProductFieldEdit: PropTypes.func.isRequired,
    onInvalidProductFieldEdit: PropTypes.func.isRequired,
    onProductDelete: PropTypes.func.isRequired
};

export default ExpandProductTable;