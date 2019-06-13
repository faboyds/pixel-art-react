import React from 'react';
import { Provider } from 'react-redux';
import App from './App';

const Root = ({ store, socket }) => (
  <Provider store={store}>
    <App socket={socket} dispatch={store.dispatch} />
  </Provider>
);

export default Root;
