/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "select1435359976",
    "maxSelect": 1,
    "name": "edit_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "editable",
      "locked"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "select1435359976",
    "maxSelect": 1,
    "name": "edit_status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "editable",
      "frozen"
    ]
  }))

  return app.save(collection)
})
