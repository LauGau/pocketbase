/**
 * =================================================================
 * API Route: /api/pins-for-url
 * =================================================================
 * 
 * This route finds pins that match a given URL.
 * It supports two matching scopes via the 'matchScope' query parameter:
 * - 'domain' (default, efficient): Finds pins whose patterns match the URL's domain.
 *   This is fast as it relies on a pre-filtered database query.
 * - 'page': Finds pins whose patterns match the full URL path.
 *   This is more precise but less performant as it requires an extra
 *   in-memory filtering step on the initial DB results.
 *  
*/

// A simple test route to verify the URL polyfill is working.
routerAdd('GET', '/pbk/test', (e) => {
	// In PocketBase, require() must be inside the handler to be in scope.
	const URL = require(`${__hooks}/utils/url-polyfill.js`);
	
	$app.logger().debug('✅ /pbk/test route was called!');

	const urlTarget = e.requestInfo().query['urlTarget'];
	if (!urlTarget) {
		return e.json(400, { error: 'urlTarget query parameter is required.' });
	}

	try {
		let urlObj = new URL(urlTarget);
		return e.json(200, {
			msg: `Hostname for ${urlTarget} is ${urlObj.hostname}`
		});
	} catch (error) {
		$app.logger().error('Failed to parse URL in /pbk/test', 'url', urlTarget, 'error', error);
		return e.json(400, { error: 'Invalid URL format provided.', details: error.message });
	}
});


