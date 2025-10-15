/// <reference path="../pb_data/types.d.ts" />

/**
 * HOOK: attachments.create (validation part)
 *
 * Before an attachment record is created, this hook:
 * 1. Calculates the size of the attachment (whether it's a file or text content).
 * 2. Sets the `size` field on the new attachment record.
 * 3. Fetches the related workspace to check the storage limit.
 * 4. Throws an error if the new attachment would exceed the workspace's storage limit.
 */

onRecordCreateRequest((e) => {
    const DEBUG = true;
    const attachment = e.record;
    let attachmentSize = 0;

    DEBUG && console.log('attachment.create file =', e.requestInfo().body.file);

    try {
        // --- Part 1: Validation (Before saving) ---
        const file = e.requestInfo().body.file;
        if (file && file.size) {
            attachmentSize = file.size;
        } else {
            const content = attachment.getString('data');
            DEBUG && console.log('measuring size of content =', content);
            attachmentSize = new TextEncoder().encode(content).length;
            DEBUG && console.log('attachmentSize = ', attachmentSize);
        }
        attachment.set('size', attachmentSize);

        DEBUG && console.log('attachment.size =', attachmentSize);

        // The pinCollection might not be set on initial "pending" attachment creation.
        // In that case, we can skip the storage validation for now.
        const pinCollectionId = attachment.getString('pinCollection');
        DEBUG && console.log('pinCollectionId =', pinCollectionId);

        if (pinCollectionId) {
            const pinCollection = $app.findRecordById(
                'pinCollections',
                pinCollectionId
            );
            DEBUG && console.log('pinCollection =', pinCollection);

            const workspace = $app.findRecordById(
                'workspaces',
                pinCollection.getString('workspace')
            );
            DEBUG && console.log('workspace =', workspace);

            const storageLimit = workspace.getInt('storage_limit');
            const currentUsage = workspace.getInt('storage_used');

            if (
                storageLimit > 0 &&
                currentUsage + attachmentSize > storageLimit
            ) {
                throw new BadRequestError(
                    'This upload would exceed your workspace storage limit.'
                );
            }
        } else {
            DEBUG &&
                console.log('No pinCollectionId, skipping storage validation.');
        }
    } catch (err) {
        // Re-throw any validation errors to prevent record creation
        throw new BadRequestError(
            `Attachment validation failed: ${err.message}`
        );
    }
    e.next();
}, 'attachments');

/**
 * HOOK: attachments.create (counter update part)
 *
 * After an attachment is successfully created, this hook updates the
 * `storage_used` counters on the parent pinCollection and workspace.
 */
onRecordAfterCreateSuccess((e) => {
    const DEBUG = true;
    const attachment = e.record;
    const attachmentSize = attachment.getInt('size');

    DEBUG && console.log('onRecordAfterCreateSuccess attachment =', attachment);

    if (attachmentSize > 0) {
        try {
            // The pinCollection should be available now, as this hook runs after successful creation
            // where the main.pb.js logic would have set it.
            const pinCollectionId = attachment.getString('pinCollection');
            if (!pinCollectionId) return; // Should not happen, but as a safeguard.

            const pinCollection = $app.findRecordById(
                'pinCollections',
                pinCollectionId
            );

            // Update pinCollection storage
            $app.db()
                .newQuery(
                    'UPDATE pinCollections SET storage_used = storage_used + {:size} WHERE id = {:id}'
                )
                .bind({ size: attachmentSize, id: pinCollection.id })
                .execute();

            // Update workspace storage
            $app.db()
                .newQuery(
                    'UPDATE workspaces SET storage_used = storage_used + {:size} WHERE id = {:id}'
                )
                .bind({
                    size: attachmentSize,
                    id: pinCollection.getString('workspace'),
                })
                .execute();
        } catch (err) {
            $app.logger().error(
                'Failed to update storage counters on attachment create.',
                'attachmentId',
                attachment.id,
                'error',
                err
            );
        }
    }
}, 'attachments');

