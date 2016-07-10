import React, { Component } from 'react'
import {connect} from 'react-redux'
import Modal from 'react-bootstrap/lib/Modal';
import '../../../node_modules/bootstrap/dist/css/bootstrap.css'
import {hideModal} from "../../actions/todos";

export class EditFactModal extends Component {
    constructor(props) {
        super(props);
        this.state = { showModal: true };
    }

    close() {
        this.props.dispatch(hideModal());
    }

    render() {
        const { factId } = this.props;

        return  (
            <Modal show={this.state.showModal} onHide={()=>this.close()}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit fact {factId}?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Text in a modal</h4>
                    <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
                    <hr />
                    <h4>Overflowing text to show scroll behavior</h4>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={this.close} ></button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default connect((state, ownProps) => ({})
)(EditFactModal);