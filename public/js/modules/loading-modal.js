export function removeLoadingModal() {
    const loader = document.getElementById('loader').style;
    loader['opacity'] = 0;
    setTimeout(() => loader['display'] = 'none', 500);

    // show info dialog
    if(!window.noshow)
        document.getElementById('info').showModal();
}