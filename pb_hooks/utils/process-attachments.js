/**
 * Processes attachments for a parent record (pin or comment) after creation or update.
 * This utility handles creating new attachments and confirming pre-uploaded ones
 * within a single database transaction.
 *
 * @param {core.App} app The PocketBase app instance.
 * @param {core.Record} parentRecord The parent record (pin or comment) that contains the attachments.
 * @param {string} parentType The type of the parent record ('pin' or 'comment').
 */
const processAttachments = (app, parentRecord, parentType) => {
    const DEBUG = false;
    const updateStorageUsage = require(`${__hooks}/utils/update-storage-usage.js`);

    DEBUG && console.log('processAttachments() called...');
    DEBUG && console.log('parentRecord = ', JSON.stringify(parentRecord));
    DEBUG && console.log('parentType = ', JSON.stringify(parentType));

    const attachmentsToCreate = JSON.parse(
        parentRecord.get('attachmentsToCreate') || '[]'
    );
    const attachmentsToConfirm = JSON.parse(
        parentRecord.get('attachmentsToConfirm') || '[]'
    );

    const hasAttachmentsToProcess =
        (attachmentsToCreate && attachmentsToCreate.length > 0) ||
        (attachmentsToConfirm && attachmentsToConfirm.length > 0);

    if (!hasAttachmentsToProcess) {
        DEBUG &&
            console.log(
                'No attachments to process for record.',
                'recordId',
                parentRecord.id
            );
        app.logger().debug(
            'No attachments to process for record.',
            'recordId',
            parentRecord.id
        );
        return;
    }

    try {
        const attachmentsCollection =
            app.findCollectionByNameOrId('attachments');

        app.runInTransaction((txApp) => {
            // 1. Create new attachments (e.g., richtext)
            if (attachmentsToCreate && attachmentsToCreate.length > 0) {
                app.logger().debug(
                    `Creating ${attachmentsToCreate.length} new attachments...`,
                    'recordId',
                    parentRecord.id
                );
                for (const attData of attachmentsToCreate) {
                    try {
                        const attachment = new Record(attachmentsCollection);

                        const attachmentSize = unescape(
                            encodeURIComponent(JSON.stringify(attData.data))
                        ).length;

                        attachment.set('pin', parentRecord.get('pin'));
                        attachment.set(
                            'pinCollection',
                            parentRecord.get('pinCollection')
                        );
                        attachment.set(parentType, parentRecord.id); // 'pin' or 'comment'
                        attachment.set('type', attData.type);
                        attachment.set('data', attData.data);
                        attachment.set('size', attachmentSize);
                        attachment.set('status', 'confirmed');
                        attachment.set('order', attData.newOrder);
                        attachment.set('creator', parentRecord.get('creator'));

                        txApp.save(attachment);
                        app.logger().debug(
                            `Created attachment: ${attachment.id}`
                        );
                    } catch (error) {
                        app.logger().error(
                            `Failed to create attachment`,
                            'error',
                            error,
                            'attachmentData',
                            attData
                        );
                        throw error; // Rollback transaction
                    }
                }
            }

            // 2. Confirm pre-uploaded attachments (e.g., files)
            if (attachmentsToConfirm && attachmentsToConfirm.length > 0) {
                app.logger().debug(
                    `Confirming ${attachmentsToConfirm.length} existing attachments...`,
                    'recordId',
                    parentRecord.id
                );
                for (const attData of attachmentsToConfirm) {
                    try {
                        const attachment = txApp.findRecordById(
                            'attachments',
                            attData.id
                        );
                        attachment.set('pin', parentRecord.get('pin'));
                        attachment.set(
                            'pinCollection',
                            parentRecord.get('pinCollection')
                        );
                        attachment.set(parentType, parentRecord.id); // 'pin' or 'comment'
                        attachment.set('order', attData.order);
                        attachment.set('status', 'confirmed');

                        txApp.save(attachment);

                        // Manually trigger storage update for confirmed files,
                        // as txApp.save() does not trigger other hooks.
                        const attachmentSize = attachment.getInt('size');
                        updateStorageUsage(
                            txApp,
                            attachmentSize,
                            parentRecord.get('pinCollection')
                        );

                        app.logger().debug(
                            `Confirmed attachment: ${attData.id}`
                        );
                    } catch (error) {
                        app.logger().error(
                            `Failed to confirm attachment`,
                            'error',
                            error,
                            'attachmentId',
                            attData.id
                        );
                        throw error; // Rollback transaction
                    }
                }
            }

            // 3. Clear temporary fields on the parent record
            parentRecord.set('attachmentsToCreate', null);
            parentRecord.set('attachmentsToConfirm', null);
            txApp.save(parentRecord);
            app.logger().debug(
                'Temporary attachment fields cleared for record',
                'recordId',
                parentRecord.id
            );
        });
        DEBUG &&
            console.log(
                'All attachments processed successfully in transaction for recordId: ',
                parentRecord.id
            );
        app.logger().debug(
            'All attachments processed successfully in transaction.',
            'recordId',
            parentRecord.id
        );
    } catch (error) {
        DEBUG &&
            console.log(
                'Error during attachment processing transaction:',
                'error',
                error,
                'recordId',
                parentRecord.id
            );
        app.logger().error(
            'Error during attachment processing transaction:',
            'error',
            error,
            'recordId',
            parentRecord.id
        );
    }
};

module.exports = processAttachments;
