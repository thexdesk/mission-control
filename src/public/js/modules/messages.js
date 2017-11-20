/**
 * messages.js
 * handle adding of preset messages to the events table
 *
 * exports: emergency(node)
 *          std_message()
 */

import { addEvent } from './events';
import { saveEvents } from './reddit';

/**
 * emergency messages
 *
 * key: `innerHTML` of element
 *
 * value: what to display as the message
 * @type Map<string, string>
 */
const messages = {
    'RUD':   'RUD',
    'Hold':  'Hold',
    'Scrub': 'Scrub'
};

/**
 * messages from emergency panel
 *
 * adds new row at top with preset message (from `messages` variable)
 * @param {HTMLElement} obj - the element that was clicked
 */
export function emergency(obj) {
    const children = addEvent().children;
    const type = obj.innerHTML;
    let time = document.getElementById('timer').innerHTML;  // from countdown timer

    // pause the clock if necessary
    if(['Hold', 'Scrub'].includes(type))
        window.hold_scrub = true;

    // get rid of decimal if between T-1m and T+1m
    if(time.substr(-2, 1) === '.')
        time = time.slice(0, -2);

    // non-strict null check
    if(window.time != null) {
        children[3].innerHTML = time.slice(0, 2);
        children[4].value = time.substr(-2, 1) === '.' ? time.slice(2, -2) : time.slice(2);
    }

    // make it posted, set the value, and post
    children[1].setAttribute('data-content', 'Posted');
    children[6].innerHTML = messages[type];
    saveEvents();
}

/**
 * messages from standard panel
 *
 * value is what is displayed in the dropdown, unless set as value attribute
 */
export function std_message() {
    const child = addEvent().children[6];
    child.innerHTML = document.getElementById('events-dropdown').value;
}
