import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import { Modal, Spin, Button } from 'antd';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

class DescriptionModal extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            editorState: this.getEditorStateFromString(props.description),
            loading: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.description !== this.props.description) {
            this.setState({ editorState: this.getEditorStateFromString(nextProps.description) });
        }
    }

    getEditorStateFromString(str) {
        if(str) {
            const blocksFromHtml = htmlToDraft(str);
            const contentState = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);
            return EditorState.createWithContent(contentState);
        } else {
            return EditorState.createEmpty()
        }
    }

    onEditorStateChange(editorState) {
        this.setState({ editorState: editorState });
    }

    onDescriptionSubmit() {        
        const { editorState } = this.state;

        this.setState({ loading: true });
        const htmlDescription = draftToHtml(convertToRaw(editorState.getCurrentContent()));

        this.props.onDescriptionSubmit(htmlDescription).then(() => {
            this.props.closeFn();
        });
    }

    render() {
        const { closeFn } = this.props;
        const { editorState, loading } = this.state;

        const footer = (
            <div>
                <Button type="default" onClick={closeFn} disabled={loading}>Cancelar</Button>
                <Button type="primary" onClick={this.onDescriptionSubmit.bind(this)} disabled={loading}>Aceptar</Button>
            </div>
        );

        return (            
                <Modal title="Descripción" 
                    visible={true} 
                    maskClosable={false} 
                    footer={footer}
                    width="75vw"
                    wrapClassName="description-modal">
                    <Spin spinning={loading}>
                        <Editor editorState={editorState}
                            wrapperClassName="main-editor-wrapper"
                            editorClassName="editor-area"
                            onEditorStateChange={this.onEditorStateChange.bind(this)} />
                    </Spin>
                </Modal>           
        );
    }
}

DescriptionModal.propTypes = {
    description: PropTypes.string,
    onDescriptionSubmit: PropTypes.func.isRequired,
    closeFn: PropTypes.func.isRequired
};

export default DescriptionModal;