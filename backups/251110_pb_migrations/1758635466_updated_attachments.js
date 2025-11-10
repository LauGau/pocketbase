/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "listRule": "pin.pinCollection.id ~ @collection.collectionMembers.pinCollection.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3073759650")

  // update collection data
  unmarshal({
    "listRule": "pin.pinCollection.id = @collection.collectionMembers.pinCollection.id"
  }, collection)

  return app.save(collection)
})
