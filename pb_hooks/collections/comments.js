/**
 * After a user successfully creates a "comment", we process any new or confirmed attachments.
 */
onRecordAfterCreateSuccess((e) => {
    const DEBUG = true;
    const commentRecord = e.record;
    const pinId = commentRecord.get('pin');

    // Atomically increment the commentsCount on the parent pin
    // This uses a direct SQL query to avoid triggering the pin's afterUpdate hook.
    try {
        $app.db()
            .newQuery(
                'UPDATE pins SET commentsCount = commentsCount + 1 WHERE id = {:pinId}'
            )
            .bind({ pinId: pinId })
            .execute();
    } catch (error) {
        $app.logger().error(
            'Failed to increment commentsCount on pin after comment creation.',
            'pinId',
            pinId,
            'commentId',
            commentRecord.id,
            'error',
            error
        );
    }

    DEBUG && console.log('comments.js, onRecordAfterCreateSuccess() called...');
    DEBUG && console.log('commentRecord = ', JSON.stringify(commentRecord));

    const processAttachments = require(`${__hooks}/utils/process-attachments.js`);
    const pinRecord = $app.findRecordById('pins', commentRecord.get('pin'));

    // The comment record needs pin and pinCollection context for the attachments
    commentRecord.set('pinCollection', pinRecord.get('pinCollection'));

    processAttachments($app, commentRecord, 'comment');

    e.next();
}, 'comments');

/**
 * After a user successfully deletes a "comment", we decrement the commentsCount on the pin.
 */
onRecordAfterDeleteSuccess((e) => {
    const commentRecord = e.record;
    const pinId = commentRecord.get('pin');

    // Atomically decrement the commentsCount on the parent pin, ensuring it doesn't go below zero.
    // This uses a direct SQL query to avoid triggering the pin's afterUpdate hook.
    try {
        $app.db()
            .newQuery(
                'UPDATE pins SET commentsCount = MAX(0, commentsCount - 1) WHERE id = {:pinId}'
            )
            .bind({ pinId: pinId })
            .execute();
    } catch (error) {
        $app.logger().error(
            'Failed to decrement commentsCount on pin after comment deletion.',
            'pinId',
            pinId,
            'commentId',
            commentRecord.id,
            'error',
            error
        );
    }
    e.next();
}, 'comments');

/**
 * After a user successfully updates a "comment", we process any new or confirmed attachments.
 */
onRecordAfterUpdateSuccess((e) => {
    const processAttachments = require(`${__hooks}/utils/process-attachments.js`);
    const commentRecord = e.record;

    // The comment might not have the pinCollection loaded, so we fetch the pin to get it.
    // This ensures attachments are correctly associated with the workspace for storage calculations.
    if (!commentRecord.get('pinCollection')) {
        try {
            const pinRecord = $app.findRecordById(
                'pins',
                commentRecord.get('pin')
            );
            commentRecord.set('pinCollection', pinRecord.get('pinCollection'));
        } catch (error) {
            $app.logger().error(
                'Failed to fetch pin to set pinCollection on comment for attachment processing.',
                'commentId',
                commentRecord.id,
                'pinId',
                commentRecord.get('pin'),
                'error',
                error
            );
            return; // Stop if we can't get context
        }
    }

    processAttachments($app, commentRecord, 'comment');

    e.next();
}, 'comments');
