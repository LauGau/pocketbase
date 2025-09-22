/**
 * =================================================================
 * API Route: /api/join-collection
 * =================================================================
 *
 * This route allows an authenticated user to join a pin collection
 * using a share token.
 *
 * @param {string} token - The unique share token of the pinCollection to join.
 *
 * Example POST request to: /api/join-collection
 * Body: { "token": "a1b2c3d4e5f6..." }
 */
routerAdd("POST", "/api/join-collection", (e) => {
    const authRecord = e.auth;

    // The user should be authenticated by the middleware, but this is a good safeguard.
    if (!authRecord) {
        throw new UnauthorizedError("You must be logged in to join a collection.");
    }

    // 1. Get the token from the request body
    const data = new DynamicModel({ token: "" });
    try {
        e.loadModel(data);
    } catch (err) {
        throw new BadRequestError("Invalid request body.", err);
    }

    if (!data.token || typeof data.token !== 'string') {
        throw new BadRequestError("A valid 'token' string is required.");
    }

    // 2. Find the collection by its shareToken
    let collectionToJoin;
    try {
        collectionToJoin = $app.findFirstRecordByFilter(
            "pinCollections",
            "shareToken = {:token}",
            { token: data.token }
        );
    } catch (err) {
        // findFirstRecordByFilter throws an error if no record is found
        throw new NotFoundError("Collection not found or invalid link.");
    }

    // 3. Check if the user is already a member of the collection
    try {
        const existingMembership = $app.findFirstRecordByFilter(
            "collectionMembers",
            "user = {:userId} && pinCollection = {:collectionId}",
            { userId: authRecord.id, collectionId: collectionToJoin.id }
        );
        // If a record is found, the user is already a member.
        return e.json(409, { "error": "You are already a member of this collection." });
    } catch (err) {
        // An error (specifically a 404) means no record was found, which is what we want.
        // We can proceed with adding the user.
    }

    // 4. Create a new record in the "collectionMembers" table
    try {
        const membersCollection = $app.findCollectionByNameOrId("collectionMembers");

        const newMemberRecord = new Record(membersCollection);
        newMemberRecord.set("user", authRecord.id);
        newMemberRecord.set("pinCollection", collectionToJoin.id);
        newMemberRecord.set("role", "member"); // Default role for joining via link

        // Find the default userProfile for the user
        const userProfile = $app.findFirstRecordByFilter(
            "userProfiles",
            "user = {:userId} && isDefault = true",
            { userId: authRecord.id }
        );
        newMemberRecord.set("userProfile", userProfile.id);

        $app.save(newMemberRecord);
    } catch (err) {
        throw new BadRequestError("Failed to join the collection. Ensure you have a default user profile.", err);
    }

    return e.json(200, { "message": "Successfully joined the collection!" });
}, $apis.requireAuth());
