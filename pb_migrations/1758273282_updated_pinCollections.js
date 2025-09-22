/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "[a-z0-9]{40}",
    "hidden": false,
    "id": "text2115302333",
    "max": 0,
    "min": 0,
    "name": "shareToken",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1778662752")

  // update field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": " [a-z0-9]{40}",
    "hidden": false,
    "id": "text2115302333",
    "max": 0,
    "min": 0,
    "name": "shareToken",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
