import fetch from 'isomorphic-fetch'
import { createAction } from 'redux-actions'

export const addTodo = createAction('add todo')
export const deleteTodo = createAction('delete todo')
export const editTodo = createAction('edit todo')
export const completeTodo = createAction('complete todo')
export const completeAll = createAction('complete all')
export const clearCompleted = createAction('clear complete')

export const requestTopics = createAction('request topics')

export const showModal = createAction('SHOW_MODAL')
export const hideModal = createAction('HIDE_MODAL')

export function fetchTopicsIfNeeded() {
    return (dispatch, getState) => {
        if (shouldFetchTopics(getState())) {
            return dispatch(fetchTopics())
        }
    }
}

// Meet our first thunk action creator!
// Though its insides are different, you would use it just like any other action creator:
// store.dispatch(fetchPosts('reactjs'))

function fetchTopics() {

    // Thunk middleware knows how to handle functions.
    // It passes the dispatch method as an argument to the function,
    // thus making it able to dispatch actions itself.

    return function (dispatch) {

        // First dispatch: the app state is updated to inform
        // that the API call is starting.

        dispatch(requestTopics())

        // The function called by the thunk middleware can return a value,
        // that is passed on as the return value of the dispatch method.

        // In this case, we return a promise to wait for.
        // This is not required by thunk middleware, but it is convenient for us.

        return fetch('http://localhost:5000/api/facts')
            .then(response => response.json())
            .then(json =>

                // We can dispatch many times!
                // Here, we update the app state with the results of the API call.

                dispatch(receiveTopics(json))
            )

        // In a real world app, you also want to
        // catch any error in the network call.
    }
}

function receiveTopics(json) {
    return {
        type: 'receive topics',
        topics: json,
        receivedAt: Date.now()
    }
}


function shouldFetchTopics(state) {
    const topics = state.topics;
    if (topics.isFetching) {
        return false
    }
    if (!topics.items.length) {
        return true
    }
    return topics.didInvalidate
}


