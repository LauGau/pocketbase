/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
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

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_402820656")

  // remove field
  collection.fields.removeById("relation2430507200")

  // remove field
  collection.fields.removeById("relation1053245976")

  return app.save(collection)
})
