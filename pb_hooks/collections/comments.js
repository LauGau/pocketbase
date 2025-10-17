// After a user create an "comment",
// - we update the "commentsCount" value on pin
onRecordCreateRequest((e) => {
    const record = e.record; // the commentRecord triggering the hook

    // retrieve a single "pin" record by its id saved into the comment "pin" field...
    const pinId = record.get('pin');
    const pinRecord = $app.findRecordById('pins', pinId);

    // then we get the current value and increment its value
    const currentCommentsCount = pinRecord.getInt('commentsCount');
    pinRecord.set('commentsCount', currentCommentsCount + 1);

    // save
    $app.save(pinRecord);

    e.next();
}, 'comments');

// After a user create an "comment",
// - we update the "commentsCount" value on pin
onRecordDeleteRequest((e) => {
    const record = e.record; // the commentRecord triggering the hook

    // retrieve a single "pin" record by its id saved into the comment "pin" field...
    const pinId = record.get('pin');
    const pinRecord = $app.findRecordById('pins', pinId);

    // then we get the current value and increment its value
    const currentCommentsCount = pinRecord.getInt('commentsCount');
    pinRecord.set('commentsCount', Math.max(0, currentCommentsCount - 1)); // cannot be less than zero

    // save
    $app.save(pinRecord);

    e.next();
}, 'comments');
