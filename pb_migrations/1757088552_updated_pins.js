/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // remove field
  collection.fields.removeById("relation1053245976")

  // add field
  collection.fields.addAt(16, new Field({
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
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // add field
  collection.fields.addAt(15, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3073759650",
    "hidden": false,
    "id": "relation1053245976",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "attachmentsToConfirm",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // remove field
  collection.fields.removeById("json1053245976")

  return app.save(collection)
})
