/** /////////////////////////////////////////////////
 * PINS
 */ //////////////////////////////////////////////////

onRecordAfterCreateSuccess((e) => {
    const DEBUG = true;

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);

    e.next();

    DEBUG && console.log('e.record= ', JSON.stringify(e.record));

    const logData = {
        type: 'pin_created',
        user: e.record.get('creator'),
        pin: e.record.get('id'),
        pinCollection: e.record.get('pinCollection'),
        data: e.record,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);
}, 'pins');

onRecordUpdateRequest((e) => {
    const DEBUG = true;
    DEBUG && console.log('onRecordUpdateRequest called for pinCollections');

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);
    const generateJsonDiff = require(`${__hooks}/utils/generate-jsondiff.js`);

    e.next(); // need to be above to be able to access the pinCollection.id

    // --- Check if this is an update immediately after creation ---
    // We compare timestamps to avoid creating a `pin_updated` log during the
    // initial creation flow (which involves an update to set the pin number or process attachments).
    // A small threshold (e.g., 2 seconds) accounts for any minor processing delays.
    const created = new Date(e.record.get('created'));
    const updated = new Date(e.record.get('updated'));
    const diffInSeconds = (updated - created) / 1000;
    const isUpdateAfterCreate = diffInSeconds < 2;

    if (!isUpdateAfterCreate) {
        const diff = generateJsonDiff(e.record.original(), e.record);
        DEBUG && console.log('diff = ', JSON.stringify(diff));

        if (!diff) {
            return; // nothing to log
        }

        const logData = {
            type: 'pin_updated',
            user: e.auth.id, // the person who made request
            pinCollection: e.record.get('pinCollection'),
            pin: e.record.get('id'),
            attachment: null,
            comment: null,
            data: e.record, // The new state of the record
            diff: diff,
        };

        DEBUG && console.log('logData to create: ', JSON.stringify(logData));
        createLog($app, logData);
    }
}, 'pins');

onRecordDeleteRequest((e) => {
    const DEBUG = true;

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);

    e.next();

    DEBUG && console.log('e.record= ', JSON.stringify(e.record));

    const logData = {
        type: 'pin_deleted',
        user: e.auth.id, // the person who made request
        pin: e.record.get('id'),
        pinCollection: e.record.get('pinCollection'),
        data: e.record,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);
}, 'pins');

/** /////////////////////////////////////////////////
 * ATTACHMENTS
 */ //////////////////////////////////////////////////

onRecordAfterCreateSuccess((e) => {
    // only for the richtext
    const DEBUG = true;

    const recordType = e.record.get('type');

    if (recordType !== 'richtext') {
        return;
    }

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);

    e.next();

    DEBUG &&
        console.log(
            'Attachment: onRecordAfterCreateSuccess e.record= ',
            JSON.stringify(e.record)
        );

    const logData = {
        type: 'attachment_created',
        user: e.record.get('creator'), // here we can use the creator onRecordAfterCreateSuccess
        pin: e.record.get('pin'),
        pinCollection: e.record.get('pinCollection'), // I need to get the pinCollection...
        attachment: e.record.get('id'),
        data: e.record,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);
}, 'attachments');

onRecordUpdateRequest((e) => {
    // for now the only true "updatable" attahments are the "richtext"
    const DEBUG = true;

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);
    const generateJsonDiff = require(`${__hooks}/utils/generate-jsondiff.js`);

    e.next();

    DEBUG &&
        console.log(
            'Attachment: onRecordAfterUpdateSuccess e.record= ',
            JSON.stringify(e.record)
        );

    const diff = generateJsonDiff(e.record.original(), e.record);

    const logData = {
        type: 'attachment_updated',
        user: e.auth.id, // the person who made request
        pin: e.record.get('pin'),
        pinCollection: e.record.get('pinCollection'), // I need to get the pinCollection...
        attachment: e.record.get('id'),
        data: e.record, // The new state of the record
        diff: diff,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);
}, 'attachments');

onRecordAfterUpdateSuccess((e) => {
    // special treatment for attchments of type "file" and "target"
    // they are created in DB instantly but we need to wait
    // the "pins" hook to "confirm" them to mark them as "created"
    // it's the only moment thos attachment type" are updated
    // otherwise they are deleted
    const DEBUG = true;

    const recordType = e.record.get('type');

    if (recordType !== 'file' && recordType !== 'target') {
        return;
    }

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);

    DEBUG &&
        console.log(
            'Attachment: onRecordAfterUpdateSuccess e.record= ',
            JSON.stringify(e.record)
        );

    const logData = {
        type: 'attachment_created',
        user: e.record.get('creator'),
        pin: e.record.get('pin'),
        pinCollection: e.record.get('pinCollection'),
        attachment: e.record.get('id'),
        data: e.record, // The new state of the record
        diff: null, // no need to diff, we consider the attachments "created"
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);
}, 'attachments');

