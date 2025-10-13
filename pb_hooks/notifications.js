onRecordAfterCreateSuccess((e) => {
    const DEBUG = false;
    const logRecord = e.record;

    // 1. Get the log type and related info from the log record
    let logType = logRecord.get('type');
    const actorId = logRecord.get('user');
    const pinCollectionId = logRecord.get('pinCollection');
    const pinId = logRecord.get('pin');
    const commentId = logRecord.get('comment');
    const attachmentId = logRecord.get('attachment');
    const diff = logRecord.get('diff');

    DEBUG && console.log('logRecord = ', JSON.stringify(logRecord));

    if (!pinCollectionId) {
        DEBUG &&
            console.log(
                'notifications.js: No pinCollectionId in log, skipping notification creation.',
                'logId',
                logRecord.id
            );
        return;
    }

    let members = [];
    try {
        // 2. Get all members of the pinCollection
        members = $app.findRecordsByFilter(
            'collectionMembers',
            `pinCollection = "${pinCollectionId}" && status = "approved"`
        );
    } catch (error) {
        $app.logger().error(
            'notifications.js: Failed to fetch collection members.',
            'pinCollectionId',
            pinCollectionId,
            'error',
            error
        );
        return; // Stop if we can't get members
    }

    DEBUG && JSON.stringify('members = ', members);

    if (members.length === 0) {
        DEBUG &&
            console.log(
                'notifications.js: No members found for pinCollection, skipping.',
                'pinCollectionId',
                pinCollectionId
            );
        return;
    }

    // 3. Exclude the user that is the "actor" of the event
    const recipients = members.filter(
        (member) => member.get('user') !== actorId
    );

    if (recipients.length === 0) {
        DEBUG &&
            console.log(
                'notifications.js: No recipients after filtering out the actor.'
            );
        return;
    }

    // LogType override
    // for now we will treat the "attachments" related events
    // like "pin_updated" for the notifications
    if (
        logType == 'attachment_created' ||
        logType == 'attachment_deleted' ||
        logType == 'attachment_updated'
    ) {
        logType = 'pin_updated';
    }

    // 4. Create the notifications in a batch transaction
    try {
        $app.runInTransaction((txApp) => {
            const notificationsCollection =
                txApp.findCollectionByNameOrId('notifications');

            for (const recipient of recipients) {
                const notification = new Record(notificationsCollection, {
                    recipient: recipient.get('user'),
                    actor: actorId,
                    type: logType,
                    isRead: false,
                    pin: pinId,
                    pinCollection: pinCollectionId,
                    comment: commentId,
                    attachment: attachmentId,
                    data: diff, // Store the diff from the log
                });
                txApp.save(notification);
            }
        });
        DEBUG &&
            console.log(
                `notifications.js: Successfully created ${recipients.length} notifications.`
            );
    } catch (error) {
        $app.logger().error(
            'notifications.js: Failed to create notifications in transaction.',
            'error',
            error
        );
    }
}, 'logs');
