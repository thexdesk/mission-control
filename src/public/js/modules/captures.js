import {
    saveEvents
    } from './reddit';
import {
    post
    } from './fetchival_wrapper';

/**
 * bound on event inputs
 * @param {event} e - keypress event
 */
export function saveIfEnter(e) {
    if(e.keyCode === 13) {  // enter
        e.preventDefault();
        saveEvents();
    }
}

/**
 * capture tab event and redirect it to the previous row
 * @param {event} e - keypress event
 * @param {HTMLElement} obj - the current node with focus
 */
export function tabEvent(e, obj) {
    if(e.keyCode === 9) {  // tab
        if(obj.parentElement !== obj.parentElement.parentElement.firstElementChild) {  // if not first row
            e.preventDefault();
            obj.parentElement.previousElementSibling.children[3].focus();
        }
    }
}

/**
 * set sign if input starts with it
 * @param {HTMLInputElement} obj - the T± input to get the value of
 */
export function setSign(obj) {
    const val = obj.value;

    if(['+', '-'].includes(val[0])) {
        obj.previousElementSibling.innerHTML = `T${val[0]}`;
        obj.value = val.substr(1);
    }
}

/**
 * prevent submission of recovery form, send as POST instead
 * @param {event} e - submission event
 * @return {boolean} prevent submission of form
 */
export async function submitRecovery(e) {
    e.preventDefault();

    const url = document.querySelector('#recovery input');

    // not valid, quit now
    if(!url.checkValidity())
        return false;

    document.getElementById('error').innerHTML = 'Trying to recover...';
    const response = await post('/recover', { url: url.value }, { responseAs: 'response' });

    // successful recovery
    if(response.status === 200)
        window.location = '/';

    // not own post
    else if(response.status === 270)
        document.getElementById('error').innerHTML = 'Error: Post must be your own';

    // not self post
    else if(response.status === 271)
        document.getElementById('error').innerHTML = 'Error: Post must be self post';

    // something else went wrong
    else
        document.getElementById('error').innerHTML = 'Unknown error';

    return false;
}