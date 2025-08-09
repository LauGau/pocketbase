/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // remove field
  collection.fields.removeById("relation2430507200")

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "json2430507200",
    "maxSize": 0,
    "name": "attachmentsToCreate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // add field
  collection.fields.addAt(14, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3073759650",
    "hidden": false,
    "id": "relation2430507200",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "attachmentsToCreate",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("json2430507200")

  return app.save(collection)
})
