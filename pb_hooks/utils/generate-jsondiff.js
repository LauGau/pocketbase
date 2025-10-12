/**
 * Generates a JSON diff between the original and updated state of a PocketBase record.
 *
 * @param {core.Record} originalRecord The record's state before the update.
 * @param {core.Record} updatedRecord The record's state after the update.
 * @returns {object|null} A diff object, or null if there are no differences.
 */
const generateJsonDiff = (originalRecord, updatedRecord) => {
    const DEBUG = true;
    DEBUG && console.log('generateJsonDiff called...');

    // The library attaches itself to the global scope.
    require(`${__hooks}/utils/jsondiffpatch.min.js`);
    const jsondiffpatch = globalThis.jsondiffpatch;

    if (!originalRecord || !updatedRecord) {
        DEBUG &&
            console.error(
                'Error: Both original and updated records must be provided.'
            );
        return null;
    }

    const recordCollectionName = JSON.parse(
        JSON.stringify(updatedRecord)
    ).collectionName;
    DEBUG && console.log('recordCollectionName =', recordCollectionName); // "pins", "attachments"...

    // Convert PocketBase records to plain JavaScript objects for diffing.
    // We use publicExport() to get all fields.
    let originalData = originalRecord.publicExport();
    let updatedData = updatedRecord.publicExport();

    // We need to patch all JSON fields because PB convert them as Byte Array
    switch (recordCollectionName) {
        case 'pins':
            updatedData.urlMatching = JSON.parse(
                updatedRecord.getString('urlMatching')
            );
            originalData.urlMatching = JSON.parse(
                originalRecord.getString('urlMatching')
            );
            break;
        case 'attachments':
            updatedData.data = JSON.parse(updatedRecord.getString('data'));
            originalData.data = JSON.parse(originalRecord.getString('data'));
            break;
        case 'comments':
            updatedData.content = JSON.parse(
                updatedRecord.getString('content')
            );
            originalData.content = JSON.parse(
                originalRecord.getString('content')
            );
            break;
        case 'pinCollections':
            updatedData.settings = JSON.parse(
                updatedRecord.getString('settings')
            );
            originalData.settings = JSON.parse(
                originalRecord.getString('settings')
            );
            updatedData.userSettings = JSON.parse(
                updatedRecord.getString('userSettings')
            );
            originalData.userSettings = JSON.parse(
                originalRecord.getString('userSettings')
            );
            break;
    }

    // Fields to exclude from the diff because they change on every update
    // or are not relevant for tracking user-made changes.
    const fieldsToIgnore = [
        'created',
        'updated',
        'collectionId',
        'collectionName',
        'expand',
        'attachmentsToConfirm',
        'attachmentsToCreate',
        'archivedBy',
    ];

    // Create cleaned copies of the data
    const cleanedOriginal = {};
    const cleanedUpdated = {};

    for (const key in originalData) {
        if (!fieldsToIgnore.includes(key)) {
            cleanedOriginal[key] = originalData[key];
        }
    }

    for (const key in updatedData) {
        if (!fieldsToIgnore.includes(key)) {
            cleanedUpdated[key] = updatedData[key];
        }
    }

    // Create a new instance of the diff patcher
    const diffPatcher = jsondiffpatch.create({
        // Optional configuration can go here
        // See https://github.com/benjamine/jsondiffpatch for options
    });

    // Generate the diff
    const delta = diffPatcher.diff(
        JSON.parse(JSON.stringify(cleanedOriginal)),
        JSON.parse(JSON.stringify(cleanedUpdated))
    );

    if (delta) {
        DEBUG && console.log('Diff generated:', JSON.stringify(delta, null, 2));
    } else {
        DEBUG && console.log('No differences found.');
    }

    return delta;
};

module.exports = generateJsonDiff;
