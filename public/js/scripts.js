'use strict';  // don't allow crap JS practices

// use vanilla JS over jQuery where feasible
// only thing I'm really using jQuery for is AJAX and jQuery UI

window.onload = () => {
	// register dialog element with polyfill
	const dialog = document.querySelector('dialog');
	dialogPolyfill.registerDialog(dialog);

	// register jQuery UI reordering
	$('#events').sortable({ placeholder: 'ui-state-highlight', handle: ".sort-icon" });

	// register textareas as Markdown editor
	for(const obj of document.querySelectorAll('textarea')) {
		new SimpleMDE({
			element: obj,
			initialValue: obj.getAttribute('data-initial') || '',
			toolbar: ['bold', 'italic', 'strikethrough', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'table', 'horizontal-rule', '|',
				{ name: 'save',
				  action: save,
				  className: 'fa fa-upload',
				  title: 'Save to reddit'
				}, 'guide'],
			promptURLs: true,
			status: false,
			forceSync: true,
			spellChecker: false
		});
	}

	// MDE animation handler
	$('.fa-upload').each( function() {
		$(this).on('animationend', () => $(this).removeClass('highlight'));
	});

	// update post stats every 5 minutes
	setInterval(updateStats, 5*60*1000);
}

function save() {
	const elem = arguments[0].element;

	const id = elem.id;
	const value = elem.value;

	$.ajax({
		method: 'POST',
		url: '/update',
		data: { id: id, value: value },
		success: data => {
			$('#' + id + ' + .editor-toolbar > a[title="Save to reddit"]').addClass('highlight');
			$('.reddit').html(data);  // data is rendered HTML from reddit
		}
	});
}

function saveEvents() {
	const events = document.getElementById('events').children;

	let allEvents = [];
	for(const evnt of events) {
		const children = evnt.children;
		const tPM = children[2].value == '' ? '' : children[1].innerHTML + children[2].value;
		const message = children[3].value;
		allEvents.push([tPM, message]);
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

function updateStats() {
	$.ajax({
		url: '/status',
		success: data => document.getElementById('status-liveupdate').innerHTML = data
	});
}

function addEvent() {
	const events = document.getElementById('events');

	const row = document.createElement('li');

	const icon = document.createElement('i');
	icon.classList.add('sort-icon', 'ui-sortable-handle');
	row.appendChild(icon);

	const tPM = document.createElement('span');
	tPM.setAttribute('onclick', 'this.innerHTML = this.innerHTML == "T+" ? "T-" : "T+"');
	tPM.innerHTML = 'T+';
	row.appendChild(tPM);

	row.appendChild( document.createElement('input') );
	row.innerHTML += ' Message: ';

	const message = document.createElement('input');
	message.setAttribute('onkeyup', 'hotSwap(this); saveIfEnter(event);');
	row.appendChild(message);

	events.insertBefore(row, events.firstChild);
}

function removeEvent() {
	const events = document.getElementById('events');
	if(events.children.length > 1)
		events.removeChild(events.firstElementChild);
}


const hotSwapVals = {
	':music:': '♫',
	':rocket:': '🚀',
	':sat:': '🛰',
	':satellite:': '🛰'
}

function hotSwap(obj) {
	if(obj.constructor !== HTMLInputElement) throw 'Object must be HTMLInputElement';

	const regex = new RegExp(Object.keys(hotSwapVals).join('|'), 'g');  // nothing needs to be escaped here
	const val = obj.value.replace(regex, key => hotSwapVals[key]);
	obj.value = val;
}

function saveIfEnter(evnt) {
	if(evnt.keyCode == 13)  // enter
		saveEvents()
}
