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



// After a user create successfully a "pin"
// - We check the attachments and confim them
onRecordAfterCreateSuccess((e) => {
	const record = e.record
	const pendingAttachmentIds = record.get('pendingAttachments')

	if (pendingAttachmentIds && pendingAttachmentIds.length > 0) {
		console.log(`Found ${pendingAttachmentIds.length} pending attachments to process. Storing in httpContext.`)
		console.log('pendingAttachmentIds', pendingAttachmentIds,
			'record', record)
		
		console.log({"e": e})
		$app.logger().debug("E debug", "e", JSON.stringify(e))

		$app.logger().debug('IF DEBUG',
			'pendingAttachmentIds', pendingAttachmentIds,
			'record', record,
		)

		// console.log(`Confirming ${pendingAttachmentIds.length} attachments for pin ${pin.getId()}`)
		$app.logger().debug("Confirming pending attachement...", "pin", record.id, "pendingAttachmentIds", pendingAttachmentIds)

		try {
			// we use runInTransaction to batch process the attachments
			$app.runInTransaction((txApp) => {
				for (const attachmentId of pendingAttachmentIds) {
					const attachment = txApp.findRecordById('attachments', attachmentId)
					attachment.set('pin', record.id)
					attachment.set('status', 'confirmed')
					txApp.save(attachment)
				}

				// Clear the field on the pin record so it's not saved to the database.
				// Using an empty array is more idiomatic for multi-relation fields.
				record.set('pendingAttachments', [])
				txApp.save(record)
			})


		} catch (error) {
			// console.error('Error during attachment confirmation transaction:', error)
			$app.logger().debug("Error during attachment confirmation transaction:", "error", error)
		}

		
	} else {
		// console.log('No pending attachments found on the pin record.')
		$app.logger().debug('No pending attachments found on the pin record.')
	}
	e.next()
}, "pins")