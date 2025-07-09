// After a user create a "pinCollection"
// - We add the user as owner
onRecordCreateRequest((e) => {
	const record = e.record;   // The record being created (can be modified directly)
    const request = e.request; // The original HTTP request
    const currentAuthUser = request.authRecord; // The authenticated user record


    // Set the 'owner' field directly on the record object
    record.set("owner", currentAuthUser.id);

    // Set the 'members' field directly on the record object.
    record.set("members", [currentAuthUser.id]);

    e.next()
}, "pinCollections")