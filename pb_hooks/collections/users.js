/// <reference path="../pb_data/types.d.ts" />

/**
 * PocketBase hook to create a personal workspace when a user becomes verified.
 *
 * This hook triggers when a "users" record is updated. It checks if the
 * `verified` field has changed from `false` to `true`. If so, it creates
 * a corresponding "Personal Workspace" for that user, but only if one
 * doesn't already exist.
 */
onRecordAfterUpdateSuccess((e) => {
    const DEBUG = false;
    const userId = e.record.getString('id');

    const originalVerified = e.record.original().getBool('verified');
    const newVerified = e.record.getBool('verified');

    DEBUG && console.log('originalVerified = ', originalVerified);
    DEBUG && console.log('newVerified = ', newVerified);

    DEBUG &&
        console.log(
            'users onRecordAfterUpdateSuccess() called...',
            JSON.stringify(e)
        );

    const isVerified = e.record.getBool('verified');

    // Check if a "FREE" workspace already exists for this user to prevent duplicates.
    try {
        // We tried to use "findFirstRecordByFilter" but it throws an error when there is no results
        let existingWorkspace = $app.findRecordsByFilter(
            'workspaces', // collection
            "plan = 'free' && owner = {:user}", // filter
            'created', // sort
            1, // limit (we just check if there is one)
            0, // offset
            { user: userId } // optional filter params
        );

        if (existingWorkspace && existingWorkspace.length > 0) {
            DEBUG && console.log('The user already has a FREE workspace...');
            return; // Workspace already exists, do nothing.
        }
    } catch (err) {
        // findFirstRecordByFilter throws if no record is found, which is the expected case here.
        DEBUG && console.log('ERROR inside existingWorkspace try/catch: ', err);
    }

    // Trigger only when the user's status changes to verified.
    if (newVerified && !originalVerified) {
        DEBUG && console.log('user is verified, creating workspace...');

        try {
            // Find the "workspaces" collection.
            const workspaces = $app.findCollectionByNameOrId('workspaces');

            // Create a new workspace record.
            const workspaceRecord = new Record(workspaces, {
                owner: userId,
                name: 'Personal Workspace',
                plan: 'free',
                storage_limit: 1000000000, // 1 GB
                storage_used: 0,
                subscription_status: 'active',
            });

            // Save the new workspace record to the database.
            $app.save(workspaceRecord);
        } catch (err) {
            // findFirstRecordByFilter throws if no record is found, which is the expected case here.
            DEBUG && console.log('ERROR inside isVerified try/catch: ', err);
        }
    }
    e.next();
}, 'users');
