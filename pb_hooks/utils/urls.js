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
 * Converts URL match patterns into a cleaned, unique array of base domains for querying.
 * - Strips leading '*.', trailing '.*'
 * - Treats ambiguous middle wildcards ('www.*.com') as a global wildcard.
 * @param {string[]} patterns - An array of URL match patterns.
 * @returns {string[]} A unique array of processed domain names.
 */
const patternsToDomains = (patterns) => {
    const WILDCARD_DOMAIN = "_WILDCARD_";
    const domains = new Set();

    if (!Array.isArray(patterns)) {
        return [];
    }

    for (const pattern of patterns) {
        let p = pattern.trim();

        if (p === "*" || p === "*://*/*") {
            domains.add(WILDCARD_DOMAIN);
            continue;
        }

        const hostMatch = p.match(/(?:[a-zA-Z]+:\/\/)?([^/]+)/);

        if (!hostMatch || !hostMatch[1]) {
            console.log(`Could not extract host from pattern: "${p}"`);
            continue;
        }

        let hostname = hostMatch[1].replace(/:\d+$/, ""); // Get host, strip port

        // ## NEW RULES START HERE ##

        // Rule 1: Check for overly generic or ambiguous middle wildcards.
        const parts = hostname.split('.');
        if (
            parts.every(part => part === '*' || part === '') || // Catches '*', '*.*', etc.
            (parts.length > 2 && parts.slice(1, -1).includes('*')) // Catches 'www.*.com', 'a.*.c.com'
        ) {
            domains.add(WILDCARD_DOMAIN);
            continue;
        }

        // Rule 2: Strip leading and trailing wildcards to get a clean base domain.
        if (hostname.startsWith("*.")) {
            hostname = hostname.substring(2); // '*.wef.com' -> 'wef.com'
        }
        if (hostname.endsWith(".*")) {
            hostname = hostname.slice(0, -2); // 'sylviecabral.*' -> 'sylviecabral'
        }

        // Rule 3: Add the final, cleaned domain.
        if (hostname) {
            domains.add(hostname);
        }
    }

    return Array.from(domains);
};

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


function generateDomainKeys(hostname) {
	DEBUG && console.log("generateDomainKeys called !");
    const keys = new Set();
    const parts = hostname.split('.');
    while (parts.length >= 2) {
        keys.add(parts.join('.'));
        parts.shift();
    }
    return Array.from(keys);
}

function patternToRegExp(pattern) {
    if (typeof pattern !== 'string' || !pattern) {
        return new RegExp('^$'); // Return a regex that matches nothing
    }
    const escapedPattern = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
    return new RegExp(`^${escapedPattern}$`);
}



module.exports = {
    isValidPattern,
    patternsToDomains,
	extractDomainFromPattern,
	generateDomainKeys,
	patternToRegExp
};