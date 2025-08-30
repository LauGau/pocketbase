/**
 * =================================================================
 * API Route: /api/pins-for-url (Upgraded Version)
 * =================================================================
 */

// --- CHANGE 1: ADD THIS HELPER FUNCTION ---
/**
 * Generates an array of domain keys from a hostname.
 * Example: "mail.google.com" -> ["mail.google.com", "google.com"]
 * @param {string} hostname
 * @returns {string[]}
 */
function generateDomainKeys(hostname) {
	const keys = new Set();
	const parts = hostname.split('.');
	while (parts.length >= 2) {
		keys.add(parts.join('.'));
		parts.shift();
	}
	return Array.from(keys);
}

function patternToRegExp(pattern) {
	const escapedPattern = pattern
		.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
		.replace(/\*/g, '.*');
	return new RegExp(`^${escapedPattern}$`);
}

module.exports = ($) => {
	$.routerAdd('GET', '/api/pins-for-url', (c) => {
		const urlString = c.queryParam('url');
		if (!urlString) {
			return c.json(400, { error: 'URL query parameter is required.' });
		}

		let currentURL;
		try {
			currentURL = new URL(urlString);
		} catch (e) {
			return c.json(400, { error: 'Invalid URL format provided.' });
		}

		const page = parseInt(c.queryParam('page')) || 1;
		const perPage = parseInt(c.queryParam('perPage')) || 30;
		const sort = c.queryParam('sort') || '-updated';
		const userFilter = c.queryParam('filter') || '';
		const expand = c.queryParam('expand') || '';

		// --- CHANGE 2: GENERATE MULTIPLE KEYS FOR THE FILTER ---
		const domainKeys = generateDomainKeys(currentURL.hostname);
		const domainConditions = domainKeys.map(key => `urlMatching.domains ?~ "${key}"`);
		
		// Use the correct wildcard marker
		domainConditions.push(`urlMatching.domains ?~ "_WILDCARD_"`); 

		const domainFilter = `(${domainConditions.join(' || ')})`;
		let finalFilter = domainFilter;
		if (userFilter) {
			finalFilter = `(${userFilter}) && ${domainFilter}`;
		}

		const initialRecords = $.app.dao().findRecordsByFilter(
			'pins',
			finalFilter,
			sort,
			0, 0,
			expand ? { expand } : {}
		);
		
		// --- CHANGE 3: CREATE A PROTOCOL-LESS URL FOR MATCHING ---
		const simplifiedUrl = `${currentURL.hostname}${currentURL.pathname}${currentURL.search}`;

		const matchingPins = [];
		for (const pin of initialRecords) {
			// --- CHANGE 4: USE THE CORRECT PATH TO THE PATTERNS ARRAY ---
			const urlMatchingData = pin.get('urlMatching');
			if (urlMatchingData && Array.isArray(urlMatchingData.patterns)) {
				for (const pattern of urlMatchingData.patterns) {
					try {
						const regex = patternToRegExp(pattern);
						// Test against the simplified URL
						if (regex.test(simplifiedUrl)) {
							matchingPins.push(pin);
							break;
						}
					} catch (e) {
						console.error(`Invalid pattern for pin ${pin.id}: "${pattern}"`);
					}
				}
			}
		}

		const totalItems = matchingPins.length;
		const totalPages = Math.ceil(totalItems / perPage);
		const offset = (page - 1) * perPage;
		const pageItems = matchingPins.slice(offset, offset + perPage);

		return c.json(200, {
			page,
			perPage,
			totalItems,
			totalPages,
			items: pageItems,
		});
	});
};