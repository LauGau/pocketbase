/**
 * Updates the storage usage counters for a pinCollection and its associated workspace.
 *
 * @param {object} app The PocketBase app instance ($app or a transaction txApp).
 * @param {number} sizeDiff The difference in size to apply. Use a positive value to increase
 *                          storage (on create/confirm) and a negative value to decrease it (on delete).
 * @param {string} pinCollectionId The ID of the pinCollection to update.
 */
const updateStorageUsage = (app, sizeDiff, pinCollectionId) => {
    const DEBUG = false;

    if (sizeDiff === 0 || !pinCollectionId) {
        DEBUG &&
            console.log(
                'updateStorageUsage: No change in size or no pinCollectionId, skipping.'
            );
        return;
    }

    try {
        const pinCollection = app.findRecordById(
            'pinCollections',
            pinCollectionId
        );
        const workspaceId = pinCollection.getString('workspace');

        if (!workspaceId) {
            app.logger().warn(
                'updateStorageUsage: pinCollection is not associated with a workspace.',
                'pinCollectionId',
                pinCollectionId
            );
            return;
        }

        // Update pinCollection storage
        app.db()
            .newQuery(
                'UPDATE pinCollections SET storage_used = MAX(0, storage_used + {:diff}) WHERE id = {:id}'
            )
            .bind({ diff: sizeDiff, id: pinCollectionId })
            .execute();

        // Update workspace storage
        app.db()
            .newQuery(
                'UPDATE workspaces SET storage_used = MAX(0, storage_used + {:diff}) WHERE id = {:id}'
            )
            .bind({ diff: sizeDiff, id: workspaceId })
            .execute();

        DEBUG &&
            console.log(
                `updateStorageUsage: Updated storage by ${sizeDiff} for pinCollection ${pinCollectionId}`
            );
    } catch (err) {
        app.logger().error(
            'Failed to update storage usage.',
            'pinCollectionId',
            pinCollectionId,
            'sizeDiff',
            sizeDiff,
            'error',
            err
        );
        // We don't re-throw here to avoid failing the parent operation just because of a counter update.
    }
};

module.exports = updateStorageUsage;
