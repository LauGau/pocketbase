/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json2430507200",
    "maxSize": 0,
    "name": "attachmentsToCreate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json1053245976",
    "maxSize": 0,
    "name": "attachmentsToConfirm",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971")

  // remove field
  collection.fields.removeById("json2430507200")

  // remove field
  collection.fields.removeById("json1053245976")

  return app.save(collection)
})
