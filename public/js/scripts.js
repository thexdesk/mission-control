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
	
	if(elem.constructor === HTMLTextAreaElement) {
		// is a text area (aka not events), send id with value
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
}

function updateStats() {
	$.ajax({
		url: '/status',
		success: data => document.getElementById('status-liveupdate').innerHTML = data
	});
}
