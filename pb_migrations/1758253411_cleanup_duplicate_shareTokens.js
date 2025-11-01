/// <reference path="../pb_data/types.d.ts" />

/**
 * This migration finds and fixes duplicate `shareToken` values in the `pinCollections` collection.
 * It runs before the migration that adds the UNIQUE index to prevent constraint errors.
 *
 * How it works:
 * 1. It groups records by `shareToken` and identifies tokens that are used by more than one record.
 * 2. For each group of duplicates, it keeps the token for the oldest record.
 * 3. For all other records in the group, it generates a new, random `shareToken`.
 */
migrate((app) => {
    // --- FIX: Convert all empty string shareTokens to NULL ---
    // This is the primary fix, as UNIQUE constraints fail on multiple empty strings.
    const emptyTokenRecords = app.findRecordsByFilter("pinCollections", "shareToken = ''");
    for (const record of emptyTokenRecords) {
        record.set("shareToken", null);
        app.save(record); // Use app.saveRecord to bypass validation
    }
    console.log(`Converted ${emptyTokenRecords.length} empty shareTokens to NULL.`);

    // Find shareTokens that are used by more than one pinCollection
    const duplicateTokens = arrayOf(new DynamicModel({
        shareToken: "",
        count: 0,
    }));

    app.db()
        .newQuery("SELECT shareToken, COUNT(*) as count FROM pinCollections WHERE shareToken IS NOT NULL AND shareToken != '' GROUP BY shareToken HAVING COUNT(*) > 1")
        .all(duplicateTokens);

    if (duplicateTokens.length === 0) {
        console.log("No duplicate shareTokens found. Nothing to do.");
        return;
    }

    console.log(`Found ${duplicateTokens.length} shareToken(s) with duplicates. Fixing...`);

    for (const item of duplicateTokens) {
        const recordsToUpdate = app.findRecordsByFilter(
            "pinCollections",
            "shareToken = {:token}",
            "+created", // Keep the token for the oldest record
            0, 0,
            { token: item.shareToken }
        );

        // Skip the first (oldest) record and update the rest
        for (let i = 1; i < recordsToUpdate.length; i++) {
            const record = recordsToUpdate[i];
            record.set("shareToken", $security.randomStringWithAlphabet(32, "abcdefghijklmnopqrstuvwxyz0123456789"));
            app.save(record); // Use app.saveRecord to bypass validation
            console.log(`Updated shareToken for pinCollection: ${record.id}`);
        }
    }
}, (app) => {
    // This migration is for data cleanup and doesn't have a rollback (down) action.
    // The changes are permanent to ensure data integrity.
    console.log("Skipping down migration for 1758253411_cleanup_duplicate_shareTokens.js");
});