'use strict';  // don't allow crap JS practices

// use vanilla JS over jQuery where it doesn't take a terrible amount of effort

// remove loading modal
document.onreadystatechange = () => {
	if(document.readyState == 'complete') {
		const loader = document.getElementById('loader').style;
		loader['opacity'] = 0;
		setTimeout(() => loader['display'] = 'none', 500);

		// show info dialog
		if(!window.noshow)
			document.getElementById('info').showModal();
	}
};

window.onload = () => {
	// register dialog element with polyfill
	document.querySelectorAll('dialog').forEach(dialog => {
		dialogPolyfill.registerDialog(dialog)
	});

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
	document.querySelectorAll('textarea').forEach(obj => {
		new SimpleMDE({
			element: obj,
			initialValue: obj.getAttribute('data-initial') || '',
			toolbar: [
				{ name: 'save',
				  action: save,
				  className: 'fa fa-upload',
				  title: 'Save to reddit'
				},
				'|', 'bold', 'italic', 'strikethrough', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'table', 'horizontal-rule', '|', 'guide'],
			promptURLs: true,
			status: false,
			forceSync: true,
			spellChecker: false,
		});
	});

	// MDE animation handler
	document.querySelectorAll('.fa-upload').forEach(obj => {
		obj.animationend = () => obj.classList.remove('highlight')
	});

	// update post stats every 5 minutes
	setInterval(updateStats, 5*60*1000);

	// update countdown every second
	window.countdown = setInterval(updateCountdown, 1000);
	window.countdown_interval = 1000;

	// remove format in popup if <input type=datetime-local> is supported
	const elem = document.createElement('input');
	elem.setAttribute('type', 'datetime-local');
	if(elem.type == 'datetime-local') {
		const removing = document.getElementById('datetime-format');
		removing.parentElement.removeChild(removing);
	}
}

// save a certain section to reddit
function save() {
	const elem = arguments[0].element;

	$.ajax({
		method: 'POST',
		url: 'update',
		data: { id: elem.id, value: elem.value },
		success: data => {
			$('#' + id + ' + .editor-toolbar > a[title="Save to reddit"]').addClass('highlight');
			$('.reddit').html(data);  // data is rendered HTML from reddit
		}
	});
}

// create empty post
function createPost() {
	$.ajax({
		url: 'update/create',
		success: data =>
			$('.reddit').html('<div class=flex><span class=greyed-out>[empty post]</span></div>')  // blank post, let's show this
	});
}

