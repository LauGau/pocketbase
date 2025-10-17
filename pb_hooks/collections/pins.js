// After a user create successfully a "pin"
// - We check the attachments and confim them
onRecordAfterCreateSuccess((e) => {
    const DEBUG = false;
    const record = e.record;
    const updateStorageUsage = require(`${__hooks}/utils/update-storage-usage.js`);

    // Add programatically populate the "number" field of a pin
    let targetPinCollectionId = e.record.get('pinCollection');

    // try to update with the pinNumberField with a specific count
    try {
        const pinsCount = $app.countRecords(
            'pins',
            $dbx.hashExp({ pinCollection: targetPinCollectionId })
        );
        e.record.set('number', pinsCount + 1);
    } catch (err) {
        console.log(
            "onRecordAfterCreateSuccess failed to add the pin 'number' field",
            err
        );
    }

    // first we log the "pin_created"event
    const createLog = require(`${__hooks}/utils/create-log.js`);
    const logData = {
        type: 'pin_created',
        user: e.record.get('creator'),
        pin: e.record.get('id'),
        pinCollection: e.record.get('pinCollection'),
        data: e.record,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));
    createLog($app, logData);

    // Safely parse attachmentsToCreate, providing a fallback to an empty array string
    // to prevent errors if the field is null.

    $app.logger().debug(
        'Going to JSON.parse after create success...',
        'pinId',
        record.id,
        'e',
        e
    );
    const attachmentsToCreate = JSON.parse(
        record.get('attachmentsToCreate') || '[]'
    );
    const attachmentsToConfirm = JSON.parse(
        record.get('attachmentsToConfirm') || '[]'
    );

    $app.logger().debug(
        'Pin created successfully. Processing attachments...',
        'pinId',
        record.id,
        'e',
        e
    );

    $app.logger().debug(
        'Typo of attachmentsToCreate',
        'type',
        typeof attachmentsToCreate,
        'isArray',
        Array.isArray(attachmentsToCreate),
        'arrayLength',
        attachmentsToCreate.length,
        'attachmentsToCreate',
        attachmentsToCreate
    );

    const hasAttachmentsToProcess =
        attachmentsToCreate.length > 0 || attachmentsToConfirm != null;

    if (!hasAttachmentsToProcess) {
        $app.logger().debug(
            'No attachments to process for pin.',
            'pinId',
            record.id
        );
        return; // Nothing to do
    }

    try {
        const collection = $app.findCollectionByNameOrId('attachments');
        // we use runInTransaction to batch process the attachments
        $app.runInTransaction((txApp) => {
            // 1. Create new attachments
            if (attachmentsToCreate && attachmentsToCreate.length > 0) {
                $app.logger().debug(
                    `Creating ${attachmentsToCreate.length} new attachments...`,
                    'pinId',
                    record.id,
                    'pinCollection',
                    record.pinCollection
                );
                for (const attData of attachmentsToCreate) {
                    try {
                        const attachment = new Record(collection);

                        // This is NOT working in JSVM as TextEncoder is not available...
                        // const attachmentSize = new TextEncoder().encode(
                        //     JSON.stringify(attData.data)
                        // ).length;

                        // ... so we neeed to do this instead
                        const attachmentSize = unescape(
                            encodeURIComponent(JSON.stringify(attData.data))
                        ).length;

                        attachment.set(
                            'pinCollection',
                            record.get('pinCollection')
                        );
                        attachment.set('pin', record.id);
                        attachment.set('type', attData.type);
                        attachment.set('data', attData.data);
                        attachment.set('size', attachmentSize);
                        attachment.set('status', 'confirmed');
                        attachment.set('order', attData.newOrder); // why are we adding 1.0 ?
                        attachment.set('creator', record.get('creator')); // Ensure creator is set
                        txApp.save(attachment);
                        $app.logger().debug(
                            `Created attachment: ${attachment.id}`
                        );
                    } catch (error) {
                        $app.logger().error(
                            `Failed to create attachment`,
                            'error',
                            error,
                            'attachmentData',
                            attData
                        );
                        throw error; // Rollback transaction on failure
                    }
                }
            }

            // 2. Confirm pre-uploaded attachments
            if (attachmentsToConfirm && attachmentsToConfirm.length > 0) {
                $app.logger().debug(
                    `Confirming ${attachmentsToConfirm.length} existing attachments...`,
                    'pinId',
                    record.id
                );
                for (const attData of attachmentsToConfirm) {
                    try {
                        const attachment = txApp.findRecordById(
                            'attachments',
                            attData.id
                        );
                        attachment.set(
                            'pinCollection',
                            record.get('pinCollection')
                        );
                        attachment.set('pin', record.id);
                        attachment.set('order', attData.order); // why are we adding 1.0 ?
                        attachment.set('status', 'confirmed');

                        txApp.save(attachment);

                        // Manually trigger storage update for confirmed files,
                        // as txApp.save() does not trigger other hooks.
                        const attachmentSize = attachment.getInt('size');
                        updateStorageUsage(
                            txApp,
                            attachmentSize,
                            record.get('pinCollection')
                        );

                        $app.logger().debug(
                            `Confirmed attachment: ${attData.id}`
                        );
                    } catch (error) {
                        $app.logger().error(
                            `Failed to confirm attachment`,
                            'error',
                            error,
                            'attachmentId',
                            attData.id
                        );
                        throw error; // Rollback transaction on failure
                    }
                }
            }

            // Clear the temporary fields on the pin record to keep the database clean.
            record.set('attachmentsToCreate', null);
            record.set('attachmentsToConfirm', null);
            txApp.save(record);
            $app.logger().debug(
                'Temporary attachment fields cleared for pin',
                'pinId',
                record.id
            );
        });

        $app.logger().debug(
            'All attachments processed successfully in transaction.',
            'pinId',
            record.id
        );
    } catch (error) {
        $app.logger().error(
            'Error during attachment processing transaction:',
            'error',
            error,
            'pinId',
            record.id
        );
    } finally {
        e.next();
    }
}, 'pins');

