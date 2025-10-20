// After a user create successfully a "pin"
// - We check the attachments and confim them
onRecordAfterCreateSuccess((e) => {
    const DEBUG = false;
    const record = e.record;
    const processAttachments = require(`${__hooks}/utils/process-attachments.js`);
    // Add programatically populate the "number" field of a pin
    let targetPinCollectionId = e.record.get('pinCollection');

    // try to update with the pinNumberField with a specific count
    try {
        const pinsCount = $app.countRecords(
            'pins',
            $dbx.hashExp({ pinCollection: targetPinCollectionId })
        );
        e.record.set('number', pinsCount);
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

    // Process attachments using the shared utility
    processAttachments($app, record, 'pin');
    // no e.next() in onRecordAfterCreateSuccess
}, 'pins');

/**
 * After a user successfully updates a "pin", we process any new or confirmed attachments.
 * This logic is similar to the onRecordAfterCreateSuccess hook.
 */

onRecordAfterUpdateSuccess((e) => {
    const DEBUG = false;
    const processAttachments = require(`${__hooks}/utils/process-attachments.js`);
    const record = e.record;

    DEBUG && console.log('MAIN.PB.JS, onRecordAfterUpdateSuccess() called...');
    processAttachments($app, record, 'pin');
    // no e.next() in onRecordAfterUpdateSuccess
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
