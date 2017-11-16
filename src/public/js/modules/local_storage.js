/**
 * store whether or not the interface is flipped in local storage
 */
export function set_interface_side() {
    const is_flipped = document.body.classList.contains('interface-left');
    localStorage.setItem('interface_flipped', is_flipped);
}

/**
 * get if interface was flipped from local storage,
 * add class to body if necessary
 */
export function get_interface_side() {
    if(localStorage.getItem('interface_flipped') === 'true')
        document.body.classList.add('interface-left');
}

/**
 * get which tab was last viewed from session storage
 * @todo switch to tab on page load
 */
export function get_tab_shown() {
    const tab = sessionStorage.getItem('tab');
}

/**
 * sets flag to never show info popup onload again
 * @return {boolean} if flag to hide popup was previously set
 */
export function get_hide_info() {
    const ret = localStorage.getItem('hide_info')
    localStorage.setItem('hide_info', true);
    return ret;
}
