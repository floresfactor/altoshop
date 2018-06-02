import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Badge } from 'antd';

import { urls } from '../../../../lib/http';
import resources from '../../../../lib/constants/resources';

// Components
import DescriptionModal from '../common/descriptionModal.jsx';
import ImagesModal from '../common/imagesModal.jsx';

class ExpandPackageTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        };

        this.tableColumns = [{
            title: 'Description',
            dataIndex: 'description',
            width: '40%'
        },
        {
            title: 'Options',
            dataIndex: 'options',
            width: '20%'
        }];
    }

    mapTableDS(_package) {
        const tableDS = [{
            key: _package._id,
            description: this.getPackageDescriptionCell(_package),
            options: this.getPackageOptionsCell(_package)
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

    getPackageOptionsCell(_package) {
        return (
            <div>
                <Badge status="error" />
                <a onClick={() => this.props.onPackageDelete(_package._id)}>Delete</a>
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

    toggleImagesModal(show) {
        this.setState({ showImagesModal: show });
    }

    render() {
        const { _package, postImageAction, deleteImageAction } = this.props;
        const { showDescriptionModal, showImagesModal } = this.state;
        const tableDS = this.mapTableDS(_package);
        const imgObj = _package.image;

        return (
            <div className="expand-package-row">
                <div className="mini-img-container">
                    <img onClick={() => { this.setState({ showImagesModal: true }); }}
                        src={imgObj ? imgObj.src : resources.IMG_NO_IMG_URL} />
                </div>
                <Table columns={this.tableColumns} dataSource={tableDS} size="small"
                    className="expand-package-row-table" pagination={false} />
                {showDescriptionModal && <DescriptionModal description={_package.description}
                    onDescriptionSubmit={this.submitDescription.bind(this)}
                    closeFn={this.toggleDescriptionModal.bind(this, false)} />}
                {showImagesModal && <ImagesModal images={_package.image ? [_package.image] : null}
                    imagesLimit={1}
                    onPostImage={(formData) => postImageAction(_package._id, formData)}
                    onDeleteImage={(imageObj) => deleteImageAction(_package._id, imageObj._id)}
                    onClose={this.toggleImagesModal.bind(this, false)} />}
            </div>
        );
    }
}

ExpandPackageTable.propTypes = {
    _package: PropTypes.object.isRequired,
    postImageAction: PropTypes.func.isRequired,
    deleteImageAction: PropTypes.func.isRequired,
    onPackageFieldEdit: PropTypes.func.isRequired,
    onPackageDelete: PropTypes.func.isRequired
};

export default ExpandPackageTable;