// save events section
// handled differently because it needs parsing
function saveEvents() {
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

// gets status page and updates section
function updateStats() {
	$.ajax({
		url: 'status',
		success: data => document.getElementById('status-liveupdate').innerHTML = data
	});
}

// capture tab event and redirect it to the previous row
function _tabEvent(e, obj) {
	if(e.keyCode == 9) {  // tab
		if(obj.parentElement !== obj.parentElement.parentElement.firstElementChild) {  // if not first row
			e.preventDefault();
			obj.parentElement.previousElementSibling.children[3].focus();
		}
	}
}

// add an event at the top of the list
function addEvent() {
	const events = document.getElementById('events');

	const template = document.getElementById('event-template');
	// firstElementChild is to prevent weird bugs, and we only have one child
	const row = document.importNode(template.content, true).firstElementChild;

	if(window.time != null && window.time > new Date())
		row.children[2].innerHTML = 'T-';

	// add new row at beginning
	events.insertBefore(row, events.firstChild);

	// trigger animation to show row
	setTimeout(() => row.classList.remove('hidden'), 0);
	setTimeout(() => row.classList.add('reverse'), 600);  // for possible removal

	// used for pre-written messages
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
	// prevent binding on non-inputs
	if(obj.constructor !== HTMLInputElement)
		throw 'Object must be HTMLInputElement';

	const regex = new RegExp(Object.keys(hotSwapVals).join('|'), 'g');  // nothing needs to be escaped here

	const val = obj.value.replace(regex, key => hotSwapVals[key]);
	if(obj.value != val) obj.value = val;  // prevents moving cursor to end if not needed
}

// bound on event inputs
function saveIfEnter(e) {
	if(e.keyCode == 13)  // enter
		saveEvents()
}

// updates the countdown timer based on launch time
function updateCountdown() {
	if(window.time == null || window.hold_scrub == true)
		return;

	const pad = num => num < 10 ? '0' + num : num;

	const timer = document.getElementById('timer');

	const curTime = new Date();
	const launchTime = window.time;
	const diff = Math.abs(launchTime - curTime);

	const sign = launchTime > curTime ? '-' : '+';

	const days = diff / 86400000 | 0;
	const hours = diff % 86400000 / 3600000 | 0;
	const mins = diff % 3600000 / 60000 | 0;
	const secs = diff % 60000 / 1000 | 0;
	const tenths = diff % 1000 / 100 | 0;

	if(diff < 61000 && window.countdown_interval != 100) {  // <1 minute => 0.1 second
		clearInterval(window.countdown);
		window.countdown = setInterval(updateCountdown, 100);
		window.countdown_interval = 100;
	}
	else if(61000 <= diff && diff < 3660000 && window.countdown_interval != 1000) {  // 1 minute to 1 hour => 1 second
		clearInterval(window.countdown);
		window.countdown = setInterval(updateCountdown, 1000);
		window.countdown_interval = 1000;
	}
	else if(3660000 <= diff && diff < 90000000 && window.countdown_interval != 60000) {  // 1 hour to 1 day => 1 minute
		clearInterval(window.countdown);
		window.countdown = setInterval(updateCountdown, 60000);
		window.countdown_interval = 60000;
	}
	else if(diff >= 90000000 && window.countdown_interval != 3600000) {  // >1 day => 1 hour
		clearInterval(window.countdown);
		window.countdown = setInterval(updateCountdown, 3600000);
		window.countdown_interval = 3600000;
	}

	let time;  // placed here for scope

	if(days > 0)
		time = `${days}d ${hours}h`;
	else if(hours > 0)
		time = `${hours}h ${mins}m`;
	else if(mins > 0)
		time = `${mins}:${pad(secs)}`;
	else
		time = `${secs}.${tenths}`;

	timer.innerHTML = `T${sign}${time}`;
}

// popup to ask for launch time (uses <dialog>)
function setLaunchTime(launchTime) {
	window.time = launchTime == null ? null : Date.parse(launchTime);
	window.hold_scrub = false;

	// non-strict equality matches undefined
	if(window.time == null) {
		const timer = document.getElementById('timer');
		timer.innerHTML = 'Set launch time';
		timer.classList.add('unset');
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

	if(['+', '-'].includes(val[0])) {
		obj.previousElementSibling.innerHTML = `T${val[0]}`;
		obj.value = val.substr(1);
	}
}

// customizable messages
const emergency_messages = {
	'RUD':    'RUD',
	'Hold':   'Hold',
	'Scrub':  'Scrub'
};

const std_messages = {
	'LOX loading started':    'LOX loading started',
	'LOX loading finished':   'LOX loading finished',
	'RP-1 loading started':   'RP-1 loading started',
	'RP-1 loading finished':  'RP-1 loading finished',
	'Statup (T-60)':          'Startup',
	'Liftoff':                'Liftoff',
	'Max Q':                  'Max Q',
	'MECO':                   'MECO',
	'Stage separation':       'Stage separation',
	'Second stage ignition':  'Second stage ignition',
	'Boostback startup':      'Boostback startup',
	'Boostback shutdown':     'Boostback shutdown',
	'Fairing separation':     'Fairing separation',
	'Reentry startup':        'Reentry startup',
	'Reentry shutdown':       'Reentry shutdown',
	'Landing startup':        'Landing startup',
	'First stage transonic':  'First stage transonic',
	'Landing success':        'Landing success',
	'Landing failure':        'Landing failure',
	'SECO':                   'SECO',
	'Second stage relight':   'Second stage relight',
	'SECO2':                  'SECO2',
	'Dragon deploy':          'Dragon deploy',
	'Payload deploy':         'Payload deploy',
	'Launch success':         'Launch success',
	'Launch failure':         'Launch failure',
	'Launch director poll':   'Launch director poll',
	'Launch director "go"':   'Launch director "go"',
	'Pressure OK':            'Pressure OK',
	'Ignition':               'Ignition',
	'Tower cleared':          'Tower cleared'
};

// messages from emergency panel
function emergency(obj) {
	const children = addEvent().children;
	const type = obj.innerHTML;
	let time = document.getElementById('timer').innerHTML;  // from countdown timer

	if(['Hold', 'Scrub'].includes(type))
		window.hold_scrub = true;

	if(time.substr(-2, 1) == '.')
		time = time.slice(0, -2);

	console.log(time);

	if(window.time != null) {
		children[2].innerHTML = time.slice(0, 2);
		children[3].value = time.substr(-2, 1) == '.' ? time.slice(2, -2) : time.slice(2);
	}

	children[1].setAttribute('data-content', 'Posted');
	children[5].value = emergency_messages[type];
	saveEvents();
}

// messages from standard panel
function std_message() {
	addEvent().children[5].value = std_messages[document.getElementById('events-dropdown').value];
}

function addEventIfNeeded() {
	if(document.getElementById('events').firstElementChild.children[5].value.length == 1)
		addEvent();
}

function show_tab(tab) {
	const events = document.querySelectorAll('.tab-events');
	const sections = document.querySelectorAll('.tab-section');

	document.querySelectorAll('#tabs > *').forEach(obj => obj.classList.remove('current'));
	tab.classList.add('current');

	const val = tab.innerHTML;

	const show = {
		events: ['Events', 'All'].includes(val),
		sections: ['Sections', 'All'].includes(val)
	};

	events.forEach(obj => obj.style['display'] = show.events ? '' : 'none');
	sections.forEach(obj => obj.style['display'] = show.sections ? '' : 'none');
}

async function setYoutube() {
	const dialog = document.getElementById('yt-dialog');
	dialog.showModal();

	const id = await new Promise(resolve => {
		dialog.querySelector('button.update').onclick = () => {
			const url = dialog.querySelector('input').value;
			const id = url.match(/(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=)?([\w-]{11,})/);
			if(id)
				resolve(id[1]);
		};
		dialog.querySelector('button.clear').onclick = () => resolve('');
	});

	document.querySelector('.youtube').setAttribute('src', id ? `https://youtube.com/embed/${id}?autoplay=0` : '');

	$.ajax({
		method: 'POST',
		url: 'update',
		data: { id: 'video', value: id }
	});

	dialog.close();
}

function insertTime(obj) {
	if(window.time != null) {
		const children = obj.parentElement.children;
		const time = document.getElementById('timer').innerHTML;

		children[2].innerHTML = time.slice(0, 2);
		children[3].value = time.includes('.') ? time.slice(2, -2) : time.slice(2);
	}
}
