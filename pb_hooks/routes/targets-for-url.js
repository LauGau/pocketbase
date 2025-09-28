/**
 * =================================================================
 * API Route: /api/targets-for-url
 * =================================================================
 *
 * This route finds "target" type attachments that match a given URL
 * for the authenticated user. It filters out any attachments belonging
 * to pins that are in an archived collection or have been personally
* archived by the user.
 *
 * It performs the following steps:
 * 1. Fetches the user's active (non-archived, approved) collection IDs.
 * 2. Executes a single, powerful query to fetch attachments that match the URL,
 *    while simultaneously filtering their parent pins based on collection and archive status.
 *
 * This route is designed for precision and fetches all matching targets
 * without pagination.
 */
routerAdd('GET', '/api/targets-for-url', (e) => {

	const DEBUG = false

	// In PocketBase's JSVM, modules must be required inside the handler.
    const URL = require(`${__hooks}/utils/url-polyfill.js`);
    const utilsUrls = require(`${__hooks}/utils/urls.js`);
	
    const requestData = e.requestInfo();
    const authRecord = e.auth; // from requireAuth middleware

	DEBUG && console.log("authRecord", JSON.stringify(authRecord)) // working

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

	DEBUG && console.log("currentURL", currentURL)

	/**
	 * =================================================================
	 * STEP 1: Find user's active Pin Collections
	 * =================================================================
	 */
	let pinCollectionIds;
	try {
		// Find all collection memberships for the user that are approved and not personally archived.
		const memberships = e.app.findRecordsByFilter(
			"collectionMembers",
			"user = {:userId} && isCollectionArchived = false && status = 'approved'",
			"-created",
			0, 0,
			{ "userId": authRecord.id }
		);

		if (memberships.length === 0) {
			DEBUG && $app.logger().debug("User is not a member of any active and approved pin collections.", "userId", authRecord.id);
			return e.json(200, []);
		}

		// Extract and filter valid pinCollection IDs from the memberships
		pinCollectionIds = memberships
			.map(m => m.get("pinCollection"))
			.filter(id => typeof id === 'string' && id.length > 0); // Ensure IDs are non-empty strings
		if (pinCollectionIds.length === 0) {
			DEBUG && $app.logger().debug("User has memberships but no valid associated pin collections after filtering.", "userId", authRecord.id);
			return e.json(200, []);
		}
	} catch (err) {
		console.log("Error on collection search, err:", JSON.stringify(err))
		return e.json(500, { error: "Error on collection search", details: err.message });
	}

	DEBUG && console.log("pinCollectionIds", JSON.stringify(pinCollectionIds))

	/**
	 * =================================================================
	 * STEP 2: Find all matching attachments with a single query
	 * =================================================================
	 */
    let finalFilter = ''; // Declare here to make it accessible in the catch block
    try {
		const collectionConditions = pinCollectionIds.map(id => `pin.pinCollection = '${id}'`).join(' || ');
		finalFilter = `
			type = "target" &&
			data.url = {:url} &&
			(${collectionConditions}) &&
			pin.archivedBy !~ {:userId}
		`;

		const attachments = e.app.findRecordsByFilter(
			"attachments",
			finalFilter,
			"-created", // sort
			0, 0, // no limit/offset
			{ url: urlString, userId: authRecord.id }
		);

		DEBUG && console.log(`Found ${attachments.length} matching attachments.`);

		return e.json(200, attachments);

    } catch (err) {
        $app.logger().error("Error fetching final attachments", "error", err, "details", JSON.stringify(err), "filter", finalFilter);
        return e.json(500, { error: "An unexpected error occurred while fetching attachments.", details: err.message });
    }
}, $apis.requireAuth());