onRecordDeleteRequest((e) => {
    const DEBUG = true;
    DEBUG && console.log('onRecordDeleteRequest called for attachment');

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);

    const logData = {
        type: 'attachment_deleted',
        user: e.auth.id, // the person who made request
        pin: e.record.get('pin'),
        pinCollection: e.record.get('pinCollection'), // I need to get the pinCollection...
        attachment: null, // the attachment doesn't exist anymore
        data: e.record,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);

    e.next();
}, 'attachments');

/** /////////////////////////////////////////////////
 * PINCOLLECTIONS
 */ //////////////////////////////////////////////////

onRecordCreateRequest((e) => {
    const DEBUG = true;
    DEBUG && console.log('onRecordDeleteRequest called for pinCollections');

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);

    e.next(); // need to be above to be able to access the pinCollection.id

    const logData = {
        type: 'collection_created',
        user: e.auth.id, // the person who made request
        pinCollection: e.record.get('id'),
        pin: null,
        attachment: null, // the attachment doesn't exist anymore
        data: e.record,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);
}, 'pinCollections');

onRecordUpdateRequest((e) => {
    const DEBUG = true;
    DEBUG && console.log('onRecordUpdateRequest called for pinCollections');

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);
    const generateJsonDiff = require(`${__hooks}/utils/generate-jsondiff.js`);

    e.next(); // need to be above to be able to access the pinCollection.id

    const diff = generateJsonDiff(e.record.original(), e.record);
    const logData = {
        type: 'collection_updated',
        user: e.auth.id, // the person who made request
        pinCollection: e.record.get('id'),
        pin: null,
        attachment: null,
        data: e.record, // The new state of the record
        diff: diff,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);
}, 'pinCollections');

onRecordDeleteRequest((e) => {
    const DEBUG = true;
    DEBUG && console.log('onRecordDeleteRequest called for pinCollections');

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);

    const logData = {
        type: 'collection_deleted',
        user: e.auth.id, // the person who made request
        pinCollection: null, // the pinCollection doesn't exist anymore
        pin: null,
        attachment: null,
        data: e.record,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);

    e.next();
}, 'pinCollections');

/** /////////////////////////////////////////////////
 * COMMENTS
 */ //////////////////////////////////////////////////

onRecordCreateRequest((e) => {
    const DEBUG = true;
    DEBUG && console.log('onRecordDeleteRequest called for pinCollections');

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);

    e.next(); // need to be above to be able to access the pinCollection.id

    const logData = {
        type: 'comment_created',
        user: e.auth.id, // the person who made request
        pinCollection: e.record.get('pinCollection'),
        pin: e.record.get('pin'),
        attachment: null,
        comment: e.record.get('id'),
        data: e.record,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);
}, 'comments');

onRecordUpdateRequest((e) => {
    const DEBUG = true;
    DEBUG && console.log('onRecordUpdateRequest called for pinCollections');

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);
    const generateJsonDiff = require(`${__hooks}/utils/generate-jsondiff.js`);

    e.next(); // need to be above to be able to access the pinCollection.id

    const diff = generateJsonDiff(e.record.original(), e.record);
    const logData = {
        type: 'comment_updated',
        user: e.auth.id, // the person who made request
        pinCollection: e.record.get('pinCollection'),
        pin: e.record.get('pin'),
        attachment: null,
        comment: e.record.get('id'),
        data: e.record, // The new state of the record
        diff: diff,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);
}, 'comments');

onRecordDeleteRequest((e) => {
    const DEBUG = true;
    DEBUG && console.log('onRecordDeleteRequest called for pinCollections');

    // In PocketBase, require() must be inside the handler to be in scope.
    const createLog = require(`${__hooks}/utils/create-log.js`);

    const logData = {
        type: 'comment_deleted',
        user: e.auth.id, // the person who made request
        pinCollection: e.record.get('pinCollection'),
        pin: e.record.get('pin'),
        attachment: null,
        comment: null, // the comment doesn't exist anymore
        data: e.record,
    };
    DEBUG && console.log('logData to create: ', JSON.stringify(logData));

    createLog($app, logData);

    e.next();
}, 'comments');

/**
 * NOTES
 *
 * For most of the hooks I wanted to use "onRecordAfter_____Success"
 * But it seems that we cannot access the e.auth without using "onRecord_____Request"...
 *
 * TODO: check how to be sure that the action succeeded before creating the log for it.
 */
