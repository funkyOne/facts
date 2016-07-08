import {routerReducer as routing} from 'react-router-redux'
import {combineReducers} from 'redux'
import todos from './todos'
import {modal} from './modals'

function topics(state = {
    isFetching: false,
    didInvalidate: false,
    items: []
}, action) {
    switch (action.type) {
        case 'request topics':
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            })
        case 'receive topics':
            return Object.assign({}, state, {
                items: action.topics,
                isFetching: false,
                didInvalidate: false,
                lastUpdate: action.receivedAt
            })
        default:
            return state
    }
}
export default combineReducers({
    routing,
    todos,
    topics,
    modal
})
