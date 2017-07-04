function removeID(id) {
	const elem = document.getElementById(id);
	elem.parentElement.removeChild(elem);
}

function onload() {
	// remove what appears to be a tracking iframe embedded by reddit
	removeID('emb_xcomm');

	// register dialog element with polyfill
	const dialog = document.querySelector('dialog');
	dialogPolyfill.registerDialog(dialog);
}

window.onload = () => onload();
