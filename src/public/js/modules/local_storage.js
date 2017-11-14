export function set_interface_side() {
    const is_flipped = document.body.classList.contains('interface-left');
    localStorage.setItem('interface_flipped', is_flipped);
}

export function get_interface_side() {
    if(localStorage.getItem('interface_flipped') === 'true')
        document.body.classList.add('interface-left');
}

export function get_tab_shown() {
    const tab = sessionStorage.getItem('tab');
}

export function get_hide_info() {
    const ret = localStorage.getItem('hide_info')
    localStorage.setItem('hide_info', true);
	return ret;
}
