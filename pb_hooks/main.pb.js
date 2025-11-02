// After a user create a "pin", an "attachement" or a "comment"
// - We add the user as the creator
onRecordCreateRequest(
    (e) => {
        const record = e.record; // The record being created (can be modified directly)
        const authRecord = e.auth; // The authenticated user record

        // It's a good practice to ensure a user is authenticated.
        // If no user is authenticated (e.g. an admin creating a record via UI, or an API key request),
        // authRecord will be null.
        if (!authRecord) {
            // If a user MUST be authenticated to create this record, throw an error.
            // This will prevent the record from being created and return a 400 response.
            throw new BadRequestError(
                'You must be logged in to create a pin or attachment.'
            );
        }

        // Set the 'owner' field directly on the record object
        record.set('creator', authRecord.id);

        e.next();
    },
    'pins',
    'attachments',
    'comments'
);

// --- Load Collections hooks ---
require(`${__hooks}/collections/pins.js`);
require(`${__hooks}/collections/pinCollections.js`);
require(`${__hooks}/collections/notifications.js`);
require(`${__hooks}/collections/attachments.js`);
require(`${__hooks}/collections/users.js`);
require(`${__hooks}/collections/comments.js`);
require(`${__hooks}/collections/userProfiles.js`);
require(`${__hooks}/collections/logs.js`);

// --- Crons ---
require(`${__hooks}/crons/notifications-email.js`);

// --- Load custom routes ---
// We need to load the route files explicitly from our main hooks file.
require(`${__hooks}/routes/pins-for-url.js`);
require(`${__hooks}/routes/targets-for-url.js`);
require(`${__hooks}/routes/join-collection.js`);
require(`${__hooks}/routes/mark-pin-as-read.js`);

// --- Mailer ---
require(`${__hooks}/mailer/mailer.js`);
