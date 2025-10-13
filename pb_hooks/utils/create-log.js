const createLog = async ($app, logData) => {
    const DEBUG = false;

    DEBUG && console.log('ℹ️ Log CREATE called...');
    try {
        DEBUG && console.log('ℹ️ Try...');
        const logsCollection = $app.findCollectionByNameOrId('logs');

        const newRecord = new Record(logsCollection);

        // populates a record from a data map
        // (calls set() for each entry of the map)
        newRecord.load(logData);

        $app.save(newRecord);
        DEBUG && console.log('✅ Log CREATED for logData = ', logData);
    } catch (err) {
        DEBUG && console.log('⛔ Log NOT created for logData = ', logData);
        throw new BadRequestError('Failed to create log: ', err);
    }
};

// Export the constructor directly, so it can be used locally in other modules.
module.exports = createLog;
