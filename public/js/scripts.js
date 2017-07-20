'use strict';  // don't allow crap JS practices

// use vanilla JS over jQuery where it doesn't take a terrible amount of effort
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

	// update countdown every second
	if(window.launchTime === undefined)
		window.launchTime = null;
	setInterval(updateCountdown, 1000);
}

// save a certain section to reddit
function save() {
	const elem = arguments[0].element;

	const id = elem.id;
	const value = elem.value;

	$.ajax({
		method: 'POST',
		url: 'update',
		data: { id: id, value: value },
		success: data => {
			$('#' + id + ' + .editor-toolbar > a[title="Save to reddit"]').addClass('highlight');
			$('.reddit').html(data);  // data is rendered HTML from reddit
		}
	});
}

// save events section
// handled differently because it needs parsing
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

// gets status page and updates section
function updateStats() {
	$.ajax({
		url: 'status',
		success: data => document.getElementById('status-liveupdate').innerHTML = data
	});
}

// add an event at the top of the list
function addEvent() {
	const events = document.getElementById('events');

	const row = document.createElement('li');
	let sign = '+'; // placed here for scope

	if(window.launchTime !== null && window.launchTime > new Date())
		sign = '-';

	// add "sortable" icon handle
	const icon = document.createElement('i');
	icon.classList.add('sort-icon', 'ui-sortable-handle');
	row.appendChild(icon);

	// T± clickable
	const tPM = document.createElement('span');
	tPM.setAttribute('onclick', 'this.innerHTML = this.innerHTML == "T+" ? "T-" : "T+"');
	tPM.innerHTML = 'T' + sign;
	row.appendChild(tPM);

	// T± input and following text
	const input = document.createElement('input');
	input.setAttribute('onkeyup', 'saveIfEnter(event); setSign(this);');
	row.appendChild(input);
	row.innerHTML += ' Message: ';

	// message input
	const message = document.createElement('input');
	message.setAttribute('onkeyup', 'hotSwap(this); saveIfEnter(event);');
	row.appendChild(message);

	// add new row at beginning
	events.insertBefore(row, events.firstChild);

	// useful for emergency messages
	return row;
}

// remove event at top of list
function removeEvent() {
	const events = document.getElementById('events');
	if(events.children.length > 1)  // don't allow removing last event
		events.removeChild(events.firstElementChild);
}


// simple hash with values to swap out
// if modifying ─ keep in mind these do not get escaped before passing to regex
const hotSwapVals = {
	':music:': '♫',
	':rocket:': '🚀',
	':sat:': '🛰',
	':satellite:': '🛰'
}

// swap out text with emoji on an input
function hotSwap(obj) {
	if(obj.constructor !== HTMLInputElement) throw 'Object must be HTMLInputElement';

	const regex = new RegExp(Object.keys(hotSwapVals).join('|'), 'g');  // nothing needs to be escaped here

	const initVal = obj.value;
	const val = obj.value.replace(regex, key => hotSwapVals[key]);
	if(initVal != val) obj.value = val;  // prevents moving cursor to end if not needed
}

// bound on event inputs
function saveIfEnter(evnt) {
	if(evnt.keyCode == 13)  // enter
		saveEvents()
}

// updates the countdown timer based on launch time
// runs every second
function updateCountdown() {
	const pad = num => num < 10 ? '0' + num : num;

	const curTime = new Date();
	const launchTime = window.launchTime;

	if(launchTime === null) {
		let timer = document.getElementById('timer');
		timer.innerHTML = 'Set launch time';
		timer.classList.add('unset');
		return;
	}

	timer.classList.remove('unset');

	const sign = launchTime > curTime ? '-' : '+';

	const hours = Math.abs(launchTime - curTime) / 3600000 | 0;
	const mins = Math.abs(launchTime - curTime) % 3600000 / 60000 | 0;
	const secs = Math.abs(launchTime - curTime) % 60000 / 1000 | 0;

	let time;  // placed here for scope

	if(hours > 0)
		time = hours + 'h ' + mins + 'm';
	else if(mins > 0)
		time = mins + ':' + pad(secs);
	else
		time = secs;

	document.getElementById('timer').innerHTML = 'T' + sign + time;
}

// popup to ask for launch time (uses <dialog>)
function setLaunchTime(launchTime) {
	window.launchTime = launchTime === null ? null : Date.parse(launchTime);

	document.getElementById('launchTime').close();

	$.ajax({
		method: 'POST',
		url: 'update',
		data: { id: 'time', value: window.launchTime }
	});
}

// set sign if input starts with it
function setSign(obj) {
	const label = obj.previousElementSibling;
	const val = obj.value;

	if(val[0] == '-') {
		label.innerHTML = 'T-';
		obj.value = val.substr(1);
	}
	else if(val[0] == '+') {
		label.innerHTML = 'T+';
		obj.value = val.substr(1);
	}
}


// customizable messages
const emergency_messages = {
	'RUD': 'RUD',
	'Hold': 'Hold',
	'Scrub': 'Scrub'
};

// messages from emergency panel
function emergency(obj) {
	const children = addEvent().children;
	const type = obj.innerHTML;
	const time = document.getElementById('timer').innerHTML.substr(2); // from countdown timer

	if(time != 't launch time')
		children[2].value = time;

	children[3].value = emergency_messages[type];

	saveEvents();
}
