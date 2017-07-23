'use strict';  // don't allow crap JS practices

// use vanilla JS over jQuery where it doesn't take a terrible amount of effort
// only thing I'm really using jQuery for is AJAX and jQuery UI

window.onload = () => {
	// register dialog element with polyfill
	for(const dialog of document.querySelectorAll('dialog'))
		dialogPolyfill.registerDialog(dialog);

	// register jQuery UI reordering
	$('#events').sortable({
		placeholder: 'ui-state-highlight',
		handle: '.sort-icon',
		axis: 'y',
		revert: 300,
		containment: 'parent',
		tolerance: 'pointer'
	});

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
	setInterval(updateCountdown, 1000);

	// remove format in popup if <input type=datetime-local> is supported
	const elem = document.createElement('input');
	elem.setAttribute('type', 'datetime-local');
	if(elem.type == 'datetime-local') {
		const removing = document.getElementById('datetime-format');
		removing.parentNode.removeChild(removing);
	}
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
	row.classList.add('hidden');

	// add new row at beginning
	events.insertBefore(row, events.firstChild);

	let sign = '+'; // placed here for scope

	if(window.time != null && window.time > new Date())
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
	message.setAttribute('onkeyup', 'saveIfEnter(event)');
	message.setAttribute('oninput', 'hotSwap(this); addEventIfNeeded();');
	row.appendChild(message);

	// trigger animation to show row
	// use setTimeout to prevent optimization that removes effect
	setTimeout(() => row.classList.remove('hidden'), 0);
	setTimeout(() => row.classList.add('reverse'), 600);  // for possible removal

	// useful for emergency messages
	return row;
}

// remove event at top of list
function removeEvent() {
	const events = document.getElementById('events');
	if(events.children.length > 1) {  // don't allow removing last event
		events.firstElementChild.classList.add('hidden');
		setTimeout(() => events.removeChild(events.firstElementChild), 600);
	}
}


// simple hash with values to swap out
// if modifying ─ keep in mind these do not get escaped before passing to regex
const hotSwapVals = {
	':music:': '♫',
	':rocket:': '🚀',
	':sat:': '🛰',
	':satellite:': '🛰'
};

// swap out text with emoji on an input
function hotSwap(obj) {
	if(obj.constructor !== HTMLInputElement) throw 'Object must be HTMLInputElement';

	const regex = new RegExp(Object.keys(hotSwapVals).join('|'), 'g');  // nothing needs to be escaped here

	const val = obj.value.replace(regex, key => hotSwapVals[key]);
	if(obj.value != val) obj.value = val;  // prevents moving cursor to end if not needed
}

// bound on event inputs
function saveIfEnter(evnt) {
	if(evnt.keyCode == 13)  // enter
		saveEvents()
}

// updates the countdown timer based on launch time
// runs every second
function updateCountdown() {
	if(window.time == null)
		return;

	const pad = num => num < 10 ? '0' + num : num;

	let timer = document.getElementById('timer');

	const curTime = new Date();
	const launchTime = window.time;
	const diff = Math.abs(launchTime - curTime)

	const sign = launchTime > curTime ? '-' : '+';

	const hours = diff / 3600000 | 0;
	const mins = diff % 3600000 / 60000 | 0;
	const secs = diff % 60000 / 1000 | 0;

	let time;  // placed here for scope

	if(hours > 0)
		time = hours + 'h ' + mins + 'm';
	else if(mins > 0)
		time = mins + ':' + pad(secs);
	else
		time = secs;

	timer.innerHTML = 'T' + sign + time;
}

// popup to ask for launch time (uses <dialog>)
function setLaunchTime(launchTime) {
	window.time = launchTime == null ? null : Date.parse(launchTime);

	if(window.time == null) {
		document.getElementById('timer').innerHTML = 'Set launch time';
		document.getElementById('timer').classList.add('unset');
	}
	else {
		document.getElementById('timer').classList.remove('unset');
		updateCountdown();
	}

	document.getElementById('launchTime').close();

	$.ajax({
		method: 'POST',
		url: 'update',
		data: { id: 'time', value: window.time }
	});
}

// set sign if input starts with it
function setSign(obj) {
	const val = obj.value;

	if(val[0] == '-') {
		obj.previousElementSibling.innerHTML = 'T-';
		obj.value = val.substr(1);
	}
	else if(val[0] == '+') {
		obj.previousElementSibling.innerHTML = 'T+';
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

	if(window.time != null)
		children[2].value = time;

	children[3].value = emergency_messages[type];

	saveEvents();
}

function addEventIfNeeded() {
	const firstChild = document.getElementById('events').firstElementChild;
	const message = firstChild.children[3];

	if(message.value.length == 1)
		addEvent();
}
