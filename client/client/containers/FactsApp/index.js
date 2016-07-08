import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import {TopicList} from '../../components/TopicList'
import {connect} from 'react-redux'
import {fetchTopicsIfNeeded, showModal} from "../../actions/todos";
import ModalRoot from "../Modal/ModalRoot";

class FactsApp extends Component {

    componentWillMount() {
        this.props.actions.fetch()
    }

    render() {
        const {topics, actions} = this.props;

        return (
            <div>
                <TopicList topics={topics} {...actions}/>
                <ModalRoot />
            </div>
        )
    }
}

function mapStateToProps(state) {
    const {items:topics} = state.topics;

    return {
        topics
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({fetch: fetchTopicsIfNeeded, showModal}, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FactsApp)

