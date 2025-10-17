// After a user creates a "userProfile"...
// - IF the user doesn't have any userProfile marked as "default" -> Set new userProfile as "Default"
onRecordCreateRequest((e) => {
    let existinDefaultUserProfilerecord = null;

    try {
        // we try to get 1 userProfile marked as "default" for the user
        existinDefaultUserProfilerecord = $app.findFirstRecordByFilter(
            'userProfiles',
            'user = {:userId} && isDefault = true ',
            { userId: e.auth.id }
        );
    } catch (err) {
        // findFirstRecordByFilter() returns an error if it cannot find anything, so we need to catch it
        // DOC: https://pocketbase.io/docs/js-records/#fetch-single-record
        // but in this case, it's ok to fail silently
    }

    if (!existinDefaultUserProfilerecord) {
        // If there is no userProfile as "default"...
        // mark the new userProfile as "Default"
        e.record.set('isDefault', true);
    }

    e.next();
}, 'userProfiles');
