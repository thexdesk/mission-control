/**
 * handle all incoming messages from websockets
 */

const ws = new WebSocket(`ws://${window.location.host}`);

ws.onmessage = message => {
    // API *must* return JSON per spec
    message = JSON.parse(message.data);

    if(message['type'] === 'post_update') {
        const create_button = document.getElementById('create_empty');
        if(create_button)
            create_button.parentNode.removeChild(create_button);
    }

    if(message['section'])
        document.getElementById(`section_${message['section']}`).innerHTML = message['content'];
};
