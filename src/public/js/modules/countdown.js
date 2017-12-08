import {
    post
    } from './fetchival_wrapper';

/**
 * updates the countdown timer based on launch time
 */
export function updateCountdown() {
    // non-strict null check
    if(window.time == null || window.hold_scrub === true)
        return;

    const timer = document.getElementById('timer');

    // how long until the launch?
    const curTime = new Date();
    const diff = Math.abs(window.time - curTime);
    const sign = window.time > curTime ? '-' : '+';

    const days   = diff            / 86400000 | 0;
    const hours  = diff % 86400000 /  3600000 | 0;
    const mins   = diff %  3600000 /    60000 | 0;
    const secs   = diff %    60000 /     1000 | 0;
    const tenths = diff %     1000 /      100 | 0;

    // [ min_diff, max_diff, expected interval ]
    const intervals = [
        [ -Infinity,    61000,     100 ],
        [     61000,  3660000,    1000 ],
        [   3660000, 90000000,   60000 ],
        [  90000000, Infinity, 3600000 ],
    ];

    for(const [min, max, interval] of intervals) {
        if(min <= diff && diff < max && window.countdown_interval != interval) {
            clearInterval(window.countdown);
            window.countdown = setInterval(updateCountdown, interval);
            window.countdown_interval = interval;
        }
    }

    let time;  // placed here for scope

    // format the output
    if(days > 0)
        time = `${days}d ${hours}h`;
    else if(hours > 0)
        time = `${hours}h ${mins}m`;
    else if(mins > 0)
        time = `${mins}:${secs.toString().padStart(2, '0')}`;
    else
        time = `${secs}.${tenths}`;

    timer.classList.remove('unset');
    timer.innerHTML = `T${sign}${time}`;
}

/**
 * popup to ask for launch time (uses `<dialog>`)
 * @param {string} launchTime - ISO-formatted string of the updates launch time
 * @see https://en.wikipedia.org/wiki/ISO_8601
 */
export async function setLaunchTime(launchTime) {
    // non-strict null check
    window.time = launchTime == null ? null : Date.parse(launchTime);
    window.hold_scrub = false;

    // non-strict null check
    if(window.time == null) {
        const timer = document.getElementById('timer');
        timer.innerHTML = 'Set launch time';
        timer.classList.add('unset');
    }
    else {
        document.getElementById('timer').classList.remove('unset');
        updateCountdown();
    }

    // need to do this before `.close()` or we lose the data
    await post('update', {
        id: 'time',
        value: window.time
    }, {
        responseAs: 'text'
    });

    document.getElementById('launchTime').close();
}

/**
 * sets T± when an input starts with a sign (+ or -)
 * @param {HTMLInputElement} obj - element to get the value from
 */
export function insertTime(obj) {
    // non-strict null check
    if(window.time != null) {
        const children = obj.parentElement.children;
        const time = document.getElementById('timer').innerHTML;

        children[2].innerHTML = time.slice(0, 2);
        children[3].value = time.includes('.') ? time.slice(2, -2) : time.slice(2);
    }
}
