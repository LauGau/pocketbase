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
	let attachmentsToCreate = record.get('attachmentsToCreate')
	const attachmentsToConfirm = record.get('attachmentsToConfirm')

	$app.logger().debug('Pin created successfully. Processing attachments...', 'pinId', record.id, 'e', e)

	attachmentsToCreate = JSON.parse(attachmentsToCreate)

	$app.logger().debug('Typo of attachmentsToCreate',
		'type', typeof attachmentsToCreate,
		"isArray", Array.isArray(attachmentsToCreate),
		"arrayLength", attachmentsToCreate.length,
		"attachmentsToCreate", attachmentsToCreate,
	)

	const hasAttachmentsToProcess = attachmentsToCreate.length > 0 || attachmentsToConfirm.length > 0;

	if (!hasAttachmentsToProcess) {
		$app.logger().debug('No attachments to process for pin.', 'pinId', pinRecord.id)
		return; // Nothing to do
	}

	try {

		const collection = $app.findCollectionByNameOrId('attachments')
		// we use runInTransaction to batch process the attachments
		$app.runInTransaction((txApp) => {
			// 1. Create new attachments
			if (attachmentsToCreate && attachmentsToCreate.length > 0) {
				$app.logger().debug(`Creating ${attachmentsToCreate.length} new attachments...`, 'pinId', record.id)
				for (const attData of attachmentsToCreate) {

					try {
						const attachment = new Record(collection)
						attachment.set('pin', record.id)
						attachment.set('type', attData.type)
						attachment.set('data', attData.data)
						attachment.set('status', 'confirmed')
						attachment.set('order', attData.newOrder + 1.0)
						attachment.set('creator', record.get('creator')) // Ensure creator is set
						txApp.save(attachment)
						$app.logger().debug(`Created attachment: ${attachment.id}`)
					} catch (error) {
						$app.logger().error(`Failed to create attachment`, 'error', error, 'attachmentData', attData)
						throw error // Rollback transaction on failure
					}
				}
			}

			// 2. Confirm pre-uploaded attachments
			if (attachmentsToConfirm && attachmentsToConfirm.length > 0) {
				$app.logger().debug(`Confirming ${attachmentsToConfirm.length} existing attachments...`, 'pinId', record.id)
				for (const attachmentId of attachmentsToConfirm) {
					try {
						const attachment = txApp.findRecordById('attachments', attachmentId)
						attachment.set('pin', record.id)
						attachment.set('status', 'confirmed')
						txApp.save(attachment)
						$app.logger().debug(`Confirmed attachment: ${attachmentId}`)
					} catch (error) {
						$app.logger().error(`Failed to confirm attachment`, 'error', error, 'attachmentId', attachmentId)
						throw error // Rollback transaction on failure
					}
				}
			}

			// Clear the temporary fields on the pin record to keep the database clean.
			record.set('attachmentsToCreate', null)
			record.set('attachmentsToConfirm', [])
			txApp.save(record)
			$app.logger().debug('Temporary attachment fields cleared for pin', 'pinId', record.id)
		})

		$app.logger().debug('All attachments processed successfully in transaction.', 'pinId', record.id)
	} catch (error) {
		$app.logger().error('Error during attachment processing transaction:', 'error', error, 'pinId', record.id)
	} finally {
		e.next()
	}

}, 'pins')