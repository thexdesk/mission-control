import { addEvent } from './events';
import { saveEvents } from './reddit';

const messages = {
    emergency: {
        'RUD':   'RUD',
        'Hold':  'Hold',
        'Scrub': 'Scrub'
    },
    standard: {
        'LOX loading started':   'LOX loading started',
        'LOX loading finished':  'LOX loading finished',
        'RP-1 loading started':  'RP-1 loading started',
        'RP-1 loading finished': 'RP-1 loading finished',
        'Statup (T-60)':         'Startup',
        'Liftoff':               'Liftoff',
        'Max Q':                 'Max Q',
        'MECO':                  'MECO',
        'Stage separation':      'Stage separation',
        'Second stage ignition': 'Second stage ignition',
        'Boostback startup':     'Boostback startup',
        'Boostback shutdown':    'Boostback shutdown',
        'Fairing separation':    'Fairing separation',
        'Reentry startup':       'Reentry startup',
        'Reentry shutdown':      'Reentry shutdown',
        'Landing startup':       'Landing startup',
        'First stage transonic': 'First stage transonic',
        'Landing success':       'Landing success',
        'Landing failure':       'Landing failure',
        'SECO':                  'SECO',
        'Second stage relight':  'Second stage relight',
        'SECO2':                 'SECO2',
        'Dragon deploy':         'Dragon deploy',
        'Payload deploy':        'Payload deploy',
        'Launch success':        'Launch success',
        'Launch failure':        'Launch failure',
        'Launch director poll':  'Launch director poll',
        'Launch director "go"':  'Launch director "go"',
        'Pressure OK':           'Pressure OK',
        'Ignition':              'Ignition',
        'Tower cleared':         'Tower cleared'
    }
};

// messages from emergency panel
export function emergency(obj) {
	const children = addEvent().children;
	const type = obj.innerHTML;
	let time = document.getElementById('timer').innerHTML;  // from countdown timer

	if(['Hold', 'Scrub'].includes(type))
		window.hold_scrub = true;

	if(time.substr(-2, 1) == '.')
		time = time.slice(0, -2);

	if(window.time != null) {
		children[2].innerHTML = time.slice(0, 2);
		children[3].value = time.substr(-2, 1) == '.' ? time.slice(2, -2) : time.slice(2);
	}

	children[1].setAttribute('data-content', 'Posted');
	children[5].value = messages.emergency[type];
	saveEvents();
}

// messages from standard panel
export function std_message() {
    const child = addEvent().children[5];
    const key = document.getElementById('events-dropdown').value;
	child.value = messages.standard[key];
}
