/**
 * handle all incoming messages from websockets
 */

const ws = new WebSocket(`ws://${window.location.host}`);

ws.onmessage = message => {
    // API *must* return JSON per spec
    message = JSON.parse(message.data);

    if(message['type'] === 'post_update') {
        document.querySelector('.reddit').innerHTML = message['content'];
    }
};