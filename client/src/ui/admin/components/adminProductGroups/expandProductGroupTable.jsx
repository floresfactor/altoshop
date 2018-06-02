import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Badge } from 'antd';

import resources from '../../../../lib/constants/resources';
import EditableCell from '../common/editableCell.jsx';
import InlineInput from '../common/inlineInput.jsx';

// Components
import DescriptionModal from '../common/descriptionModal.jsx';
import ImagesModal from '../common/imagesModal.jsx';
import TagsInput from '../common/tagsInput.jsx';

class ExpandProductGroupTable extends Component {
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

    mapTableDS(productGroup) {
        const tableDS = [{
            key: productGroup._id,
            sku: this.getSkuCell(productGroup),
            description: this.getProductDescriptionCell(productGroup),
            options: this.getProductOptionsCell(productGroup)
        }];

        return tableDS;
    }

    getSkuCell(pg) {
        const title = (
            <a>{pg.sku}</a>
        );

        return (
            <EditableCell displayComponent={title} editComponent={InlineInput}
                editComponentProps= {{
                    onValidSubmit: (...args) => this.props.onValidProductGroupFieldEdit.apply(null, [pg, ...args]), 
                    onInvalidSubmit: (...args) => this.props.onInvalidProductGroupFieldEdit.bind(null, [pg, ...args]),
                    inputType: "text",
                    name: "sku",
                    value: pg.sku, 
                    required: true
                }} />
        );
    }

    getProductDescriptionCell() {
        return (
            <a>
                <i onClick={() => {this.setState({ showDescriptionModal: true });}}>
                    Ver/Editar
                </i>
            </a>
        );
    }

    getProductOptionsCell(product) {
        return(
            <div>
                <Badge status="error" /> 
                <a onClick={() => this.props.onProductGroupDelete(product)}>Delete</a>
            </div>
        );
    }

    toggleDescriptionModal(show) {        
        this.setState({ showDescriptionModal: show });
    }

    submitDescription(htmlDescription) {
        const { productGroup } = this.props;

        return this.props.onValidProductGroupFieldEdit(productGroup, { description: htmlDescription });
    }

    toggleImagesModal(show) {
        this.setState({ showImagesModal: show });
    }

    render() {
        const { productGroup, postImageAction, deleteImageAction, onValidProductGroupFieldEdit } = this.props;
        const { showDescriptionModal, showImagesModal } = this.state;
        const tableDS = this.mapTableDS(productGroup);

        const imgObj = productGroup.image;

        return (
            <div className="expand-product-row">
                <div className="mini-img-container">
                    <img onClick={() => { this.setState({ showImagesModal: true }); }}
                        src={imgObj && imgObj.src || resources.IMG_NO_IMG_URL} />
                </div>            
                <Table columns={this.tableColumns} dataSource={tableDS} size="small"
                    className="expand-product-row-table" pagination={false} />
                {showDescriptionModal && <DescriptionModal description={productGroup.description}
                                            onDescriptionSubmit={this.submitDescription.bind(this)} 
                                            closeFn={this.toggleDescriptionModal.bind(this, false)} />}
                {showImagesModal && <ImagesModal images={productGroup.image ? [productGroup.image] : null} imagesLimit={1}
                                                 onPostImage={(formData) => postImageAction(productGroup._id, formData)}
                                                 onDeleteImage={(imageObj) => deleteImageAction(productGroup._id, imageObj._id)}
                                                 onClose={this.toggleImagesModal.bind(this, false)} />}
                <div className="expand-product-row-tag">
                   <TagsInput
                    tags={productGroup.tags}
                    suggestions={this.props.tagsSuggestions}
                    searchSuggestions={this.props.searchSuggestions}
                    onAddingTag={(changedField)=> onValidProductGroupFieldEdit(productGroup, changedField)}
                    onRemovingTag={(changedField)=> onValidProductGroupFieldEdit(productGroup, changedField)}
                   />
                </div>
            </div>
        );
    }
}

ExpandProductGroupTable.propTypes = {
    productGroup: PropTypes.object.isRequired,
    postImageAction: PropTypes.func.isRequired,
    deleteImageAction: PropTypes.func.isRequired,
    onValidProductGroupFieldEdit: PropTypes.func.isRequired,
    onInvalidProductGroupFieldEdit: PropTypes.func.isRequired,
    onProductGroupDelete: PropTypes.func.isRequired,
    tagsSuggestions: PropTypes.array,
    searchSuggestions: PropTypes.func.isRequired
};

export default ExpandProductGroupTable;