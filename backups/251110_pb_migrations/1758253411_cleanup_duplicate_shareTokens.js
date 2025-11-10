/// <reference path="../pb_data/types.d.ts" />

/**
 * This migration ensures every record in `pinCollections` has a unique `shareToken`.
 *
 * How it works:
 * 1. Finds all records with empty `shareToken` values and assigns them a new random token.
 * 2. Finds all records with duplicate `shareToken` values.
 * 3. For each group of duplicates, it keeps the token for the oldest record and generates new random tokens for the others.
 */
migrate(
    (app) => {
        // --- FIX 1: Assign a unique token to all records with an empty shareToken ---
        const emptyTokenRecords = app.findRecordsByFilter("pinCollections", "shareToken = ''");
        for (const record of emptyTokenRecords) {
            record.set("shareToken", $security.randomStringWithAlphabet(40, "abcdefghijklmnopqrstuvwxyz0123456789"));
            app.save(record); // Use app.save to bypass validation during this fix
        }
        console.log(`Fixed ${emptyTokenRecords.length} records with empty shareTokens.`);

        // --- FIX 2: Handle any other remaining duplicates ---
        const duplicateTokens = arrayOf(
            new DynamicModel({
                shareToken: '',
            })
        );

        app.db().newQuery("SELECT shareToken FROM pinCollections GROUP BY shareToken HAVING COUNT(*) > 1").all(duplicateTokens);

        console.log(`Found ${duplicateTokens.length} token(s) with duplicates. Fixing...`);

        for (const item of duplicateTokens) {
            const recordsToUpdate = app.findRecordsByFilter('pinCollections', 'shareToken = {:token}', '+created', 0, 0, { token: item.shareToken });

            for (let i = 1; i < recordsToUpdate.length; i++) {
                const record = recordsToUpdate[i];
                record.set('shareToken', $security.randomStringWithAlphabet(40, 'abcdefghijklmnopqrstuvwxyz0123456789'));
                app.save(record); // Use app.save to bypass validation during this fix
                console.log(`Updated duplicate shareToken for pinCollection: ${record.id}`);
            }
        }
    },
    (app) => {
        // This migration is for data cleanup and doesn't have a rollback (down) action.
        // The changes are permanent to ensure data integrity.
        console.log('Skipping down migration for 1758253411_cleanup_duplicate_shareTokens.js');
    }
);