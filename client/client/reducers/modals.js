const initialState = {
    modalType: null,
    modalProps: {}
}

export function modal(state = initialState, action) {
    switch (action.type) {
        case 'SHOW_MODAL':
            return {
                modalType: action.payload.type,
                modalProps: action.payload.props
            }
        case 'HIDE_MODAL':
            return initialState
        default:
            return state
    }
}