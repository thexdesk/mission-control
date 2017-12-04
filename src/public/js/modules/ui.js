import {
    get_hide_info
    } from './local_storage';

/**
 * show contents of a tab in the interface
 * @param {HTMLElement} tab - which tab to show
 */
export function showTab(tab) {
    const events = document.querySelectorAll('.tab-events');
    const sections = document.querySelectorAll('.tab-section');

    document.querySelectorAll('#tabs > .current').forEach(obj => obj.classList.remove('current'));
    tab.classList.add('current');

    // get which tab to show and store it for later
    const val = tab.innerHTML;
    sessionStorage.setItem('tab', val);

    // array is the tabs each type is shown for
    const show = {
        events: ['Events', 'All'].includes(val) ? '' : 'none',
        sections: ['Sections', 'All'].includes(val) ? '' : 'none'
    };

    // show or hide each section
    events.forEach(obj => obj.style['display'] = show.events);
    sections.forEach(obj => obj.style['display'] = show.sections);
}

/**
 * create reorderable events
 */
export function createSortable() {
    Sortable.create(document.getElementById('events'), {
        handle: '.sort-icon',
        ghostClass: 'ui-state-highlight',
        fallbackTolerance: 3
    });
}

/**
 * feature detection for `<input type='datetime-local'>`
 *
 * change displayed text in popup (show format if not supported)
 */
export function datetimeSupport() {
    // create test case
    const elem = document.createElement('input');
    elem.setAttribute('type', 'datetime-local');

    document.getElementById('datetime-format').innerHTML =
        `${elem.type !== 'datetime-local' ? 'YYYY-MM-DDTHH:MM:SS<br>' : ''
        }(in your timezone)`;
}

/**
 * when the page is done loading, we can remove
 * the modal and show the interface
 */
export function removeLoadingModal() {
    const loader = document.getElementById('loader');

    // fade out
    loader.style['opacity'] = 0;

    // we don't need it anymore, so remove it from the DOM
    setTimeout(() => loader.parentNode.removeChild(loader), 500);

    // show info dialog if necessary
    if(!get_hide_info())
        document.getElementById('info').showModal();
}