/**
 * HOOK: attachments.update (validation and counter update part)
 *
 * Before a "richtext" attachment is updated, this hook:
 * 1. Calculates the new size of the content.
 * 2. Sets the new `size` on the record.
 * 3. Calculates the difference in size compared to the original.
 * 4. Validates that the change does not exceed the workspace storage limit.
 * 5. Updates the `storage_used` counters on the parent pinCollection and workspace.
 *
 * Note: This is done in a single `onRecordUpdateRequest` hook because we need both
 * the original and new record states to calculate the size difference.
 */
onRecordUpdateRequest((e) => {
    const DEBUG = true;
    const attachment = e.record;

    DEBUG && console.log('onRecordUpdateRequest attachment =', attachment);

    // This logic is only for 'richtext' attachments, as other types are not updated this way.
    // if (attachment.get('type') !== 'richtext') {
    //     e.next();
    //     return;
    // }

    try {
        const originalSize = attachment.original().getInt('size');
        const content = attachment.getString('data');
        const newSize = unescape(
            encodeURIComponent(JSON.stringify(content))
        ).length;

        DEBUG && console.log('originalSize =', originalSize);
        DEBUG && console.log('newSize =', newSize);
        const sizeDiff = newSize - originalSize;

        // Update the size on the record being saved
        attachment.set('size', newSize);

        // If size hasn't changed, no need to check storage or update counters
        if (sizeDiff === 0) {
            e.next();
            return;
        }

        const pinCollectionId = attachment.getString('pinCollection');
        if (pinCollectionId) {
            const pinCollection = $app.findRecordById(
                'pinCollections',
                pinCollectionId
            );
            const workspace = $app.findRecordById(
                'workspaces',
                pinCollection.getString('workspace')
            );

            const storageLimit = workspace.getInt('storage_limit');
            const currentUsage = workspace.getInt('storage_used');

            // 1. Validation
            if (storageLimit > 0 && currentUsage + sizeDiff > storageLimit) {
                throw new BadRequestError(
                    'This update would exceed your workspace storage limit.'
                );
            }

            // Proceed with the actual DB update for the attachment
            e.next();

            // 2. Update Counters (only runs if e.next() was successful)
            const workspaceId = pinCollection.getString('workspace');
            $app.db()
                .newQuery(
                    'UPDATE pinCollections SET storage_used = storage_used + {:diff} WHERE id = {:id}'
                )
                .bind({ diff: sizeDiff, id: pinCollectionId })
                .execute();
            $app.db()
                .newQuery(
                    'UPDATE workspaces SET storage_used = storage_used + {:diff} WHERE id = {:id}'
                )
                .bind({ diff: sizeDiff, id: workspaceId })
                .execute();
        } else {
            // Should not happen for an existing attachment, but as a safeguard.
            e.next();
        }
    } catch (err) {
        $app.logger().error(
            'Failed to process attachment update.',
            'attachmentId',
            attachment.id,
            'error',
            err
        );
        throw new BadRequestError(`Attachment update failed: ${err.message}`);
    }
}, 'attachments');

/**
 * HOOK: attachments.delete
 *
 * After an attachment is successfully deleted, this hook updates the
 * `storage_used` counters on the parent pinCollection and workspace.
 */
onRecordAfterDeleteSuccess((e) => {
    const attachment = e.record;
    const attachmentSize = attachment.getInt('size');

    if (attachmentSize > 0) {
        try {
            // The related records (pin, pinCollection) might already be deleted, so we check.
            const pinCollection = $app.findFirstRecordByFilter(
                'pinCollections',
                'id = {:id}',
                { id: attachment.get('pinCollection') }
            );
            if (pinCollection) {
                // Update pinCollection storage
                $app.db()
                    .newQuery(
                        'UPDATE pinCollections SET storage_used = storage_used - {:size} WHERE id = {:id}'
                    )
                    .bind({ size: attachmentSize, id: pinCollection.id })
                    .execute();

                // Update workspace storage
                $app.db()
                    .newQuery(
                        'UPDATE workspaces SET storage_used = storage_used - {:size} WHERE id = {:id}'
                    )
                    .bind({
                        size: attachmentSize,
                        id: pinCollection.getString('workspace'),
                    })
                    .execute();
            }
        } catch (err) {
            $app.logger().error(
                'Failed to update storage counters on attachment delete.',
                'attachmentId',
                attachment.id,
                'error',
                err
            );
        }
    }
}, 'attachments');
