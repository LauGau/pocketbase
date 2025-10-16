/// <reference path="../pb_data/types.d.ts" />

/**
 * Recalculates and updates the total storage used for a given workspace.
 *
 * This function aggregates the `storage_used` from all `pinCollections`
 * belonging to the specified workspace and updates the workspace's
 * `storage_used` field with the new total.
 *
 * @param {object} app The PocketBase app instance ($app or a transaction txApp).
 * @param {string} workspaceId The ID of the workspace to recalculate.
 */
const recalculateWorkspaceStorage = (app, workspaceId) => {
    const DEBUG = true;

    if (!workspaceId) {
        app.logger().warn(
            'recalculateWorkspaceStorage: workspaceId not provided, skipping.'
        );
        return;
    }

    DEBUG &&
        console.log(
            `recalculateWorkspaceStorage: Recalculating storage for workspace ${workspaceId}`
        );

    try {
        // Define the shape of the expected result for the aggregation query.
        const result = new DynamicModel({
            id: '',
            total: 0,
        });

        // Use a single aggregation query to sum the storage of all pinCollections in the workspace
        // and populate the result model. A dummy `id` is selected to ensure compatibility
        // with the `.one()` method, which expects a unique identifier.
        app.db()
            .newQuery(
                "SELECT 'storage_sum' as id, SUM(storage_used) as total FROM pinCollections WHERE workspace = {:workspaceId}"
            )
            .bind({ workspaceId: workspaceId })
            .one(result);

        const newTotalUsage = result.total || 0;

        DEBUG &&
            console.log(
                '👀 recalculateWorkspaceStorage: newTotalUsage = ',
                newTotalUsage
            );

        // Update the workspace's storage_used field with the new aggregated value.
        const workspace = app.findRecordById('workspaces', workspaceId);
        workspace.set('storage_used', newTotalUsage);
        app.save(workspace);

        DEBUG &&
            console.log(
                `recalculateWorkspaceStorage: Workspace ${workspaceId} updated to ${newTotalUsage} bytes.`
            );
    } catch (err) {
        app.logger().error(
            'Failed to recalculate workspace storage.',
            'workspaceId',
            workspaceId,
            'error',
            err
        );
        // We don't re-throw here to avoid failing the parent operation just because of a counter update.
    }
};

module.exports = recalculateWorkspaceStorage;
