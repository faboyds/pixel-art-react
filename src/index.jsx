import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import './css/imports.css'; // Import PostCSS files
import configureStore from './store/configureStore';
import Root from './components/Root';

const devMode = process.env.NODE_ENV === 'development';
const store = configureStore(devMode);


const socket = io.connect('https://pixel-to-music.herokuapp.com:8080');

/*
send.addEventListener('click', () => {
    socket.emit('chat', {
        message: "Esta mensagem vou enviada pelo outro",
    })
});
*/
/*

// Listen for events
socket.on('chat', data => {
    text.innerHTML = '<span>'+ data.message + '</span>';
});
*/


ReactDOM.render(<Root socket={socket} store={store} />, document.getElementById('app'));
