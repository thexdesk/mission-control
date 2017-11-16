/**
 * GET and POST AJAX requests
 */
export const ajax = {
    /**
     * how long to wait until we reject the promise?
     * @type number
     */
    timeout: 3000,

    /**
     * generic AJAX request
     * @type function
     * @param {string} method - how should we send the request?
     * @param {string} url - where are we sending the request?
     * @param {Object} data - any data we have to send
     * @return {Promise} the raw AJAX request wrapped in a Promise
     */
    _request: (method, url, data) => {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.timeout = ajax.timeout;
            req.open(method, url);

            // need to set headers when sending encoded JSON
            if(method === 'post' && data instanceof Object)
                req.setRequestHeader('Content-type', 'application/json;charset=UTF-8');

            req.onload = function() {
                // success, resolve with response
                if(this.status === 200)
                    resolve(req.response);

                // non-2** status code, reject
                else
                    reject({
                        status: this.status,
                        statusText: req.statusText
                    });
            };

            // something went wrong, reject
            req.onerror = function() {
                reject({
                    status: this.status,
                    statusText: req.statusText
                });
            };

            // took too long, reject
            req.ontimeout = req.onerror;

            const query = [];
            for(const key in data)
                query.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);

            if(method.toLowerCase() === 'post')
                req.send(JSON.stringify(data));
            else
                req.send(`'?${query.join('&')}`);
        });
    },

    /**
     * GET AJAX request
     * @type function
     * @param {string} url - where are we sending the request?
     * @param {Object} [data={}] - any data we have to send
     * @return {Promise} the raw AJAX request wrapped in a Promise
     */
    get: (url, data={}) => ajax._request('get', url, data),

    /**
     * @type function
     * @param {string} url - where are we sending the request?
     * @param {Object} [data={}] - any data we have to send
     * @return {Promise} the raw AJAX request wrapped in a Promise
     */
    post: (url, data={}) => ajax._request('post', url, data)
};
