import { applyMiddleware, createStore } from 'redux';
import undoable, { includeAction } from 'redux-undo';
import { fromJS } from 'immutable';
import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';
import {
  CHANGE_DIMENSIONS,
  APPLY_PENCIL,
  APPLY_ERASER,
  APPLY_BUCKET,
  APPLY_EYEDROPPER,
  SHOW_SPINNER,
  NEW_PROJECT,
  SET_DRAWING,
  SET_CELL_SIZE,
  SET_RESET_GRID
} from '../store/actions/actionTypes';

const socket = io('http://localhost:3000');

const createIncludedActions = () =>
  includeAction([
    CHANGE_DIMENSIONS,
    APPLY_PENCIL,
    APPLY_ERASER,
    APPLY_BUCKET,
    APPLY_EYEDROPPER,
    SET_DRAWING,
    SET_CELL_SIZE,
    SET_RESET_GRID,
    NEW_PROJECT
  ]);

const configureStore = devMode => {

  const socketIoMiddleware = createSocketIoMiddleware(socket, "server/");
  function reducer(state = {}, action){
    switch(action.type){
      case 'message':
        return Object.assign({}, {message:action.data});
      default:
        return state;
    }
  }

  let store;
  if (devMode) {

    store = createStore(
      undoable(reducer, {
        filter: createIncludedActions(),
        debug: true,
        ignoreInitialState: true
      }),
      applyMiddleware(socketIoMiddleware)
    );

    store.subscribe(()=> {
      console.log('new client state', store.getState());
      store.dispatch({ type: 'server/hello', data: 'Hello!' });
    });

    store.dispatch({
      type: SHOW_SPINNER
    });

  } else {
    const initialState = window.__INITIAL_STATE__;
    initialState.present = fromJS(initialState.present);

    store = createStore(
      undoable(reducer, {
        filter: createIncludedActions(),
        debug: false,
        ignoreInitialState: true
      }),
      //initialState,
      applyMiddleware(socketIoMiddleware)
    );

    store.subscribe(()=>{
      console.log('new client state', store.getState());
    });

    store.dispatch({type:'server/hello', data:'Hello!'});
  }

  return store;
};

export default configureStore;
