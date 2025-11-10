/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // update field
  collection.fields.addAt(4, new Field({
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
      "collection_deleted"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2363381545",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "pin-created",
      "pin-updated",
      "pin-deleted",
      "comment-added",
      "comment-updated",
      "comment-deleted",
      "priority-updated",
      "collection-created",
      "collection-updated"
    ]
  }))

  return app.save(collection)
})
