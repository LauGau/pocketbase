/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool2165001858",
    "name": "isCollectionArchived",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // remove field
  collection.fields.removeById("bool2165001858")

  return app.save(collection)
})
