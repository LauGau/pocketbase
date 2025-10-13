/// <reference path="../pb_data/types.d.ts" />

/**
 * Cron job to send email digests for unread notifications.
 *
 * This job runs hourly and performs the following steps:
 * 1. Calculates the timestamp for 24 hours ago.
 * 2. Finds all users who have at least one unread notification older than 24 hours
 *    for which an email has not yet been sent.
 * 3. For each of these users, it fetches ALL their unread notifications.
 * 4. It sends a single summary email to the user.
 * 5. It updates the `emailSentAt` timestamp for all included notifications to prevent resending.
 */
cronAdd('sendNotificationEmails', '0 * * * *', () => {
    const DEBUG = true;
    DEBUG && console.log('Running unread notifications email cron job...');

    // 1. Calculate the date 24 hours ago
    const twentyFourHoursAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    // 2. Find all distinct users (recipients) who have at least one unread notification
    //    older than 24 hours that hasn't been included in an email digest yet.
    const usersToNotify = $app
        .findRecordsByFilter(
            'notifications',
            `isRead = false && emailSentAt = null && created < "${twentyFourHoursAgo}"`,
            '+created', // Sort ascending
            0, // No limit
            0, // No offset
            {}
        )
        .map((notif) => notif.get('recipient')) // Get the recipient user ID
        .filter((value, index, self) => self.indexOf(value) === index); // Get unique user IDs

    if (usersToNotify.length === 0) {
        DEBUG &&
            console.log('No users with old unread notifications. Exiting.');
        return;
    }

    DEBUG &&
        console.log(
            `Found ${usersToNotify.length} user(s) to notify:`,
            usersToNotify
        );

    // Define throttling parameters to respect API rate limits.
    const RATE_LIMIT_PER_SECOND = 60;
    const DELAY_MS = 1000 / RATE_LIMIT_PER_SECOND + 5; // ~21.7ms, adding a 5ms buffer.

    // 3. Process each user
    for (const userId of usersToNotify) {
        let user;
        try {
            user = $app.findRecordById('users', userId);
        } catch (err) {
            $app.logger().error(
                `Failed to find user ${userId} for notification email.`,
                'error',
                err
            );
            continue; // Skip to the next user
        }

        // 4. Fetch ALL unread notifications for this user that haven't been sent.
        const allUnreadNotifications = $app.findRecordsByFilter(
            'notifications',
            `recipient = "${userId}" && isRead = false && emailSentAt = null`,
            '-created' // Most recent first
        );

        if (allUnreadNotifications.length === 0) {
            continue; // Should not happen based on the first query, but good for safety
        }

        // 5. Send the email digest
        try {
            const message = new MailerMessage({
                from: {
                    address: $app.settings().meta.senderAddress,
                    name: $app.settings().meta.senderName,
                },
                to: [{ address: user.email() }],
                subject: `You have ${allUnreadNotifications.length} unread notifications on Pinback`,
                html: `
                    <h1>You've got mail!</h1>
                    <p>Hello ${user.get('name') || 'there'},</p>
                    <p>Here is a summary of your unread notifications:</p>
                    <ul>
                        ${allUnreadNotifications
                            .map(
                                (n) =>
                                    `<li>[${n.get(
                                        'type'
                                    )}] - A new event happened.</li>`
                            )
                            .join('')}
                    </ul>
                    <p>Visit Pinback to catch up!</p>
                `,
            });

            // This will use the email settings configured in your PocketBase Admin UI
            $app.newMailClient().send(message);

            DEBUG &&
                console.log(
                    `Sent notification digest to ${user.email()} for ${
                        allUnreadNotifications.length
                    } notifications.`
                );

            // 6. Mark notifications as sent in a transaction
            $app.runInTransaction((txApp) => {
                const sentAt = new Date().toISOString();
                for (const notif of allUnreadNotifications) {
                    notif.set('emailSentAt', sentAt);
                    txApp.save(notif);
                }
            });
        } catch (err) {
            $app.logger().error(
                `Failed to send email or update notifications for user ${userId}.`,
                'error',
                err
            );
        } finally {
            // IMPORTANT: Pause execution to respect API rate limits.
            // This prevents overwhelming the external email service.
            sleep(DELAY_MS);
        }
    }
});
