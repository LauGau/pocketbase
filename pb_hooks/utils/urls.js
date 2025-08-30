const DEBUG = false;

/**
 * Checks if a given URL pattern is syntactically valid.
 * Handles global wildcards, protocols, hostnames with wildcards, and paths.
 * @param {string} pattern The pattern to validate.
 * @returns {boolean} True if the pattern is valid, false otherwise.
 */
function isValidPattern(pattern) {
    // Case 1: The global wildcard "*" is valid on its own.
    if (pattern === '*') {
        return true;
    }

    // Case 2: For all other patterns, we use a regex to check the structure.
    // Breakdown of the regex:
    // ^                                      - Start of the string
    // (https?|\\*):\\/\\/                     - Protocol: "http://", "https://", or "*://"
    // (                                      - Start of hostname group
    //   \\* -   A literal "*"
    //   |                                    -   OR
    //   ([a-zA-Z0-9\\*\\-]+\\.)*[a-zA-Z0-9\\*\\-]+ -   Hostname segments (eg, "*.google.com" or "site.*")
    // )                                      - End of hostname group
    // (\\/.*)?                               - Optional path starting with "/"
    // $                                      - End of the string
    const patternRegex = /^(https?|\*):\/\/(\*|([a-zA-Z0-9\*\-]+\.)*[a-zA-Z0-9\*\-]+)(\/.*)?$/;

    return patternRegex.test(pattern);
}

if (DEBUG) {
	// --- Examples of Usage ---

	// Valid Patterns:
	console.log(isValidPattern('*'));                               // true
	console.log(isValidPattern('*://*'));                           // true
	console.log(isValidPattern('https://www.google.com'));          // true
	console.log(isValidPattern('http://*.domain.com/path'));        // true
	console.log(isValidPattern('https://domain.*.org/*'));          // true
	console.log(isValidPattern('*://sub.domain.*/path*'));          // true

	// Invalid Patterns:
	console.log(isValidPattern('google.com'));                      // false (missing protocol)
	console.log(isValidPattern('htp://google.com'));                // false (invalid protocol)
	console.log(isValidPattern('https://'));                        // false (incomplete)
	console.log(isValidPattern('https://.google.com'));             // false (starts with a dot)
}


/**
 * Converts a list of URL patterns into a unique set of domain keys for database indexing.
 * Uses a helper function to intelligently extract the most specific domain part.
 * @param {string[]} patterns An array of URL patterns.
 * @returns {string[]} An array of unique domain keys.
 */
function patternsToDomains(patterns) {
    if (!patterns || !Array.isArray(patterns)) {
        return [];
    }

    const domains = new Set();
    for (const pattern of patterns) {
        const domainKey = extractDomainFromPattern(pattern);
        if (domainKey) {
            domains.add(domainKey);
        }
    }

    return Array.from(domains);
}

/**
 * [Helper Function] Extracts the most specific, indexable domain key from a pattern.
 * This implements the advanced logic to make queries more specific.
 * @param {string} pattern The URL pattern.
 * @returns {string|null} The extracted domain key or null if invalid.
 */
function extractDomainFromPattern(pattern) {
    if (pattern === '*') {
        return '_WILDCARD_';
    }

    const protocolSeparator = '://';
    const separatorIndex = pattern.indexOf(protocolSeparator);
    if (separatorIndex === -1) {
        return null; // Invalid pattern, missing protocol
    }

    const rest = pattern.substring(separatorIndex + protocolSeparator.length);
    const hostname = rest.split('/')[0];

    if (hostname === '*') {
        return '_WILDCARD_';
    }

    // Rule for "*.domain.com" -> we store "domain.com"
    if (hostname.startsWith('*.')) {
        return hostname.substring(2);
    }
    
    // Rule for "domain.*" or "domain.*.com" -> we store "domain"
    const firstWildcardSegment = hostname.indexOf('.*');
    if (firstWildcardSegment !== -1) {
        return hostname.substring(0, firstWildcardSegment);
    }

    // Default: return the full hostname for specific patterns
    return hostname;
}


// --- Examples of Usage ---


if(DEBUG) {

	const myPatterns = [
		'http://some-old-site.com/about',
		'http://*.some-old-site.com/',
		'https://www.othersite.com/',
		'*://www.othersite.*',
		'https://www.othersite.*.*',
		'http://www.*.com/',
		'*://*',
		'*'
	];

	const extractedDomains = patternsToDomains(myPatterns);
	console.log(extractedDomains);
	// Expected Output:
	// [
	//   "some-old-site.com",
	//   "www.othersite.com",
	//   "www.othersite",
	//   "www",
	//   "_WILDCARD_"
	// ]
}



module.exports = {
    isValidPattern,
    patternsToDomains,
	extractDomainFromPattern,
};