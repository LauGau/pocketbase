/**
 * Marks all unread notifications for a specific pin as read for the authenticated user.
 * Can be filtered by a notification type prefix.
 *
 * Method: POST
 * Path:   /api/notifications/mark-pin-as-read
 * Body:   { "pinId": "...", "typePrefix": "pin_" | "comment_" }
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

        // 3. Parse the pinId and typePrefix from the request body.
        const body = e.requestInfo().body || {};
        const pinId = body.pinId;
        const typePrefix = body.typePrefix;

        if (!pinId || typeof pinId !== 'string') {
            throw new BadRequestError('The "pinId" field is required.');
        }

        if (!typePrefix || typeof typePrefix !== 'string') {
            throw new BadRequestError('The "typePrefix" field is required.');
        }

        // 4. Build the filter string to include the type prefix.
        const filter =
            'recipient = {:userId} && pin = {:pinId} && isRead = false && type ~ {:typePrefix}';

        // 5. Find all notifications that match the criteria.
        const notificationsToUpdate = $app.findRecordsByFilter(
            'notifications', // collection name
            filter,
            '-created', // sort order (optional)
            0, // limit (0 for unlimited)
            0, // offset
            { userId: user.id, pinId: pinId, typePrefix: `${typePrefix}%` } // filter parameters
        );

        // 6. If there are no notifications to update, we can return early.
        if (notificationsToUpdate.length === 0) {
            return e.json(200, {
                success: true,
                message:
                    'No unread notifications found for this pin with the specified type.',
            });
        }

        // 7. Perform the updates within a database transaction for atomicity.
        $app.runInTransaction((txApp) => {
            const readAt = new Date().toISOString();

            for (const notif of notificationsToUpdate) {
                notif.set('isRead', true);
                notif.set('readAt', readAt);

                // Save the changes for each notification record.
                txApp.save(notif);
            }
        });

        // 8. Return a success response.
        return e.json(200, {
            success: true,
            message: `Marked ${notificationsToUpdate.length} notifications as read.`,
        });
    },
    $apis.requireAuth() // Middleware to enforce that a user must be logged in.
);
