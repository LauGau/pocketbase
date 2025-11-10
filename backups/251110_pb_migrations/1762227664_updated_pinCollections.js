/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // add field
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

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // remove field
  collection.fields.removeById("select1937748032")

  // remove field
  collection.fields.removeById("select1435359976")

  return app.save(collection)
})
