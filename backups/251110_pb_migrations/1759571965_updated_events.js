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
      "comment-added"
    ]
  }))

  return app.save(collection)
})
