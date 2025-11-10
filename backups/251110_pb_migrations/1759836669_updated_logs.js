/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "json1164986283",
    "maxSize": 0,
    "name": "diff",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2555859327")

  // remove field
  collection.fields.removeById("json1164986283")

  return app.save(collection)
})