/**
 * After a user successfully updates a "pin", we process any new or confirmed attachments.
 * This logic is similar to the onRecordAfterCreateSuccess hook.
 */

onRecordAfterUpdateSuccess((e) => {
    const DEBUG = false;
    const createLog = require(`${__hooks}/utils/create-log.js`);
    const updateStorageUsage = require(`${__hooks}/utils/update-storage-usage.js`);
    const record = e.record;

    DEBUG && console.log('MAIN.PB.JS, onRecordAfterUpdateSuccess() called...');

    $app.logger().debug(
        'Going to JSON.parse after update success...',
        'pinId',
        record.id,
        'e',
        e
    );
    const attachmentsToCreate = JSON.parse(
        record.get('attachmentsToCreate') || '[]'
    );
    const attachmentsToConfirm = JSON.parse(
        record.get('attachmentsToConfirm') || '[]'
    );

    $app.logger().debug(
        'Pin updated successfully. Processing attachments...',
        'pinId',
        record.id
    );

    const hasAttachmentsToProcess =
        (attachmentsToCreate && attachmentsToCreate.length > 0) ||
        (attachmentsToConfirm && attachmentsToConfirm.length > 0);

    if (!hasAttachmentsToProcess) {
        $app.logger().debug(
            'No attachments to process for pin update.',
            'pinId',
            record.id
        );
        return; // Nothing to do
    }

    try {
        const collection = $app.findCollectionByNameOrId('attachments');
        // We use runInTransaction to batch process the attachments
        $app.runInTransaction((txApp) => {
            // 1. Create new attachments
            if (attachmentsToCreate && attachmentsToCreate.length > 0) {
                $app.logger().debug(
                    `Creating ${attachmentsToCreate.length} new attachments...`,
                    'pinId',
                    record.id
                );
                for (const attData of attachmentsToCreate) {
                    try {
                        const attachment = new Record(collection);

                        // This is NOT working in JSVM as TextEncoder is not available...
                        // const attachmentSize = new TextEncoder().encode(
                        //     JSON.stringify(attData.data)
                        // ).length;

                        // ... so we neeed to do this instead
                        const attachmentSize = unescape(
                            encodeURIComponent(JSON.stringify(attData.data))
                        ).length;

                        attachment.set(
                            'pinCollection',
                            record.get('pinCollection')
                        );
                        attachment.set('pin', record.id);
                        attachment.set('type', attData.type); //only for attRichText for now
                        attachment.set('data', attData.data);
                        attachment.set('size', attachmentSize);
                        attachment.set('status', 'confirmed');
                        attachment.set('order', attData.newOrder); // I was uising +1.0 but don't remember why
                        attachment.set('creator', record.get('creator')); // Ensure creator is set
                        txApp.save(attachment);
                        $app.logger().debug(
                            `Created attachment: ${attachment.id}`
                        );
                    } catch (error) {
                        $app.logger().error(
                            `Failed to create attachment`,
                            'error',
                            error,
                            'attachmentData',
                            attData
                        );
                        throw error; // Rollback transaction on failure
                    }
                }
            }

            // 2. Confirm pre-uploaded attachments
            if (attachmentsToConfirm && attachmentsToConfirm.length > 0) {
                $app.logger().debug(
                    `Confirming ${attachmentsToConfirm.length} existing attachments...`,
                    'pinId',
                    record.id
                );
                for (const attData of attachmentsToConfirm) {
                    try {
                        const attachment = txApp.findRecordById(
                            'attachments',
                            attData.id
                        );
                        attachment.set(
                            'pinCollection',
                            record.get('pinCollection')
                        );
                        attachment.set('pin', record.id);
                        attachment.set('order', attData.order); // I was uising +1.0 but don't remember why
                        attachment.set('status', 'confirmed');

                        // Manually trigger storage update for confirmed files,
                        // as txApp.save() does not trigger other hooks.
                        const attachmentSize = attachment.getInt('size');
                        updateStorageUsage(
                            txApp,
                            attachmentSize,
                            record.get('pinCollection')
                        );

                        txApp.save(attachment);
                        $app.logger().debug(
                            `Confirmed attachment: ${attData.id}`
                        );
                    } catch (error) {
                        $app.logger().error(
                            `Failed to confirm attachment`,
                            'error',
                            error,
                            'attachmentId',
                            attData.id
                        );
                        throw error; // Rollback transaction on failure
                    }
                }
            }

            // Clear the temporary fields on the pin record to keep the database clean.
            record.set('attachmentsToCreate', null);
            record.set('attachmentsToConfirm', null);
            txApp.save(record);
            $app.logger().debug(
                'Temporary attachment fields cleared for pin',
                'pinId',
                record.id
            );
        });

        $app.logger().debug(
            'All attachments processed successfully in transaction.',
            'pinId',
            record.id
        );
    } catch (error) {
        $app.logger().error(
            'Error during attachment processing transaction:',
            'error',
            error,
            'pinId',
            record.id
        );
    }
}, 'pins');

