/**
 * Marks all unread notifications for a specific pin as read for the authenticated user.
 *
 * Method: POST
 * Path:   /api/notifications/mark-pin-as-read
 * Body:   { "pinId": "..." }
 */
routerAdd(
    'POST',
    '/api/notifications/mark-pin-as-read',
    (e) => {
        // 1. Get the authenticated user from the request context.
        const user = e.auth;

        // 2. If no user is authenticated, return an authorization error.
        // This is a safeguard; requireAuth() middleware should handle it.
        if (!user) {
            throw new UnauthorizedError(
                'You must be logged in to perform this action.'
            );
        }

        // 3. Parse the pinId from the request body.
        const body = e.requestInfo().body || {};
        const pinId = body.pinId;

        if (!pinId || typeof pinId !== 'string') {
            throw new BadRequestError('The "pinId" field is required.');
        }

        // 4. Find all notifications that match the criteria.
        const notificationsToUpdate = $app.findRecordsByFilter(
            'notifications', // collection name
            'recipient = {:userId} && pin = {:pinId} && isRead = false', // filter
            '-created', // sort order (optional)
            0, // limit (0 for unlimited)
            0, // offset
            { userId: user.id, pinId: pinId } // filter parameters
        );

        // 5. If there are no notifications to update, we can return early.
        if (notificationsToUpdate.length === 0) {
            return e.json(200, {
                success: true,
                message: 'No unread notifications found for this pin.',
            });
        }

        // 6. Perform the updates within a database transaction for atomicity.
        $app.runInTransaction((txApp) => {
            const readAt = new Date().toISOString();

            for (const notif of notificationsToUpdate) {
                notif.set('isRead', true);
                notif.set('readAt', readAt);

                // Save the changes for each notification record.
                txApp.save(notif);
            }
        });

        // 7. Return a success response.
        return e.json(200, {
            success: true,
            message: `Marked ${notificationsToUpdate.length} notifications as read.`,
        });
    },
    $apis.requireAuth() // Middleware to enforce that a user must be logged in.
);
