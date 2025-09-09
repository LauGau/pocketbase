/**
 * =================================================================
 * API Route: /api/targets-for-url
 * =================================================================
 *
 * This route finds "target" type attachments that match a given URL
 * for the authenticated user.
 *
 * It performs the following steps:
 * 1. Finds all pin collections the user is a member of.
 * 2. Fetches all pins from those collections that are not archived by the user.
 * 3. Filters the pins by matching their URL patterns against the provided URL.
 * 4. Retrieves all "target" type attachments associated with the matching pins.
 *
 * This route is designed for precision and fetches all matching targets without pagination.
 */
routerAdd('GET', '/api/targets-for-url', (e) => {
	// In PocketBase's JSVM, modules must be required inside the handler.
    const URL = require(`${__hooks}/utils/url-polyfill.js`);
    const utilsUrls = require(`${__hooks}/utils/urls.js`);
	
    const requestData = e.requestInfo();
    const authRecord = e.auth; // from requireAuth middleware

	//console.log("authRecord", JSON.stringify(authRecord)) // working

    const urlString = requestData.query['url'];

    if (!urlString) {
        return e.json(400, { error: 'URL query parameter is required.' });
    }



    let currentURL;
    try {
        currentURL = new URL(urlString);
    } catch (error) {
        $app.logger().error('Failed to parse URL parameter', 'url', urlString, 'error', error);
        return e.json(400, { error: 'Invalid URL format provided.', details: error.message });
    }

    try {
        // 1. Find all pinCollections the user is a member of.
        const pinCollections = e.app.findRecordsByFilter(
            "pinCollections", // collection name
            "members ?~ {:userId}",
            "-created",
            0, // no limit
            0, // no offset
            { userId: authRecord.id }
        );
		// TODO: add "collection NOT archivedBy... user"
		


        if (pinCollections.length === 0) {
            $app.logger().debug("User is not a member of any pin collections.", "userId", authRecord.id);
            return e.json(200, []);
        }

        const pinCollectionIds = pinCollections.map(pc => pc.id);
		// console.log("pinCollectionIds", JSON.stringify(pinCollectionIds)) // working


        // 2. Fetch all pins from those collections, not archived by the user.
        // We also do a preliminary filter on domain keys for efficiency.
        const domainKeys = utilsUrls.generateDomainKeys(currentURL.hostname);
        const domainConditions = domainKeys.map(key => `urlMatching.domains ?~ "${key}"`);
        domainConditions.push(`urlMatching.domains ?~ "_WILDCARD_"`);
        const domainFilter = `(${domainConditions.join(' || ')})`;

        const pins = e.app.findRecordsByFilter(
		// DOC: https://pocketbase.io/jsvm/functions/_app.findRecordsByFilter.html
            "pins", // collection name
            // "pinCollection ?~ {:collections} && archivedBy !~ {:userId} && {:domainFilter}",
			//"pinCollection ?~ {:collections} && archivedBy !~ {:userId}",
			null, // TODO: prepare the correct "filter", maybe a recordQuery() is needed
            "-created",
            0, // no limit
            0, // no offset
            {
                collections: pinCollectionIds,
                userId: authRecord.id,
				domainFilter: domainFilter
            }
        );

		// console.log("pins after filter !!!!", JSON.stringify(pins)) // working


        if (pins.length === 0) {
            $app.logger().debug("No potential pins found for user and URL domain.", "userId", authRecord.id, "url", urlString);
            return e.json(200, []);
        }

        // 3. Filter pins by full URL match (in-memory).
        let urlWithSlash = urlString.endsWith('/') ? urlString : urlString + '/';
        let urlWithoutSlash = urlString.endsWith('/') ? urlString.slice(0, -1) : urlString;

        const matchingPinIds = [];
        for (const pin of pins) {
            let urlMatchingData;
            try {
                urlMatchingData = JSON.parse(pin.get('urlMatching') || '{}');
				// console.log("urlMatchingData", JSON.stringify(urlMatchingData)) // working
            } catch (parseError) {
                $app.logger().warn(`Skipping pin with invalid urlMatching JSON`, "pinId", pin.id, "error", parseError);
                continue;
            }
            if (urlMatchingData && Array.isArray(urlMatchingData.patterns)) {
                for (const pattern of urlMatchingData.patterns) {
                    try {
						// console.log("pattern", JSON.stringify(pattern)) // working	
                        const regex = utilsUrls.patternToRegExp(pattern);
						// console.log("regex", JSON.stringify(regex)) // working
                       if (regex.test(urlWithSlash) || regex.test(urlWithoutSlash)) {
                            matchingPinIds.push(pin.id);
                            break; // Found a match, no need to check other patterns for this pin.
                        }
                    } catch (err) {
						console.log("err", JSON.stringify(err)) // working
                        $app.logger().error(`Invalid pattern for pin ${pin.id}: "${pattern}"`, "error", err);
                    }
                }
            }
        }
		console.log("matchingPinIds", JSON.stringify(matchingPinIds)) // returns : ["h72wmfttfwuxiq6", "mzjrtt09ayb8wl0", "vd2d8qr3rx8r07q"]



        if (matchingPinIds.length === 0) {
            $app.logger().debug("No pins matched the full URL.", "userId", authRecord.id, "url", urlString);
            return e.json(200, []);
        }

        // // 4. Retrieve all "target" type attachments for the matching pins.


		// console.log("Final attachments result:", JSON.stringify(attachments, null, 2));


		// Initialize an array to hold the record results.
		// This is a special construct for the PocketBase JSVM.
		let attachments = arrayOf(new Record);

		// --- Custom Query Start ---

		// Start building a query against the "attachments" collection.
		e.app.recordQuery("attachments")
			// Add the first condition: WHERE type = 'target'
			.andWhere($dbx.hashExp({ 'type': 'target' }))
			
			// Add the second condition: AND pin IN (...)
			// We use $dbx.in() and spread the matchingPinIds array into it.
			.andWhere($dbx.in('pin', ...matchingPinIds))
			
			// Set the sorting order: ORDER BY created DESC
			.orderBy("created DESC")
			
			// Execute the query and populate the 'attachments' array with all matching records.
			.all(attachments);

		// --- Custom Query End ---

		console.log("Attachments from custom query:", JSON.stringify(attachments, null, 2));

		return e.json(200, attachments);


    } catch (err) {
        $app.logger().error("Error processing /api/targets-for-url", "error", err);
        return e.json(500, { error: "An unexpected error occurred.", details: err.message });
    }
}, $apis.requireAuth());