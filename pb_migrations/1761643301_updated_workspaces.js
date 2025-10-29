/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number334786077",
    "max": null,
    "min": 0,
    "name": "collections_count",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2170078043")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number334786077",
    "max": null,
    "min": null,
    "name": "collections_used",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