routerAdd('GET', '/api/pins-for-url', (c) => {
	const DEBUG = false;

    const requestData = c.requestInfo();
    const urlString = requestData.query['url'];
    const pinCollectionId = requestData.query['pinCollectionId'];
    const page = parseInt(requestData.query['page']) || 1;
    const perPage = parseInt(requestData.query['perPage']) || 30;
	const isArchive = requestData.query['isArchive'] ? JSON.parse(requestData.query['isArchive']) : false;
    const sort = requestData.query['sort'] || '-updated';
    const matchScope = requestData.query['matchScope'] || 'domain'; // 'domain' or 'page'
	const authRecord = c.auth; // from requireAuth middleware

    // Due to PocketBase's JSVM environment, all route-specific logic,
    // including helper functions, must be defined inside the handler's scope.
    // We also load modules here to ensure they are available in this context.
	const URL = require(`${__hooks}/utils/url-polyfill.js`);
	const utilsUrls = require(`${__hooks}/utils/urls.js`);

    /**
     * Handles the 'domain' match scope.
     * Fetches and paginates records directly from the database.
     * @param {core.RequestEvent} c The request event.
     * @param {string} filter The base DB filter string.
     * @param {number} page The current page number.
     * @param {number} perPage The number of items per page.
     * @param {string} sort The sort order.
     */
    function handleDomainScopeMatch(c, filter, page, perPage, sort) {
        $app.logger().debug("Handling 'domain' scope match.");
        try {
            // The `?~` operator is part of PocketBase's filter language and not directly
            // supported by the low-level `countRecords` function, which caused a SQL error.
            // The correct and safe way to get a total count for a filter with `?~` is to
            // fetch all matching records and then count them. This is less performant than a
            // direct SQL COUNT for very large datasets, but it is guaranteed to work correctly
            // within the JSVM environment.
            const allItems = c.app.findRecordsByFilter(
                'pins',
                filter,
                sort,
                0, 0 // Fetch all to get the total count
            );

            // Paginate the results in-memory
            const totalItems = allItems.length;
            const totalPages = Math.ceil(totalItems / perPage);
            const offset = (page - 1) * perPage;
            const pageItems = allItems.slice(offset, offset + perPage);

            // Manually expand relations if requested in the query params.
            const requestData = c.requestInfo();
            const expand = requestData.query['expand'] || '';
            if (expand && pageItems.length > 0) {
                c.app.expandRecords(pageItems, expand.split(','));
            }

            // Construct the standard paginated response object.
            return c.json(200, {
                page: page,
                perPage: perPage,
                totalItems: totalItems,
                totalPages: totalPages,
                items: pageItems,
            });
        } catch (dbError) {
            $app.logger().error("Database query failed for 'domain' scope", "filter", filter, "error", dbError);
            return c.json(500, { error: "Database query failed.", details: dbError.message });
        }
    }

    /**
     * Handles the 'page' match scope.
     * Fetches all potential matches and then filters them in-memory using regex.
     * @param {core.RequestEvent} c The request event.
     * @param {string} filter The base DB filter string.
     * @param {string} fullUrlToMatch The full URL to match against patterns.
     * @param {number} page The current page number.
     * @param {number} perPage The number of items per page.
     * @param {string} sort The sort order.
     */
    function handlePageScopeMatch(c, filter, fullUrlToMatch, page, perPage, sort) {
        $app.logger().debug("Handling 'page' scope match.");
        let initialRecords;
        try {
            // Fetch all potentially matching records first (no DB pagination)
            initialRecords = c.app.findRecordsByFilter(
                'pins',
                filter,
                sort,
                0, 0 // Fetch all
            );
        } catch (dbError) {
            $app.logger().error("Database query failed for 'page' scope", "filter", filter, "error", dbError);
            return c.json(500, { error: "Database query failed.", details: dbError.message });
        }

        // To make matching insensitive to a trailing slash, we'll test against two versions of the URL:
        // one with a trailing slash, and one without. This ensures that a search for
        // `https://example.com/page` matches patterns for both `.../page` and `.../page/`.
        let urlWithSlash = fullUrlToMatch;
        let urlWithoutSlash = fullUrlToMatch;

        if (fullUrlToMatch.endsWith('/')) {
            urlWithoutSlash = fullUrlToMatch.slice(0, -1);
        } else {
            urlWithSlash = fullUrlToMatch + '/';
        }

        // Perform secondary, more precise filtering in-memory
        const matchingPins = [];
        for (const pin of initialRecords) {
            let urlMatchingData;
            try {
                urlMatchingData = JSON.parse(pin.get('urlMatching') || '{}');
            } catch (parseError) {
                $app.logger().warn(`Skipping pin with invalid urlMatching JSON`, "pinId", pin.id, "error", parseError);
                continue;
            }

            if (urlMatchingData && Array.isArray(urlMatchingData.patterns)) {
                for (const pattern of urlMatchingData.patterns) {
                    try {
                        const regex = utilsUrls.patternToRegExp(pattern);
                        if (regex.test(urlWithSlash) || regex.test(urlWithoutSlash)) {
                            matchingPins.push(pin);
                            break; // Match found, move to the next pin
                        }
                    } catch (e) {
                        $app.logger().error(`Invalid pattern for pin ${pin.id}: "${pattern}"`, "error", e);
                    }
                }
            }
        }

        // Paginate the final, filtered results in-memory
        const totalItems = matchingPins.length;
        const totalPages = Math.ceil(totalItems / perPage);
        const offset = (page - 1) * perPage;
        const pageItems = matchingPins.slice(offset, offset + perPage);

        // Manually expand relations if requested in the query params.
        const requestData = c.requestInfo();
        const expand = requestData.query['expand'] || '';
        if (expand && pageItems.length > 0) {
            c.app.expandRecords(pageItems, expand.split(','));
        }

        return c.json(200, {
            page: page,
            perPage: perPage,
            totalItems: totalItems,
            totalPages: totalPages,
            items: pageItems,
        });
    }

    if (!urlString) {
        return c.json(400, { error: 'URL query parameter is required.' });
    }

    let currentURL;
    try {
        currentURL = new URL(urlString);
    } catch (error) {
        $app.logger().error('Failed to parse URL parameter', 'url', urlString, 'error', error);
        return c.json(400, { error: 'Invalid URL format provided.', details: error.message });
    }

    // --- 1. Build the base database filter ---
    const domainKeys = utilsUrls.generateDomainKeys(currentURL.hostname);
    const domainConditions = domainKeys.map(key => `urlMatching.domains ?~ "${key}"`);
    domainConditions.push(`urlMatching.domains ?~ "_WILDCARD_"`);

    let filterParts = [`(${domainConditions.join(' || ')})`];

    if (pinCollectionId) {
        filterParts.push(`pinCollection = "${pinCollectionId}"`);
    }

	DEBUG &&console.log("filterParts = ", filterParts)

	if (isArchive == true) {
		console.log("isArchive == true, YaY !!!!")
		filterParts.push(`archivedBy ?~ "${authRecord.id}"`);
	} else {
		filterParts.push(`archivedBy !~ "${authRecord.id}"`);
	}

    const baseFilter = filterParts.join(' && ');
    $app.logger().debug("Using base database filter", "filter", baseFilter);

    // --- 2. Handle request based on matchScope ---
    if (matchScope === 'page') {
        return handlePageScopeMatch(c, baseFilter, urlString, page, perPage, sort);
    }

    // Default to 'domain' scope match, which is more efficient.
    return handleDomainScopeMatch(c, baseFilter, page, perPage, sort);

}, $apis.requireAuth());