/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2301922722")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "pin_created",
      "pin_priority",
      "pin_closed",
      "pin_reopened",
      "pin_updated",
      "pin_deleted",
      "comment_created",
      "comment_updated",
      "comment_deleted",
      "attachment_created",
      "attachment_updated",
      "attachment_deleted",
      "collection_invite",
      "collection_updated"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2301922722")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "pin_created",
      "pin_priority",
      "pin_closed",
      "pin_reopened",
      "pin_updated",
      "pin_deleted",
      "comment_created",
      "comment_updated",
      "comment_deleted",
      "attachment_created",
      "attachment_updated",
      "attachment_deleted",
      "collection_invite"
    ]
  }))

  return app.save(collection)
})
