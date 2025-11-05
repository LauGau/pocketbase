/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select1937748032",
    "maxSelect": 1,
    "name": "access_level",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "personal",
      "link",
      "public"
    ]
  }))

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "select1435359976",
    "maxSelect": 1,
    "name": "edit_status",
    "presentable": false,
    "required": true,
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
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select1937748032",
    "maxSelect": 1,
    "name": "access_level",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "personal",
      "link",
      "public"
    ]
  }))

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
})
