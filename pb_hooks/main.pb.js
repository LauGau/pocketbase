// After a user create a "pinCollection"
// - We add the user as owner
onRecordCreateRequest((e) => {
    const record = e.record;   // The record being created (can be modified directly)
    const authRecord = e.auth; // The authenticated user record

    // It's a good practice to ensure a user is authenticated.
    // If no user is authenticated (e.g. an admin creating a record via UI, or an API key request),
    // authRecord will be null.
    if (!authRecord) {
        // If a user MUST be authenticated to create this record, throw an error.
        // This will prevent the record from being created and return a 400 response.
        throw new BadRequestError("You must be logged in to create a pin collection.");
    }

    // Set the 'owner' field directly on the record object
    record.set("owner", authRecord.id);

    // Set the 'members' field directly on the record object.
    record.set("members", [authRecord.id]);

	 e.next()

}, "pinCollections")


// After a user create a "pin"
// - We add the user as the creator
onRecordCreateRequest((e) => {
    const record = e.record;   // The record being created (can be modified directly)
    const authRecord = e.auth; // The authenticated user record

    // It's a good practice to ensure a user is authenticated.
    // If no user is authenticated (e.g. an admin creating a record via UI, or an API key request),
    // authRecord will be null.
    if (!authRecord) {
        // If a user MUST be authenticated to create this record, throw an error.
        // This will prevent the record from being created and return a 400 response.
        throw new BadRequestError("You must be logged in to create a pin.");
    }

    // Set the 'owner' field directly on the record object
    record.set("creator", authRecord.id);

	 e.next()

}, "pins")


/**
 * This file contains the hooks to atomically confirm attachments when a pin is created.
 * It uses a two-step process to ensure data integrity.
 */

/**
 * **Hook 1: Before the pin is created**
 * This hook intercepts the pin creation request. It moves the `pendingAttachments`
 * from the record data into the temporary request context (`e.httpContext`).
 * It then clears the `pendingAttachments` field on the record itself, ensuring
 * this temporary data is not saved to the database.
 *
 * @param {import('pocketbase').RecordCreateEvent} e
 */
onRecordBeforeCreate((e) => {
	console.log('pin onRecordBeforeCreate hook fired...')

	const record = e.record
	const pendingAttachmentIds = record.get('pendingAttachments')

	if (pendingAttachmentIds && pendingAttachmentIds.length > 0) {
		console.log(`Found ${pendingAttachmentIds.length} pending attachments to process.`)
		// Store the IDs in the request context to pass them to the afterCreate hook
		e.httpContext.set('pendingAttachmentIds', pendingAttachmentIds)

		// Clear the field on the pin record so it's not saved to the database
		record.set('pendingAttachments', [])
	} else {
		console.log('No pending attachments found on the pin record.')
	}
}, 'pins')

/**
 * **Hook 2: After the pin has been created**
 * This hook runs after the pin has been successfully saved. It retrieves the
 * attachment IDs from the request context and, within a transaction, updates
 * each attachment to link it to the new pin and mark it as "confirmed".
 *
 * @param {import('pocketbase').ModelEvent} e
 */
onModelAfterCreate((e) => {
	console.log('pin onModelAfterCreate hook fired...')

	const pin = e.model
	// Retrieve the IDs from the request context
	const pendingAttachmentIds = e.httpContext.get('pendingAttachmentIds')

	if (!pendingAttachmentIds || pendingAttachmentIds.length === 0) {
		console.log('No pending attachments to confirm from context.')
		return
	}

	console.log(`Confirming ${pendingAttachmentIds.length} attachments for pin ${pin.getId()}`)

	$app.dao().runInTransaction((txDao) => {
		for (const attachmentId of pendingAttachmentIds) {
			const attachment = txDao.findRecordById('attachments', attachmentId)
			attachment.set('pin', pin.getId())
			attachment.set('status', 'confirmed')
			txDao.saveRecord(attachment)
		}
	})
}, 'pins')

