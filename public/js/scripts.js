MDEs = {}

window.onload = () => {
	// register dialog element with polyfill
	const dialog = document.querySelector('dialog');
	dialogPolyfill.registerDialog(dialog);

	// register jQuery UI reordering
	$('#events').sortable({ placeholder: 'ui-state-highlight', handle: ".sort-icon" });

	// register textareas as Markdown editor
	let id = 0;
	for(obj of document.querySelectorAll('textarea')) {
		MDEs[id++] = new SimpleMDE({
			element: obj,
			initialValue: obj.getAttribute('data-initial') || '',
			toolbar: ['bold', 'italic', 'strikethrough', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'table', 'horizontal-rule', '|', 'guide'],
			promptURLs: true,
			status: false
		});
	}

	// leave this last as it may fail, crashing the script
	// remove what appears to be a tracking iframe embedded by reddit
	const elem = document.getElementById('emb_xcomm');
	elem.parentElement.removeChild(elem);
}
