/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2170078043",
    "hidden": false,
    "id": "relation2375286809",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "workspace",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // remove field
  collection.fields.removeById("relation2375286809")

  return app.save(collection)
})
