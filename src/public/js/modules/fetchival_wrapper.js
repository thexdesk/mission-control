/**
 * wrapped around fetchival library in modules directory
 */

/**
 * @param {string} url - where are we sending the request?
 * @param {Object} [data={}] - any data to be sent
 * @param {Object} [opts={}] - any headers to be sent
 * @return {Promise} request wrapped in a Promise
 */
export function get(url, data={}, opts={}) {
    // send session along with request
    opts['mode'] = 'cors';
    opts['credentials'] = 'include';
    return fetchival(url, opts).get(data);
}

/**
 * @param {string} url - where are we sending the request?
 * @param {Object} [data={}] - any data to be sent
 * @param {Object} [opts={}] - any headers to be sent
 * @return {Promise} request wrapped in a Promise
 */
export function post(url, data={}, opts={}) {
    // send session along with request
    opts['mode'] = 'cors';
    opts['credentials'] = 'include';
    return fetchival(url, opts).post(data);
}
