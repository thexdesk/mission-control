// save a certain section to reddit
export function save() {
	const elem = arguments[0].element;

	$.ajax({
		method: 'POST',
		url: 'update',
		data: { id: elem.id, value: elem.value },
		success: data => {
			$('.editor-toolbar > a[title="Save to reddit"]').addClass('highlight');
			$('.reddit').html(data);  // data is rendered HTML from reddit
		}
	});
}

// save events section
// handled differently because it needs parsing
export function saveEvents() {
	const events = document.getElementById('events').children;

	let allEvents = [];
	for(const evnt of events) {
		const children = evnt.children;

		if(children[1].getAttribute('data-content') == 'Posted') {
			const tPM = children[3].value == '' ? '' : children[2].innerHTML + children[3].value;
			const message = children[5].value;
			allEvents.push([tPM, message]);
		}
	}

	$.ajax({
		method: 'POST',
		url: 'update',
		data: { id: 'events', value: allEvents },
		success: data => {
			$('#events [title="Save to reddit"]').addClass('highlight');
			$('.reddit').html(data);  // data is rendered HTML from reddit
		}
	});
}

// create empty post
export function createPost() {
	$.ajax({
		url: 'update/create',
		success: data =>
			$('.reddit').html('<div class=flex><span class=greyed-out>[empty post]</span></div>')  // blank post, let's show this
	});
}

// gets status page and updates section
export function updateStats() {
	$.ajax({
		url: 'status',
		success: data => document.getElementById('status-liveupdate').innerHTML = data
	});
}
