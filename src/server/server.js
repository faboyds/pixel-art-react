/**
 * Module dependencies.
 */
import socket from 'socket.io';
import { renderToString } from 'react-dom/server';
import undoable, { includeAction } from 'redux-undo';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import temp from 'temp';
import fs from 'fs';
import Twitter from 'twitter';
import { OAuth } from 'oauth';
import session from 'express-session';
import React from 'react';
import { createStore } from 'redux';
import reducer from '../store/reducers/reducer';
import pkgjson from '../../package.json';
import { drawFrame, drawGif, drawSpritesheet } from '../utils/imageGeneration';
import Root from '../components/Root';
import {
  SHOW_SPINNER,
  CHANGE_DIMENSIONS,
  DRAW_CELL,
  NEW_PROJECT,
  SET_DRAWING,
  SET_CELL_SIZE,
  SET_RESET_GRID
} from '../store/actions/actionTypes';

const app = express();
module.exports = app;
console.log(`Version deployed: ${pkgjson.version}`);

/**
 * Configuration
 */
let configData;
const PORTSERVER = 3000;
const ENV = process.env.NODE_ENV || 'development';

if (ENV === 'development') {
  // configData = JSON.parse(fs.readFileSync('config.json', 'utf8')).dev;
} else {
  configData = process.env;
}

app.set('views', `${__dirname}/../views`);
app.set('view engine', 'pug');
app.use(express.static(`${__dirname}/../../deploy`));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: 'secretsupersecret', // configData.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);

/**
 * Redux helper functions
 */
function handleRender(req, res) {
  // Create a new Redux store instance
  const store = createStore(
    undoable(reducer, {
      filter: includeAction([
        CHANGE_DIMENSIONS,
        DRAW_CELL,
        SET_DRAWING,
        SET_CELL_SIZE,
        SET_RESET_GRID,
        NEW_PROJECT
      ]),
      debug: false,
      ignoreInitialState: true
    })
  );

  store.dispatch({
    type: SHOW_SPINNER
  });

  // Render the component to a string
  const html = renderToString(<Root store={store} />);

  const initialState = store.getState();

  // Send the rendered page back to the client
  res.render('index.pug', {
    reactOutput: html,
    initialState: JSON.stringify(initialState)
  });
}

/**
 * Routes
 */
app.get('/', handleRender);

const server = app.listen(process.env.PORT || PORTSERVER, () => {
  console.log(
    'Express server listening on port %d in %s mode',
    process.env.PORT || PORTSERVER,
    app.settings.env
  );
});

// Socket setup
const io = socket(server);

io.on('connection', socket => {
  console.log('made socket connection', socket.id);

  socket.on('apply-sound-to-cell', data => {
    console.log(data);
    socket.broadcast.emit('apply-sound-to-cell', data);
  });
});
