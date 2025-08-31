console.log('--- Loading and exporting URL polyfill module ---');

/**
 * A basic WHATWG URL API polyfill for the PocketBase JSVM environment.
 * It is not fully spec-compliant but covers common use cases for parsing
 * hostname, pathname, and search from a URL string.
 *
 * @param {string} urlString The URL to parse.
 * @param {string} [base] Optional base URL. Not implemented in this polyfill.
 */
const URLPolyfill = function (urlString, base) {
    console.log("✅ URL polyfill constructor was called!");

    if (typeof urlString !== 'string') {
        throw new TypeError("Failed to construct 'URL': Invalid URL");
    }

    // A basic parser using regex. This is not a full implementation but covers many common cases.
    // It captures: 1:protocol, 2:hostname, 3:port, 4:pathname, 5:search, 6:hash
    const regex = /^(?:(https?|ftp|file):\/\/)?([^/:]+)?(?::(\d+))?([^?#]*)?(\?[^#]*)?(#.*)?$/i;
    const match = urlString.match(regex);

    if (!match) {
        throw new TypeError("Failed to construct 'URL': Invalid URL format");
    }

    this.protocol = match[1] ? match[1] + ':' : '';
    this.hostname = match[2] || '';
    this.port = match[3] ? match[3].substring(1) : '';
    this.pathname = match[4] || '/';
    this.search = match[5] || '';
    this.hash = match[6] || '';
    this.host = this.hostname + (this.port ? ':' + this.port : '');
    this.origin = this.protocol + '//' + this.host;
    this.href = urlString;
};

// Export the constructor directly, so it can be used locally in other modules.
module.exports = URLPolyfill;