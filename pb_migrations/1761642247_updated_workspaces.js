/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
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

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number261533666",
    "max": null,
    "min": null,
    "name": "collections_limit",
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
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number261533666",
    "max": null,
    "min": null,
    "name": "collections_limit",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
