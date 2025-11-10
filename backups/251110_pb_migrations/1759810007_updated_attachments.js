/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1778662752",
    "hidden": false,
    "id": "relation1380179765",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "pinCollection",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // remove field
  collection.fields.removeById("relation1380179765")

  return app.save(collection)
})
