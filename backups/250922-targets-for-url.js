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


	/**
	 * ************************************************************************
	 * STEP 1
	 * 
	 * Find all pinCollections the user is a member of.
	 */

	let pinCollections
	try {
		// 1. Find all pinCollections the user is a member of.
		pinCollections = e.app.findRecordsByFilter(
			"pinCollections", 									// collection name
			"members ?~ {:userId} && archivedBy !~ {:userId}", 	// filters
			"-created",											// sort
			0, 													// no limit
			0, 													// no offset
			{ userId: authRecord.id }
		);
		// TODO: add "collection NOT archivedBy... user"
	


		console.log("authRecord.id", authRecord.id)

		pinCollections.forEach(pc => {
			console.log(JSON.stringify(pc.get("name"), null, 2))	// working
		})

		if (pinCollections.length === 0) {
            $app.logger().debug("User is not a member of any pin collections.", "userId", authRecord.id);
            return e.json(200, []);
        }
	} catch (err) {
		
		console.log("Error on collection search, err:", JSON.stringify(err))
		return e.json(500, { error: "Error on collection search", details: err.message });
	}



	/**
	 * ************************************************************************
	 * STEP 2
	 * 
	 * Build the domain filter
	 */

	let domainFilter
	let pinCollectionIds
	try {
		pinCollectionIds = pinCollections.map(pc => pc.id);
		// console.log("pinCollectionIds", JSON.stringify(pinCollectionIds)) // working

        // 2. Fetch all pins from those collections, not archived by the user.
        // We also do a preliminary filter on domain keys for efficiency.
        const domainKeys = utilsUrls.generateDomainKeys(currentURL.hostname);
        const domainConditions = domainKeys.map(key => `urlMatching.domains ?~ "${key}"`);
        domainConditions.push(`urlMatching.domains ?~ "_WILDCARD_"`);
        domainFilter = `(${domainConditions.join(' || ')})`;

		console.log("pinCollectionIds = ", pinCollectionIds)
		console.log("domainFilter = ", domainFilter)

	} catch (err) {
		console.log("Error while building domain filter, err:", JSON.stringify(err))
		return e.json(500, { error: "Error while building domain filter", details: err.message });
	}


	/**
	 * ************************************************************************
	 * STEP 3 with Custom Query
	 * 
	 * Searching the pins...
	 */

	let pins
	try {
		// Initialize an array to hold the record results.
		// This is a special construct for the PocketBase JSVM.
		pins = arrayOf(new Record);

		// --- Custom Query Start ---

		// Start building a query against the "attachments" collection.
		e.app.recordQuery("pins")
			.bind({
				"userId": authRecord.id,
			})
			// Add the first condition: WHERE type = 'target'
			// .andWhere($dbx.hashExp({ 'type': 'target' }))

			// Add the second condition: AND pinCollection IN (...)
			// We use $dbx.in() and spread the pinCollectionIds array into it.
			.andWhere($dbx.in('pinCollection', ...pinCollectionIds))
			
			// Exclude pins where the authRecord's ID is found inside the 'archivedBy' JSON array.
	        .andWhere($dbx.not($dbx.like('archivedBy', authRecord.id)))
			
			// Set the sorting order: ORDER BY created DESC
			.orderBy("created DESC")
			
			// Execute the query and populate the 'attachments' array with all matching records.
			.all(pins);

	} catch (err) {
		console.log("Error while getting the pins, err:", JSON.stringify(err))
	}


	// 3. Filter pins by full URL match (in-memory).
    let urlWithSlash = urlString.endsWith('/') ? urlString : urlString + '/';
    let urlWithoutSlash = urlString.endsWith('/') ? urlString.slice(0, -1) : urlString;

	
	/**
	 * ************************************************************************
	 * STEP 4
	 * 
	 * Build the domain filter
	 */

	let matchingPinIds = []
	try {
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

	} catch (err) {
		console.log("Error while getting the matchingPinIds, err:", JSON.stringify(err))
	}




    try {
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


			 // Ensure the 'data' field is not null before trying to access a nested key.
    		// .andWhere($dbx.not($dbx.hashExp({ 'data': null }))) // to test !
			.andWhere($dbx.exp("JSON_EXTRACT(data, '$.url') = {:url}", { url: urlString }))

			
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




/**
 * ************************************************************************
 * DEV NOTES
 * ************************************************************************
 * 
 * Excessive try/catch has been made on purpose as it's really hard to debug in JSVM
 */