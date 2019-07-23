import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

const initialAppState = {
  playVideoId: '',
  realPlaySeconds: 0,
  videoStartTime: null,
  playStartTime: null,
  videoChanged: false
}

export const actionTypes = {
  UPDATE_PLAY_VIDEO_ID: 'UPDATE_PLAY_VIDEO_ID',
  UPDATE_REAL_PLAY_SECONDS: 'UPDATE_REAL_PLAY_SECONDS',
  UPDATE_VIDEO_START_TIME: 'UPDATE_VIDEO_START_TIME',
  UPDATE_PLAY_START_TIME: 'UPDATE_PLAY_START_TIME',
  UPDATE_VIDEO_CHANGED: 'UPDATE_VIDEO_CHANGED'
}

// REDUCERS
export const reducer = (state = initialAppState, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_PLAY_VIDEO_ID:
      return Object.assign({}, state, {
        playVideoId: action.payload
      })
    case actionTypes.UPDATE_REAL_PLAY_SECONDS:
      return Object.assign({}, state, {
        realPlaySeconds: action.payload
      })
    case actionTypes.UPDATE_VIDEO_START_TIME:
      return Object.assign({}, state, {
        videoStartTime: action.payload
      })
    case actionTypes.UPDATE_PLAY_START_TIME:
      return Object.assign({}, state, {
        playStartTime: action.payload
      })
    case actionTypes.UPDATE_VIDEO_CHANGED:
      return Object.assign({}, state, {
        videoChanged: action.payload
      })
    default:
      return state
  }
}

// ACTIONS
export const updatePlayVideoId = (playVideoId) => {
  return { type: actionTypes.UPDATE_PLAY_VIDEO_ID, payload: playVideoId };
}

export const updateRealPlaySeconds = (realPlaySeconds) => {
  return { type: actionTypes.UPDATE_REAL_PLAY_SECONDS, payload: realPlaySeconds };
}

export const updatePlayStartTime = (playStartTime) => {
  return { type: actionTypes.UPDATE_PLAY_START_TIME, payload: playStartTime };
}

export const updateVideoStartTime = (videoStartTime) => {
  return { type: actionTypes.UPDATE_VIDEO_START_TIME, payload: videoStartTime };
}

export const updateVideoChanged = (videoChanged) => {
  return { type: actionTypes.UPDATE_VIDEO_CHANGED, payload: videoChanged };
}

export function initializeStore (initialState = initialAppState) {
  return createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware())
  )
}