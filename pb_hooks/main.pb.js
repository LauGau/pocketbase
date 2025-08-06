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
 * After a new pin is created, this hook finds all associated "pending"
 * attachments and updates them to be "confirmed" and linked to the new pin.
 *
 * @param {import('pocketbase').ModelEvent} e
 */
onModelAfterCreate((e) => {
	console.log('pin afterCreate hook fired...')

	const pin = e.model
	const pendingAttachmentIds = pin.get('pendingAttachments')

	if (!pendingAttachmentIds || pendingAttachmentIds.length === 0) {
		console.log('No pending attachments to confirm.')
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