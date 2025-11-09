/**
 * Marks all unread notifications for the authenticated user as read.
 */
routerAdd('POST', '/api/notifications/mark-all-as-read', (e) => {
    const authRecord = e.httpContext.get('authRecord');

    if (!authRecord) {
        return e.httpContext.json(401, { error: 'Unauthorized' });
    }

    const userId = authRecord.getId();

    try {
        // Using a raw query for efficiency to avoid N+1 updates.
        $app.db()
            .newQuery(
                `
        UPDATE notifications
        SET "isRead" = true, "readAt" = strftime('%Y-%m-%d %H:%M:%f', 'now')
        WHERE recipient = {:userId} AND "isRead" = false
    `
            )
            .bind({ userId: userId })
            .execute();

        return e.httpContext.json(200, { success: true });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        return e.httpContext.json(500, { error: 'Internal Server Error' });
    }
});

/**
 * Deletes all notifications for the authenticated user that have been marked as read.
 */
routerAdd('POST', '/api/notifications/delete-all-read', (e) => {
    const authRecord = e.httpContext.get('authRecord');

    if (!authRecord) {
        return e.httpContext.json(401, { error: 'Unauthorized' });
    }

    const userId = authRecord.getId();

    try {
        // Using a raw query for efficiency to avoid fetching and then deleting one by one.
        $app.db()
            .newQuery(
                `
        DELETE FROM notifications
        WHERE recipient = {:userId} AND "isRead" = true
    `
            )
            .bind({ userId: userId })
            .execute();

        return e.httpContext.json(200, { success: true });
    } catch (err) {
        console.error('Error deleting all read notifications:', err);
        return e.httpContext.json(500, { error: 'Internal Server Error' });
    }
});

/**
 * Marks all unread notifications for a specific pin as read.
 * Expects a JSON body with `pinId` and `typePrefix` ('pin_' or 'comment_').
 */
routerAdd('POST', '/api/notifications/mark-pin-as-read', (e) => {
    const authRecord = e.httpContext.get('authRecord');
    const data = $apis.requestInfo(e.httpContext).data;

    if (!authRecord) return e.httpContext.json(401, { error: 'Unauthorized' });
    if (!data.pinId || !data.typePrefix)
        return e.httpContext.json(400, {
            error: 'Missing pinId or typePrefix',
        });

    try {
        $app.db()
            .newQuery(
                `
        UPDATE notifications
        SET "isRead" = true, "readAt" = strftime('%Y-%m-%d %H:%M:%f', 'now')
        WHERE recipient = {:userId} AND pin = {:pinId} AND type LIKE {:typePrefix} AND "isRead" = false
    `
            )
            .bind({
                userId: authRecord.getId(),
                pinId: data.pinId,
                typePrefix: `${data.typePrefix}%`,
            })
            .execute();

        return e.httpContext.json(200, { success: true });
    } catch (err) {
        console.error(
            `Error marking notifications for pin ${data.pinId} as read:`,
            err
        );
        return e.httpContext.json(500, { error: 'Internal Server Error' });
    }
});
