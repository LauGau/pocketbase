/**
 * Marks all unread notifications for the authenticated user as read.
 *
 * Method: POST
 * Path:   /api/notifications/mark-all-as-read
 * Body:   {}
 */
routerAdd(
    'POST',
    '/api/notifications/mark-all-as-read',
    (e) => {
        const user = e.auth;

        if (!user) {
            throw new UnauthorizedError(
                'You must be logged in to perform this action.'
            );
        }

        let result;
        try {
            // Using a raw query for efficiency to avoid fetching and then updating records one by one.
            result = $app
                .db()
                .newQuery(
                    `UPDATE notifications
                     SET "isRead" = true, "readAt" = strftime('%Y-%m-%d %H:%M:%f', 'now')
                     WHERE recipient = {:userId} AND "isRead" = false`
                )
                .bind({ userId: user.id })
                .execute();
        } catch (err) {
            $app.logger().error(
                'Error marking all notifications as read:',
                err
            );
            throw new InternalServerError(
                'Failed to mark notifications as read.'
            );
        }

        return e.json(200, {
            success: true,
            message: `Marked ${result.rowsAffected} notifications as read.`,
        });
    },
    $apis.requireAuth() // Middleware to enforce that a user must be logged in.
);

/**
 * Deletes all notifications for the authenticated user that have been marked as read.
 *
 * Method: POST
 * Path:   /api/notifications/delete-all-read
 * Body:   {}
 */
routerAdd(
    'POST',
    '/api/notifications/delete-all-read',
    (e) => {
        const user = e.auth;

        if (!user) {
            throw new UnauthorizedError(
                'You must be logged in to perform this action.'
            );
        }

        let result;
        try {
            // Using a raw query for efficiency to avoid fetching and then deleting one by one.
            result = $app
                .db()
                .newQuery(
                    `DELETE FROM notifications
                     WHERE recipient = {:userId} AND "isRead" = true`
                )
                .bind({ userId: user.id })
                .execute();
        } catch (err) {
            $app.logger().error('Error deleting all read notifications:', err);
            throw new InternalServerError(
                'Failed to delete read notifications.'
            );
        }

        return e.json(200, {
            success: true,
            message: `Deleted ${result.rowsAffected} read notifications.`,
        });
    },
    $apis.requireAuth() // Middleware to enforce that a user must be logged in.
);

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

        let result;
        try {
            // 4. Perform the bulk update using a raw SQL query for efficiency.
            result = $app
                .db()
                .newQuery(
                    `
                        UPDATE notifications
                        SET "isRead" = true, "readAt" = strftime('%Y-%m-%d %H:%M:%f', 'now')
                        WHERE recipient = {:userId} AND pin = {:pinId} AND type LIKE {:typePrefix} AND "isRead" = false
                    `
                )
                .bind({
                    userId: user.id,
                    pinId: pinId,
                    typePrefix: `${typePrefix}%`,
                })
                .execute();
        } catch (err) {
            $app.logger().error(
                `Error marking notifications for pin ${pinId} as read:`,
                err
            );
            throw new InternalServerError(
                'Failed to mark notifications as read.'
            );
        }

        // 5. Return a success response.
        return e.json(200, {
            success: true,
            message: `Marked ${result.rowsAffected} notifications as read.`,
        });
    },
    $apis.requireAuth() // Middleware to enforce that a user must be logged in.
);
