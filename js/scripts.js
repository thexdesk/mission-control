function removeID(id) {
	const elem = document.getElementById(id);
	elem.parentElement.removeChild(elem);
}

// this removes what appears to be a tracking iframe embedded by reddit
window.onload = () => removeID('emb_xcomm');
