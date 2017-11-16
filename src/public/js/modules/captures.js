import { saveEvents } from './reddit';

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
