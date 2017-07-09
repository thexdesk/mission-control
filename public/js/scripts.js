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

	// remove what appears to be a tracking iframe embedded by reddit
	const elem = document.getElementById('emb_xcomm');
	if(elem) elem.parentElement.removeChild(elem);
}

function save() {
	elem = arguments[0].element;
	
	if(elem.constructor === HTMLTextAreaElement) {
		// is a text area (aka not events), send id with value
		const id = elem.id;
		console.log(id);
		const value = elem.value;

		$.ajax({
			method: 'POST',
			url: '/update',
			data: { id: id, value: value },
			success: data => {
				$('#' + id + ' + .editor-toolbar > a[title="Save to reddit"]').addClass('highlight');
				$('.reddit').html(data);
			}
		});
	}
}
