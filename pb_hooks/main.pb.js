// After a user create a "pinCollection"
// - We add the user as owner
onRecordCreateRequest((e) => {
    const record = e.record;   // The record being created (can be modified directly)
    const authRecord = e.httpContext.authRecord; // The authenticated user record

    // It's a good practice to ensure a user is authenticated.
    // If no user is authenticated (e.g. an admin creating a record via UI, or an API key request),
    // authRecord will be null.
    if (!authRecord) {
        // If a user MUST be authenticated to create this record, throw an error.
        // This will prevent the record from being created and return a 400 response.
        throw new BadRequestError("You must be logged in to create a pin collection.");
    }

    // Set the 'owner' field directly on the record object
    record.set("owner", authRecord.id);

    // Set the 'members' field directly on the record object.
    record.set("members", [authRecord.id]);

	 e.next()

}, "pinCollections")