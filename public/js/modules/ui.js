export function showTab(tab) {
	const events = document.querySelectorAll('.tab-events');
	const sections = document.querySelectorAll('.tab-section');

	document.querySelectorAll('#tabs > *').forEach(obj => obj.classList.remove('current'));
	tab.classList.add('current');

	const val = tab.innerHTML;

	const show = {
		events: ['Events', 'All'].includes(val) ? '' : 'none',
		sections: ['Sections', 'All'].includes(val) ? '' : 'none'
	};

	events.forEach(obj => obj.style['display'] = show.events);
	sections.forEach(obj => obj.style['display'] = show.sections);
}

export function createSortable() {
	// register jQuery UI reordering
	$('#events').sortable({
		placeholder: 'ui-state-highlight',
		handle: '.sort-icon',
		axis: 'y',
		revert: 300,
		containment: 'parent',
		tolerance: 'pointer'
	});
}

export function datetimeSupport() {
	// remove format in popup if <input type=datetime-local> is supported
	const elem = document.createElement('input');
	elem.setAttribute('type', 'datetime-local');
	if(elem.type == 'datetime-local') {
		const removing = document.getElementById('datetime-format');
		removing.parentElement.removeChild(removing);
	}
}