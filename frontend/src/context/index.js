import React from "react";
import { createContext, useReducer} from 'react';

const AppContext = createContext();

const initialState = {
    playVideoId: null
};

const appReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_PLAY_VIDEO_ID':
            return { ...state, playVideoId: action.payload };
        default:
            throw new Error('Unexpected action');
    }
};

const AppProvider = props => {
    const [store, dispatch] = useReducer(appReducer, initialState);
    return (
        <AppContext.Provider value={{state, dispatch}}>
            {props.children}
        </AppContext.Provider>
    )
}

export { AppContext, AppProvider};
