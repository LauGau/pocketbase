/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": true,
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
      "collection_created",
      "collection_updated",
      "collection_deleted",
      "attachment_created",
      "attachment_updated",
      "attachment_deleted"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // update field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "pin_created",
      "pin_updated",
      "pin_deleted",
      "comment_created",
      "comment_updated",
      "comment_deleted",
      "collection_created",
      "collection_updated",
      "collection_deleted",
      "attachment_created",
      "attachment_updated",
      "attachment_deleted"
    ]
  }))

  return app.save(collection)
})
