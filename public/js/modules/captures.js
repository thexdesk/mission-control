import { saveEvents } from './reddit';

// bound on event inputs
export function saveIfEnter(e) {
    if(e.keyCode == 13)  // enter
        saveEvents()
}

// capture tab event and redirect it to the previous row
export function _tabEvent(e, obj) {
    if(e.keyCode == 9) {  // tab
        if(obj.parentElement !== obj.parentElement.parentElement.firstElementChild) {  // if not first row
            e.preventDefault();
            obj.parentElement.previousElementSibling.children[3].focus();
        }
    }
}

// set sign if input starts with it
export function setSign(obj) {
    const val = obj.value;

    if(['+', '-'].includes(val[0])) {
        obj.previousElementSibling.innerHTML = `T${val[0]}`;
        obj.value = val.substr(1);
    }
}