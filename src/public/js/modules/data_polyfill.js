/**
 * polyfill for `<data>` element, allowing seamless use of `.value` getter
 *
 * courtesy Jonathan Neal (used with permission)
 */

if(!window.HTMLDataElement) {
    window.HTMLDataElement = window.HTMLUnknownElement;

    const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLDataElement.prototype, 'value');

    Object.defineProperty(
        HTMLDataElement.prototype,
        'value',
        valueDescriptor || {
            get() {
                return 'DATA' === this.nodeName && this.getAttribute('value');
            }
        }
    );
}