/**
 * all emojis with their corresponding text
 * if modifying - keep in mind these do not get escaped before passing to regex
 */
const hotSwapVals = {
    ':music:'     : '♫',
    ':tunes:'     : '♫',
    ':rocket:'    : '🚀',
    ':sat:'       : '🛰',
    ':satellite:' : '🛰',
    ':sun:'       : '☀️',
    ':sunny:'     : '☀️',
    ':cloud:'     : '☁️',
    ':cloudy:'    : '☁️',
    ':fog:'       : '🌫️',
    ':foggy:'     : '🌫️',
    ':rain:'      : '🌧️',
    ':rainy:'     : '🌧️',
    ':thunder:'   : '⛈️',
    ':lightning:' : '⛈️',
    ':yes:'       : '✔️',
    ':ok:'        : '️️️✔️',
    ':check:'     : '✔️',
    ':no:'        : '❌',
    ':x:'         : '❌',
    // prevent showing `<br>` if text is pasted into field
    '\r'          : '',
    '\n'          : '',
};

/**
 * swap out text with emoji on an element
 * @param {HTMLElement} obj - the element to bind the listener to
 * @example `:rocket:` → `🚀`
 * @example `:music:` → `♫`
 */
export function hotSwap(obj) {
    const regex = new RegExp(Object.keys(hotSwapVals).join('|'), 'g');  // nothing needs to be escaped here

	const val = obj.innerHTML.replace(regex, key => hotSwapVals[key]);
	if(obj.innerHTML !== val)
		obj.innerHTML = val;
}
