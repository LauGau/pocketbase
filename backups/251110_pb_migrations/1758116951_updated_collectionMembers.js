/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_161176599",
    "hidden": false,
    "id": "relation3532353325",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "userProfile",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_482864135")

  // remove field
  collection.fields.removeById("relation3532353325")

  return app.save(collection)
})
