// After a user create a "pinCollection"
// - We add the user as owner to it
onRecordCreateRequest((e) => {
    const record = e.record; // The record being created (can be modified directly)
    const authRecord = e.auth; // The authenticated user record
    const userProfile = e.requestInfo().body.userProfile; // we get the custom parametter

    // Safety 1. Validate the type
    if (typeof userProfile !== 'string') {
        throw new BadRequestError("The 'userProfile' must be a string.");
    }

    // Safety 2. Validate the length
    const MAX_LENGTH = 50;
    if (userProfile.length > MAX_LENGTH) {
        throw new BadRequestError(
            `The userProfile cannot exceed ${MAX_LENGTH} characters.`
        );
    }

    // It's a good practice to ensure a user is authenticated.
    // If no user is authenticated (e.g. an admin creating a record via UI, or an API key request),
    // authRecord will be null.
    if (!authRecord) {
        // If a user MUST be authenticated to create this record, throw an error.
        // This will prevent the record from being created and return a 400 response.
        throw new BadRequestError(
            'You must be logged in to create a pin collection.'
        );
    }

    // Set the 'owner' field directly on the record object
    // record.set('owner', authRecord.id);

    e.next(); // needed to be able to access the e.record.id bellow

    let collectionMembersTable =
        $app.findCollectionByNameOrId('collectionMembers');
    let newCollectionMemberRecord = new Record(collectionMembersTable);
    newCollectionMemberRecord.set('user', authRecord.id); // e.auth.id doesn't seems available
    newCollectionMemberRecord.set('pinCollection', e.record.get('id'));
    newCollectionMemberRecord.set('role', 'owner');
    newCollectionMemberRecord.set('status', 'approved');
    newCollectionMemberRecord.set('userProfile', userProfile);
    $app.save(newCollectionMemberRecord);
}, 'pinCollections');

/**
 * After a new 'pinCollection' is CREATED,
 * find its workspace and increment the collections_count.
 */
onRecordAfterCreateSuccess((e) => {
    const newPinCollection = e.record;
    const workspaceId = newPinCollection.get('workspace'); // Get ID from the relation field

    if (!workspaceId) {
        e.next();
        return; // No workspace linked, do nothing
    }
    try {
        // Atomically increment the collections_count on the parent workspace.
        // This uses a direct SQL query to avoid triggering the workspace's afterUpdate hook.
        $app.db()
            .newQuery(
                'UPDATE workspaces SET collections_count = collections_count + 1 WHERE id = {:workspaceId}'
            )
            .bind({ workspaceId: workspaceId })
            .execute();
    } catch (err) {
        console.log(
            `[pinCollection Create]: Error updating collections_count count for workspace ${workspaceId}:`,
            err
        );
        // Don't throw here, or it might roll back the create operation
    }
    e.next();
}, 'pinCollections'); // Only run for the 'pinCollections' collection

/**
 * After a new 'pinCollection' is DELETED,
 * find its workspace and decrement the collections_count.
 */
onRecordAfterDeleteSuccess((e) => {
    const deletedCollection = e.record;
    const workspaceId = deletedCollection.get('workspace');

    if (!workspaceId) {
        e.next();
        return; // No workspace linked, do nothing
    }

    try {
        // Atomically decrement the collections_count on the parent workspace.
        $app.db()
            .newQuery(
                'UPDATE workspaces SET collections_count = MAX(0, collections_count - 1) WHERE id = {:workspaceId}'
            )
            .bind({ workspaceId: workspaceId })
            .execute();

        // After a collection is deleted, its storage is gone, so we must recalculate the total.
        const recalculateWorkspaceStorage = require(`${__hooks}/utils/recalculate-workspace-storage.js`);
        recalculateWorkspaceStorage($app, workspaceId);
    } catch (err) {
        $app.logger().error(
            `[pinCollection Delete]: Error updating counters for workspace ${workspaceId}:`,
            'pinCollectionId',
            deletedCollection.id,
            err
        );
    }
    e.next();
}, 'pinCollections'); // Only run for the 'pinCollections' collection

/**
 * Before a "pinCollection" is updated, this hook checks for workspace changes.
 *
 * If the `workspace` field has changed, it:
 * 1. Validates if the new workspace has enough storage capacity.
 * 2. If it does, it proceeds with the update and then triggers a recalculation
 *    of storage for both the old and new workspaces.
 */
onRecordUpdateRequest((e) => {
    const DEBUG = true;
    const record = e.record;
    const original = e.record.original();

    const oldWorkspaceId = original.get('workspace');
    const newWorkspaceId = record.get('workspace');

    // Proceed only if the workspace has actually changed
    if (oldWorkspaceId === newWorkspaceId) {
        return e.next(); // No change, continue with the update.
    }

    DEBUG &&
        console.log(
            `Workspace changed for pinCollection ${record.id} from ${oldWorkspaceId} to ${newWorkspaceId}`
        );

    const collectionStorageUsed = record.getInt('storage_used');

    // --- 1. Validate storage in the new workspace ---
    try {
        const newWorkspace = $app.findRecordById('workspaces', newWorkspaceId);
        const storageLimit = newWorkspace.getInt('storage_limit');
        const currentUsage = newWorkspace.getInt('storage_used');

        // Check if the new workspace can accommodate the collection's storage.
        // storageLimit = 0 means unlimited.
        if (
            storageLimit > 0 &&
            currentUsage + collectionStorageUsed > storageLimit
        ) {
            throw new BadRequestError(
                'Moving this collection would exceed the new workspace storage limit.'
            );
        }
    } catch (err) {
        $app.logger().error(
            'Error validating new workspace storage.',
            'error',
            err
        );
        // Re-throw BadRequestError or any other validation error to stop the update.
        throw err;
    }

    // Allow the record update to proceed
    e.next();

    // --- 2. Recalculate storage for both workspaces after the update succeeds ---
    // This part runs only if e.next() was successful.
    const recalculateWorkspaceStorage = require(`${__hooks}/utils/recalculate-workspace-storage.js`);

    // Use a try-catch to ensure that a failure in recalculation doesn't
    // break the entire request flow, as it's a background maintenance task.
    try {
        // Recalculate the new workspace's storage
        if (newWorkspaceId) {
            recalculateWorkspaceStorage($app, newWorkspaceId);
        }

        // Recalculate the old workspace's storage
        if (oldWorkspaceId) {
            recalculateWorkspaceStorage($app, oldWorkspaceId);
        }
    } catch (err) {
        $app.logger().error(
            'An error occurred during workspace storage recalculation after moving a pinCollection.',
            'error',
            err
        );
    }
}, 'pinCollections');