onRecordUpdateRequest((e) => {
    const utilsUrls = require(`${__hooks}/utils/urls.js`); // import the utils
    const authRecord = e.auth; // The authenticated user record

    if (!authRecord) {
        // If a user MUST be authenticated to create this record, throw an error.
        // This will prevent the record from being created and return a 400 response.
        throw new BadRequestError(
            'You must be logged in to create a pin or attachment.'
        );
    }

    /*
     *  —————————————————————————————————————————————
     *  WARNING: always parse JSON to enable chaining
     *
     *  urlMatchingData = e.record.original().get('urlMatching') // Without JSONS.parse...
     *  urlMatchingData.patterns // ... this will not work
     */
    const urlMatchingData = JSON.parse(e.record.get('urlMatching'));

    const TESTDATA = {
        example: 'https://google.com/mail/',
        patterns: [
            '*://*.upwwward.io/*',
            '*://google.com/map/',
            '*://trema.upwwward.io/*',
        ],
        type: 'src',
    };

    const newUrlMatching = {
        domains: utilsUrls.patternsToDomains(urlMatchingData.patterns),
        patterns: urlMatchingData.patterns,
        type: urlMatchingData.type,
    };

    e.record.set('urlMatching', newUrlMatching); // replace "newUrlMatching by TESTDATA for quick test"
    e.next();
}, 'pins');

// TODO: see how I can merge with the function above, ask Vince ?
onRecordCreateRequest((e) => {
    const utilsUrls = require(`${__hooks}/utils/urls.js`); // import the utils
    const authRecord = e.auth; // The authenticated user record

    if (!authRecord) {
        // If a user MUST be authenticated to create this record, throw an error.
        // This will prevent the record from being created and return a 400 response.
        throw new BadRequestError(
            'You must be logged in to create a pin or attachment.'
        );
    }

    /*
     *  —————————————————————————————————————————————
     *  WARNING: always parse JSON to enable chaining
     *
     *  urlMatchingData = e.record.original().get('urlMatching') // Without JSONS.parse...
     *  urlMatchingData.patterns // ... this will not work
     */
    const urlMatchingData = JSON.parse(e.record.get('urlMatching'));

    const TESTDATA = {
        example: 'https://google.com/mail/',
        patterns: [
            '*://*.upwwward.io/*',
            '*://google.com/map/',
            '*://trema.upwwward.io/*',
        ],
        type: 'src',
    };

    const newUrlMatching = {
        domains: utilsUrls.patternsToDomains(urlMatchingData.patterns),
        patterns: urlMatchingData.patterns,
        type: urlMatchingData.type,
    };

    e.record.set('urlMatching', newUrlMatching); // replace "newUrlMatching by TESTDATA for quick test"
    e.next();
}, 'pins');
