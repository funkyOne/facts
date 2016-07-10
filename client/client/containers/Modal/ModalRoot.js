import React from 'react'
import {connect} from 'react-redux'
import DeletePostModal from './edit-fact-modal'
import Modal from 'react-bootstrap/lib/Modal';

const MODAL_COMPONENTS = {
    'EDIT_FACT': DeletePostModal
    /* other modals */
}

const ModalRoot = ({ modalType, modalProps }) => {
    if (!modalType) {
        return null
    }

    const SpecificModal = MODAL_COMPONENTS[modalType]
    return <SpecificModal {...modalProps} />
}

export default connect(
    state => state.modal
)(ModalRoot)