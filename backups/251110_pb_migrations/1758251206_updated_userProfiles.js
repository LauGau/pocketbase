/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_161176599")

  // remove field
  collection.fields.removeById("relation1307527415")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_161176599")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1778662752",
    "hidden": false,
    "id": "relation1307527415",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "pinCollections",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
