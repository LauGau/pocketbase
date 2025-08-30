/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_161176599")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool2241418015",
    "name": "isDefault",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_161176599")

  // remove field
  collection.fields.removeById("bool2241418015")

  return app.save(collection)
})
